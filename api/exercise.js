function safeParseJSON(text) {
  try { return JSON.parse(text); } catch {}
  let out = '';
  let inStr = false;
  let esc = false;
  for (const ch of text) {
    if (esc)          { out += ch; esc = false; continue; }
    if (ch === '\\' && inStr) { out += ch; esc = true;  continue; }
    if (ch === '"')   { inStr = !inStr; out += ch; continue; }
    if (inStr && ch === '\n') { out += '\\n'; continue; }
    if (inStr && ch === '\r') { out += '\\r'; continue; }
    if (inStr && ch === '\t') { out += '\\t'; continue; }
    out += ch;
  }
  return JSON.parse(out);
}

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

  // NO code fields in the JSON — code in JSON strings causes unterminated string errors.
  // starterCode and solution are generated server-side from functionName.
  const prompt = `You are an expert SDET creating a practical coding exercise.

Create a ${difficulty}-difficulty exercise for: "${topic}" in ${langLabel}.

Rules:
- Function must be self-contained (no HTTP, no I/O, no imports)
- Test inputs/outputs must be plain JSON values (primitives, objects, arrays)
- Topic-relevant: validation, parsing, transformation, assertion helpers

Respond with ONLY this JSON structure. No code fields. No markdown:
{
  "title": "Short exercise title",
  "description": "2 sentences about what to implement and why it matters for testing",
  "functionName": "${language === 'python' ? 'snake_case' : 'camelCase'} name only, no parens",
  "paramName": "name of the single input parameter",
  "testCases": [
    { "input": <JSON value>, "expected": <JSON value>, "label": "what this tests" },
    { "input": <JSON value>, "expected": <JSON value>, "label": "what this tests" },
    { "input": <JSON value>, "expected": <JSON value>, "label": "what this tests" },
    { "input": <JSON value>, "expected": <JSON value>, "label": "edge case" }
  ],
  "hints": ["approach hint", "implementation hint"]
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024, responseMimeType: 'application/json' },
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

    const exercise = safeParseJSON(rawText);
    exercise.language = language;
    exercise.difficulty = difficulty;
    exercise.topic = topic;

    // Generate starter code server-side — never embed code in Gemini JSON
    const fn = exercise.functionName || 'solution';
    const param = exercise.paramName || 'input';
    exercise.starterCode = language === 'python'
      ? `def ${fn}(${param}):\n    # TODO: implement\n    pass`
      : `function ${fn}(${param}) {\n  // TODO: implement\n}`;

    res.status(200).json({ exercise });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
