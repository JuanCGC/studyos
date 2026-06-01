function parseJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}

  // Escape raw newlines/tabs that appear inside JSON string values
  let sanitized = '';
  let inString = false;
  let escaped = false;
  for (const ch of text) {
    if (escaped) { sanitized += ch; escaped = false; continue; }
    if (ch === '\\' && inString) { sanitized += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; sanitized += ch; continue; }
    if (inString && ch === '\n') { sanitized += '\\n'; continue; }
    if (inString && ch === '\r') { sanitized += '\\r'; continue; }
    if (inString && ch === '\t') { sanitized += '\\t'; continue; }
    sanitized += ch;
  }

  try { return JSON.parse(sanitized); } catch {}

  // Also fix unquoted property keys
  const repaired = sanitized.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
  return JSON.parse(repaired);
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

  const prompt = `You are an expert SDET (Software Development Engineer in Test) creating a practical coding exercise.

Create a ${difficulty}-difficulty coding exercise for the topic: "${topic}".
Language: ${langLabel}

CRITICAL CONSTRAINTS:
- The function must be COMPLETELY SELF-CONTAINED (no HTTP calls, no browser APIs, no file I/O, no require/import)
- Only use built-in language features
- Test cases must use only primitives, plain objects, and arrays as inputs/outputs
- Make the exercise relevant to SDET work: data validation, response parsing, assertion helpers, test data transformation

For "${topic}", great exercise types include:
- Validate if an API response object has correct structure/fields
- Parse or transform test data (headers, query strings, JSON payloads)
- Write an assertion utility function used in test suites
- Generate or normalize test fixture data

Respond with ONLY valid JSON (no markdown backticks, no extra text):
{
  "title": "Concise exercise title (5-8 words)",
  "description": "2-3 sentences: what the function does and why it matters in SDET/testing context",
  "functionName": "${language === 'python' ? 'snake_case_name' : 'camelCaseName'}",
  "starterCode": "full starter code with function signature and // TODO or # TODO comment",
  "testCases": [
    { "input": <JSON value>, "expected": <JSON value>, "label": "what this case tests" },
    { "input": <JSON value>, "expected": <JSON value>, "label": "what this case tests" },
    { "input": <JSON value>, "expected": <JSON value>, "label": "what this case tests" },
    { "input": <JSON value>, "expected": <JSON value>, "label": "edge case" }
  ],
  "hints": ["hint 1 (algo/approach hint)", "hint 2 (implementation hint)"],
  "solution": "complete working solution code (just the function, no test runner)"
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: 'application/json' },
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

    const exercise = parseJSON(rawText);
    exercise.language = language;
    exercise.difficulty = difficulty;
    exercise.topic = topic;
    res.status(200).json({ exercise });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
