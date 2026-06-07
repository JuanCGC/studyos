import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import 'dotenv/config';

const app = express();

// ── Body parsing ─────────────────────────────────────────────
// Must run before any route. Preserves rawBody for webhook
// HMAC verification while also providing parsed req.body.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Signature');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST' && req.path === '/api/analyze-cv') {
    const cl = parseInt(req.headers['content-length'] || '0', 10);
    if (cl > 5 * 1024 * 1024) {
      res.status(413).json({ error: 'File too large. Maximum 4 MB.' });
      return;
    }
  }

  let destroyed = false;
  let data = '';
  let size = 0;
  req.on('data', chunk => {
    size += chunk.length;
    if (!destroyed && size > 6 * 1024 * 1024) {
      destroyed = true;
      if (!res.headersSent) res.status(413).json({ error: 'Payload too large' });
      req.destroy();
    }
    if (!destroyed) data += chunk;
  });
  req.on('end', () => {
    if (destroyed) return;
    req.rawBody = data;
    if (data) {
      try { req.body = JSON.parse(data); } catch { req.body = {}; }
    } else {
      req.body = {};
    }
    next();
  });
});

// ── Shared helpers ──────────────────────────────────────────
function devLog(...args) {
  if (process.env.NODE_ENV === 'development') console.log(...args);
}
function devError(...args) {
  if (process.env.NODE_ENV === 'development') console.error(...args);
}

const DEFAULT_SUPABASE_URL = 'https://jyasohtnqlracghsxdla.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5YXNvaHRucWxyYWNnaHN4ZGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODkxNjMsImV4cCI6MjA5NjM2NTE2M30.lE99l7i3Pxrl6F9EjJSBXvc0oxivRKTzulmvRmkejKY';

function getSupabaseConfig() {
  return {
    url: process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY,
    serviceKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  };
}

/** Service-role client — webhooks and other admin-only paths */
function getSupabaseAdmin() {
  const { url, anonKey, serviceKey } = getSupabaseConfig();
  if (!serviceKey) devError('[api] VITE_SUPABASE_SERVICE_ROLE_KEY not set — webhook/admin ops may fail');
  return createClient(url, serviceKey || anonKey);
}

/** User-scoped client — respects RLS via the caller's JWT */
function getSupabaseForUser(accessToken) {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

async function getUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  const supabase = getSupabaseForUser(token);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return !error && user ? user : null;
}

async function getUserClient(req) {
  const token = extractToken(req);
  if (!token) return { user: null, supabase: null };
  const supabase = getSupabaseForUser(token);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { user: null, supabase: null };
  return { user, supabase };
}

function requireUser(req, res, next) {
  if (!req.headers.authorization)
    return res.status(401).json({ error: 'Missing Authorization header' });
  next();
}

function isTruncated(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const last = trimmed[trimmed.length - 1];
  return last !== '}' && last !== ']';
}

