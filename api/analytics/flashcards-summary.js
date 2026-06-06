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
}
