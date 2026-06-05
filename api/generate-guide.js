import parseJSON from './_parse.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { subjectName, chapterName, subjectReason = '', embeddedGuide } = req.body || {};
  if (!subjectName || !chapterName) return res.status(400).json({ error: 'subjectName and chapterName required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  let labContext = '';
  if (embeddedGuide) {
    const parts = [];
    if (embeddedGuide.keyConcept) parts.push(`Concepto clave: ${embeddedGuide.keyConcept}`);
    if (embeddedGuide.labExpress) parts.push(`Lab Express — ${embeddedGuide.labExpress.title}:\n${embeddedGuide.labExpress.body}`);
    if (embeddedGuide.projectEvolution) parts.push(`Project Evolution — ${embeddedGuide.projectEvolution.title}:\n${embeddedGuide.projectEvolution.body}`);
    if (parts.length) {
      labContext = `\n\nLABORATORIOS ASOCIADOS (debes correlacionar los ejercicios con este contenido):\n${parts.join('\n\n')}`;
    }
  }

  const prompt = `Eres un instructor técnico senior especializado en SDET (Software Development Engineer in Test).
Genera una guía de estudio PRÁCTICA para el capítulo "${chapterName}" de la materia "${subjectName}".
${subjectReason ? `Contexto del tema: ${subjectReason}` : ''}${labContext}

FILOSOFÍA: Menos teoría, más código. Cada concepto debe ir seguido inmediatamente de un ejercicio real.

INSTRUCCIÓN CLAVE — CORRELACIÓN CON LABORATORIOS:
- Los ejercicios en "sections" (código) y "exercises" DEBEN estar correlacionados con los laboratorios asociados.
- Si hay un Lab Express, los ejercicios de código deben practicar exactamente lo que el Lab Express enseña.
- Si hay un Project Evolution, los ejercicios deben construir skills que se aplican directamente en ese proyecto.
- Los hints y pasos de los ejercicios deben referenciar los laboratorios cuando sea relevante.
- Si los laboratorios usan herramientas específicas (Postman, Playwright, Selenium, etc.), los ejercicios deben usar las mismas.

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
- Todo en español excepto el código.
- ESCAPE CORRECTAMENTE el JSON: escapa comillas dobles (\\") y barras invertidas (\\) dentro de los valores de código. NO pongas saltos de línea literales dentro de strings JSON.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8192, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini error', detail: err });
    }

    const data = await geminiRes.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const rawText = parts.filter(p => !p.thought).map(p => p.text).join('') || '';
    if (!rawText) return res.status(502).json({ error: 'Empty response from Gemini' });
    if (candidate?.finishReason === 'MAX_TOKENS') {
      return res.status(502).json({ error: 'Gemini response was truncated. Try reducing the chapter size.' });
    }

    const guide = parseJSON(rawText);
    res.status(200).json({ guide });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