async function geminiFetch(prompt, config = {}, timeoutMs = 30000) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY not set'), { code: 500 });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192, responseMimeType: 'application/json', ...config },
      }),
    });
    if (!res.ok) throw Object.assign(new Error('Gemini API error'), { code: 502, detail: await res.text() });
    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'MAX_TOKENS') {
      throw Object.assign(new Error('Response truncated (max tokens exceeded). Try lowering the prompt complexity or splitting the request.'), { code: 502 });
    }
    const parts = candidate?.content?.parts || [];
    const text = parts.filter(p => !p.thought).map(p => p.text).join('') || '';
    if (!text) throw Object.assign(new Error('Empty response from Gemini'), { code: 502 });
    if (isTruncated(text)) {
      throw Object.assign(new Error('Response truncated (incomplete JSON). Try again or split the request.'), { code: 502 });
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// ── GET /api/config ──────────────────────────────────────────
app.get('/api/config', (req, res) => {
  const cfg = getSupabaseConfig();
  res.json({
    supabaseUrl: cfg.url,
    supabaseAnonKey: cfg.anonKey,
  });
});

// ── POST /api/checkout ───────────────────────────────────────
const PLANS = {
  pro:  { amount: 19, currency: 'USD', description: 'StudIt Pro Plan — Monthly',  subject_limit: 20,    plan_type: 'pro' },
  enterprise: { amount: 99, currency: 'USD', description: 'StudIt Enterprise Plan — Monthly', subject_limit: 9999, plan_type: 'enterprise' },
};

app.post('/api/checkout', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { tier } = req.body || {};
  const plan = PLANS[tier];
  if (!plan) return res.status(400).json({ error: `Invalid or missing tier. Supported: ${Object.keys(PLANS).join(', ')}` });

  const dlocalLogin    = process.env.DLOCAL_LOGIN;
  const dlocalTransKey = process.env.DLOCAL_TRANS_KEY;
  const dlocalSecretKey = process.env.DLOCAL_SECRET_KEY;
  if (!dlocalLogin || !dlocalTransKey || !dlocalSecretKey)
    return res.status(500).json({ error: 'dLocal Go not configured' });

  const origin  = req.headers.origin || 'https://studit.vercel.app';
  const orderId = `studit_${user.id}_${Date.now()}`;

  try {
    const body = JSON.stringify({
      amount: plan.amount,
      currency: plan.currency,
      description: plan.description,
      order_id: orderId,
      country: 'CO',
      payer: {
        name:  user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        document: '',
        user_ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '',
      },
      payment_method_id: 'CARD',
      notification_url: `${origin}/api/webhooks/dlocal`,
      callback_url: `${origin}/app?checkout=success`,
      metadata: {
        supabase_user_id: user.id,
        tier,
        subject_limit: plan.subject_limit,
        plan_type: plan.plan_type,
        order_id: orderId,
      },
    });

    const timestamp = Date.now().toString();
    const authHash = crypto
      .createHmac('sha256', dlocalSecretKey)
      .update(timestamp + dlocalLogin + body)
      .digest('hex');

    const dlocalRes = await fetch('https://api.dlocal.com/go/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Login': dlocalLogin,
        'X-Trans-Key': dlocalTransKey,
        'X-Version': '2.1',
        'X-Date': timestamp,
        'X-Auth': authHash,
      },
      body,
    });

    const data = await dlocalRes.json();
    if (!dlocalRes.ok) {
      devError('dLocal error:', data);
      return res.status(dlocalRes.status).json({ error: data.message || 'dLocal payment creation failed' });
    }

    res.status(200).json({ url: data.redirect_url });
  } catch (err) {
    devError('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/generate-guide ─────────────────────────────────
app.post('/api/generate-guide', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { subjectName, chapterName, subjectReason = '', language, embeddedGuide, showDeepDiveComments } = req.body || {};
  if (!subjectName || !chapterName) return res.status(400).json({ error: 'subjectName and chapterName required' });
  if (!language) return res.status(400).json({ error: 'language is required' });

  try {
    let labContext = '';
    if (embeddedGuide) {
      const parts = [];
      if (embeddedGuide.keyConcept) parts.push(`Key concept: ${embeddedGuide.keyConcept}`);
      if (embeddedGuide.labExpress) parts.push(`Lab Express — ${embeddedGuide.labExpress.title}:\n${embeddedGuide.labExpress.body}`);
      if (embeddedGuide.projectEvolution) parts.push(`Project Evolution — ${embeddedGuide.projectEvolution.title}:\n${embeddedGuide.projectEvolution.body}`);
      if (parts.length) labContext = `\n\nASSOCIATED LABS (you must correlate the exercises with this content):\n${parts.join('\n\n')}`;
    }

    let prompt = `You are a senior technical instructor specialized in SDET (Software Development Engineer in Test).
Generate a PRACTICAL study guide for the chapter "${chapterName}" of the subject "${subjectName}".
${subjectReason ? `Topic context: ${subjectReason}` : ''}${labContext}

CRITICAL LANGUAGE RULE: ALL generated content MUST be written entirely in ENGLISH. Do not use any other language.

PHILOSOPHY: Less theory, more code. Each concept should be immediately followed by a real exercise.

KEY INSTRUCTION — CORRELATION WITH LABS:
- The code sections MUST correlate with the associated labs.
- If there is a Lab Express, the coding examples must practice exactly what the Lab Express teaches.
- If there is a Project Evolution, the examples must build skills that apply directly to that project.
- If the labs use specific tools (Postman, Playwright, Selenium, etc.), the code must use the same ones.

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
  ]
}

Strict rules:
- Text sections: max 3 sentences each. DO NOT explain what the code already says.
- Code: minimum 3 code sections, max 2 text sections. Total max 7 sections.
- Each code section MUST have a "what" field explaining what it does in one line.
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

    const text = await geminiFetch(prompt);
    let guide;
    try { guide = parseJSON(text); }
    catch { return res.status(502).json({ error: 'Failed to parse Gemini response. Try again.' }); }
    res.status(200).json({ guide });
  } catch (err) {
    const status = err.code || 500;
    res.status(status).json({ error: err.message, detail: err.detail });
  }
});

// ── POST /api/quiz ───────────────────────────────────────────
app.post('/api/quiz', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { subjectName = '', chapterName = '', chapterIndex = 0, totalChapters = 0 } = req.body || {};

  const position = totalChapters > 0 ? `chapter ${chapterIndex + 1} of ${totalChapters}` : `chapter ${chapterIndex + 1}`;
  const level = chapterIndex <= 2 ? 'introductory' : chapterIndex <= Math.floor((totalChapters || 10) * 0.5) ? 'intermediate' : 'advanced';

  const prompt = `You are an expert SDET instructor teaching entirely in ENGLISH.

CRITICAL — LANGUAGE CONSTRAINT: You MUST generate ALL content strictly in ENGLISH. Never use Spanish, even if the chapter name or subject name seems to suggest a different language. This is non-negotiable.

Create exactly 3 multiple-choice questions about the chapter "${chapterName}" (${position}, ${level} level) of the subject "${subjectName}".

STRICT rules:
- Questions must cover ONLY the content of "${chapterName}". DO NOT introduce concepts from other chapters.
- ${level} level: if introductory, ask about definitions, core concepts and fundamental uses of "${chapterName}".
- Questions must be answerable by someone who just studied "${chapterName}" and nothing else.
- 4 options per question (A, B, C, D). Only ONE correct.
- Wrong options must be plausible but clearly incorrect for someone who studied the topic.
- LANGUAGE RULE (again, mandatory): ALL question text, ALL option text (A/B/C/D), and ALL content must be written in ENGLISH ONLY.

Respond ONLY with valid JSON, no markdown, no extra text:
[
  {
    "q": "What is the correct HTTP status code for a successful POST request?",
    "options": ["200 OK", "201 Created", "202 Accepted", "204 No Content"],
    "correct": 1
  }
]
(correct = index 0-3 of the correct option)

REMINDER: Questions and options above are just format examples. You must generate NEW questions about "${chapterName}". And they MUST be in ENGLISH.`;

  try {
    const text = await geminiFetch(prompt, { temperature: 0.3, maxOutputTokens: 2048 });
    const questions = parseJSON(text);
    res.status(200).json({ questions });
  } catch (err) {
    const status = err.code || 500;
    res.status(status).json({ error: err.message, detail: err.detail });
  }
});

// ── POST /api/analyze-cv ─────────────────────────────────────
app.post('/api/analyze-cv', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { fileBase64, mimeType = 'application/pdf', currentSubjects = [] } = req.body || {};
  if (!fileBase64) return res.status(400).json({ error: 'fileBase64 required' });
  if (fileBase64.length > 5.3e6) {
    return res.status(413).json({ error: 'File too large. Maximum 4 MB.' });
  }

  const alreadyHave = currentSubjects.map(s => s.name).join(', ');

  const prompt = `You are a career advisor specialized in SDET (Software Development Engineer in Test).
Analyze this CV and do the following:

1. Extract the candidate's current technical skills.
2. Identify knowledge gaps for the SDET role.
3. Recommend exactly 4 study topics (that are NOT: ${alreadyHave || 'none'}).
4. List 5 common interview questions based on their current experience.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "skills": ["skill1", "skill2"],
  "experience_summary": "summary in 2 sentences",
  "gaps": ["gap1", "gap2"],
  "recommended_subjects": [
    {
      "name": "Topic name",
      "icon": "relevant phosphor icon name (e.g. robot, database, shield, globe, code, chart-bar, cloud, lock, terminal, bug, gear, graph, layers, stack, wrench, microscope). Choose the most fitting one.",
      "color": "blue|green|orange|purple",
      "reason": "why to learn it based on the CV",
      "hours": "Xh",
      "chapList": [
        {"name": "Chapter 1", "done": false},
        {"name": "Chapter 2", "done": false},
        {"name": "Chapter 3", "done": false},
        {"name": "Chapter 4", "done": false},
        {"name": "Chapter 5", "done": false},
        {"name": "Chapter 6", "done": false},
        {"name": "Chapter 7", "done": false},
        {"name": "Chapter 8", "done": false},
        {"name": "Chapter 9", "done": false},
        {"name": "Chapter 10", "done": false}
      ]
    }
  ],
  "interview_questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ]
}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

    const cvController = new AbortController();
    const cvTimer = setTimeout(() => cvController.abort(), 60000);
    let geminiRes;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: cvController.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ inlineData: { mimeType, data: fileBase64 } }, { text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 8192, responseMimeType: 'application/json' },
          }),
        }
      );
    } finally {
      clearTimeout(cvTimer);
    }

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return res.status(502).json({ error: 'Gemini error', detail: err });
    }

    const data = await geminiRes.json();
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'MAX_TOKENS') {
      return res.status(502).json({ error: 'Response truncated (max tokens exceeded). Simplify the CV or remove content.' });
    }
    const parts = candidate?.content?.parts || [];
    const rawText = parts.filter(p => !p.thought).map(p => p.text).join('') || '';
    if (!rawText) return res.status(502).json({ error: 'Empty response from Gemini' });
    if (isTruncated(rawText)) {
      return res.status(502).json({ error: 'Response truncated (incomplete JSON). Try again.' });
    }

    const analysis = parseJSON(rawText);
    const used = new Set();
    const slug = name => {
      let base = 'cv_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let id = base;
      for (let n = 1; used.has(id); n++) id = base + '_' + n;
      used.add(id);
      return id;
    };
    analysis.recommended_subjects = (analysis.recommended_subjects || []).map((s, i) => ({
      ...s,
      id: slug(s.name),
      pct: 0,
      tag: 'From CV',
      chapters: `0/${s.chapList?.length || 0} ch`,
      exam: null,
      aiSuggested: true,
      fromCV: true,
      priority: 20 + i,
    }));

    res.status(200).json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/suggest ────────────────────────────────────────
