
import React, { useState, useEffect, useMemo } from 'react';
import { deleteBook, addBook, getBooks, getAllTransactions, approveReturn } from '../services/dbService';
import { Book, Transaction, DashboardView } from '../types';
import { Icons } from '../components/Icons';
import { QRCodeCanvas } from 'qrcode.react';

const AdminDashboard: React.FC<{ onLogout: () => void; onExit: () => void }> = ({ onLogout, onExit }) => {
  const [view, setView] = useState<Exclude<DashboardView, 'settings'>>('directory');
  
  // Data
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Actions
  const [selectedBookForQr, setSelectedBookForQr] = useState<Book | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [code, setCode] = useState('');
  const [formStatus, setFormStatus] = useState<{type: 'error'|'success'|'', msg: string}>({type: '', msg: ''});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (books.length === 0) setLoading(true);
      const [booksData, txData] = await Promise.all([getBooks(), getAllTransactions()]);
      setBooks(booksData);
      setTransactions(txData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic Helpers ---
  
  const pendingReturns = useMemo(() => 
    transactions.filter(t => t.status === 'ACTIVE' && t.return_date !== null),
  [transactions]);
  
  const overdueTransactions = useMemo(() => transactions.filter(t => {
      if (t.status !== 'ACTIVE' || t.return_date !== null) return false;
      const issueDate = new Date(t.issue_date);
      const diffTime = Math.abs(new Date().getTime() - issueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > 10;
  }), [transactions]);

  const activeIssues = useMemo(() => 
    transactions.filter(t => t.status === 'ACTIVE' && t.return_date === null),
  [transactions]);

  const filteredBooks = useMemo(() => {
    if (!searchTerm) return books;
    const lower = searchTerm.toLowerCase();
    return books.filter(b => 
        b.title.toLowerCase().includes(lower) || 
        b.category.toLowerCase().includes(lower) ||
        b.unique_code.includes(lower)
    );
  }, [books, searchTerm]);

  const groupedBooks = useMemo(() => {
    return filteredBooks.reduce<Record<string, Book[]>>((acc, book) => {
        const cat = book.category || 'UNCATEGORIZED';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(book);
        return acc;
    }, {});
  }, [filteredBooks]);


  // --- Actions ---

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({type: '', msg: ''});

    if (code.length !== 4) {
      setFormStatus({type: 'error', msg: "Unique code must be exactly 4 digits."});
      return;
    }

    try {
      await addBook(title, category.toUpperCase(), code);
      setFormStatus({type: 'success', msg: `Added "${title}"`});
      setTitle('');
      setCode('');
      fetchData(); 
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormStatus({type: '', msg: ''});
      }, 1000);
    } catch (err: any) {
      setFormStatus({type: 'error', msg: "Failed. Code might be duplicate."});
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Delete this book permanently?')) {
      await deleteBook(id);
      fetchData();
    }
  };

  const handleApproveReturn = async (tx: Transaction) => {
      try {
          await approveReturn(tx.id, tx.book_id);
          fetchData();
      } catch (e) {
          console.error("Failed to approve", e);
          alert("Failed to approve return");
      }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-gen') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${selectedBookForQr?.title}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30 pb-20 transition-colors duration-300">
      
      {/* Top Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-zinc-200 dark:border-white/5 sticky top-0 bg-white/80 dark:bg-[#050505]/90 backdrop-blur-xl z-40 transition-colors">
         <div className="flex items-center gap-4">
             <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white font-mono">ADMIN_PANEL</h1>
             <p className="hidden md:block text-sm text-zinc-500 dark:text-zinc-600 font-mono">v2.0.4 // SYS_ACTIVE</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
                onClick={fetchData}
                className="p-2.5 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm"
                title="Refresh Data"
            >
                <Icons.Database className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
             <button 
                 onClick={onExit}
                 className="px-6 py-2.5 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold tracking-widest text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white transition-all mr-2 uppercase shadow-sm"
             >
                 Close
             </button>
             <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1"></div>
             <button onClick={onLogout} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors uppercase tracking-wider">Sign Out</button>
         </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto space-y-10">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-2 duration-500">
              {[
                  { label: 'BOOKS ISSUED', val: activeIssues.length, color: 'text-zinc-900 dark:text-white', sub: 'Currently out' },
                  { label: 'PENDING RETURNS', val: pendingReturns.length, color: 'text-amber-600 dark:text-amber-400', sub: 'Require approval' },
                  { label: 'OVERDUE', val: overdueTransactions.length, color: 'text-rose-600 dark:text-rose-500', sub: '> 10 Days late' },
                  { label: 'TOTAL ASSETS', val: books.length, color: 'text-zinc-500 dark:text-zinc-400', sub: 'Registered books' }
              ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between h-36 hover:border-zinc-300 dark:hover:border-white/10 transition-colors group relative overflow-hidden shadow-sm dark:shadow-none">
                      <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                          <Icons.Database className="w-12 h-12" />
                      </div>
                      <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold tracking-widest text-zinc-500 dark:text-zinc-600 uppercase font-mono">{stat.label}</span>
                      </div>
                      <div>
                        <span className={`text-5xl font-medium tracking-tight ${stat.color}`}>{stat.val}</span>
                        <p className="text-xs text-zinc-500 dark:text-zinc-700 mt-2 font-mono">{stat.sub}</p>
                      </div>
                  </div>
              ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 border-b border-zinc-200 dark:border-white/5 pb-1">
              {[
                  { id: 'directory', label: 'Directory' },
                  { id: 'reviews', label: 'Review Queue', count: pendingReturns.length },
                  { id: 'overdue', label: 'Overdue Logs', count: overdueTransactions.length },
              ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                        setView(tab.id as any);
                        setActiveCategory(null);
                        setSearchTerm('');
                    }}
                    className={`relative pb-4 text-sm font-medium transition-colors flex items-center gap-2 tracking-wide ${view === tab.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                  >
                      {tab.label}
                      {tab.count !== undefined && tab.count > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${tab.id === 'overdue' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                              {tab.count}
                          </span>
                      )}
                      {view === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded-t-full"></div>}
                  </button>
              ))}
          </div>

          {/* DIRECTORY VIEW */}
          {view === 'directory' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {!activeCategory ? (
                     <>
                        <div className="flex items-center gap-2 mb-6 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            <Icons.Folder className="w-4 h-4" />
                            <span>Root Directory</span>
                        </div>
                        
                        {/* Search */}
                        <div className="relative mb-8">
                            <Icons.Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="SEARCH ASSETS (Title, ID, Folder)..." 
                                className="w-full bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 rounded-xl py-4 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all font-mono uppercase shadow-sm dark:shadow-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {!searchTerm && (
                                <button 
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="group h-48 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-indigo-500/50 bg-transparent hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-4"
                                >
                                    <div className="p-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/20 transition-all shadow-md dark:shadow-lg">
                                        <Icons.Plus className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                                    </div>
                                    <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 uppercase tracking-wide">Add Resource</span>
                                </button>
                            )}

                            {Object.entries(groupedBooks).map(([catName, catBooks]) => (
                                <div 
                                    key={catName}
                                    onClick={() => setActiveCategory(catName)}
                                    className="group relative bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-white/10 transition-all cursor-pointer hover:-translate-y-1 shadow-sm dark:shadow-lg hover:shadow-lg dark:hover:shadow-indigo-900/10"
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-zinc-900/80 text-indigo-600 dark:text-indigo-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all border border-indigo-100 dark:border-white/5 group-hover:border-indigo-500 dark:group-hover:border-indigo-400/50 shadow-inner">
                                            <Icons.Folder className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide font-mono truncate">{catName}</h3>
                                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                                        <Icons.Database className="w-3 h-3" />
                                        <span>{(catBooks as Book[]).length} RESOURCES</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </>
                  ) : (
                      <div>
                          <button 
                            onClick={() => setActiveCategory(null)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors text-xs font-bold uppercase tracking-widest"
                          >
                              <Icons.ArrowRight className="w-4 h-4 rotate-180" />
                              Return to Root
                          </button>
                          
                          <div className="flex items-center gap-4 mb-10 border-b border-zinc-200 dark:border-white/5 pb-6">
                              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                <Icons.Folder className="w-8 h-8" />
                              </div>
                              <div>
                                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide font-mono">{activeCategory}</h2>
                                <p className="text-zinc-500 text-sm font-mono mt-1">{groupedBooks[activeCategory!]?.length || 0} ASSETS INDEXED</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {groupedBooks[activeCategory!]?.map(book => (
                                  <div key={book.id} className="bg-white dark:bg-[#0A0A0A] p-5 rounded-xl border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 group transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/30 shadow-sm dark:shadow-none">
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                              <Icons.BookOpen className="w-5 h-5" />
                                          </div>
                                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase font-mono ${book.status === 'AVAILABLE' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20' : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 border border-indigo-200 dark:border-indigo-500/20'}`}>
                                              {book.status === 'ISSUED' ? 'ISSUED' : 'ACTIVE'}
                                          </span>
                                      </div>
                                      <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-1 truncate leading-relaxed" title={book.title}>{book.title}</h4>
                                      <p className="text-xs text-zinc-500 dark:text-zinc-600 font-mono mb-6">REF: {book.unique_code}</p>
                                      
                                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                                          <button onClick={() => setSelectedBookForQr(book)} className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2">
                                              <Icons.QrCode className="w-3 h-3" /> GET QR
                                          </button>
                                          <button onClick={() => handleDeleteBook(book.id)} className="text-zinc-400 dark:text-zinc-700 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                                              <Icons.Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* REVIEWS VIEW */}
          {view === 'reviews' && (
              <div className="max-w-4xl animate-in fade-in">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-zinc-900 dark:text-white">
                      <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_#fbbf24]"></div>
                      REVIEW QUEUE
                  </h2>
                  {pendingReturns.length === 0 ? (
                      <div className="p-16 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                          <Icons.CheckCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-4" />
                          <p className="text-zinc-500 dark:text-zinc-600 font-mono text-sm">ALL RETURNS PROCESSED</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {pendingReturns.map(tx => (
                              <div key={tx.id} className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-amber-500/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors shadow-sm dark:shadow-none">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
                                          <Icons.Clock className="w-7 h-7" />
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{tx.books?.title}</h3>
                                          <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm text-zinc-600 dark:text-zinc-300 font-mono bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/5">{tx.students?.name || 'Unknown Student'}</span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono uppercase">ID: {tx.students?.student_id}</span>
                                          </div>
                                          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-2 font-mono uppercase tracking-wide">Submitted: {new Date(tx.return_date!).toLocaleString()}</p>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => handleApproveReturn(tx)}
                                    className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors tracking-wide shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                  >
                                      CONFIRM RETURN
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* OVERDUE VIEW */}
          {view === 'overdue' && (
              <div className="max-w-4xl animate-in fade-in">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-zinc-900 dark:text-white">
                      <div className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]"></div>
                      OVERDUE LOGS
                  </h2>
                  {overdueTransactions.length === 0 ? (
                      <div className="p-16 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                           <Icons.CheckCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-4" />
                           <p className="text-zinc-500 dark:text-zinc-600 font-mono text-sm">SYSTEM OPTIMAL. NO DELAYS.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {overdueTransactions.map(tx => {
                              const issueDate = new Date(tx.issue_date);
                              const diffTime = Math.abs(new Date().getTime() - issueDate.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                              return (
                                <div key={tx.id} className="bg-rose-50 dark:bg-rose-950/5 border border-rose-200 dark:border-rose-500/10 p-6 rounded-2xl flex items-center justify-between hover:bg-rose-100 dark:hover:bg-rose-950/10 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 flex items-center justify-center border border-rose-200 dark:border-rose-500/20">
                                            <Icons.AlertCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-rose-900 dark:text-rose-100">{tx.students?.name || tx.students?.student_id}</h3>
                                            <p className="text-xs text-rose-600 dark:text-rose-400/60 uppercase font-mono tracking-wide">ID: {tx.students?.student_id}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="px-2 py-1 bg-rose-200 dark:bg-rose-500/20 rounded text-[10px] text-rose-700 dark:text-rose-400 font-bold border border-rose-300 dark:border-rose-500/20">
                                                    {diffDays} DAYS LATE
                                                </span>
                                                <span className="text-[10px] text-rose-600/60 dark:text-rose-500/40 font-mono uppercase">Item: {tx.books?.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <button className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 border border-rose-300 dark:border-rose-500/30 px-4 py-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors">Notify</button>
                                    </div>
                                </div>
                              );
                          })}
                      </div>
                  )}
              </div>
          )}

      </main>

      {/* ADD BOOK MODAL */}
      {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 rounded-3xl w-full max-w-lg p-8 relative shadow-2xl">
                  <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white transition-colors">
                      <Icons.X className="w-6 h-6" />
                  </button>
                  
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 uppercase tracking-wide font-mono">New Resource</h2>
                  <p className="text-xs text-zinc-500 font-mono mb-8">ADD ITEM TO DATABASE</p>
                  
                  <form onSubmit={handleAddBook} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Resource Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4 text-zinc-900 dark:text-white focus:border-indigo-500 outline-none transition-colors font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-800"
                            placeholder="e.g. Quantum Mechanics Vol. 1"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Category</label>
                             <input 
                                type="text" 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4 text-zinc-900 dark:text-white focus:border-indigo-500 outline-none transition-colors uppercase placeholder:text-zinc-400 dark:placeholder:text-zinc-800 font-mono"
                                placeholder="PHYSICS"
                                required
                            />
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Access Code</label>
                             <input 
                                type="text" 
                                value={code} 
                                maxLength={4}
                                onChange={e => setCode(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4 text-zinc-900 dark:text-white focus:border-indigo-500 outline-none transition-colors font-mono text-center tracking-widest placeholder:text-zinc-400 dark:placeholder:text-zinc-800"
                                placeholder="0000"
                                required
                            />
                        </div>
                    </div>

                    {formStatus.msg && (
                        <div className={`p-4 rounded-xl text-xs font-bold font-mono border ${formStatus.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
                            {formStatus.msg}
                        </div>
                    )}

                    <button type="submit" className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        Confirm Entry
                    </button>
                  </form>
              </div>
          </div>
      )}
      
      {/* QR MODAL */}
      {selectedBookForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
                <button onClick={() => setSelectedBookForQr(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors">
                    <Icons.X className="w-6 h-6" />
                </button>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{selectedBookForQr.title}</h3>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-8">{selectedBookForQr.category} // {selectedBookForQr.unique_code}</p>
                <div className="bg-white p-4 rounded-2xl inline-block mb-8 shadow-inner border border-zinc-100 dark:border-transparent dark:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                     <QRCodeCanvas id="qr-gen" value={selectedBookForQr.unique_code} size={200} level={"H"} />
                </div>
                <button onClick={downloadQR} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-lg">
                    <Icons.Download className="w-4 h-4" /> Save Asset QR
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
