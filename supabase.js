// supabase.js

// Les identifiants Supabase sont definis ici
const SUPABASE_URL = 'https://mtjkijmzzycymjmdlvn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10amtpam16eXpjeXltam1kbHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDgwNzQsImV4cCI6MjA2OTc4NDA3NH0.s35vs0dVC0XrKMwPLgP_WxVUBZKuJRAbF6S0-dspTt0';

// On s'assure que la variable globale 'supabase' existe avant de l'utiliser.
// L'op�rateur '?' est utilis� pour �viter une erreur si 'window.supabase' n'est pas encore d�fini.
export const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);

// Si vous utilisez un syst�me de modules et n'incluez pas le script CDN,
// la ligne suivante serait la bonne, mais vous devez vous assurer que
// la biblioth�que est correctement import�e en tant que module.
// import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
// export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Vous pouvez ajouter d'autres fonctions ici si n�cessaire
// export async function signInWithEmail(email, password) {
//     const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//     });
//     return { data, error };
// }