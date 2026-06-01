function parseJSON(text) {
  try { return JSON.parse(text); } catch {}
  const repaired = text.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
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

  const { subjectName = '', chapterName = '', chapterIndex = 0, totalChapters = 0 } = req.body || {};

  const position = totalChapters > 0 ? `capítulo ${chapterIndex + 1} de ${totalChapters}` : `capítulo ${chapterIndex + 1}`;
  const level = chapterIndex <= 2 ? 'introductorio' : chapterIndex <= Math.floor((totalChapters || 10) * 0.5) ? 'intermedio' : 'avanzado';

  const prompt = `Eres un instructor SDET experto. Crea exactamente 3 preguntas de opción múltiple sobre el capítulo "${chapterName}" (${position}, nivel ${level}) de la materia "${subjectName}".

Reglas ESTRICTAS:
- Las preguntas deben cubrir ÚNICAMENTE el contenido de "${chapterName}". NO introduzcas conceptos de otros capítulos.
- Nivel ${level}: si es introductorio, pregunta sobre definiciones, conceptos básicos y usos fundamentales de "${chapterName}".
- Las preguntas deben ser respondibles por alguien que acaba de estudiar "${chapterName}" y nada más.
- 4 opciones por pregunta (A, B, C, D). Solo UNA correcta.
- Opciones incorrectas plausibles pero claramente incorrectas para quien estudió el tema.

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
          generationConfig: { temperature: 0.5, maxOutputTokens: 1024, responseMimeType: 'application/json' },
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
