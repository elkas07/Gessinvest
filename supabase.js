import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.8';

// Les identifiants Supabase
// Il est recommandé de ne pas les hardcoder directement dans un fichier JavaScript côté client.
// Pour les projets simples, c'est acceptable. Pour la production, utilisez des variables d'environnement.
const SUPABASE_URL = 'https://mtjkijmzzycymjmdlvn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10amtpam16eXpjeXltam1kbHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDgwNzQsImV4cCI6MjA2OTc4NDA3NH0.s35vs0dVC0XrKMwPLgP_WxVUBZKuJRAbF6S0-dspTt0';

// On initialise le client Supabase en utilisant la fonction createClient.
// Cette fonction est importée ci-dessus.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);