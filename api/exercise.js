export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { topic = 'API Testing', difficulty = 'medium', language = 'javascript' } = req.body || {};
  const langLabel = language === 'python' ? 'Python 3' : 'JavaScript (Node.js)';

  const prompt = `Create a ${difficulty} SDET coding exercise for "${topic}" in ${langLabel}.

Reply with EXACTLY this format and nothing else:
TITLE: <title>
DESC: <one sentence, no line break>
FN: <functionName>
PARAM: <paramName>
HINT: <hint 1>
HINT: <hint 2>
TEST: <input>|<expected>|<label>
TEST: <input>|<expected>|<label>
TEST: <input>|<expected>|<label>
TEST: <input>|<expected>|<label>

Rules for TEST lines:
- input and expected must be simple primitives: a number, true, false, or a plain word (no quotes, no objects, no arrays)
- Use | as separator
- Example valid line: TEST: 200|true|valid status code
- Example valid line: TEST: hello|5|string length`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 512 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini error', detail: err });
    }

    const data = await geminiRes.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const rawText = parts.filter(p => !p.thought).map(p => p.text).join('') || '';
    if (!rawText) return res.status(502).json({ error: 'Empty response from Gemini' });

    // Strip any markdown formatting Gemini might add
    const cleaned = rawText.replace(/\*\*/g, '').replace(/`/g, '').replace(/^#+\s*/gm, '');
    const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);

    // Match KEY: or KEY:value (with or without space, case-insensitive key)
    const parseLine = (line) => {
      const m = line.match(/^([A-Z_]+)\s*:\s*(.*)/i);
      return m ? { key: m[1].toUpperCase(), val: m[2].trim() } : null;
    };
    const getFirst = (key) => {
      const line = lines.map(parseLine).find(p => p?.key === key);
      return line?.val || '';
    };
    const getAll = (key) =>
      lines.map(parseLine).filter(p => p?.key === key).map(p => p.val);

    // Collect continuation lines after DESC until next labeled key
    const descIdx = lines.findIndex(l => parseLine(l)?.key === 'DESC');
    let description = getFirst('DESC');
    if (descIdx !== -1) {
      for (let i = descIdx + 1; i < lines.length; i++) {
        if (parseLine(lines[i])) break;
        description += ' ' + lines[i];
      }
      description = description.trim();
    }

    // Parse TEST lines: input|expected|label — no JSON
    const toValue = (s) => {
      const t = s.trim();
      if (t === 'true')  return true;
      if (t === 'false') return false;
      if (t !== '' && !isNaN(t)) return Number(t);
      return t;
    };

    const testCases = getAll('TEST').map(line => {
      const [inp, exp, ...labelParts] = line.split('|');
      return {
        input:    toValue(inp || ''),
        expected: toValue(exp || ''),
        label:    labelParts.join('|').trim(),
      };
    });

    const functionName = getFirst('FN') || 'solution';
    const paramName    = getFirst('PARAM') || 'input';

    const starterCode = language === 'python'
      ? `def ${functionName}(${paramName}):\n    # TODO: implement\n    pass`
      : `function ${functionName}(${paramName}) {\n  // TODO: implement\n}`;

    res.status(200).json({
      exercise: {
        title: getFirst('TITLE') || topic + ' Exercise',
        description,
        functionName,
        starterCode,
        testCases,
        hints: getAll('HINT'),
        language,
        difficulty,
        topic,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