app.post('/api/suggest', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
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
    const text = await geminiFetch(prompt, { temperature: 0.4, maxOutputTokens: 4096 });
    const suggestions = parseJSON(text);
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
    const status = err.code || 500;
    res.status(status).json({ error: err.message, detail: err.detail });
  }
});

// ── POST /api/interview ──────────────────────────────────────
app.post('/api/interview', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { messages = [], cvSummary = '', topic = '', userName = '' } = req.body || {};

  try {
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
      contents.push({ role: 'model', parts: [{ text: `Let's begin, ${candidateName}! ` }] });
    } else {
      contents.push({ role: 'user', parts: [{ text: systemContext }] });
      contents.push({ role: 'model', parts: [{ text: 'Understood, starting the session.' }] });
      for (const m of messages) {
        contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
      }
    }

    const intController = new AbortController();
    const intTimer = setTimeout(() => intController.abort(), 30000);
    let geminiRes;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: intController.signal,
          body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }),
        }
      );
    } finally {
      clearTimeout(intTimer);
    }

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
});

// ── GET /api/analytics-hours ─────────────────────────────────
app.get('/api/analytics-hours', async (req, res) => {
  const { user, supabase } = await getUserClient(req);
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' });

  const timezone = req.query.timezone || 'UTC';

  try {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('subject_id, duration_minutes, completed_at')
      .eq('user_id', user.id)
      .not('subject_id', 'is', null);

    if (error) return res.status(500).json({ error: error.message });

    const agg = {};
    for (const row of data || []) {
      agg[row.subject_id] = (agg[row.subject_id] || 0) + row.duration_minutes;
    }
    const result = Object.entries(agg).map(([subject_id, total_minutes]) => ({
      subject_id,
      total_hours: Math.round((total_minutes / 60) * 10) / 10,
    }));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/pomodoro-log ───────────────────────────────────
app.post('/api/pomodoro-log', async (req, res) => {
  const { user, supabase } = await getUserClient(req);
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' });

  const { subjectId, chapterName, durationMinutes, timezone } = req.body || {};
  if (!durationMinutes || typeof durationMinutes !== 'number')
    return res.status(400).json({ error: 'durationMinutes (number) is required' });

  try {
    const { error } = await supabase.from('pomodoro_sessions').insert({
      user_id: user.id,
      subject_id: subjectId || null,
      chapter_name: chapterName || null,
      duration_minutes: durationMinutes,
      completed_at: new Date().toISOString(),
    });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/tasks ────────────────────────────────────────
app.delete('/api/tasks', async (req, res) => {
  const { user, supabase } = await getUserClient(req);
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing task id' });

  try {
    const { error: rpcErr } = await supabase.rpc('delete_progress_task', {
      p_user_id: user.id,
      p_task_id: String(id),
    });

    if (rpcErr) {
      if ((rpcErr.message || '').includes('function') && (rpcErr.message || '').includes('exist')) {
        const { data: progress } = await supabase
          .from('progress')
          .select('tasks')
          .eq('user_id', user.id)
          .single();

        let raw = progress?.tasks;
        if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = []; } }
        if (!Array.isArray(raw)) raw = [];
        const updated = raw.filter(t => String(t?.id) !== String(id));

        const { error: upsertError } = await supabase
          .from('progress')
          .upsert({ user_id: user.id, tasks: updated, updated_at: new Date().toISOString() });

        if (upsertError) return res.status(500).json({ error: upsertError.message });
      } else {
        return res.status(500).json({ error: rpcErr.message });
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/subjects ──────────────────────────────────────
app.delete('/api/subjects', async (req, res) => {
  const { user, supabase } = await getUserClient(req);
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing subject id' });

  try {

    await supabase.from('pomodoro_sessions').delete()
      .eq('user_id', user.id)
      .eq('subject_id', id);

    await supabase.from('interview_flashcards').delete()
      .eq('user_id', user.id)
      .eq('subject_id', id);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/analytics/flashcards-summary ────────────────────
app.get('/api/analytics/flashcards-summary', async (req, res) => {
  const { user, supabase } = await getUserClient(req);
  if (!user || !supabase) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data, error } = await supabase
      .from('interview_flashcards')
      .select('id, mastered, review_count')
      .eq('user_id', user.id);

    if (error) return res.status(500).json({ error: error.message });

    const total = data?.length || 0;
    const reviewed = data?.filter(c => c.review_count > 0).length || 0;
    const mastered = data?.filter(c => c.mastered).length || 0;

    res.status(200).json({ total, reviewed, mastered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/webhooks/dlocal ────────────────────────────────
const TIER_CONFIG = {
  pro:  { plan_type: 'pro',  subject_limit: 20 },
  enterprise: { plan_type: 'enterprise', subject_limit: 9999 },
};

app.post('/api/webhooks/dlocal', async (req, res) => {
  const secret = process.env.DLOCAL_SECRET_KEY;
  const signature = req.headers['x-signature'];

  const bodyStr = req.rawBody || '';
  if (!secret || !signature) {
    return res.status(401).json({ error: 'Missing signature or secret' });
  }
  const expected = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
  if (expected.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload = req.body || {};

  res.status(200).json({ received: true });

  setImmediate(async () => {
    try {
      const paymentId = payload.id || payload.order_id;

      const event = payload.event || payload.status;
      const userId = payload.metadata?.supabase_user_id;
      const tier = payload.metadata?.tier;

      if ((event === 'paid' || event === 'PAID' || event === 'SUCCESS') && userId && tier && paymentId) {
        const config = TIER_CONFIG[tier];
        if (!config) return;

        const supabase = getSupabaseAdmin();

        const { error } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_type: config.plan_type,
          subject_limit: config.subject_limit,
          status: 'active',
          payment_id: paymentId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'payment_id', ignoreDuplicates: false });

        if (error?.code === '23505') return;
        if (error) devError('Supabase upsert error:', error);

      } else if ((event === 'cancelled' || event === 'canceled') && paymentId) {
        const supabase = getSupabaseAdmin();
        const { data: existing, error: lookupError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('payment_id', paymentId)
          .single();

        if (!lookupError && existing) {
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: existing.user_id,
            payment_id: paymentId,
            plan_type: 'free',
            subject_limit: 3,
            status: 'canceled',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'payment_id' });
          if (error) devError('Supabase cancel error:', error);
        }
      }
    } catch (err) {
      devError('Webhook error:', err);
    }
  });
});

// Catch‑all removed – let Express default 404 handling

const PORT = process.env.PORT || 4000;
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => devLog(`[api] running on http://localhost:${PORT}`));
}

export default app;
