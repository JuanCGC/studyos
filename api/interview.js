export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { messages = [], cvSummary = '', topic = '', userName = '' } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const candidateName = userName || 'the candidate';

  const systemContext = `You are a senior SDET technical interviewer.
The candidate's name is ${candidateName}.
${cvSummary ? `Candidate background: ${cvSummary}.` : ''}
${topic ? `Session topic: ${topic}.` : ''}
Your role:
- Address the candidate by name (${candidateName})
- Ask real SDET technical interview questions
- Give constructive feedback on answers
- If the candidate doesn't know something, briefly explain and move to the next question
- Alternate between theoretical and practical questions
- Speak in English
Start the session by greeting the candidate by name and asking a direct technical question.`;

  const contents = [];

  if (messages.length === 0) {
    contents.push({ role: 'user', parts: [{ text: systemContext }] });
    contents.push({ role: 'model', parts: [{ text: `¡Empecemos, ${candidateName}! ` }] });
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini error', detail: err });
    }

    const data = await geminiRes.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const reply = parts.filter(p => !p.thought).map(p => p.text).join('') || '';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
