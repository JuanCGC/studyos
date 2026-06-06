import parseJSON from './_parse.js';

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
    inProgress.length  ? `IN PROGRESS: ${inProgress.map(s => `${s.name} (${s.pct}%)`).join(', ')}` : '',
    completed.length   ? `COMPLETED: ${completed.map(s => s.name).join(', ')}` : '',
    notStarted.length  ? `NOT STARTED: ${notStarted.map(s => s.name).join(', ')}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `You are a career advisor for SDET (Software Development Engineer in Test).

CURRENT STUDENT PROGRESSION:
${progressDetail}

Analyze their progression and suggest exactly 3 topics that are the LOGICAL NEXT STEP of what they are studying.
Expected reasoning:
- If they are advanced in API Testing → suggest topics that deepen or complement (e.g. Contract Testing, API Security, GraphQL Testing)
- If they are starting CI/CD → suggest topics that build on that (e.g. Infrastructure as Code, GitOps, Observability)
- If they completed something → suggest the next level or specialization
- DO NOT suggest generic topics unrelated to their current progression
- DO NOT repeat: ${alreadyHave}

Respond ONLY with a valid JSON array. No markdown, no \`\`\`, no extra text:
[
  {
    "name": "Short topic name",
    "icon": "relevant phosphor icon name (e.g. robot, database, shield, globe, code, chart-bar, cloud, lock, terminal, bug, gear, graph, layers, stack, wrench, microscope). Choose the most fitting one.",
    "color": "blue",
    "reason": "One concrete sentence explaining why this follows logically from their current progression",
    "hours": "Xh",
    "chapList": [
      {"name": "Chapter 1 name", "done": false},
      {"name": "Chapter 2 name", "done": false},
      {"name": "Chapter 3 name", "done": false},
      {"name": "Chapter 4 name", "done": false},
      {"name": "Chapter 5 name", "done": false},
      {"name": "Chapter 6 name", "done": false},
      {"name": "Chapter 7 name", "done": false},
      {"name": "Chapter 8 name", "done": false},
      {"name": "Chapter 9 name", "done": false},
      {"name": "Chapter 10 name", "done": false}
    ]
  }
]
Available colors: blue, green, orange, purple. Vary them across the 3 suggestions.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 4096, responseMimeType: 'application/json' },
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

    const suggestions = parseJSON(rawText);

    // deterministic ID based on name so cache survives re-suggestion
    const used = new Set();
    const slug = name => {
      let base = 'ai_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let id = base;
      for (let n = 1; used.has(id); n++) id = base + '_' + n;
      used.add(id);
      return id;
    };
    const enriched = suggestions.map((s, idx) => ({
      ...s,
      id: slug(s.name),
      pct: 0,
      tag: 'Suggested',
      chapters: `0/${s.chapList.length} ch`,
      exam: null,
      aiSuggested: true,
      priority: 10 + idx,
    }));

    res.status(200).json({ suggestions: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
