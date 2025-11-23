
import React, { useState, useEffect } from 'react';
import AdminDashboard from './views/AdminDashboard';
import StudentKiosk from './views/StudentKiosk';
import { supabase } from './services/supabaseClient';
import { Icons } from './components/Icons';

function App() {
  const [view, setView] = useState<'kiosk' | 'admin'>('kiosk');
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
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
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

  if (view === 'admin') {
    if (!session) {
      // Admin Login Form
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white p-6 relative transition-colors duration-300">
             <button 
                onClick={handleBackToKiosk} 
                className="absolute top-6 left-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
            >
                <Icons.ArrowRight className="w-4 h-4 rotate-180" /> Back to Kiosk
            </button>

            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl mb-4 text-indigo-600 dark:text-indigo-400">
                        <Icons.User className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Admin Access</h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Authorized Personnel Only</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                        <input 
                            type="email" 
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 focus:border-indigo-500 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 transition-colors"
                        />
                    </div>
                    <div>
                         <input 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 focus:border-indigo-500 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 transition-colors"
                        />
                    </div>
                    {loginError && <p className="text-red-500 text-xs text-center">{loginError}</p>}
                    <button 
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors text-sm tracking-wide shadow-lg"
                    >
                        {authLoading ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
      );
    }
    return <AdminDashboard onLogout={handleLogout} onExit={handleBackToKiosk} />;
  }

  return <StudentKiosk onAdminClick={() => setView('admin')} />;
}

export default App;
