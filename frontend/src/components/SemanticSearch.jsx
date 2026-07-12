import React from 'react';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';

export default function SemanticSearch({
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchLoading,
  searchResults,
  selectedRepo
}) {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-2xs">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
          Search Repo Issues
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Search through repository issues using natural phrases.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-3xs flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} className="text-slate-450 dark:text-slate-500" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by issue meaning, topic or bug category..."
            className="w-full pl-11 pr-4 py-2.5 text-xs rounded-lg text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#6A89A7] focus:ring-1 focus:ring-[#6A89A7] font-medium transition-all"
            onKeyDown={(e) => { if(e.key === 'Enter') handleSearch(e); }}
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={searchLoading || !searchQuery}
          className="bg-[#384959] dark:bg-[#6A89A7] hover:bg-[#2c3a47] dark:hover:bg-[#527394] text-white text-xs font-semibold py-2.5 px-6 rounded-lg flex items-center gap-1.5 transition-all shadow-3xs"
        >
          {searchLoading && <RefreshCw className="animate-spin" size={12} />}
          <span>Search</span>
        </button>
      </div>

      {/* Search Results list display */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-3xs">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          Matching Issues
        </h3>

        {searchLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-450 dark:text-slate-500">
            <RefreshCw className="animate-spin text-[#6A89A7]" size={24} />
            <span className="text-xs font-semibold">Searching issue history...</span>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div className="flex flex-col gap-4">
            {searchResults.map((issue, idx) => (
              <div key={idx} className="p-4 bg-slate-50/30 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-lg flex items-start justify-between gap-4 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#6A89A7] dark:text-[#88BDF2]">#{issue.number}</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-lg">{issue.title}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      issue.state === 'closed' 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' 
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
                    }`}>
                      {issue.state}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                    {issue.body || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {issue.labels && issue.labels.map(lbl => (
                      <span 
                        key={lbl.id} 
                        style={{ backgroundColor: `#${lbl.color}15`, borderColor: `#${lbl.color}30`, color: `#${lbl.color}` }}
                        className="text-[9px] font-bold px-2 py-0.5 rounded border"
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex flex-col justify-between h-full min-h-[60px]">
                  {issue.assignee ? (
                    <div className="flex items-center gap-1.5 justify-end">
                      <img 
                        src={issue.assignee.avatar_url || 'https://github.com/identicons/git.png'} 
                        alt={issue.assignee.login} 
                        className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700" 
                      />
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">@{issue.assignee.login}</span>
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold italic">Unassigned</div>
                  )}
                  {selectedRepo && (
                    <a 
                      href={`${selectedRepo.url}/issues/${issue.number}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#6A89A7] dark:text-[#88BDF2] hover:text-[#384959] dark:hover:text-slate-105 font-bold flex items-center gap-1 justify-end mt-2 transition-colors"
                    >
                      <span>Open GitHub</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-450 dark:text-slate-500 font-medium italic">
            Type a query above to search past issues.
          </div>
        )}
      </div>

    </div>
  );
}
