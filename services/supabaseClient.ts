import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmqavurzdhqpfevdkyab.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcWF2dXJ6ZGhxcGZldmRreWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mzg2MzcsImV4cCI6MjA3OTMxNDYzN30.txJwPMi7jnoT3-MUWVTNM_ZmGzG2sDWIK9nv6iEmt0E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);