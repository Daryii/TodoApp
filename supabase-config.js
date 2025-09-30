// Fill these with your Supabase project details
// Go to app.supabase.com → New project → Project settings → API
//   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'
//   const SUPABASE_ANON_KEY = 'your anon public key'

const SUPABASE_URL = 'https://hqdcsxtmawlnnbnllqgx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZGNzeHRtYXdsbm5ibmxscWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODI3NjIsImV4cCI6MjA3NDc1ODc2Mn0.47FS2yDSqjDSabOWsylQTW0RDTIrx_bekU0KiDeNtm4';

window.supabaseClient = (function createClientOrNull() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || typeof supabase === 'undefined') return null;
  return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();


