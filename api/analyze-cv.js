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

  const prompt = `Eres un advisor de carrera especializado en SDET (Software Development Engineer in Test).
Analiza este CV y realiza lo siguiente:

1. Extrae las habilidades técnicas actuales del candidato.
2. Identifica gaps de conocimiento para el rol SDET.
3. Recomienda exactamente 4 temas de estudio (que NO sean: ${alreadyHave || 'ninguno'}).
4. Lista 5 preguntas de entrevista frecuentes basadas en su experiencia actual.

Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra:
{
  "skills": ["skill1", "skill2"],
  "experience_summary": "resumen en 2 frases",
  "gaps": ["gap1", "gap2"],
  "recommended_subjects": [
    {
      "name": "Nombre del tema",
      "icon": "emoji",
      "color": "blue|green|orange|purple",
      "reason": "por qué aprenderlo basado en el CV",
      "hours": "Xh",
      "chapList": [
        {"name": "Capítulo 1", "done": false},
        {"name": "Capítulo 2", "done": false},
        {"name": "Capítulo 3", "done": false},
        {"name": "Capítulo 4", "done": false},
        {"name": "Capítulo 5", "done": false},
        {"name": "Capítulo 6", "done": false}
      ]
    }
  ],
  "interview_questions": [
    "pregunta 1",
    "pregunta 2",
    "pregunta 3",
    "pregunta 4",
    "pregunta 5"
  ]
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
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
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini error', detail: err });
    }

    const data = await geminiRes.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'No JSON in response', raw });

    const analysis = JSON.parse(match[0]);

    // enrich recommended subjects with IDs
    analysis.recommended_subjects = (analysis.recommended_subjects || []).map((s, i) => ({
      ...s,
      id: 'cv_' + Date.now() + '_' + i,
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
