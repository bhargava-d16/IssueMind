import React from 'react';
import { RefreshCw } from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer 
} from 'recharts';

const Github = ({ size = 18, className = "" }) => (
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

export default function DeveloperProfiles({
  developers,
  selectedDev,
  handleSelectDeveloper,
  profileLoading,
  devProfileDetails,
  theme
}) {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-2xs">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
          Developer Profiles
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Overview of developer profiles and experience. Select any developer to load a scorecard that charts their resolved issues distributions and assigns an Expertise Score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team list side menu */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-3xs">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              Repository Team
            </h3>
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
              {developers && developers.length > 0 ? (
                developers.map(dev => (
                  <button 
                    key={dev.id} 
                    onClick={() => handleSelectDeveloper(dev.login)}
                    className={`p-3 rounded-lg text-left flex items-center gap-3 border transition-all ${
                      selectedDev === dev.login 
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-3xs' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350'
                    }`}
                  >
                    <img 
                      src={dev.avatar_url || 'https://github.com/identicons/git.png'} 
                      alt={dev.login} 
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-750" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{dev.name || dev.login}</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500">@{dev.login}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-2">No developers found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Scorecard Profile Details View */}
        <div className="lg:col-span-2">
          {profileLoading ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/85 min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 shadow-3xs">
              <RefreshCw className="animate-spin text-[#6A89A7]" size={24} />
              <span className="text-xs font-semibold">Compiling scorecard...</span>
            </div>
          ) : devProfileDetails ? (
            <div className="flex flex-col gap-6">
              
              {/* Profile Card Header */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-3xs flex items-start gap-4">
                <img 
                  src={devProfileDetails.avatar_url || 'https://github.com/identicons/git.png'} 
                  alt={devProfileDetails.login} 
                  className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-3xs"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{devProfileDetails.name || devProfileDetails.login}</h3>
                    <a 
                      href={devProfileDetails.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 dark:text-slate-500 hover:text-[#6A89A7] dark:hover:text-[#88BDF2] transition-colors"
                    >
                      <Github size={18} />
                    </a>
                  </div>
                  <span className="text-xs text-slate-450 dark:text-slate-400 font-medium">@{devProfileDetails.login}</span>

                  {/* Expertise Score Stats */}
                  <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg px-4 py-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Expertise Score</span>
                      <div className="text-base font-extrabold text-[#6A89A7] dark:text-[#88BDF2] mt-0.5">{devProfileDetails.expertise_score}%</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Issues Solved</span>
                      <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{devProfileDetails.issues_solved_count}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus radar & Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Recharts Skills Radar */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-3xs flex flex-col">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Expertise Focus Area
                  </h4>
                  <div className="h-44 flex items-center justify-center">
                    {devProfileDetails.top_labels && devProfileDetails.top_labels.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" radius="70%" data={devProfileDetails.top_labels}>
                          <PolarGrid stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                          <PolarAngleAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={9} />
                          <Radar name="Count" dataKey="count" stroke="#6A89A7" fill="#BDDDFC" fillOpacity={0.4} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic text-center">No assigned issue labels.</div>
                    )}
                  </div>
                </div>

                {/* Category count labels */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-3xs flex flex-col">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Category Counts
                  </h4>
                  {devProfileDetails.top_labels && devProfileDetails.top_labels.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {devProfileDetails.top_labels.map((lbl, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-705 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-150 dark:border-slate-850">
                            {lbl.name}
                          </span>
                          <span className="font-bold text-[#6A89A7] dark:text-[#88BDF2]">{lbl.count} issue(s)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic py-4 text-center">No label category data.</div>
                  )}
                </div>

              </div>

              {/* Solved Issues list log */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-3xs">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  Recent Activity Log
                </h4>
                {devProfileDetails.recent_activity && devProfileDetails.recent_activity.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {devProfileDetails.recent_activity.map((activity, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-lg text-xs flex items-center justify-between gap-4 font-semibold">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#6A89A7] dark:text-[#88BDF2]">#{activity.number}</span>
                            <span className="text-slate-800 dark:text-slate-200 truncate">{activity.title}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 flex-shrink-0">{activity.closed_at}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-450 dark:text-slate-400 font-medium italic py-4 text-center">No recent activity logged.</div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
              <p className="text-xs font-medium">Select a developer from the team list to view their scorecard scorecard details.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
