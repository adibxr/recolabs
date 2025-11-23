
import { createClient } from '@supabase/supabase-js';

// Direct API Configuration to prevent deployment crashes
const SUPABASE_URL = "https://bmqavurzdhqpfevdkyab.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcWF2dXJ6ZGhxcGZldmRreWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mzg2MzcsImV4cCI6MjA3OTMxNDYzN30.txJwPMi7jnoT3-MUWVTNM_ZmGzG2sDWIK9nv6iEmt0E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
