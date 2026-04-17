import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'Supabase の環境変数が未設定です。.env に VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY を設定してください。',
  );
}

export const supabase = createClient<Database>(url, publishableKey);
