import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { subjectId, chapterName, durationMinutes } = req.body || {};
  if (!durationMinutes || typeof durationMinutes !== 'number') {
    return res.status(400).json({ error: 'durationMinutes (number) is required' });
  }

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
}
