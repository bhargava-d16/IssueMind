import React from 'react';
import { Compass, BarChart2, Cpu, Search, Award, Info, GitBranch } from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  repositories, 
  selectedRepoId, 
  setSelectedRepoId,
  addNotification
}) {
  const navItems = [
    { id: 'landing', label: 'Connect & Launch', icon: Compass, requireRepo: false },
    { id: 'dashboard', label: 'Repo Dashboard', icon: BarChart2, requireRepo: true },
    { id: 'prediction', label: 'Find Developer', icon: Cpu, requireRepo: true },
    { id: 'search', label: 'Search Issues', icon: Search, requireRepo: true },
    { id: 'developers', label: 'Developer Profiles', icon: Award, requireRepo: true },
    { id: 'about', label: 'Architecture & Stack', icon: Info, requireRepo: false },
  ];

  const handleTabClick = (tabId, requireRepo) => {
    if (requireRepo && !selectedRepoId) {
      addNotification("Please connect or select a repository first!", "error");
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 h-full transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <GitBranch className="text-[#384959] dark:text-[#88BDF2]" size={20} />
        <div>
          <h1 className="font-bold text-base leading-tight text-slate-800 dark:text-slate-100">IssueMind</h1>
          <span className="text-[10px] text-[#6A89A7] dark:text-[#88BDF2] font-semibold tracking-wide uppercase">AI GitHub Analyzer</span>
        </div>
      </div>

      {/* Context Repository Switcher */}
      {repositories && repositories.length > 0 && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-800/10">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">
            Active Context Repo
          </label>
          <select 
            value={selectedRepoId || ''} 
            onChange={(e) => setSelectedRepoId(Number(e.target.value))}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs py-2 px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6A89A7]/20 focus:border-[#6A89A7] transition-all font-medium"
          >
            {repositories.map(r => (
              <option key={r.id} value={r.id}>
                {r.owner}/{r.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isDisabled = item.requireRepo && !selectedRepoId;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id, item.requireRepo)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive 
                  ? 'bg-[#384959] dark:bg-[#6A89A7] text-white shadow-xs' 
                  : isDisabled
                  ? 'text-slate-450 dark:text-slate-600 opacity-65 cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-450 dark:text-slate-500'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-800/10 text-center">
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">IssueMind v1.0.0</div>
      </div>
    </aside>
  );
}
