import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Camera, Loader2 } from 'lucide-react';
import { User, updateProfile } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onUpdateName: (name: string) => void;
}

export const SettingsModal = ({ 
  isOpen, onClose, user, onLogout, onUpdateName 
}: SettingsModalProps) => {
  const [name, setName] = useState(user?.displayName || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => { 
    if(user?.displayName) setName(user.displayName); 
  }, [user]);
  
  if (!isOpen) return null;

  // Xử lý upload ảnh (Giữ nguyên tính năng hay ho này)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return alert("Vui lòng chọn file ảnh!");
    if (file.size > 5 * 1024 * 1024) return alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");

    setIsUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const base64String = canvas.toDataURL('image/jpeg', 0.7);

        if (user) {
          updateProfile(user, { photoURL: base64String })
            .then(() => {
              alert("Đã cập nhật ảnh đại diện!");
              window.location.reload(); 
            })
            .catch((err) => alert("Lỗi: " + err.message))
            .finally(() => setIsUploading(false));
        }
      };
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
          
          {/* AVATAR UPLOAD */}
          <div className="relative mx-auto mb-3 h-24 w-24 group">
            <div className="h-full w-full rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              {user?.photoURL ? (
                <img src={user.photoURL} className="h-full w-full object-cover" alt="User" />
              ) : (
                <div className="flex h-full items-center justify-center bg-blue-600 text-3xl font-bold text-white">
                  {(user?.displayName?.[0] || 'U')}
                </div>
              )}
            </div>
            
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
            >
              {isUploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
          </div>

          <h2 className="text-xl font-bold text-slate-800">{user?.email}</h2>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Tên hiển thị</label>
            <div className="flex gap-2">
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                placeholder="Nhập tên của bạn"
              />
              <button 
                onClick={() => onUpdateName(name)} 
                className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-200 transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-4">
             <button 
               onClick={onLogout} 
               className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
             >
               <LogOut size={16}/> Đăng xuất
             </button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-3 text-right border-t border-slate-100">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-800 px-4 py-1">Đóng</button>
        </div>
      </div>
    </div>
  );
};