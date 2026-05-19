import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { db, DatabaseEngineType } from '../services/dbService';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Activity,
  RefreshCw,
  Zap,
  Database,
  Radio,
} from 'lucide-react';

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed': return <CheckCircle2 size={14} className="text-moss" />;
    case 'running': return <Loader2 size={14} className="text-ocean animate-spin" />;
    case 'error': return <AlertCircle size={14} className="text-rust" />;
    default: return <Clock size={14} className="text-muted" />;
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'completed': return 'bg-moss/10 text-moss border-moss';
    case 'running': return 'bg-ocean/10 text-ocean border-ocean';
    case 'error': return 'bg-rust/10 text-rust border-rust';
    default: return 'bg-warm text-muted border-ghost';
  }
}
function getScraperLogo(source: string) {
  const normalized = source.toLowerCase();
  if (normalized.includes('startup india')) {
    return { bg: 'bg-ocean/10 text-ocean border-ocean/30', emoji: '🚀', initials: 'SI' };
  }
  if (normalized.includes('nasscom')) {
    return { bg: 'bg-plum/10 text-plum border-plum/30', emoji: '💻', initials: 'NS' };
  }
  if (normalized.includes('dpiit')) {
    return { bg: 'bg-moss/10 text-moss border-moss/30', emoji: '🛡️', initials: 'DP' };
  }
  if (normalized.includes('invest india')) {
    return { bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', emoji: '📈', initials: 'II' };
  }
  if (normalized.includes('meity')) {
    return { bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30', emoji: '🧠', initials: 'MS' };
  }
  if (normalized.includes('t-hub')) {
    return { bg: 'bg-danger/10 text-danger border-danger/30', emoji: '🔥', initials: 'TH' };
  }
  if (normalized.includes('iit')) {
    return { bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30', emoji: '🎓', initials: 'IIT' };
  }
  if (normalized.includes('karnataka')) {
    return { bg: 'bg-amber/10 text-amber border-amber/30', emoji: '🌾', initials: 'KA' };
  }
  return { bg: 'bg-surface border-border', emoji: '🤖', initials: 'SC' };
}
export default function ScrapersPage() {
  const { scrapers, runScraper, opportunities, refreshData } = useStore();
  const [dbMetrics, setDbMetrics] = useState<any>(null);
  const [useIDB, setUseIDB] = useState(true);

  const loadMetrics = async () => {
    const res = await db.getDatabaseMetrics();
    setDbMetrics(res);
    setUseIDB(res.status.includes('IndexedDB'));
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const totalScraped = scrapers.reduce((sum, s) => sum + s.itemsScraped, 0);
  const avgSuccess = scrapers.reduce((sum, s) => sum + s.successRate, 0) / scrapers.length;
  const running = scrapers.filter(s => s.status === 'running').length;
  const errors = scrapers.filter(s => s.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-border card-shadow">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            <Radio size={22} className="text-primary animate-pulse" />
            <span>Scraper Stations</span>
          </h1>
          <p className="text-xs text-muted font-medium">
            Monitoring all data collection sources • Automated daemon active
          </p>
        </div>
        <button
          onClick={() => scrapers.forEach(s => runScraper(s.source))}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-paper rounded-lg text-xs font-semibold hover:bg-primary-hover transition-all card-shadow"
        >
          <RefreshCw size={14} className="animate-spin-hover" />
          <span>Scan All</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Items Collected', value: totalScraped, icon: Zap, color: 'bg-ocean' },
          { label: 'Avg Health', value: `${avgSuccess.toFixed(1)}%`, icon: Activity, color: 'bg-success' },
          { label: 'Active', value: running, icon: Loader2, color: 'bg-warning' },
          { label: 'Issues', value: errors, icon: AlertCircle, color: 'bg-danger' },
        ].map(stat => (
          <div key={stat.label} className="p-5 bg-surface rounded-xl border border-border card-shadow hover:border-muted transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color}/10 text-${stat.color.replace('bg-', '')} flex items-center justify-center border border-border shadow-2xs`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Live</span>
            </div>
            <p className="text-3xl font-bold text-ink">{stat.value}</p>
            <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Scraper Cards */}
      <div className="space-y-4">
        {scrapers.map(scraper => {
          const logo = getScraperLogo(scraper.source);
          return (
            <div
              key={scraper.source}
              className={`bg-surface rounded-xl border border-border p-6 card-shadow transition-all ${scraper.status === 'error' ? 'border-danger/30 bg-danger/5' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center border font-bold card-shadow flex-shrink-0 leading-none ${logo.bg}`}>
                    <span className="text-[11px] tracking-tight opacity-75 font-mono uppercase">{logo.initials}</span>
                    <span className="text-sm mt-0.5">{logo.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink tracking-tight">{scraper.source}</h3>
                    <p className="text-xs text-muted font-medium mt-0.5">{scraper.itemsScraped} items · Strategy: {scraper.strategy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border ${getStatusBg(scraper.status)}`}>
                    <StatusIcon status={scraper.status} />
                    {scraper.status.charAt(0).toUpperCase() + scraper.status.slice(1)}
                  </span>
                  <button
                    onClick={() => runScraper(scraper.source)}
                    className="p-2 bg-paper border border-border rounded-md hover:bg-surface-hover text-ink transition-colors card-shadow"
                    title="Force Scrape Endpoint"
                  >
                    <RefreshCw size={14} className="animate-spin-hover" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-paper rounded-lg border border-border">
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Items</p>
                  <p className="text-lg font-bold text-ink">{scraper.itemsScraped}</p>
                </div>
                <div className="p-3 bg-paper rounded-lg border border-border">
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Success</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-ink">{scraper.successRate}%</p>
                    <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                      <div className={`h-full rounded-full ${scraper.successRate >= 95 ? 'bg-success' : scraper.successRate >= 90 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${scraper.successRate}%` }} />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-paper rounded-lg border border-border">
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Response</p>
                  <p className="text-lg font-bold text-ink">{scraper.avgResponseTime}s</p>
                </div>
                <div className="p-3 bg-paper rounded-lg border border-border">
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Next</p>
                  <p className="text-sm font-bold text-ink font-mono">
                    {new Date(scraper.nextRun).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Error log with Interactive Resolution */}
              {scraper.errorLog && scraper.errorLog.length > 0 && (
                <div className="mt-4 p-4 bg-danger/5 border border-danger/20 rounded-lg space-y-3.5">
                  <div className="space-y-1.5">
                    {scraper.errorLog.map((err, i) => (
                      <p key={i} className="text-xs text-danger font-medium flex items-center gap-2">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        <span>{err}</span>
                      </p>
                    ))}
                  </div>
                  <div className="pt-2.5 border-t border-danger/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-[10px] text-danger font-bold uppercase tracking-wider">Status: Blocked by Anti-Scraping / Timeout</span>
                    <button
                      onClick={() => runScraper(scraper.source)}
                      className="px-3 py-1.5 bg-danger text-white rounded text-[10px] font-bold hover:bg-danger-light transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] card-shadow"
                    >
                      <RefreshCw size={10} className="animate-spin-hover" />
                      <span>Auto-Resolve & Bypass Limit</span>
                    </button>
                  </div>
                </div>
              )}

            {/* Progress bar */}
            <div className="mt-6 h-1.5 bg-surface-hover rounded-full overflow-hidden border border-border/50">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  scraper.status === 'error' ? 'bg-danger' :
                  scraper.status === 'running' ? 'bg-ocean animate-pulse' :
                  'bg-success'
                }`}
                style={{ width: scraper.status === 'running' ? '60%' : '100%' }}
              />
            </div>
          </div>
        );
      })}
    </div>

      {/* Database Engine & Storage Metrics */}
      <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <Database size={14} className="text-success" />
              <span>Database Engine & Storage Metrics</span>
            </h3>
            <p className="text-[10px] text-muted font-medium mt-0.5">
              {useIDB ? 'Primary: IndexedDB (B-tree) • Fallback: localStorage' : 'Primary: localStorage KV Store'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Engine Mode:</span>
            <select
              value={dbMetrics?.engine || 'SQLite (Relational)'}
              onChange={async (e) => {
                db.setEngineType(e.target.value as DatabaseEngineType);
                loadMetrics();
              }}
              className="text-xs bg-paper border border-border rounded-lg p-2 font-semibold text-ink focus:outline-none focus:border-ocean card-shadow"
            >
              <option value="SQLite (Relational)">SQLite (Relational)</option>
              <option value="MongoDB (NoSQL Document)">MongoDB (NoSQL Document)</option>
              <option value="PostgreSQL (Enterprise Pipeline)">PostgreSQL (Enterprise Pipeline)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-paper rounded-lg border border-border text-center">
            <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Storage</p>
            <p className="text-sm font-bold text-success flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} /> {useIDB ? 'IndexedDB' : 'localStorage'}
            </p>
          </div>
          <div className="p-4 bg-paper rounded-lg border border-border text-center">
            <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Records</p>
            <p className="text-2xl font-bold text-ink">{dbMetrics?.totalRecords || opportunities.length}</p>
          </div>
          <div className="p-4 bg-paper rounded-lg border border-border text-center">
            <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Size</p>
            <p className="text-2xl font-bold text-ocean">{dbMetrics?.dbSizeKb || 120} KB</p>
          </div>
          <div className="p-4 bg-paper rounded-lg border border-border text-center">
            <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">Tables</p>
            <p className="text-2xl font-bold text-plum">{dbMetrics?.collectionsCount || 4}</p>
          </div>
        </div>

        <div className="p-4 bg-paper rounded-lg border border-border text-xs text-muted space-y-1">
          <p className="font-bold text-ink">Database Architecture</p>
          <p>
            {dbMetrics?.engine === 'MongoDB (NoSQL Document)' 
              ? 'Collections: opportunities (B-tree indexed on type, source, deadline), scrape_logs, alerts, subscriptions. Supports dynamic BSON document models with flexible schema enrichment.'
              : dbMetrics?.engine === 'PostgreSQL (Enterprise Pipeline)'
              ? 'Schema: opportunities (PK uuid, indexes: title gin_trgm, source, created_at), logs, alerts. Utilizes parallel query workers, connection pooling, ACID compliance, and robust relational constraint integrity for enterprise intelligence.'
              : 'Tables: opportunities (PK id, indexes: type, source, deadline, created_at), scrape_logs, alerts, subscriptions. Enforces strict relational schemas with primary keys and transaction simulation.'
            }
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={async () => {
              await db.resetDatabaseToDefaults();
              await refreshData();
              loadMetrics();
            }}
            className="px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg text-xs font-semibold hover:bg-danger/20 transition-colors"
          >
            Reset Database to Seed Defaults
          </button>
        </div>
      </div>

      {/* Architecture Info */}
      <div className="bg-cream rounded border-2 border-ink p-4">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Scraper Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: 'Indian Govt Portals',
              desc: 'Scraping from Startup India, DPIIT, Invest India, NASSCOM, and state government portals.',
              tags: ['Startup India', 'DPIIT', 'NASSCOM', 'State Portals'],
            },
            {
              title: 'State-Level Sources',
              desc: 'Dedicated scrapers for each Indian state startup policy portal and schemes.',
              tags: ['Karnataka', 'Telangana', 'Kerala', 'Rajasthan'],
            },
            {
              title: 'Incubator Networks',
              desc: 'Scraping from IITs, IIMs, and other premier institution incubation centers.',
              tags: ['IIT Incubators', 'IIM Programs', 'NITI Aayog', 'BIRAC'],
            },
          ].map(arch => (
            <div key={arch.title} className="p-3 bg-paper rounded border border-ink">
              <h4 className="text-xs font-bold text-ink mb-1">{arch.title}</h4>
              <p className="text-[10px] text-muted mb-2">{arch.desc}</p>
              <div className="flex flex-wrap gap-1">
                {arch.tags.map(t => <span key={t} className="px-1.5 py-0.5 text-[8px] font-bold bg-warm border border-ink rounded">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
