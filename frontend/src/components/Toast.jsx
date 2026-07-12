import React from 'react';

export default function Toast({ notifications }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full animate-fade-in">
      {notifications.map(n => (
        <div 
          key={n.id} 
          className={`p-4 rounded-lg shadow-sm border text-xs pointer-events-auto flex items-center justify-between gap-3 transition-all transform animate-slide-in duration-300 ${
            n.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : n.type === 'info' 
              ? 'bg-slate-50 border-slate-200 text-slate-700' 
              : 'bg-emerald-50 border-emerald-250 text-emerald-800'
          }`}
        >
          <div className="flex-1 font-bold">{n.text}</div>
        </div>
      ))}
    </div>
  );
}
