import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://waswpdrikgranshvtgiq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HILhj83kZHb9TExshnf5BQ_pgbqz0zs';

if (!SUPABASE_URL || SUPABASE_URL.includes('default')) {
  console.error('❌ ОШИБКА: Неверный Supabase URL!');

}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase };