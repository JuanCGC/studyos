export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { subjectName, chapterName, subjectReason = '' } = req.body || {};
  if (!subjectName || !chapterName) return res.status(400).json({ error: 'subjectName and chapterName required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const prompt = `Eres un instructor técnico senior especializado en SDET (Software Development Engineer in Test).
Genera una guía de estudio completa para el capítulo "${chapterName}" de la materia "${subjectName}".
${subjectReason ? `Contexto del tema: ${subjectReason}` : ''}

Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra:
{
  "title": "${chapterName}",
  "summary": "Resumen de 2-3 frases explicando qué aprenderás y por qué es importante",
  "sections": [
    {
      "type": "text",
      "title": "Título de la sección",
      "content": "Explicación detallada del concepto en 3-5 párrafos"
    },
    {
      "type": "code",
      "title": "Título del ejemplo de código",
      "language": "java",
      "content": "// código real aquí"
    },
    {
      "type": "list",
      "title": "Puntos clave",
      "items": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"]
    }
  ],
  "exercise": "Descripción clara del ejercicio práctico para consolidar este capítulo"
}

Reglas:
- Incluye exactamente: 1-2 secciones de texto, 1-2 ejemplos de código reales, 1 lista de puntos clave
- Máximo 5 secciones totales
- Código en el lenguaje más apropiado para el tema (java, javascript, bash, yaml, python)
- Todo en español excepto el código
- Ejemplos de código deben ser funcionales y relevantes para SDET`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } },
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
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'No JSON in response', raw });

    const guide = JSON.parse(match[0]);
    res.status(200).json({ guide });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
