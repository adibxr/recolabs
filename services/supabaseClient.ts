
import { createClient } from '@supabase/supabase-js';

// Robust Environment Variable Loader
const getEnvVar = (suffix: string) => {
  // @ts-ignore - Vite support
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${suffix}`]) {
    // @ts-ignore
    return import.meta.env[`VITE_${suffix}`];
  }
  
  // @ts-ignore - Node/Process support (Next.js / CRA)
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env[`NEXT_PUBLIC_${suffix}`] || process.env[`REACT_APP_${suffix}`];
  }

  return null;
};

// Fallback keys from project history to ensure local functionality
const FALLBACK_URL = "https://bmqavurzdhqpfevdkyab.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcWF2dXJ6ZGhxcGZldmRreWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mzg2MzcsImV4cCI6MjA3OTMxNDYzN30.txJwPMi7jnoT3-MUWVTNM_ZmGzG2sDWIK9nv6iEmt0E";

const supabaseUrl = getEnvVar('SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY') || FALLBACK_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Setup Error: Missing API Keys. App will crash.');
}

// Ensure we don't pass empty strings which crashes the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
