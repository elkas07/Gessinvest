// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Assurez-vous que ces valeurs sont correctes et qu'elles ne sont pas exposées publiquement.
// Pour les projets en production, utilisez des variables d'environnement.
const SUPABASE_PROJECT_URL = 'https://mtjkijmzzycymjmdlvn.supabase.co';
const SUPABASE_ANONYMOUS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10amtpam16eXpjeXltam1kbHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDgwNzQsImV4cCI6MjA2OTc4NDA3NH0.s35vs0dVC0XrKMwPLgP_WxVUBZKuJRAbF6S0-dspTt0';

/**
 * Crée et exporte le client Supabase.
 * Ce client est utilisé pour toutes les interactions avec la base de données et l'authentification.
 */
export const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANONYMOUS_KEY);