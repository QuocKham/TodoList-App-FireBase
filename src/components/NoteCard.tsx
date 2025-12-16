import React from 'react';
import { Pin, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onToggle: (note: Note) => void;
  onDelete: (id: string) => void;
  onPin: (note: Note) => void;
  onEdit: (note: Note) => void;
}

export const NoteCard = ({ note, onToggle, onDelete, onPin, onEdit }: NoteCardProps) => {
  const getBorderColor = () => {
    if (note.completed) return 'ring-2 ring-green-500 bg-green-50/50';
    if (note.isPinned) return 'ring-2 ring-blue-400 shadow-blue-100';
    if (note.deadline) {
      const today = new Date().setHours(0,0,0,0);
      const dDate = new Date(note.deadline).setHours(0,0,0,0);
      if (dDate < today) return 'ring-2 ring-red-500 bg-red-50/50'; 
      if (dDate === today) return 'ring-2 ring-yellow-400 bg-yellow-50/50';
    }
    return 'hover:ring-1 hover:ring-slate-300';
  };

  return (
    <div 
      className={`group relative flex flex-col justify-between rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${getBorderColor()}`}
      style={{ backgroundColor: note.completed ? undefined : note.color }}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onPin(note); }}
        className={`absolute -right-2 -top-2 rounded-full border border-slate-100 bg-white p-1.5 shadow-sm transition-all ${note.isPinned ? 'text-blue-600 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-blue-600'}`}
      >
        <Pin size={14} className={note.isPinned ? "fill-current" : ""} />
      </button>

      <div onClick={() => onEdit(note)} className="mb-4 flex-1 cursor-pointer">
        {note.title && <h3 className={`mb-2 font-bold text-slate-900 ${note.completed ? 'line-through opacity-60' : ''}`}>{note.title}</h3>}
        <p className={`whitespace-pre-wrap text-sm text-slate-700 ${note.completed ? 'line-through opacity-60' : ''}`}>
          {note.text || "Chưa có nội dung"}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-black/5 pt-3">
        <div className="flex items-center gap-2">
          {note.deadline && (
            <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${new Date(note.deadline) < new Date() && !note.completed ? 'bg-red-100 text-red-600' : 'bg-white/60 text-slate-600'}`}>
              <Calendar size={10} /> {note.deadline.split('-').reverse().join('/')}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onToggle(note); }} className={`rounded-lg p-1.5 transition-colors ${note.completed ? 'bg-green-200 text-green-700' : 'hover:bg-black/5 text-slate-500'}`}>
            <CheckCircle2 size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};