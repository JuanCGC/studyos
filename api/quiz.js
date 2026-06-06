import parseJSON from './_parse.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { subjectName = '', chapterName = '', chapterIndex = 0, totalChapters = 0 } = req.body || {};

  const position = totalChapters > 0 ? `chapter ${chapterIndex + 1} of ${totalChapters}` : `chapter ${chapterIndex + 1}`;
  const level = chapterIndex <= 2 ? 'introductory' : chapterIndex <= Math.floor((totalChapters || 10) * 0.5) ? 'intermediate' : 'advanced';

  const prompt = `You are an expert SDET instructor teaching entirely in ENGLISH.

CRITICAL — LANGUAGE CONSTRAINT: You MUST generate ALL content strictly in ENGLISH. Never use Spanish, even if the chapter name or subject name seems to suggest a different language. This is non-negotiable.

Create exactly 3 multiple-choice questions about the chapter "${chapterName}" (${position}, ${level} level) of the subject "${subjectName}".

STRICT rules:
- Questions must cover ONLY the content of "${chapterName}". DO NOT introduce concepts from other chapters.
- ${level} level: if introductory, ask about definitions, core concepts and fundamental uses of "${chapterName}".
- Questions must be answerable by someone who just studied "${chapterName}" and nothing else.
- 4 options per question (A, B, C, D). Only ONE correct.
- Wrong options must be plausible but clearly incorrect for someone who studied the topic.
- LANGUAGE RULE (again, mandatory): ALL question text, ALL option text (A/B/C/D), and ALL content must be written in ENGLISH ONLY.

Respond ONLY with valid JSON, no markdown, no extra text:
[
  {
    "q": "What is the correct HTTP status code for a successful POST request?",
    "options": ["200 OK", "201 Created", "202 Accepted", "204 No Content"],
    "correct": 1
  }
]
(correct = index 0-3 of the correct option)

REMINDER: Questions and options above are just format examples. You must generate NEW questions about "${chapterName}". And they MUST be in ENGLISH.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048, responseMimeType: 'application/json' },
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

    const questions = parseJSON(rawText);
    res.status(200).json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
