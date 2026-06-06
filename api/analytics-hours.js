import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('subject_id, duration_minutes')
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
}
