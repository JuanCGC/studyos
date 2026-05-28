export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages = [], cvSummary = '', topic = '' } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  // Build conversation history for Gemini
  const systemContext = `Eres un entrevistador técnico senior especializado en SDET.
Contexto del candidato: ${cvSummary || 'Candidato SDET en preparación'}.
${topic ? `Tema de esta sesión: ${topic}.` : ''}
Tu rol:
- Haz preguntas técnicas reales de entrevista SDET
- Da feedback constructivo a las respuestas
- Si el candidato no sabe algo, explícalo brevemente y pasa a la siguiente pregunta
- Alterna entre preguntas teóricas y prácticas
- Habla en español
Empieza la sesión con una pregunta de introducción sobre el tema.`;

  const contents = [];

  // First turn: system context as user message (Gemini doesn't have system role)
  if (messages.length === 0) {
    contents.push({ role: 'user', parts: [{ text: systemContext }] });
    contents.push({ role: 'model', parts: [{ text: '¡Perfecto! Empecemos la sesión de práctica. ' }] });
  } else {
    // inject system context in first exchange
    contents.push({ role: 'user', parts: [{ text: systemContext }] });
    contents.push({ role: 'model', parts: [{ text: 'Entendido, comenzamos.' }] });
    // add conversation history
    for (const m of messages) {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      });
    }
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini error', detail: err });
    }

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
