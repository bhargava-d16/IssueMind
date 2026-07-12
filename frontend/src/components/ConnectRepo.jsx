import React from 'react';

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

export default function ConnectRepo({
  repoUrl,
  setRepoUrl,
  handleAnalyze,
  analyzeLoading,
  analyzeMessage,
  handleLoadDemoMock,
  pollInterval
}) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      
      {/* Hero Title */}
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight mb-4 transition-colors">
        Map Developer Experience to Repo Issues
      </h2>

      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mb-10 leading-relaxed font-medium transition-colors">
        Analyze repository issues, map contributor history, and search for the most experienced developers based on their past work.
      </p>

      {/* Indexing Input Box Card */}
      <div className="w-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 text-left mb-6 transition-all">
        <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            Paste public GitHub Repository URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-slate-500">
                <GithubIcon size={16} />
              </div>
              <input 
                type="url" 
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/facebook/react"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#6A89A7] focus:ring-1 focus:ring-[#6A89A7] transition-all font-medium"
              />
            </div>
            <button 
              type="submit" 
              disabled={analyzeLoading || pollInterval !== null}
              className="bg-[#384959] dark:bg-[#6A89A7] hover:bg-[#2c3a47] dark:hover:bg-[#527394] text-white font-semibold py-3 px-6 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{analyzeLoading ? "Analyzing..." : "Index Repository"}</span>
            </button>
          </div>
        </form>

        {/* Progress Alert */}
        {analyzeMessage && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg flex items-start gap-3">
            <p className="text-xs text-slate-600 dark:text-slate-350 font-medium leading-normal">{analyzeMessage}</p>
          </div>
        )}

        {/* Live Demo trigger info */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Tryout</h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Click to instantly load index parsing for Facebook's React.js repository</p>
          </div>
          <button 
            onClick={handleLoadDemoMock}
            disabled={analyzeLoading}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-3.5 py-2 rounded-lg text-xs transition-all shadow-2xs flex items-center gap-1.5"
          >
            <GithubIcon size={12} className="text-slate-500 dark:text-slate-400" />
            <span>Load React Demo Repo</span>
          </button>
        </div>
      </div>

    </div>
  );
}
