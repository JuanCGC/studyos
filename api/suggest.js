export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { subjects = [] } = req.body || {};

  const alreadyHave = subjects.map(s => s.name).join(', ');

  const inProgress = subjects.filter(s => s.pct > 0 && s.pct < 100);
  const completed  = subjects.filter(s => s.pct === 100);
  const notStarted = subjects.filter(s => s.pct === 0);

  const progressDetail = [
    inProgress.length  ? `EN PROGRESO: ${inProgress.map(s => `${s.name} (${s.pct}%)`).join(', ')}` : '',
    completed.length   ? `COMPLETADOS: ${completed.map(s => s.name).join(', ')}` : '',
    notStarted.length  ? `AÚN NO INICIADOS: ${notStarted.map(s => s.name).join(', ')}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `Eres un advisor de carrera para SDET (Software Development Engineer in Test).

PROGRESIÓN ACTUAL DEL ESTUDIANTE:
${progressDetail}

Analiza su progresión y sugiere exactamente 3 temas que sean la CONTINUACIÓN LÓGICA de lo que está estudiando.
Razonamiento esperado:
- Si está avanzado en API Testing → sugerir temas que profundicen o complementen (ej: Contract Testing, API Security, GraphQL Testing)
- Si está iniciando CI/CD → sugerir temas que se construyen sobre eso (ej: Infrastructure as Code, GitOps, Observability)
- Si completó algo → sugerir el siguiente nivel o especialización
- NO sugerir temas genéricos no relacionados con su progresión actual
- NO repetir: ${alreadyHave}

Responde ÚNICAMENTE con un JSON array válido. Sin markdown, sin \`\`\`, sin texto extra:
[
  {
    "name": "Nombre corto del tema",
    "icon": "emoji relevante",
    "color": "blue",
    "reason": "Una frase concreta explicando por qué sigue lógicamente de su progresión actual",
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
Colores disponibles: blue, green, orange, purple. Varía entre las 3 sugerencias.`;

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

    const suggestions = JSON.parse(rawText);

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
