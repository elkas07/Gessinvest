// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://mtjkijmzzycymjmdlvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10amtpam16eXpjeXltam1kbHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDgwNzQsImV4cCI6MjA2OTc4NDA3NH0.s35vs0dVC0XrKMwPLgP_WxVUBZKuJRAbF6S0-dspTt0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
