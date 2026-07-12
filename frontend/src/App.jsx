import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import ConnectRepo from './components/ConnectRepo';
import Dashboard from './components/Dashboard';
import AIPredictor from './components/AIPredictor';
import SemanticSearch from './components/SemanticSearch';
import DeveloperProfiles from './components/DeveloperProfiles';
import Architecture from './components/Architecture';

const API_BASE = "http://localhost:8000/api";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Navigation & Active Repos State
  const [activeTab, setActiveTab] = useState('landing');
  const [repositories, setRepositories] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  
  // App States
  const [repoUrl, setRepoUrl] = useState('');
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeMessage, setAnalyzeMessage] = useState('');
  
  // Dashboard & Analytics data
  const [repoStats, setRepoStats] = useState(null);
  const [developers, setDevelopers] = useState([]);
  
  // Predict Form State
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  
  // Semantic Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Selected Developer Profile Details State
  const [selectedDev, setSelectedDev] = useState(null);
  const [devProfileDetails, setDevProfileDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Status polling timer
  const [pollInterval, setPollInterval] = useState(null);

  // App notification state
  const [notifications, setNotifications] = useState([]);

  const addNotification = (text, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Fetch repositories list
  const fetchRepositories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/repositories`);
      if (res.ok) {
        const data = await res.json();
        setRepositories(data);
        // Automatically select first repo if none is selected
        if (data.length > 0 && !selectedRepoId) {
          setSelectedRepoId(data[0].id);
          setSelectedRepo(data[0]);
        }
      }
    } catch (err) {
      console.error("Could not fetch repositories:", err);
    }
  }, [selectedRepoId]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Load stats and contributors
  const fetchRepoDetails = useCallback(async (repoId) => {
    try {
      const statsRes = await fetch(`${API_BASE}/stats?repo_id=${repoId}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setRepoStats(statsData);
      }
      
      const devRes = await fetch(`${API_BASE}/developers?repo_id=${repoId}`);
      if (devRes.ok) {
        const devData = await devRes.json();
        setDevelopers(devData);
      }
    } catch (err) {
      console.error("Error loading repository details:", err);
    }
  }, []);

  // Update selected repo when ID changes
  useEffect(() => {
    if (selectedRepoId && repositories.length > 0) {
      const repo = repositories.find(r => r.id === selectedRepoId);
      setSelectedRepo(repo);
      fetchRepoDetails(selectedRepoId);
    }
  }, [selectedRepoId, repositories, fetchRepoDetails]);

  // Trigger analysis for a repository URL
  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl) return;

    setAnalyzeLoading(true);
    setAnalyzeMessage('Sending indexing request to backend...');
    
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAnalyzeMessage(data.message);
        addNotification("Background indexing started!", "info");
        
        // Start polling repositories status
        startPolling();
      } else {
        setAnalyzeMessage(`Error: ${data.detail || 'Could not trigger indexing.'}`);
        addNotification(data.detail || "Indexing failed", "error");
      }
    } catch {
      setAnalyzeMessage('Connection failed. Is the FastAPI backend running on port 8000?');
      addNotification("Connection failed", "error");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const startPolling = () => {
    if (pollInterval) clearInterval(pollInterval);
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/repositories`);
        if (res.ok) {
          const data = await res.json();
          setRepositories(data);
          
          // Check if indexing finished
          const target = data.find(r => r.url.toLowerCase().trim().replace(/\/$/, "") === repoUrl.toLowerCase().trim().replace(/\/$/, ""));
          if (target && (target.status === 'INDEXED' || target.status === 'FAILED')) {
            clearInterval(interval);
            setPollInterval(null);
            setSelectedRepoId(target.id);
            setSelectedRepo(target);
            addNotification(target.status === 'INDEXED' ? "Repository index complete!" : "Repository indexing failed", target.status === 'INDEXED' ? "success" : "error");
            setActiveTab('dashboard');
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);
    
    setPollInterval(interval);
  };

  // Run Recommendation Predict
  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    if (!selectedRepoId || !issueTitle) return;

    setPredictLoading(true);
    setPredictionResult(null);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_id: selectedRepoId,
          title: issueTitle,
          description: issueDesc
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPredictionResult(data);
        addNotification("Developer recommendation generated!", "success");
      } else {
        addNotification(data.detail || "Recommendation error", "error");
      }
    } catch {
      addNotification("Failed to fetch recommendation", "error");
    } finally {
      setPredictLoading(false);
    }
  };

  // Run Semantic Issue Search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!selectedRepoId || !searchQuery) return;

    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/issues?repo_id=${selectedRepoId}&q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        addNotification(`Found ${data.length} semantically matching issues!`);
      } else {
        addNotification("Search query failed", "error");
      }
    } catch {
      addNotification("Search connection failed", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Load Developer Detailed Profile
  const handleSelectDeveloper = async (login) => {
    setSelectedDev(login);
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/developers/${login}?repo_id=${selectedRepoId}`);
      if (res.ok) {
        const data = await res.json();
        setDevProfileDetails(data);
      }
    } catch {
      addNotification("Could not load developer profile", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // Quick Demo Inject (loads the facebook/react repo)
  const handleLoadDemoMock = async () => {
    setRepoUrl('https://github.com/facebook/react');
    setAnalyzeLoading(true);
    setAnalyzeMessage('Loading realistic React.js repo intelligence index...');
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: 'https://github.com/facebook/react' })
      });
      if (res.ok) {
        addNotification("React demo triggered! Building local FAISS index...", "info");
        // Trigger background polling
        startPolling();
      }
    } catch {
      addNotification("Demo connection failed", "error");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Toast Notifications */}
      <Toast notifications={notifications} />

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        repositories={repositories} 
        selectedRepoId={selectedRepoId} 
        setSelectedRepoId={setSelectedRepoId}
        addNotification={addNotification}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Navigation / Header */}
        <Header selectedRepo={selectedRepo} theme={theme} setTheme={setTheme} />

        {/* Tab Views container */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: Connect / Index Repository URL (Landing) */}
          {activeTab === 'landing' && (
            <ConnectRepo 
              repoUrl={repoUrl}
              setRepoUrl={setRepoUrl}
              handleAnalyze={handleAnalyze}
              analyzeLoading={analyzeLoading}
              analyzeMessage={analyzeMessage}
              handleLoadDemoMock={handleLoadDemoMock}
              pollInterval={pollInterval}
            />
          )}

          {/* TAB 2: Repository Dashboard */}
          {activeTab === 'dashboard' && selectedRepo && (
            <Dashboard 
              selectedRepo={selectedRepo}
              repoStats={repoStats}
              developers={developers}
              setActiveTab={setActiveTab}
              handleSelectDeveloper={handleSelectDeveloper}
              theme={theme}
            />
          )}

          {/* TAB 3: Recommendation Engine (Predict) */}
          {activeTab === 'prediction' && (
            <AIPredictor 
              issueTitle={issueTitle}
              setIssueTitle={setIssueTitle}
              issueDesc={issueDesc}
              setIssueDesc={setIssueDesc}
              handlePredict={handlePredict}
              predictLoading={predictLoading}
              predictionResult={predictionResult}
              selectedRepo={selectedRepo}
            />
          )}

          {/* TAB 4: Semantic Search View */}
          {activeTab === 'search' && (
            <SemanticSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              searchLoading={searchLoading}
              searchResults={searchResults}
              selectedRepo={selectedRepo}
            />
          )}

          {/* TAB 5: Developer Profiles Page */}
          {activeTab === 'developers' && (
            <DeveloperProfiles 
              developers={developers}
              selectedDev={selectedDev}
              handleSelectDeveloper={handleSelectDeveloper}
              profileLoading={profileLoading}
              devProfileDetails={devProfileDetails}
              theme={theme}
            />
          )}

          {/* TAB 6: About & Architecture Specs */}
          {activeTab === 'about' && (
            <Architecture />
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
export { App };
