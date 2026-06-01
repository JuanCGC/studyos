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
Genera una guía de estudio PRÁCTICA para el capítulo "${chapterName}" de la materia "${subjectName}".
${subjectReason ? `Contexto del tema: ${subjectReason}` : ''}

FILOSOFÍA: Menos teoría, más código. Cada concepto debe ir seguido inmediatamente de un ejercicio real.

Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra:
{
  "title": "${chapterName}",
  "summary": "1-2 frases: qué vas a construir/practicar en este capítulo",
  "sections": [
    {
      "type": "text",
      "title": "Título corto",
      "content": "Explicación BREVE (máximo 3 oraciones). Solo lo esencial para entender el código que sigue."
    },
    {
      "type": "code",
      "title": "Título del ejercicio",
      "what": "Una línea explicando exactamente qué hace este código y por qué",
      "language": "java",
      "content": "// código real, completo y ejecutable"
    },
    {
      "type": "code",
      "title": "Siguiente ejercicio",
      "what": "Una línea explicando exactamente qué hace este código y por qué",
      "language": "java",
      "content": "// código que amplía el anterior"
    },
    {
      "type": "list",
      "title": "Puntos clave para recordar",
      "items": ["punto concreto 1", "punto concreto 2", "punto concreto 3"]
    }
  ],
  "exercises": [
    {
      "title": "Ejercicio 1",
      "goal": "Qué debes lograr",
      "steps": ["paso 1", "paso 2", "paso 3"],
      "hint": "Pista o snippet inicial"
    },
    {
      "title": "Ejercicio 2 — variante más difícil",
      "goal": "Qué debes lograr",
      "steps": ["paso 1", "paso 2", "paso 3"],
      "hint": "Pista o snippet inicial"
    }
  ]
}

Reglas estrictas:
- Secciones de texto: máximo 3 oraciones cada una. NO explicar lo que el código ya dice.
- Código: mínimo 3 secciones de código, máximo 2 de texto. Total máximo 7 secciones.
- Cada sección de código DEBE tener campo "what" explicando qué hace en una línea.
- exercises: exactamente 2 ejercicios prácticos con pasos claros y hint de código.
- Código funcional, real, del stack SDET (java, javascript, bash, yaml, python, groovy).
- Todo en español excepto el código.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
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
