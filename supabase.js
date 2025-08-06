const SUPABASE_URL = 'https://mtjkijmzzycymjmdlvn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10amtpam16eXpjeXltam1kbHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDgwNzQsImV4cCI6MjA2OTc4NDA3NH0.s35vs0dVC0XrKMwPLgP_WxVUBZKuJRAbF6S0-dspTt0';

// 'supabase' est déjà une variable globale après l'inclusion du script CDN
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Vous pouvez ajouter d'autres fonctions ici si nécessaire
// export async function signInWithEmail(email, password) {
//      const { data, error } = await supabase.auth.signInWithPassword({
//          email,
//          password,
//      });
//      return { data, error };
// }