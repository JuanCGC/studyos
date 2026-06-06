import parseJSON from './_parse.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { subjectName, chapterName, subjectReason = '', language = 'JavaScript', embeddedGuide, showDeepDiveComments } = req.body || {};
  if (!subjectName || !chapterName) return res.status(400).json({ error: 'subjectName and chapterName required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  let labContext = '';
  if (embeddedGuide) {
    const parts = [];
    if (embeddedGuide.keyConcept) parts.push(`Key concept: ${embeddedGuide.keyConcept}`);
    if (embeddedGuide.labExpress) parts.push(`Lab Express — ${embeddedGuide.labExpress.title}:\n${embeddedGuide.labExpress.body}`);
    if (embeddedGuide.projectEvolution) parts.push(`Project Evolution — ${embeddedGuide.projectEvolution.title}:\n${embeddedGuide.projectEvolution.body}`);
    if (parts.length) {
      labContext = `\n\nASSOCIATED LABS (you must correlate the exercises with this content):\n${parts.join('\n\n')}`;
    }
  }

  let prompt = `You are a senior technical instructor specialized in SDET (Software Development Engineer in Test).
Generate a PRACTICAL study guide for the chapter "${chapterName}" of the subject "${subjectName}".
${subjectReason ? `Topic context: ${subjectReason}` : ''}${labContext}

PHILOSOPHY: Less theory, more code. Each concept should be immediately followed by a real exercise.

KEY INSTRUCTION — CORRELATION WITH LABS:
- The exercises in "sections" (code) and "exercises" MUST correlate with the associated labs.
- If there is a Lab Express, the coding exercises must practice exactly what the Lab Express teaches.
- If there is a Project Evolution, the exercises must build skills that apply directly to that project.
- Exercise hints and steps must reference the labs when relevant.
- If the labs use specific tools (Postman, Playwright, Selenium, etc.), the exercises must use the same ones.

IMPORTANT — All code examples MUST be written in ${language}. Use ${language} syntax, idioms, and conventions.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "title": "${chapterName}",
  "summary": "1-2 sentences: what you will build/practice in this chapter",
  "sections": [
    {
      "type": "text",
      "title": "Short title",
      "content": "BRIEF explanation (max 3 sentences). Only what's essential to understand the code that follows."
    },
    {
      "type": "code",
      "title": "Exercise title",
      "what": "One line explaining exactly what this code does and why",
      "language": "${language.toLowerCase()}",
      "content": "// real, complete, executable code in ${language}"
    },
    {
      "type": "code",
      "title": "Next exercise",
      "what": "One line explaining exactly what this code does and why",
      "language": "${language.toLowerCase()}",
      "content": "// code that builds on the previous one, in ${language}"
    },
    {
      "type": "list",
      "title": "Key points to remember",
      "items": ["concrete point 1", "concrete point 2", "concrete point 3"]
    }
  ],
  "exercises": [
    {
      "title": "Exercise 1",
      "goal": "What you must achieve",
      "steps": ["step 1", "step 2", "step 3"],
      "hint": "Hint or initial snippet in ${language}"
    },
    {
      "title": "Exercise 2 — harder variant",
      "goal": "What you must achieve",
      "steps": ["step 1", "step 2", "step 3"],
      "hint": "Hint or initial snippet in ${language}"
    }
  ]
}

Strict rules:
- Text sections: max 3 sentences each. DO NOT explain what the code already says.
- Code: minimum 3 code sections, max 2 text sections. Total max 7 sections.
- Each code section MUST have a "what" field explaining what it does in one line.
- exercises: exactly 2 practical exercises with clear steps and a code hint.
- ALL code MUST be in ${language}. Use ${language} best practices, naming conventions, and testing frameworks.
- Everything in English, including text and comments. Code stays in its natural language.
- Properly ESCAPE the JSON: escape double quotes (\\") and backslashes (\\) inside code values. DO NOT put literal line breaks inside JSON strings.`;

  if (showDeepDiveComments) {
    prompt += `

CRITICAL CODE COMMENTING RULE (SELECTIVE):
Do not comment on self-explanatory or basic code lines. Only inject inline comments for critical, high-impact lines that involve environment handling, performance/scaling trade-offs, or hidden pitfalls.
- Limit comments to a maximum of 2 to 4 critical lines per code block.
- Use the prefix '// \u{1F4A1} CRITICAL:' (or the appropriate language equivalent comment syntax, like '#' for Python/YAML) followed by a concise engineering justification.
- Ensure the code remains syntactically valid.`;
  }

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

    let guide;
    try {
      guide = parseJSON(rawText);
    } catch (_) {
      if (candidate?.finishReason === 'MAX_TOKENS') {
        // Retry with Pro model which supports 64K output tokens
        const proRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 64000, responseMimeType: 'application/json' },
            }),
          }
        );
        if (proRes.ok) {
          const proData = await proRes.json();
          const proCandidate = proData.candidates?.[0];
          const proParts = proCandidate?.content?.parts || [];
          const proText = proParts.filter(p => !p.thought).map(p => p.text).join('') || '';
          if (proText) try { guide = parseJSON(proText); } catch (_) {}
        }
      }
      if (!guide) return res.status(502).json({ error: 'Gemini response was truncated. Try reducing the chapter size.' });
    }

    res.status(200).json({ guide });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
