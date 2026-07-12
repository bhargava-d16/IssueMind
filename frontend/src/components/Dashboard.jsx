import React from 'react';
import { ExternalLink } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard({ 
  selectedRepo, 
  repoStats, 
  developers, 
  setActiveTab, 
  handleSelectDeveloper,
  theme
}) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Banner Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {selectedRepo.owner}/{selectedRepo.name} Dashboard
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
            Repository index generated on: {new Date(selectedRepo.indexed_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Status: {selectedRepo.status}
          </span>
          <a 
            href={selectedRepo.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-355 text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:text-[#6A89A7] dark:hover:text-[#88BDF2] hover:border-[#6A89A7]/40 transition-all shadow-3xs"
          >
            <span>View Repository</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Inline Metadata Row */}
      {repoStats && (
        <div className="bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-6 py-4 flex flex-wrap justify-between items-center gap-6 shadow-3xs">
          <div className="flex-1 min-w-[120px] text-center md:text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">Stars</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{repoStats.stars.toLocaleString()}</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 min-w-[120px] text-center md:text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">Forks</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{repoStats.forks.toLocaleString()}</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 min-w-[120px] text-center md:text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">Developers</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{repoStats.contributors_count}</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 min-w-[120px] text-center md:text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">Indexed Issues</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{repoStats.embeddings_count}</span>
          </div>
        </div>
      )}

      {/* Analytical Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Contributor contributions bar chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-3xs flex flex-col">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4">
            Top Repository Contributors
          </h3>
          <div className="h-64 mt-2 bg-slate-50/20 dark:bg-slate-950/35 rounded-lg p-3 border border-slate-100/80 dark:border-slate-800/30">
            {developers && developers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={developers.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="login" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                  <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', 
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontWeight: '550' 
                    }}
                    labelStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: '755' }}
                  />
                  <Bar dataKey="contributions" fill="#6A89A7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No contributors data loaded</div>
            )}
          </div>
        </div>

        {/* Developer List Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-3xs flex flex-col">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4">
            Team Overview
          </h3>
          <div className="flex-1 overflow-x-auto mt-2">
            {developers && developers.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500">
                    <th className="pb-3 pt-1 px-1 font-bold uppercase tracking-wider text-[9px]">Developer</th>
                    <th className="pb-3 pt-1 px-1 font-bold uppercase tracking-wider text-[9px] text-center">Contributions</th>
                    <th className="pb-3 pt-1 px-1 font-bold uppercase tracking-wider text-[9px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {developers.slice(0, 5).map(dev => (
                    <tr key={dev.id} className="text-slate-600 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 flex items-center gap-3">
                        <img 
                          src={dev.avatar_url || 'https://github.com/identicons/git.png'} 
                          alt={dev.login} 
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-3xs" 
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{dev.name || dev.login}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">@{dev.login}</div>
                        </div>
                      </td>
                      <td className="py-3 text-center font-bold text-[#6A89A7]">{dev.contributions}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => {
                            handleSelectDeveloper(dev.login);
                            setActiveTab('developers');
                          }}
                          className="text-[#6A89A7] dark:text-[#88BDF2] hover:text-[#384959] dark:hover:text-slate-100 font-bold transition-colors"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No developers associated with this repository context</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
