import React from 'react';
import { AppLogo } from './AppLogo';
import { ASSETS } from '../lib/utils';

interface AuthScreenProps {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  authError: string;
  handleAuth: (e: React.FormEvent) => void;
  handleGoogleLogin: () => void;
}

export const AuthScreen = ({ 
  authMode, setAuthMode, email, setEmail, password, setPassword, 
  authError, handleAuth, handleGoogleLogin 
}: AuthScreenProps) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.BACKGROUND_URL})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-4">
        <div className="relative rounded-3xl bg-white/90 p-8 pt-16 shadow-2xl backdrop-blur-md">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 transform">
             <AppLogo size={24} />
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold text-slate-800">
            {authMode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="mb-6 text-center text-sm text-slate-500">Todo Pro Max - Quản lý công việc</p>

          {authError && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center">{authError}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="Email của bạn" required className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Mật khẩu" required className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform hover:scale-[1.02]">
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-xs font-medium text-slate-400">HOẶC</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          {/* Chỉ còn nút Google */}
          <button onClick={handleGoogleLogin} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white py-2.5 hover:bg-slate-50 shadow-sm transition-all">
            <img src="https://www.google.com/favicon.ico" className="h-5 w-5"/> <span className="text-sm font-bold text-slate-600">Tiếp tục với Google</span>
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            <span className="cursor-pointer font-bold text-blue-600 hover:underline" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};