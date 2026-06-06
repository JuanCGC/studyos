import parseJSON from './_parse.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { fileBase64, mimeType = 'application/pdf', currentSubjects = [] } = req.body || {};
  if (!fileBase64) return res.status(400).json({ error: 'fileBase64 required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const alreadyHave = currentSubjects.map(s => s.name).join(', ');

  const prompt = `You are a career advisor specialized in SDET (Software Development Engineer in Test).
Analyze this CV and do the following:

1. Extract the candidate's current technical skills.
2. Identify knowledge gaps for the SDET role.
3. Recommend exactly 4 study topics (that are NOT: ${alreadyHave || 'none'}).
4. List 5 common interview questions based on their current experience.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "skills": ["skill1", "skill2"],
  "experience_summary": "summary in 2 sentences",
  "gaps": ["gap1", "gap2"],
  "recommended_subjects": [
    {
      "name": "Topic name",
      "icon": "emoji",
      "color": "blue|green|orange|purple",
      "reason": "why to learn it based on the CV",
      "hours": "Xh",
      "chapList": [
        {"name": "Chapter 1", "done": false},
        {"name": "Chapter 2", "done": false},
        {"name": "Chapter 3", "done": false},
      {"name": "Chapter 4", "done": false},
      {"name": "Chapter 5", "done": false},
      {"name": "Chapter 6", "done": false},
      {"name": "Chapter 7", "done": false},
      {"name": "Chapter 8", "done": false},
      {"name": "Chapter 9", "done": false},
      {"name": "Chapter 10", "done": false}
      ]
    }
  ],
  "interview_questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ]
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: fileBase64 } },
              { text: prompt },
            ],
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 8192, responseMimeType: 'application/json' },
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

    const analysis = parseJSON(rawText);

    // deterministic ID based on name so cache survives re-analysis
    const used = new Set();
    const slug = name => {
      let base = 'cv_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let id = base;
      for (let n = 1; used.has(id); n++) id = base + '_' + n;
      used.add(id);
      return id;
    };
    analysis.recommended_subjects = (analysis.recommended_subjects || []).map((s, i) => ({
      ...s,
      id: slug(s.name),
      pct: 0,
      tag: 'Recomendado CV',
      chapters: `0/${s.chapList?.length || 0} caps`,
      exam: null,
      aiSuggested: true,
      fromCV: true,
      priority: 20 + i,
    }));

    res.status(200).json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
