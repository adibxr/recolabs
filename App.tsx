
import React, { useState, useEffect } from 'react';
import AdminDashboard from './views/AdminDashboard';
import StudentKiosk from './views/StudentKiosk';
import DocsPage from './views/DocsPage';
import { supabase } from './services/supabaseClient';
import { Icons } from './components/Icons';

function App() {
  const [view, setView] = useState<'kiosk' | 'admin' | 'docs'>('kiosk');
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setLoginError('');
    
    // Strict Supabase Auth - No default passwords
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError("Access Denied: Invalid Credentials.");
    } else {
      setView('admin');
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('kiosk');
  };

  const handleBackToKiosk = () => {
    setView('kiosk');
  }

  // Docs View
  if (view === 'docs') {
    return <DocsPage onBack={() => setView('kiosk')} />;
  }

  // Admin View
  if (view === 'admin') {
    if (!session) {
      // Secure Admin Login Form
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#050505] text-zinc-900 dark:text-white p-6 relative transition-colors duration-300">
             
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

             <button 
                onClick={handleBackToKiosk} 
                className="absolute top-8 left-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors z-10"
            >
                <Icons.ArrowRight className="w-4 h-4 rotate-180" /> Back to Kiosk
            </button>

            <div className="w-full max-w-sm bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Icons.User className="w-6 h-6 text-white dark:text-black" />
                    </div>
                </div>
                
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Admin Authentication</h2>
                    <p className="text-xs text-zinc-500 font-mono mt-2 uppercase tracking-widest">Secure Gateway v2.0</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-1">Identity</label>
                        <input 
                            type="email" 
                            placeholder="user@recolabs.system"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 transition-all"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-1">Keyphrase</label>
                         <input 
                            type="password" 
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 transition-all"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    
                    {loginError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold justify-center animate-in slide-in-from-bottom-2 fade-in">
                            <Icons.AlertCircle className="w-4 h-4" />
                            {loginError}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all text-xs uppercase tracking-widest shadow-lg hover:shadow-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {authLoading ? 'Verifying Credentials...' : 'Authenticate'}
                    </button>
                </form>

                <p className="text-center mt-8 text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">
                    Protected by Supabase Auth Security
                </p>
            </div>
        </div>
      );
    }
    return <AdminDashboard onLogout={handleLogout} onExit={handleBackToKiosk} />;
  }

  // Kiosk View (Default)
  return <StudentKiosk onAdminClick={() => setView('admin')} onDocsClick={() => setView('docs')} />;
}

export default App;
