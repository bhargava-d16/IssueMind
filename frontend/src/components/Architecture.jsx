import React from 'react';

export default function Architecture() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-2xs">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
          System Architecture
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Designed for clear separation of concerns, displaying a structured pipeline to index issue history and identify matching contributors.
        </p>
      </div>

      {/* Workflow Map */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-3xs">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
          Workflow Execution Map
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-xs font-bold">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center">
            <span className="text-slate-800 dark:text-slate-200">1. Fetch</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Load issues, labels, and authors</span>
          </div>
          <div className="flex items-center justify-center text-slate-300 dark:text-slate-700 font-extrabold rotate-90 md:rotate-0">→</div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center">
            <span className="text-slate-800 dark:text-slate-200">2. Encode</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Generate text indices</span>
          </div>
          <div className="flex items-center justify-center text-slate-300 dark:text-slate-700 font-extrabold rotate-90 md:rotate-0">→</div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center">
            <span className="text-slate-800 dark:text-slate-200">3. Search & Match</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Save records and query similarity</span>
          </div>
        </div>
      </div>

      {/* Tech breakdown columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-3xs flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Backend Architecture
          </h3>
          <ul className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-2.5 list-disc list-inside font-semibold leading-relaxed">
            <li><b>FastAPI</b>: Web service and background task executor.</li>
            <li><b>SQLAlchemy</b>: Database mapper.</li>
            <li><b>Sentence Transformers</b>: Local text modeling and indexing.</li>
            <li><b>FAISS</b>: Fast similarity search indexing database.</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-3xs flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Frontend Design
          </h3>
          <ul className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-2.5 list-disc list-inside font-semibold leading-relaxed">
            <li><b>React.js (Vite)</b>: Lightweight, modern web application bundle.</li>
            <li><b>Tailwind CSS</b>: Minimalist responsive layout structure.</li>
            <li><b>Lucide React</b>: Flat outline icon library.</li>
            <li><b>Recharts</b>: Dynamic vector stats visualizers.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
