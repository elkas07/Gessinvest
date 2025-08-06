import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://mtjkijmzzycymjmdlvn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10amtpam16eXpjeXltam1kbHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDgwNzQsImV4cCI6MjA2OTc4NDA3NH0.s35vs0dVC0XrKMwPLgP_WxVUBZKuJRAbF6S0-dspTt0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Vous pouvez également ajouter ici les fonctions d'authentification ou d'autres fonctions liées à Supabase
// par exemple pour l'authentification par email et mot de passe
// export async function signInWithEmail(email, password) {
//     const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//     });
//     return { data, error };
// }