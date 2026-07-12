import React from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

export default function AIPredictor({
  issueTitle,
  setIssueTitle,
  issueDesc,
  setIssueDesc,
  handlePredict,
  predictLoading,
  predictionResult
}) {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-2xs">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
          Find Assignee for New Issue
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">
          Enter the details of a new issue below to find developers who have resolved similar issues in this repository context.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Form Input */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <form onSubmit={handlePredict} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/85 dark:border-slate-800 shadow-3xs flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">New Issue Details</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Issue Title</label>
              <input 
                type="text" 
                required
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="e.g. JWT Auth Signature is failing"
                className="w-full px-3 py-2.5 text-xs rounded-lg text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#6A89A7] focus:ring-1 focus:ring-[#6A89A7] font-medium transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Issue Description</label>
              <textarea 
                rows={6}
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                placeholder="Provide details about the bug, steps to reproduce, or dependencies involved..."
                className="w-full px-3 py-2.5 text-xs rounded-lg text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#6A89A7] focus:ring-1 focus:ring-[#6A89A7] resize-none font-medium transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={predictLoading}
              className="bg-[#384959] dark:bg-[#6A89A7] hover:bg-[#2c3a47] dark:hover:bg-[#527394] text-white font-semibold py-2.5 rounded-lg text-xs mt-2 flex items-center justify-center gap-2 transition-all shadow-3xs disabled:opacity-50"
            >
              {predictLoading && <RefreshCw className="animate-spin" size={12} />}
              <span>{predictLoading ? "Finding Match..." : "Find Best Developer"}</span>
            </button>
          </form>
        </div>

        {/* AI recommendation Result view */}
        <div className="lg:col-span-3">
          {predictionResult ? (
            <div className="flex flex-col gap-6">
              
              {/* Top Recommended Developer Card */}
              {predictionResult.recommended_developer ? (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col gap-4">
                  
                  {/* Recommended header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full px-3 py-1">
                      Best Matching Contributor
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Match Strength:</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{Math.round(predictionResult.confidence_score * 100)}%</span>
                    </div>
                  </div>

                  {/* Profile Data */}
                  <div className="flex items-start gap-4">
                    <img 
                      src={predictionResult.recommended_developer.avatar_url || 'https://github.com/identicons/git.png'} 
                      alt={predictionResult.recommended_developer.login} 
                      className="w-16 h-16 rounded-full border border-slate-200 dark:border-slate-700 shadow-3xs"
                    />
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{predictionResult.recommended_developer.name || predictionResult.recommended_developer.login}</h3>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">@{predictionResult.recommended_developer.login}</span>
                      
                      <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Score</span>
                          <div className="font-extrabold text-[#6A89A7] dark:text-[#88BDF2] mt-0.5">{Math.round(predictionResult.confidence_score * 100)}%</div>
                        </div>
                        <div className="border-l border-slate-150 dark:border-slate-800 pl-4">
                          <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Contributions</span>
                          <div className="font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{predictionResult.recommended_developer.contributions}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explanation Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-lg text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Match Reason:</span>
                    {predictionResult.explanation}
                  </div>

                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-3xs text-center py-10">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">No Match Recommended</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                    No developer is associated with similar historical issues in the repository context index.
                  </p>
                </div>
              )}

              {/* Similar Issues duplicate list */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-3xs">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  Top Similar Historical Issues
                </h3>
                {predictionResult.similar_issues.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {predictionResult.similar_issues.map((issue, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-lg text-xs flex items-center justify-between gap-4 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#6A89A7] dark:text-[#88BDF2]">#{issue.number}</span>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm">{issue.title}</h4>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-3 font-medium">
                            <span>Status: <b className="text-slate-500 dark:text-slate-400">{issue.state}</b></span>
                            <span>Resolver: <b className="text-[#6A89A7] dark:text-[#88BDF2]">@{issue.developer || 'unassigned'}</b></span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{Math.round(issue.similarity_score * 100)}% Match</div>
                          {issue.html_url && (
                            <a 
                              href={issue.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#6A89A7] dark:text-[#88BDF2] hover:text-[#384959] dark:hover:text-slate-100 font-bold flex items-center gap-0.5 justify-end mt-1 transition-colors"
                            >
                              <span>View Issue</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-450 dark:text-slate-500 font-medium py-4">No similar issues retrieved.</div>
                )}
              </div>

              {/* Alternative Developers List */}
              {predictionResult.alternative_developers.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-3xs">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    Alternative Matches
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {predictionResult.alternative_developers.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center gap-3">
                        <img 
                          src={item.developer.avatar_url || 'https://github.com/identicons/git.png'} 
                          alt={item.developer.login} 
                          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{item.developer.name || item.developer.login}</div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">Relative Weight: {Math.round(item.score * 100)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[320px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
              <p className="text-xs font-medium">Enter the title and description of a new bug or feature to find matching developers.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
