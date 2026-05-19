import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OpportunitiesPage from './components/OpportunitiesPage';
import AnalyticsPage from './components/AnalyticsPage';
import ScrapersPage from './components/ScrapersPage';
import AlertsPage from './components/AlertsPage';
import ExportPage from './components/ExportPage';
import LogsPage from './components/LogsPage';
import OpportunityDetail from './components/OpportunityDetail';
import { X, Mail, CheckCircle2, Bell } from 'lucide-react';

function App() {
  const { 
    currentView, 
    sidebarOpen, 
    showSubscribeModal, 
    setShowSubscribeModal, 
    addEmailSubscription,
    initStore,
    uiTheme,
    setUiTheme,
    aiSearchSuggestions,
    activeAiSuggestion,
    setActiveAiSuggestion
  } = useStore();

  useEffect(() => {
    initStore();
    const interval = setInterval(() => {
      useStore.getState().decrementCountdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [initStore]);

  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('AI Startup Grants');
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      addEmailSubscription(email, category);
      setSubscribedSuccess(true);
      setTimeout(() => {
        setSubscribedSuccess(false);
        setEmail('');
      }, 3000);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'opportunities': return <OpportunitiesPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'scrapers': return <ScrapersPage />;
      case 'alerts': return <AlertsPage />;
      case 'export': return <ExportPage />;
      case 'logs': return <LogsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-paper relative text-ink transition-colors duration-300" data-theme={uiTheme}>
      {/* Grain overlay for paper texture */}
      <div className="grain-overlay" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main
        className="transition-all duration-300 min-h-screen flex flex-col"
        style={{ marginLeft: sidebarOpen ? 240 : 64 }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-border px-7 py-2 transition-colors min-h-[108px] flex items-center">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => useStore.setState({ sidebarOpen: !sidebarOpen })}
                className="lg:hidden p-1.5 rounded bg-surface border border-border text-ink hover:bg-surface-hover transition-colors"
                title="Toggle Sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <div className="flex items-center gap-8 text-sm font-medium text-muted tracking-wide">
                <span className="text-ink font-semibold max-w-[210px] leading-tight">Startup Opportunity Aggregator Platform</span>
                <span className="text-muted">/</span>
                <span className="capitalize text-ink font-semibold">{currentView}</span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-3">
              {/* AI Quick Filter views */}
              <div className="hidden xl:flex items-center gap-1 bg-surface p-1 rounded-md border border-border">
                <span className="text-xs px-2 font-medium text-muted flex items-center gap-1">Views:</span>
                {aiSearchSuggestions.slice(0, 3).map(sug => (
                  <button
                    key={sug}
                    onClick={() => setActiveAiSuggestion(activeAiSuggestion === sug ? null : sug)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      activeAiSuggestion === sug ? 'bg-primary text-paper card-shadow' : 'text-muted hover:text-ink hover:bg-surface-hover'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* 2 OPTIONS IN UI: Option A Clean vs Option B Dark */}
              <div className="flex items-center gap-1 bg-surface p-1.5 rounded-md border border-border card-shadow">
                <span className="text-xs font-medium text-muted px-2 uppercase tracking-wider hidden md:inline">Theme:</span>
                <button
                  onClick={() => setUiTheme('notion')}
                  className={`px-4 py-1.5 rounded text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    uiTheme === 'notion' ? 'bg-black text-white card-shadow' : 'text-muted hover:text-ink hover:bg-surface-hover'
                  }`}
                  title="Option A: Clean light interface"
                >
                  <span>Option A · Clean</span>
                </button>
                <button
                  onClick={() => setUiTheme('figma')}
                  className={`px-4 py-1.5 rounded text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    uiTheme === 'figma' ? 'bg-black text-white card-shadow' : 'text-muted hover:text-ink hover:bg-surface-hover'
                  }`}
                  title="Option B: Dark professional interface"
                >
                  <span>Option B · Dark</span>
                </button>
              </div>

              <button
                onClick={() => setShowSubscribeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-surface text-ink rounded-md text-sm font-medium hover:bg-surface-hover transition-all border border-border card-shadow"
              >
                <Bell size={14} />
                Subscribe Alerts
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-5 flex-1 transition-colors">
          {renderView()}
        </div>

        {/* Production Footer */}
        <footer className="bg-surface border-t border-border p-4 mt-auto text-center text-xs text-muted font-medium flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Startup Opportunity Aggregator Platform · Continuous Ingestion & Smart Deduplication</p>
          <div className="flex items-center gap-4 text-ink font-medium">
            <span>PostgreSQL Pipeline</span>
            <span>·</span>
            <span>APScheduler Daemon</span>
            <span>·</span>
            <span>105+ Active Targets</span>
          </div>
        </footer>
      </main>

      {/* Opportunity Detail Modal */}
      <OpportunityDetail />

      {/* Email Subscription Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded border-2 border-ink p-6 max-w-md w-full paper-shadow space-y-4 relative animate-scaleIn">
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="absolute top-4 right-4 p-1 rounded bg-paper border border-ink hover:bg-warm text-ink transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 border-b border-ink/10 pb-3">
              <div className="w-10 h-10 rounded bg-amber flex items-center justify-center border border-ink text-white">
                <Mail size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink tracking-tight">Subscribe to Real-Time Alerts</h2>
                <p className="text-xs text-muted font-medium">Get notified instantly when new opportunities match</p>
              </div>
            </div>

            {subscribedSuccess ? (
              <div className="p-4 bg-moss/10 border-2 border-moss rounded text-center space-y-2">
                <CheckCircle2 size={32} className="text-moss mx-auto animate-bounce" />
                <h3 className="text-sm font-bold text-ink">Successfully Subscribed!</h3>
                <p className="text-xs text-muted">You will receive instant alerts for {category}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-ink uppercase mb-1 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@startup.in"
                    className="w-full p-2.5 bg-paper border-2 border-ink rounded text-xs text-ink placeholder-muted focus:outline-none focus:border-ocean transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink uppercase mb-1 block">Opportunity Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-paper border-2 border-ink rounded text-xs text-ink font-bold focus:outline-none focus:border-ocean transition-colors"
                  >
                    <option value="AI Startup Grants">AI Startup Grants (DPIIT & MeitY)</option>
                    <option value="Government Seed Funds">Government Seed Funds (SISFS & SIDBI)</option>
                    <option value="Corporate Accelerators">Corporate Accelerators (Google, Microsoft, Peak XV)</option>
                    <option value="Public Company / PSU Grants">Public Company / PSU Grants (ONGC, GAIL, IOCL)</option>
                    <option value="State Portals & Hackathons">State Portals & Hackathons (Karnataka, Kerala, SIH)</option>
                  </select>
                </div>

                <div className="p-3 bg-paper rounded border border-ink/20 text-[11px] text-muted space-y-1">
                  <p className="font-bold text-ink">🔒 Operational Reliability Guarantee</p>
                  <p>We use SendGrid/SMTP automated triggers with smart deduplication. No spam, only verified matches.</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubscribeModal(false)}
                    className="px-4 py-2 bg-paper border border-ink rounded text-xs font-bold text-muted hover:text-ink hover:bg-warm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-ink text-paper rounded text-xs font-bold hover:bg-charcoal transition-colors border border-ink paper-shadow-sm flex items-center gap-1.5"
                  >
                    <Mail size={14} /> Confirm Subscription
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
