// js/supabase-client.js
// Cliente oficial do Supabase para o SITE

const SUPABASE_URL = "https://owvswrwsjimvykxnjram.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dnN3cndzamltdnlreG5qcmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTc5ODAsImV4cCI6MjEwMTg5Mzk4MH0.-ATpx2VM6OG2xfJu6b1j5rE4dXphjheY36HPzdLVlC4";

// Inicializador dinâmico
(function initSupabase() {
  const url = SUPABASE_URL || (window.ENV && window.ENV.SUPABASE_URL) || "";
  const key = SUPABASE_ANON_KEY || (window.ENV && window.ENV.SUPABASE_ANON_KEY) || "";

  if (url && key && window.supabase && window.supabase.createClient) {
    try {
      window.supabaseClient = window.supabase.createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log('✅ Supabase Client inicializado com sucesso no SITE.');
    } catch (err) {
      console.warn('⚠️ Erro ao inicializar o Supabase Client no SITE:', err);
      window.supabaseClient = null;
    }
  } else {
    window.supabaseClient = null;
  }
})();

