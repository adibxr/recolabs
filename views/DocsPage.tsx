
import React, { useState } from 'react';
import { Icons } from '../components/Icons';

interface DocsPageProps {
  onBack: () => void;
}

const DocsPage: React.FC<DocsPageProps> = ({ onBack }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsNavOpen(false);
  };

  const sections = [
    { id: 'intro', label: 'Introduction' },
    { id: 'ecosystem', label: 'The Ecosystem' },
    { id: 'admin-guide', label: 'Admin Guide' },
    { id: 'student-guide', label: 'Student Guide' },
    { id: 'developer', label: 'About Developer' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30 flex transition-colors duration-300">
      
      {/* Mobile Back Button (Top Left) */}
      <button 
        onClick={onBack}
        className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 lg:hidden text-zinc-900 dark:text-white hover:scale-105 transition-transform"
      >
        <Icons.ArrowRight className="w-5 h-5 rotate-180" />
      </button>

      {/* Mobile Nav Toggle (Top Right) */}
      <button 
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 lg:hidden text-zinc-900 dark:text-white hover:scale-105 transition-transform"
      >
        {isNavOpen ? <Icons.X className="w-5 h-5" /> : <Icons.Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Navigation */}
      {/* Mobile: Fixed Right. Desktop: Fixed Left. */}
      <aside className={`fixed inset-y-0 z-40 w-64 bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-white/5 transform transition-transform duration-300 
        lg:left-0 lg:translate-x-0 lg:border-r lg:shadow-none
        right-0 border-l shadow-2xl
        ${isNavOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-10 cursor-pointer" onClick={onBack}>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold tracking-[0.25em] font-mono">RECO_DOCS</span>
          </div>

          <nav className="flex-1 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between group ${
                  activeSection === section.id 
                    ? 'bg-zinc-100 dark:bg-white/5 text-indigo-600 dark:text-indigo-400' 
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {section.label}
                <Icons.ChevronRight className={`w-3 h-3 transition-transform ${activeSection === section.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50'}`} />
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-zinc-100 dark:border-white/5">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest"
            >
              <Icons.ArrowRight className="w-3 h-3 rotate-180" />
              Exit Docs
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8 lg:p-16 max-w-5xl mx-auto space-y-24 pt-24 lg:pt-16">
        
        {/* Introduction */}
        <section id="intro" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
            Documentation.
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-light max-w-2xl">
            Welcome to the comprehensive guide for the <span className="text-zinc-900 dark:text-white font-medium">RECO ECOSYSTEM</span>. A minimal, next-generation library management solution designed for seamless asset tracking via QR integration.
          </p>
        </section>

        {/* Ecosystem */}
        <section id="ecosystem" className="space-y-6 pt-10 border-t border-zinc-200 dark:border-white/5">
           <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><Icons.Database className="w-5 h-5" /></span>
              <h2 className="text-2xl font-bold uppercase tracking-wide">The Ecosystem</h2>
           </div>
           <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
             The Reco System operates on a dual-interface architecture connecting a centralized Admin Dashboard with public Student Kiosks.
           </p>
           <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5">
                 <h3 className="text-lg font-bold mb-2">Student Kiosk</h3>
                 <p className="text-sm text-zinc-500 font-mono">Public Facing Interface</p>
                 <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-center gap-2"><Icons.CheckCircle className="w-3 h-3 text-emerald-500"/> Instant QR Code Scanning</li>
                    <li className="flex items-center gap-2"><Icons.CheckCircle className="w-3 h-3 text-emerald-500"/> Real-time Availability Check</li>
                    <li className="flex items-center gap-2"><Icons.CheckCircle className="w-3 h-3 text-emerald-500"/> Secure Student Authentication</li>
                 </ul>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5">
                 <h3 className="text-lg font-bold mb-2">Admin Panel</h3>
                 <p className="text-sm text-zinc-500 font-mono">Secure Control Center</p>
                 <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-center gap-2"><Icons.CheckCircle className="w-3 h-3 text-indigo-500"/> Asset & Folder Management</li>
                    <li className="flex items-center gap-2"><Icons.CheckCircle className="w-3 h-3 text-indigo-500"/> Return Verification Queue</li>
                    <li className="flex items-center gap-2"><Icons.CheckCircle className="w-3 h-3 text-indigo-500"/> Overdue Tracking Logs</li>
                 </ul>
              </div>
           </div>
        </section>

        {/* Admin Guide */}
        <section id="admin-guide" className="space-y-6 pt-10 border-t border-zinc-200 dark:border-white/5">
           <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Icons.User className="w-5 h-5" /></span>
              <h2 className="text-2xl font-bold uppercase tracking-wide">Admin Guide</h2>
           </div>
           
           <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-3 font-mono">01 // Adding Resources</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                  Admins can add books or assets directly from the Directory. When adding a book, specifying a <strong>Category</strong> (e.g., COMIC, MATH) automatically creates or assigns it to a folder. Each asset requires a unique 4-digit code.
                </p>
                <div className="p-4 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 font-mono text-xs text-zinc-500">
                   Tip: Use the "Get QR" button on any book card to generate and download a printable QR code for physical labeling.
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 font-mono">02 // Processing Returns</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  When a student returns a book at the Kiosk, it enters a <strong>"Pending Review"</strong> state. It does not become available immediately. Admins must go to the "Review Queue" tab and click "Confirm Return" to physically verify the item and release it back to the pool.
                </p>
              </div>
           </div>
        </section>

        {/* Student Guide */}
        <section id="student-guide" className="space-y-6 pt-10 border-t border-zinc-200 dark:border-white/5">
           <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"><Icons.BookOpen className="w-5 h-5" /></span>
              <h2 className="text-2xl font-bold uppercase tracking-wide">Student Guide</h2>
           </div>
           <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
             Students interact with the system via the touch-enabled Kiosk.
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-l-2 border-indigo-500 pl-4 py-2">
                 <h4 className="font-bold text-zinc-900 dark:text-white">Issuing</h4>
                 <p className="text-sm text-zinc-500 mt-1">Select "Issue", scan the book QR. If it's your first time, enter Name/Email/Phone. The system links the unique book code to your Student ID.</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-4 py-2">
                 <h4 className="font-bold text-zinc-900 dark:text-white">Returning</h4>
                 <p className="text-sm text-zinc-500 mt-1">Select "Return", scan the book QR. The system logs the return timestamp and notifies the admin for verification.</p>
              </div>
           </div>
        </section>

        {/* Developer Section */}
        <section id="developer" className="pt-20 pb-20 border-t border-zinc-200 dark:border-white/5">
           <div className="bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-900 dark:to-black rounded-3xl p-8 md:p-12 border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                 {/* Avatar */}
                 <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden">
                       <img 
                         src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=c0aede" 
                         alt="Aditya Raj" 
                         className="w-full h-full object-cover"
                       />
                    </div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-zinc-900 rounded-full" title="Available to hire"></div>
                 </div>

                 <div className="text-center md:text-left space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Aditya Raj</h2>
                      <p className="text-indigo-600 dark:text-indigo-400 font-mono text-sm uppercase tracking-widest">Lead Developer & Architect</p>
                    </div>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto md:mx-0 leading-relaxed text-sm">
                       Full-stack engineer specializing in minimal, high-performance web ecosystems. Creator of RECO LABS and other modern digital solutions.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                       <a href="https://immortaladi.live" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase shadow-sm">
                          <Icons.Globe className="w-3 h-3" /> Website
                       </a>
                       <a href="https://github.com/adibxr" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-900 dark:hover:border-white hover:text-zinc-900 dark:hover:text-white transition-all text-xs font-bold uppercase shadow-sm">
                          <Icons.Github className="w-3 h-3" /> @adibxr
                       </a>
                       <a href="https://linkedin.com/in/adibxr" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-blue-600 hover:text-blue-600 transition-all text-xs font-bold uppercase shadow-sm">
                          <Icons.Linkedin className="w-3 h-3" /> Linked In
                       </a>
                       <a href="mailto:devadibxr@gmail.com" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-rose-500 hover:text-rose-500 transition-all text-xs font-bold uppercase shadow-sm">
                          <Icons.Mail className="w-3 h-3" /> Contact
                       </a>
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </main>
    </div>
  );
};

export default DocsPage;
