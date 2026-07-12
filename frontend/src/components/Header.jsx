import React from 'react';
import { ExternalLink, Sun, Moon } from 'lucide-react';

const GithubIcon = ({ size = 18, className = "" }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function Header({ selectedRepo, theme, setTheme }) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-8 flex items-center justify-between flex-shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Context:</span>
        {selectedRepo ? (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
            <span className="font-bold text-slate-800 dark:text-slate-100">{selectedRepo.owner}/{selectedRepo.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-450">({selectedRepo.status === 'INDEXED' ? 'Ready' : 'Analyzing...'})</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">No repository context</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {selectedRepo && (
          <a 
            href={selectedRepo.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#6A89A7] flex items-center gap-1 transition-colors"
          >
            <span>View on GitHub</span>
            <ExternalLink size={12} />
          </a>
        )}
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-250 transition-colors"
        >
          <GithubIcon size={18} />
        </a>

        {/* Theme Switch Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
