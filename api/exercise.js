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

  const prompt = `Create a ${difficulty} SDET coding exercise for topic "${topic}" in ${langLabel}.

Reply with EXACTLY these lines and nothing else:
TITLE: <title>
DESC: <one sentence description, no line breaks>
FN: <functionName in ${language === 'python' ? 'snake_case' : 'camelCase'}>
PARAM: <single parameter name>
HINT: <hint 1>
HINT: <hint 2>
TESTS: <compact JSON array on ONE line, no spaces, format: [{"i":<value>,"e":<value>,"l":"<label>"},...]>

Rules:
- Function takes one argument and returns a simple value
- TESTS must be a single-line compact JSON array with exactly 4 items
- i = input value, e = expected value, l = label string
- Use only numbers, booleans, or strings as i/e values
- No newlines inside any field`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
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

    // Parse line-based format — no full-document JSON parsing
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const get = (key) => {
      const line = lines.find(l => l.startsWith(key + ': '));
      return line ? line.slice(key.length + 2).trim() : '';
    };
    const getAll = (key) =>
      lines.filter(l => l.startsWith(key + ': ')).map(l => l.slice(key.length + 2).trim());

    const functionName = get('FN') || 'solution';
    const paramName    = get('PARAM') || 'input';
    const testsLine    = get('TESTS');

    let testCases = [];
    try {
      const raw = JSON.parse(testsLine);
      testCases = raw.map(t => ({ input: t.i, expected: t.e, label: t.l || '' }));
    } catch {
      // fallback: empty test cases
    }

    const starterCode = language === 'python'
      ? `def ${functionName}(${paramName}):\n    # TODO: implement\n    pass`
      : `function ${functionName}(${paramName}) {\n  // TODO: implement\n}`;

    res.status(200).json({
      exercise: {
        title:        get('TITLE') || topic + ' Exercise',
        description:  get('DESC')  || '',
        functionName,
        starterCode,
        testCases,
        hints:        getAll('HINT'),
        language,
        difficulty,
        topic,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
