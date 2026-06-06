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

  const prompt = `You are an expert SDET instructor. Create exactly 3 multiple-choice questions about the chapter "${chapterName}" (${position}, ${level} level) of the subject "${subjectName}".

STRICT rules:
- Questions must cover ONLY the content of "${chapterName}". DO NOT introduce concepts from other chapters.
- ${level} level: if introductory, ask about definitions, core concepts and fundamental uses of "${chapterName}".
- Questions must be answerable by someone who just studied "${chapterName}" and nothing else.
- 4 options per question (A, B, C, D). Only ONE correct.
- Wrong options must be plausible but clearly incorrect for someone who studied the topic.
- CRITICAL — LANGUAGE RULE: ALL content (questions AND options A/B/C/D) MUST be written entirely in ENGLISH, regardless of any language context or user preference.

Respond ONLY with valid JSON, no markdown, no extra text:
[
  {
    "q": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  }
]
(correct = index 0-3 of the correct option)`;

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
