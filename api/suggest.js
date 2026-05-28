export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { subjects = [] } = req.body || {};

  const summary = subjects
    .map(s => `${s.name} (${s.pct}% completado)`)
    .join(', ');

  const alreadyHave = subjects.map(s => s.name).join(', ');

  const prompt = `Eres un advisor de carrera para SDET (Software Development Engineer in Test).
El estudiante tiene este stack actual: ${summary}.
NO repitas estas materias: ${alreadyHave}.

Sugiere exactamente 3 nuevos temas técnicos para expandir su stack SDET.
Prioriza temas como: performance testing, mobile testing, security testing, observability, contract testing, AI/ML testing, chaos engineering, etc.

Responde ÚNICAMENTE con un JSON array válido. Sin markdown, sin \`\`\`, sin texto extra. Solo el JSON:
[
  {
    "name": "Nombre corto del tema",
    "icon": "emoji relevante",
    "color": "blue",
    "reason": "Una frase explicando por qué este tema expande el stack",
    "hours": "Xh",
    "chapList": [
      {"name": "Nombre del capítulo 1", "done": false},
      {"name": "Nombre del capítulo 2", "done": false},
      {"name": "Nombre del capítulo 3", "done": false},
      {"name": "Nombre del capítulo 4", "done": false},
      {"name": "Nombre del capítulo 5", "done": false},
      {"name": "Nombre del capítulo 6", "done": false}
    ]
  }
]
Los colores disponibles son solo: blue, green, orange, purple. Varía los colores entre las 3 sugerencias.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
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
    const raw = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return res.status(502).json({ error: 'No JSON in Gemini response', raw });

    const suggestions = JSON.parse(match[0]);

    // attach unique ids and mark as AI-suggested
    const enriched = suggestions.map((s, i) => ({
      ...s,
      id: 'ai_' + Date.now() + '_' + i,
      pct: 0,
      tag: 'Sugerido',
      chapters: `0/${s.chapList.length} caps`,
      exam: null,
      aiSuggested: true,
      priority: 10 + i,
    }));

    res.status(200).json({ suggestions: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
