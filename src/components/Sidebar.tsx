import React from 'react';
import { Plus, Settings, Layers, CheckCircle2, Pin } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface SidebarProps {
  currentFilter: 'all' | 'completed' | 'pinned';
  setFilter: (filter: 'all' | 'completed' | 'pinned') => void;
  onAdd: () => void;
  onSettings: () => void;
}

export const Sidebar = ({ currentFilter, setFilter, onAdd, onSettings }: SidebarProps) => {
  const getButtonClass = (isActive: boolean) => 
    `rounded-xl p-3 transition-all duration-200 ${isActive ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`;

  return (
    <div className="hidden flex-col items-center justify-between border-r border-slate-200 bg-white py-6 shadow-sm sm:flex sm:w-20">
      <div className="flex flex-col items-center gap-6">
        <div className="mb-2 cursor-pointer" onClick={() => setFilter('all')}>
          <AppLogo size={10} />
        </div>
        
        {/* Bộ lọc: Tất cả */}
        <button 
          onClick={() => setFilter('all')}
          className={getButtonClass(currentFilter === 'all')}
          title="Tất cả ghi chú"
        >
          <Layers size={24} />
        </button>

        {/* Bộ lọc: Đã ghim */}
        <button 
          onClick={() => setFilter('pinned')}
          className={getButtonClass(currentFilter === 'pinned')}
          title="Đã ghim"
        >
          <Pin size={24} />
        </button>

        {/* Bộ lọc: Đã hoàn thành */}
        <button 
          onClick={() => setFilter('completed')}
          className={getButtonClass(currentFilter === 'completed')}
          title="Đã hoàn thành"
        >
          <CheckCircle2 size={24} />
        </button>

        <div className="h-px w-8 bg-slate-200 my-2"></div>

        {/* Nút add */}
        <button 
          onClick={onAdd}
          className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
          title="Thêm ghi chú mới"
        >
          <Plus size={24} />
        </button>
      </div>

      <button 
        onClick={onSettings}
        className="rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
        title="Cài đặt tài khoản"
      >
        <Settings size={24} />
      </button>
    </div>
  );
};