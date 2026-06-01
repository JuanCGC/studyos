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

  const prompt = `Create a ${difficulty}-difficulty SDET coding exercise for topic "${topic}" in ${langLabel}.

Rules:
- Function must be self-contained (no HTTP, no I/O, no imports)
- testCases: inputJson and expectedJson are the JSON-serialized string of the value
  Examples: number 200 → "200", boolean true → "true", string hello → "\\"hello\\"", object → "{\\"status\\":200}"
- 4 test cases covering normal and edge cases
- hints: practical approach hints, no code`;

  // responseSchema forces constrained decoding — Gemini guarantees valid JSON
  const responseSchema = {
    type: 'OBJECT',
    properties: {
      title:        { type: 'STRING' },
      description:  { type: 'STRING' },
      functionName: { type: 'STRING' },
      paramName:    { type: 'STRING' },
      hints: { type: 'ARRAY', items: { type: 'STRING' } },
      testCases: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            inputJson:    { type: 'STRING' },
            expectedJson: { type: 'STRING' },
            label:        { type: 'STRING' },
          },
          required: ['inputJson', 'expectedJson', 'label'],
        },
      },
    },
    required: ['title', 'description', 'functionName', 'paramName', 'hints', 'testCases'],
  };

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
            responseSchema,
          },
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

    const raw = JSON.parse(rawText);

    // Deserialize inputJson/expectedJson back to actual values
    const testCases = (raw.testCases || []).map(tc => {
      let input, expected;
      try { input = JSON.parse(tc.inputJson); } catch { input = tc.inputJson; }
      try { expected = JSON.parse(tc.expectedJson); } catch { expected = tc.expectedJson; }
      return { input, expected, label: tc.label };
    });

    const fn    = raw.functionName || 'solution';
    const param = raw.paramName    || 'input';
    const starterCode = language === 'python'
      ? `def ${fn}(${param}):\n    # TODO: implement\n    pass`
      : `function ${fn}(${param}) {\n  // TODO: implement\n}`;

    res.status(200).json({
      exercise: {
        title:        raw.title,
        description:  raw.description,
        functionName: fn,
        starterCode,
        testCases,
        hints:        raw.hints || [],
        language,
        difficulty,
        topic,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
