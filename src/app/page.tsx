'use client';
// chịu
import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, GoogleAuthProvider, 
  signOut, onAuthStateChanged, updateProfile, User, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  collection, addDoc, query, onSnapshot, 
  deleteDoc, doc, updateDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
  Grid, List, ArrowUpDown, Plus, 
  Loader2, Search 
} from 'lucide-react';

// Imports
import { auth, db } from '../lib/firebase';
import { Note } from '../types';
import { Sidebar } from '../components/Sidebar';
import { NoteCard } from '../components/NoteCard';
import { NoteModal } from '../components/NoteModal';
import { SettingsModal } from '../components/SettingsModal';
import { AuthScreen } from '../components/AuthScreen';

export default function TodoApp() {
  // STATE
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI Control
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Sort Time
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'pinned'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  
  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // EFFECTS
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => { 
      setUser(u); 
      setLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) { setNotes([]); return; }
    
    // Lấy App ID
    const currentAppId = (typeof window !== 'undefined' && (window as any).__app_id) || 'todo-pro-max';
    
    const q = query(collection(db, 'artifacts', currentAppId, 'users', user.uid, 'notes'));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const notesData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
      setNotes(notesData);
    });
    return () => unsubscribe();
  }, [user]);

  // LOGIC LỌC VÀ TÌM KIẾM
  const getProcessedNotes = () => {
    let filtered = notes.filter(n => {
      if (filterMode === 'completed') return n.completed;
      if (filterMode === 'pinned') return n.isPinned;
      return true;
    });

    // 2. Lọc theo thanh tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title?.toLowerCase().includes(q) || n.text?.toLowerCase().includes(q)
      );
    }

    // 3. Sắp xếp
    return filtered.sort((a, b) => {
      if (filterMode === 'all' && a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;


      return sortOrder === 'newest' ? (timeB - timeA) : (timeA - timeB);
    });
  };

  const processedNotes = getProcessedNotes();

  // HANDLERS
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setAuthError('');
    if (!auth) return;
    try {
      if (authMode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) { 
      setAuthError(err.message); 
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (err: any) { alert("Lỗi: " + err.message); }
  };

  const handleSave = async (data: any) => {
    if (!user || !db) return;
    const currentAppId = (typeof window !== 'undefined' && (window as any).__app_id) || 'todo-pro-max';
    const col = collection(db, 'artifacts', currentAppId, 'users', user.uid, 'notes');
    try {
      if (editNote) await updateDoc(doc(col, editNote.id), data);
      else await addDoc(col, { ...data, completed: false, isPinned: false, createdAt: serverTimestamp() });
      setModalOpen(false); 
      setEditNote(null);
    } catch (e) { console.error(e); }
  };

  // RENDER
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600"/>
    </div>
  );

  if (!user) {
    return (
      <AuthScreen 
        authMode={authMode} setAuthMode={setAuthMode}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        authError={authError}
        handleAuth={handleAuth}
        handleGoogleLogin={handleGoogleLogin}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR */}
      <Sidebar 
        currentFilter={filterMode} 
        setFilter={setFilterMode} 
        onAdd={() => {setEditNote(null); setModalOpen(true)}} 
        onSettings={() => setSettingsOpen(true)}
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-10 gap-4">
          
          {/* Tiêu đề Bộ lọc */}
          <div className="hidden md:block w-32 font-bold text-xl text-slate-800">
            {filterMode === 'all' ? 'Tất cả' : filterMode === 'completed' ? 'Đã xong' : 'Đã ghim'}
          </div>

          {/* THANH TÌM KIẾM */}
          <div className="flex-1 max-w-md relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="text" 
                className="block w-full rounded-full border-none bg-slate-100 py-2 pl-9 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder-slate-400" 
                placeholder="Tìm nhanh..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* CÔNG CỤ & PROFILE */}
          <div className="flex items-center gap-2">
            
            {/* View Mode */}
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Đổi giao diện">
              {viewMode === 'grid' ? <List size={20}/> : <Grid size={20}/>}
            </button>
            
            {/* Sort Button */}
            <button 
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} 
              className="flex items-center gap-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100" 
              title={sortOrder === 'newest' ? "Đang xếp: Mới nhất" : "Đang xếp: Cũ nhất"}
            >
              <ArrowUpDown size={20}/>
              <span className="text-xs font-medium w-12 text-center hidden sm:block">
                {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
              </span>
            </button>

            {/* Nút Thêm */}
            <button onClick={() => {setEditNote(null); setModalOpen(true)}} className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 mx-2">
              <Plus size={18}/> <span className="hidden sm:inline">Thêm</span>
            </button>

            {/* Vạch ngăn cách */}
            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* Profile User */}
            <div className="flex items-center gap-2 pl-1 cursor-pointer" onClick={() => setSettingsOpen(true)}>
               <div className="hidden lg:block text-right">
                 <p className="text-sm font-bold text-slate-800 leading-none">{user.displayName || "User"}</p>
                 <p className="text-[10px] text-slate-500 font-medium">Free Plan</p>
               </div>
               <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100">
                 {user.photoURL ? (
                   <img src={user.photoURL} className="h-full w-full object-cover" alt="User"/>
                 ) : (
                   <div className="flex h-full items-center justify-center bg-blue-100 font-bold text-blue-600">
                     {user.email?.[0]?.toUpperCase()}
                   </div>
                 )}
               </div>
            </div>

          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          {processedNotes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <div className="mb-4 rounded-full bg-white p-6 shadow-sm">
                {searchQuery ? <Search size={48} className="opacity-20"/> : <div className="text-6xl opacity-20">📝</div>}
              </div>
              <p>
                {searchQuery 
                  ? `Không tìm thấy kết quả cho "${searchQuery}"` 
                  : filterMode === 'completed' 
                    ? "Chưa có ghi chú nào hoàn thành" 
                    : filterMode === 'pinned' 
                      ? "Chưa có ghi chú nào được ghim"
                      : "Chưa có ghi chú nào. Hãy bắt đầu ngay!"}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'mx-auto flex max-w-3xl flex-col gap-3'}>
              {processedNotes.map(n => (
                <NoteCard 
                  key={n.id} 
                  note={n} 
                  onToggle={() => {
                    const col = collection(db!, 'artifacts', 'todo-pro-max', 'users', user.uid, 'notes');
                    updateDoc(doc(col, n.id), { completed: !n.completed });
                  }} 
                  onDelete={id => deleteDoc(doc(db!, 'artifacts', 'todo-pro-max', 'users', user.uid, 'notes', id))} 
                  onPin={n => updateDoc(doc(db!, 'artifacts', 'todo-pro-max', 'users', user.uid, 'notes', n.id), { isPinned: !n.isPinned })} 
                  onEdit={() => {setEditNote(n); setModalOpen(true)}}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        noteToEdit={editNote} 
        onSave={handleSave}
      />
      
      {/* SETTINGS MODAL */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        user={user} 
        onLogout={() => auth && signOut(auth)} 
        onUpdateName={async (name: string) => { 
          if(user) {
             await updateProfile(user, {displayName: name});
             setSettingsOpen(false);
             window.location.reload();
          } 
        }}
      />
    </div>
  );
}