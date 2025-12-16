import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getRandomColor, NOTE_COLORS } from '../lib/utils';
import { Note } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit: Note | null;
  onSave: (data: any) => void;
}

export const NoteModal = ({ isOpen, onClose, noteToEdit, onSave }: NoteModalProps) => {
  const [data, setData] = useState({ title: '', text: '', deadline: '', color: '#ffffff' });

  useEffect(() => {
    if (noteToEdit) setData({ ...noteToEdit, deadline: noteToEdit.deadline || '', color: noteToEdit.color || '#ffffff' });
    else setData({ title: '', text: '', deadline: '', color: getRandomColor() });
  }, [noteToEdit, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all" style={{ backgroundColor: data.color }}>
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <h2 className="font-bold text-slate-800">{noteToEdit ? 'Sửa ghi chú' : 'Tạo ghi chú mới'}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-black/10"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          <input className="w-full bg-transparent text-xl font-bold text-slate-900 placeholder-slate-500/70 outline-none" placeholder="Tiêu đề..." value={data.title} onChange={e => setData({...data, title: e.target.value})}/>
          <textarea className="w-full resize-none bg-transparent text-slate-700 placeholder-slate-500/70 outline-none" placeholder="Nội dung..." rows={5} value={data.text} onChange={e => setData({...data, text: e.target.value})}/>
          <div className="flex gap-4">
            <input type="date" className="flex-1 rounded-lg border-0 bg-white/50 px-3 py-2 text-sm outline-none" value={data.deadline} onChange={e => setData({...data, deadline: e.target.value})}/>
            <div className="flex gap-1">
              {NOTE_COLORS.slice(0, 5).map(c => (
                <button key={c} onClick={() => setData({...data, color: c})} className={`h-8 w-8 rounded-full border border-black/10 ${data.color === c ? 'ring-2 ring-blue-600' : ''}`} style={{ backgroundColor: c }}/>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-black/5 bg-white/30 p-4">
          <button onClick={() => onSave(data)} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700">Lưu</button>
        </div>
      </div>
    </div>
  );
};