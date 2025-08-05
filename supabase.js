// supabase.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Charge les variables du .env

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Ajoutez les validations ici (comme dans la réponse précédente)
// ...

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});