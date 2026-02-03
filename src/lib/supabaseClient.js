// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ВАШИ РЕАЛЬНЫЕ КЛЮЧИ (замените если нужно)
const SUPABASE_URL = 'https://umvqpgiekgvthdqgidyx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hNARqA6zE7DOCaZQSUuBaw_kv7WcA9_';

// Проверка ключей
console.log('🔧 Инициализация Supabase с URL:', SUPABASE_URL);

if (!SUPABASE_URL || SUPABASE_URL.includes('default')) {
  console.error('❌ ОШИБКА: Неверный Supabase URL!');
  console.log('Используется:', SUPABASE_URL);
  console.log('Ожидается что-то вроде: https://xxxxxx.supabase.co');
}

// Создаем клиент
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Экспортируем
export { supabase };