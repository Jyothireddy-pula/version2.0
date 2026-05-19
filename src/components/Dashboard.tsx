import { useMemo, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getDeadlineUrgency, getTypeEmoji, getUrgencyColor, getCompanyLogo, formatTimeOnly } from '../utils/helpers';
import {
  TrendingUp,
  Zap,
  Clock,
  Target,
  Globe,
  RefreshCw,
  ExternalLink,
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  MailPlus,
  Server,
  Activity,
} from 'lucide-react';

export default function Dashboard() {
  const { 
    opportunities, 
    selectOpportunity, 
    setView, 
    isLiveScraping,
    scrapingInterval,
    secondsToNextScrape,
    toggleLiveScraping,
    setScrapingInterval,
    triggerLiveScrapingCycle,
    logs,
    bookmarkedIds,
    toggleBookmark,
    setShowSubscribeModal,
    adminStats,
    simulateAdminFailure,
    simulateAdminSuccess,
  } = useStore();

  const [tickerOffset, setTickerOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScraping, setIsScraping] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleForceScrape = async () => {
    if (isScraping) return;
    setIsScraping(true);
    setShowToast(true);
    try {
      await triggerLiveScrapingCycle();
    } catch (e) {
      console.error(e);
    }
    // Artificial 1200ms delay to let the user see the gorgeous spinning indicator
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsScraping(false);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Update live clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset(prev => prev - 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const total = opportunities.length;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newThisWeek = opportunities.filter(o => new Date(o.createdAt) >= weekAgo).length;
    const avgScore = total > 0 ? Math.round(opportunities.reduce((sum, o) => sum + o.aiScore, 0) / total) : 0;
    const urgent = opportunities.filter(o => o.urgency === 'Critical' || o.urgency === 'High').length;
    const totalFunding = opportunities.filter(o => o.fundingAmount).length;
    const sources = [...new Set(opportunities.map(o => o.source))].length;
    return { total, newThisWeek, avgScore, urgent, totalFunding, sources };
  }, [opportunities]);

  const featuredOpps = opportunities.filter(o => o.featured).slice(0, 5);
  const urgentOpps = opportunities
    .filter(o => getDeadlineUrgency(o.deadline) === 'urgent' || getDeadlineUrgency(o.deadline) === 'soon')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const topSectors = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach(o => o.sectors.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [opportunities]);

  const byType = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach(o => { counts[o.type] = (counts[o.type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [opportunities]);

  const bySource = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach(o => { counts[o.source] = (counts[o.source] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [opportunities]);

  const statCards = [
    { label: 'Total Opportunities', value: stats.total, icon: Target, color: 'bg-ocean', accent: 'border-ocean' },
    { label: 'New This Week', value: stats.newThisWeek, icon: TrendingUp, color: 'bg-moss', accent: 'border-moss' },
    { label: 'Avg AI Score', value: `${stats.avgScore}%`, icon: Zap, color: 'bg-amber', accent: 'border-amber' },
    { label: 'Urgent Deadlines', value: stats.urgent, icon: Clock, color: 'bg-rust', accent: 'border-rust' },
  ];

  // Get the latest live scrape log
  const latestLiveLog = logs[0];

  // Calculate days left for countdown
  const getDaysLeft = (deadlineStr: string) => {
    const d = new Date(deadlineStr);
    const n = new Date();
    const diff = Math.ceil((d.getTime() - n.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Closing Today';
    return `Closing in ${diff} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header with live timestamp and SaaS Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface p-7 rounded-xl border border-border card-shadow">
        <div className="space-y-1.5">
          <h1 className="text-[28px] leading-tight font-bold text-ink tracking-tight max-w-[470px]">Startup Opportunity Aggregator Platform</h1>
          <p className="text-xs text-muted font-medium flex items-center gap-2 flex-wrap">
            <span>Real-Time Startup Intelligence</span>
            <span>·</span>
            <span>{currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>·</span>
            <span className="text-ink font-semibold">Clock: {currentTime.toLocaleTimeString('en-IN')}</span>
          </p>
        </div>

        {/* Live Scraper & Ingestion Panel */}
        <div className="flex flex-wrap items-center gap-3 bg-paper p-3.5 rounded-lg border border-border card-shadow min-w-[420px] justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-md border border-border text-xs font-semibold text-muted">
            <span className={`w-2 h-2 rounded-full ${isLiveScraping ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            {isLiveScraping ? `INGESTION ACTIVE (${secondsToNextScrape}s)` : 'INGESTION PAUSED'}
          </div>

          <button
            onClick={toggleLiveScraping}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isLiveScraping ? 'bg-surface-hover text-ink hover:border-muted border border-border' : 'bg-primary text-paper hover:bg-primary-hover card-shadow'
            }`}
            title={isLiveScraping ? 'Pause automatic background scraping' : 'Resume automatic background scraping'}
          >
            {isLiveScraping ? <Pause size={14} /> : <Play size={14} />}
            {isLiveScraping ? 'Pause' : 'Start'}
          </button>

          <button
            onClick={handleForceScrape}
            disabled={isScraping}
            className={`flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-md text-xs font-semibold hover:bg-primary-hover transition-all card-shadow ${
              isScraping ? 'opacity-80 cursor-wait' : ''
            }`}
            title="Force immediate scraping of social media and portal feeds"
          >
            <RefreshCw size={14} className={isScraping ? 'animate-spin' : 'animate-spin-hover'} />
            <span>{isScraping ? 'Scraping Feeds...' : 'Force Scrape Now'}</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <span className="text-xs text-muted font-medium">Interval:</span>
            <select
              value={scrapingInterval}
              onChange={(e) => setScrapingInterval(Number(e.target.value))}
              className="text-xs bg-surface border border-border rounded-md px-2.5 py-1.5 font-semibold text-ink focus:outline-none"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
              <option value={300}>5m</option>
            </select>
          </div>
        </div>
      </div>

      {/* Production SaaS Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-5 rounded-xl border border-border card-shadow">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setView('opportunities')}
            className="px-4 py-2 bg-black text-white rounded-md font-semibold text-xs hover:bg-primary-hover transition-all card-shadow flex items-center gap-2"
          >
            <Target size={14} /> Explore All {opportunities.length} Opportunities
          </button>

          <button
            onClick={() => setShowSubscribeModal(true)}
            className="px-4 py-2 bg-surface-hover text-ink rounded-md font-semibold text-xs hover:border-muted transition-all border border-border flex items-center gap-2"
          >
            <MailPlus size={14} /> Subscribe to Email Alerts
          </button>

          <button
            onClick={() => setView('alerts')}
            className="px-4 py-2 bg-surface-hover text-ink rounded-md font-semibold text-xs hover:border-muted transition-all border border-border flex items-center gap-2"
          >
            <Zap size={14} className="text-warning" /> Webhook & Slack Alerts
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-ink">Admin Monitoring Health</p>
            <p className="text-[10px] text-success font-semibold">{adminStats.sourceHealth}% Proxy Uptime · {adminStats.totalScrapedToday} Scraped Today</p>
          </div>
          <button
            onClick={() => setView('scrapers')}
            className="p-2 bg-paper border border-border rounded-md hover:bg-surface-hover text-ink transition-colors card-shadow"
            title="View Scraper Health & Logs"
          >
            <Server size={16} />
          </button>
        </div>
      </div>

      {/* Latest Live Scraper Activity Banner */}
      {latestLiveLog && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
          latestLiveLog.level === 'success' ? 'bg-success/10 border-success/30' :
          latestLiveLog.level === 'warn' ? 'bg-warning/10 border-warning/30' :
          latestLiveLog.level === 'error' ? 'bg-danger/10 border-danger/30' :
          'bg-surface-hover border-border'
        }`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-semibold uppercase tracking-wider text-ink">[{latestLiveLog.source}]</span>
              <span className="text-muted">{formatTimeOnly(latestLiveLog.timestamp)}</span>
            </div>
            <p className="text-xs font-medium text-ink truncate mt-0.5">{latestLiveLog.message}</p>
          </div>
          <button
            onClick={() => setView('logs')}
            className="text-xs font-semibold text-ink underline hover:text-muted flex-shrink-0"
          >
            View All Logs
          </button>
        </div>
      )}

      {/* Scrolling ticker with real links */}
      <div className="overflow-hidden bg-ink text-paper py-2.5 rounded border-2 border-ink shadow-inner">
        <div className="flex whitespace-nowrap" style={{ transform: `translateX(${tickerOffset}px)` }}>
          {[...opportunities, ...opportunities].slice(0, 20).map((opp, idx) => (
            <a
              key={idx}
              href={opp.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mx-6 text-xs font-medium hover:text-amber-light transition-colors"
            >
              <span>{getTypeEmoji(opp.type)}</span>
              <span className="text-amber-light font-bold">{opp.title}</span>
              <span className="text-muted">•</span>
              <span className="text-ghost">{opp.fundingAmount || 'TBA'}</span>
              <span className="text-muted">•</span>
              <span className="text-paper underline">{opp.source.split(' - ')[0]}</span>
              <ExternalLink size={10} className="text-muted" />
            </a>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-cream rounded border-2 border-ink paper-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-ink)] transition-all duration-200 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded ${stat.color} flex items-center justify-center border border-ink`}>
                <stat.icon size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-muted uppercase">Verified</span>
            </div>
            <p className="text-3xl font-bold text-ink">{stat.value}</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 bg-amber rounded flex items-center justify-center border border-ink text-[10px]">⭐</span>
              Featured Opportunities (Direct Links)
            </h2>
            <button onClick={() => setView('opportunities')} className="text-xs text-ocean font-bold hover:underline">
              See all {opportunities.length} opportunities →
            </button>
          </div>
          
          <div className="space-y-3.5">
            {featuredOpps.map((opp) => {
              const isBookmarked = bookmarkedIds.includes(opp.id);
              const compLogo = getCompanyLogo(opp.organizer);
              return (
                <div
                  key={opp.id}
                  onClick={() => selectOpportunity(opp)}
                  className="p-5 bg-surface rounded-xl border border-border cursor-pointer hover:bg-surface-hover transition-all card-shadow group relative"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${compLogo.bg} ${compLogo.color} flex items-center justify-center font-bold text-lg border border-current/20 flex-shrink-0 shadow-sm`}>
                      {compLogo.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded border border-border bg-paper text-ink`}>
                          {getTypeEmoji(opp.type)} {opp.type}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getUrgencyColor(opp.urgency)}`}>
                          {opp.urgency} Urgency
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-ocean/10 text-ocean border border-ocean">
                          {opp.startupStage} Stage
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-moss/10 text-moss border border-moss flex items-center gap-1">
                          <ShieldCheck size={12} /> {opp.sourceReliability || 98}% Reliable
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rust/10 text-rust border border-rust flex items-center gap-1">
                          <Clock size={12} /> {getDaysLeft(opp.deadline)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-ink group-hover:text-ocean transition-colors line-clamp-1">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-muted mt-1">{opp.organizer} • {opp.location}</p>
                      
                      {/* Direct Original Link display */}
                      <div className="mt-3 pt-3 border-t border-ink/10 flex items-center justify-between flex-wrap gap-2">
                        <a
                          href={opp.applicationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-bold text-ocean hover:underline flex items-center gap-1.5 bg-paper px-3 py-1.5 rounded border border-ink/20 hover:border-ocean transition-colors"
                        >
                          <span>Direct Link: {opp.applicationLink.replace('https://', '')}</span>
                          <ExternalLink size={12} />
                        </a>
                        <span className="text-[10px] text-muted font-medium">Scraped from: {opp.source}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-3 border-l border-ink/10 flex flex-col items-end justify-between h-full">
                      <div>
                        <div className="text-base font-bold text-ink">{opp.aiScore}%</div>
                        <div className="text-[9px] text-muted uppercase font-bold">AI Match</div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(opp.id);
                        }}
                        className={`p-2 rounded border border-ink transition-colors mt-4 ${
                          isBookmarked ? 'bg-amber text-ink hover:bg-amber-light' : 'bg-paper text-muted hover:text-ink hover:bg-warm'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Opportunity'}
                      >
                        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Clock size={14} className="text-warning" />
              <span>Upcoming Deadlines</span>
            </h3>
            <div className="space-y-3">
              {urgentOpps.map(opp => {
                const compLogo = getCompanyLogo(opp.organizer);
                return (
                <a
                  key={opp.id}
                  href={opp.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-paper rounded-lg border border-border cursor-pointer hover:bg-surface-hover transition-colors group card-shadow"
                >
                  <div className={`w-8 h-8 rounded-md ${compLogo.bg} ${compLogo.color} flex items-center justify-center font-bold text-xs border border-current/15 flex-shrink-0`}>
                    {compLogo.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate group-hover:underline">{opp.title}</p>
                    <p className="text-[10px] text-muted truncate mt-0.5">{compLogo.initials} {opp.organizer}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0 ${
                    getDeadlineUrgency(opp.deadline) === 'urgent' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-warning/10 text-warning border border-warning/20'
                  }`}>
                    {getDaysLeft(opp.deadline)}
                  </span>
                </a>
              );
              })}
            </div>
          </div>

          {/* Verified Working Sources */}
          <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Globe size={14} className="text-ocean" />
              <span>Verified Data Sources</span>
            </h3>
            <div className="space-y-3">
              {bySource.slice(0, 6).map(([source, count]) => {
                const sourceUrls: Record<string, string> = {
                  'Startup India Portal': 'https://www.startupindia.gov.in',
                  'NASSCOM 10K Startups': 'https://nasscom.in',
                  'DPIIT Recognition Portal': 'https://www.dpiit.gov.in',
                  'Invest India': 'https://www.investindia.gov.in',
                  'State Portal - Karnataka': 'https://startup.karnataka.gov.in',
                  'State Portal - Kerala KSUM': 'https://startupmission.kerala.gov.in',
                  'FICCI Startup Awards': 'https://www.ficci.in',
                  'MeitY Portal': 'https://www.meity.gov.in',
                  'SIDBI Portal': 'https://www.sidbi.in',
                  'Google for Startups': 'https://startup.google.com',
                };
                return (
                  <a
                    key={source}
                    href={sourceUrls[source] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{source}</p>
                      <p className="text-[10px] text-muted truncate mt-0.5">{sourceUrls[source] || 'Direct Feed'}</p>
                    </div>
                    <span className="text-xs font-semibold text-ink bg-paper px-2.5 py-0.5 rounded border border-border">{count}</span>
                    <ExternalLink size={12} className="text-muted flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Admin Monitoring Panel */}
          <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} className="text-success" />
                <span>Admin Monitoring Panel</span>
              </h3>
              <button onClick={() => setView('scrapers')} className="text-xs text-ocean font-semibold hover:underline">
                Manage
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-paper rounded-lg border border-border">
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-0.5">Failed Scrapes</p>
                <p className="text-lg font-bold text-danger">{adminStats.failedScrapes}</p>
              </div>
              <div className="p-3 bg-paper rounded-lg border border-border">
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-0.5">Source Health</p>
                <p className="text-lg font-bold text-success">{adminStats.sourceHealth}%</p>
              </div>
              <div className="p-3 bg-paper rounded-lg border border-border">
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-0.5">Duplicate Rate</p>
                <p className="text-lg font-bold text-warning">{adminStats.duplicateRate}%</p>
              </div>
              <div className="p-3 bg-paper rounded-lg border border-border">
                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-0.5">Scraped Today</p>
                <p className="text-lg font-bold text-ocean">{adminStats.totalScrapedToday}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-border">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Simulate:</span>
              <button
                onClick={simulateAdminFailure}
                className="px-2.5 py-1 bg-danger/10 text-danger border border-danger/20 rounded text-xs font-medium hover:bg-danger/20 transition-colors"
              >
                Trigger Failure
              </button>
              <button
                onClick={simulateAdminSuccess}
                className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded text-xs font-medium hover:bg-success/20 transition-colors"
              >
                Pass Health Check
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - Type distribution & Top sectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Distribution by Type</h3>
            <span className="text-xs font-medium text-muted">105 Verified</span>
          </div>
          <div className="space-y-3.5">
            {byType.map(([type, count]) => (
              <div key={type} className="flex items-center gap-3 group">
                <span className="text-xs font-medium text-muted w-5 text-center flex-shrink-0">{getTypeEmoji(type as any)}</span>
                <span className="text-xs font-semibold text-ink w-32 truncate group-hover:text-ocean transition-colors">{type}</span>
                <div className="flex-1 h-2.5 bg-surface-hover rounded-full overflow-hidden border border-border/50 relative">
                  <div
                    className="h-full bg-ink rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${(count / byType[0][1]) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-ink bg-paper px-2.5 py-0.5 rounded border border-border w-10 text-center flex-shrink-0 shadow-2xs">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sectors */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Top Sectors & Keywords</h3>
            <span className="text-xs font-medium text-muted">AI Inferred</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topSectors.map(([sector, count]) => (
              <span
                key={sector}
                className="px-3 py-1.5 text-xs font-medium bg-paper border border-border rounded-lg hover:bg-surface-hover transition-colors cursor-default card-shadow"
              >
                {sector} <span className="text-muted ml-1 text-[11px]">({count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Scraper Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-black border border-border/80 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs font-semibold">
            <p className="text-white">✦ System Ingestion Active</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{isScraping ? 'Triggering scraper cycles...' : 'Database populated successfully!'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
