
import { createClient } from '@supabase/supabase-js';

// Robust Environment Variable Loader
// Supports Vite (import.meta.env), Next.js (process.env.NEXT_PUBLIC_), and CRA (process.env.REACT_APP_)
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

  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase Environment Variables are missing. ' + 
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel Project Settings.'
  );
}

// Fallback to empty string prevents crash during build time, but will fail at runtime if not set
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
