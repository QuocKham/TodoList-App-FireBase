'use client';

import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithCustomToken,
  User,
  AuthError
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp
} from 'firebase/firestore';
import { 
  Loader2, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  LogOut, 
  Plus, 
  Mail,
  AlertCircle
} from 'lucide-react';

// --- 0. KHAI BÁO BIẾN TOÀN CỤC CHO TYPESCRIPT ---
// Phần này giúp TypeScript không báo lỗi khi truy cập các biến global của môi trường
declare global {
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
  var __app_id: string | undefined;
}

// --- 1. ĐỊNH NGHĨA INTERFACE ---
interface TodoTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp | null;
}

// --- 2. CẤU HÌNH FIREBASE THÔNG MINH ---
const getFirebaseConfig = () => {
  // Ưu tiên 1: Sandbox Config (Môi trường hiện tại)
  if (typeof window !== 'undefined' && window.__firebase_config) {
    try {
      return JSON.parse(window.__firebase_config);
    } catch (e) {
      console.error("Lỗi parse config sandbox:", e);
    }
  }

  // Ưu tiên 2: Biến môi trường (Khi deploy lên Vercel / Chạy Local)
  // Chỉ truy cập process.env khi chắc chắn không phải là undefined
  if (typeof process !== 'undefined' && process.env) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
  }

  return {};
};

const firebaseConfig = getFirebaseConfig();

// Khởi tạo app (Singleton Pattern để tránh lỗi duplicate app)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Lấy App ID an toàn
const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) {
    return window.__app_id;
  }
  return 'default-todo-app-id';
};
const currentAppId = getAppId();


// --- 3. COMPONENT CHÍNH ---
export default function TodoApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  // EFFECT 1: AUTHENTICATION
  useEffect(() => {
    const initAuth = async () => {
      // Xử lý token của môi trường Sandbox (nếu có)
      if (typeof window !== 'undefined' && window.__initial_auth_token) {
        try {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } catch (e) {
          console.error("Lỗi xác thực sandbox:", e);
        }
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // EFFECT 2: FIRESTORE SYNC
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    // Query dữ liệu Real-time
    const q = query(
      collection(db, 'artifacts', currentAppId, 'users', user.uid, 'todos')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TodoTask));

      // Sắp xếp client-side (Mới nhất lên đầu)
      taskList.sort((a, b) => {
        const timeA = a.createdAt?.seconds || Date.now() / 1000;
        const timeB = b.createdAt?.seconds || Date.now() / 1000;
        return timeB - timeA;
      });

      setTasks(taskList);
    }, (err) => {
      console.error("Firestore Error:", err);
      // Không hiển thị lỗi UI để tránh làm phiền user nếu chỉ là lỗi mạng thoáng qua
    });

    return () => unsubscribe();
  }, [user]);

  // HANDLERS
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      const firebaseError = err as AuthError;
      switch (firebaseError.code) {
        case 'auth/invalid-email': setError('Email không đúng định dạng.'); break;
        case 'auth/user-disabled': setError('Tài khoản này đã bị vô hiệu hóa.'); break;
        case 'auth/user-not-found': setError('Không tìm thấy tài khoản.'); break;
        case 'auth/wrong-password': setError('Sai mật khẩu.'); break;
        case 'auth/email-already-in-use': setError('Email này đã được sử dụng.'); break;
        case 'auth/weak-password': setError('Mật khẩu quá yếu (tối thiểu 6 ký tự).'); break;
        default: setError(firebaseError.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError("Đăng nhập Google thất bại. Vui lòng thử lại hoặc dùng Email/Pass.");
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setTasks([]);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    try {
      await addDoc(collection(db, 'artifacts', currentAppId, 'users', user.uid, 'todos'), {
        text: newTask,
        completed: false,
        createdAt: serverTimestamp()
      });
      setNewTask('');
    } catch (err) {
      console.error("Add Task Error:", err);
      setError("Không thể thêm công việc. Vui lòng kiểm tra kết nối mạng.");
    }
  };

  const toggleTask = async (task: TodoTask) => {
    try {
      const taskRef = doc(db, 'artifacts', currentAppId, 'users', user!.uid, 'todos', task.id);
      await updateDoc(taskRef, { completed: !task.completed });
    } catch (err) {
      console.error("Toggle Task Error:", err);
    }
  };

  const deleteTask = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      try {
        const taskRef = doc(db, 'artifacts', currentAppId, 'users', user!.uid, 'todos', id);
        await deleteDoc(taskRef);
      } catch (err) {
        console.error("Delete Task Error:", err);
      }
    }
  };

  const sendEmailReport = () => {
    if (!user || tasks.length === 0) return;
    const subject = "Danh sách việc cần làm (Todo List)";
    const content = tasks.map(t => 
      `${t.completed ? '[ĐÃ XONG]' : '[CHƯA]'} ${t.text}`
    ).join('%0D%0A');
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${content}`;
  };

  // UI HELPERS
  const getAvatarChar = () => {
    if (user?.email) return user.email[0].toUpperCase();
    if (user?.displayName) return user.displayName[0].toUpperCase();
    return 'U';
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Giao diện Auth
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="bg-blue-600 p-6 text-center text-white">
            <h1 className="text-3xl font-bold">Todo Pro</h1>
            <p className="mt-2 text-blue-100 opacity-90">Quản lý công việc - Nâng tầm hiệu suất</p>
          </div>
          <div className="p-8">
            <h2 className="mb-6 text-center text-xl font-semibold text-slate-700">
              {authMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
            </h2>
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">Mật khẩu</label>
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-200"
              >
                {authMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký Ngay'}
              </button>
            </form>
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative bg-white px-3 text-sm text-slate-500">Hoặc</span>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Đăng nhập bằng Google
            </button>
            <p className="mt-6 text-center text-sm text-slate-600">
              {authMode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="font-semibold text-blue-600 hover:underline"
              >
                {authMode === 'login' ? 'Tạo tài khoản' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện Dashboard
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
              {getAvatarChar()}
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Hi, {getUserName()}</h1>
              <p className="text-xs text-slate-500">Chúc bạn một ngày làm việc hiệu quả!</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span className="hidden sm:inline">Đăng xuất</span>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <div className="mb-8 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100 sm:p-3">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-xl bg-slate-50 px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Bạn muốn làm gì hôm nay?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button
              type="submit"
              disabled={!newTask.trim()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 font-medium text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Thêm</span>
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <CheckCircle2 size={40} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Danh sách trống</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Tuyệt vời! Bạn đang rảnh rỗi. Hãy thêm công việc mới để bắt đầu.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center justify-between rounded-xl border border-transparent bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md ${
                  task.completed ? 'bg-slate-50 opacity-75' : ''
                }`}
              >
                <div className="flex flex-1 items-center gap-4">
                  <button
                    onClick={() => toggleTask(task)}
                    className={`flex-shrink-0 transition-colors ${
                      task.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'
                    }`}
                  >
                    {task.completed ? <CheckCircle2 size={24} className="fill-current bg-white rounded-full" /> : <Circle size={24} />}
                  </button>
                  <span
                    className={`text-base transition-all ${
                      task.completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="ml-3 rounded-lg p-2 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Xóa công việc"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {tasks.length > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
            <p className="text-sm text-slate-500">
              Tiến độ: <span className="font-medium text-slate-900">{tasks.filter(t => t.completed).length}</span> / {tasks.length} hoàn thành
            </p>
            <button 
              onClick={sendEmailReport}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
            >
              <Mail size={16} />
              Gửi báo cáo qua Gmail
            </button>
          </div>
        )}
      </main>
    </div>
  );
}