export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { subjectName = '', chapterName = '' } = req.body || {};

  const prompt = `Eres un instructor SDET experto. Crea exactamente 3 preguntas de opción múltiple para verificar comprensión del capítulo "${chapterName}" de la materia "${subjectName}".

Reglas:
- Preguntas concretas, técnicas, orientadas a la práctica real de SDET
- 4 opciones por pregunta (A, B, C, D)
- Solo UNA respuesta correcta por pregunta
- Dificultad media-alta: no triviales, que requieran haber estudiado el tema
- Las opciones incorrectas deben ser plausibles (no obvias)

Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra:
[
  {
    "q": "Texto de la pregunta",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correct": 0
  }
]
(correct = índice 0-3 de la opción correcta)`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
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
    if (!match) return res.status(502).json({ error: 'No JSON in response', raw });

    const questions = JSON.parse(match[0]);
    res.status(200).json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
