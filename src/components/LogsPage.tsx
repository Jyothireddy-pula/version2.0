import { useStore } from '../store/useStore';
import { ScrollText, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { formatTimeOnly } from '../utils/helpers';

function LevelIcon({ level }: { level: string }) {
  switch (level) {
    case 'success': return <CheckCircle2 size={14} className="text-success" />;
    case 'error': return <AlertCircle size={14} className="text-danger" />;
    case 'warn': return <AlertTriangle size={14} className="text-warning" />;
    default: return <Info size={14} className="text-ocean" />;
  }
}

function getLevelBg(level: string) {
  switch (level) {
    case 'success': return 'bg-success/5 border-success/20';
    case 'error': return 'bg-danger/5 border-danger/20';
    case 'warn': return 'bg-warning/5 border-warning/20';
    default: return 'bg-paper border-border';
  }
}

export default function LogsPage() {
  const { logs } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-surface p-6 rounded-xl border border-border card-shadow">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            Scraping Logs <ScrollText size={20} />
          </h1>
          <p className="text-xs text-muted font-medium">Real-time logs from all scraper operations • Automated daemon active</p>
        </div>
      </div>

      {/* Log entries */}
      <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Live Feed</span>
          </div>
          <span className="text-xs font-medium text-muted">{logs.length} entries</span>
        </div>
        <div className="space-y-2 font-mono">
          {logs.map(log => (
            <div
              key={log.id}
              className={`flex items-start gap-3 p-3 rounded-lg border card-shadow transition-all hover:scale-[1.01] ${getLevelBg(log.level)}`}
            >
              <LevelIcon level={log.level} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted">
                    {formatTimeOnly(log.timestamp)}
                  </span>
                  <span className="text-[10px] font-bold text-ocean">[{log.source}]</span>
                </div>
                <p className="text-xs text-ink mt-0.5">{log.message}</p>
                {log.itemsFound && (
                  <span className="text-[10px] font-bold text-success mt-1 inline-block">Found {log.itemsFound} items</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duplicate Detection Info */}
      <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Duplicate Detection Pipeline</h3>
          <span className="text-xs font-medium text-muted">Fuzzy Match Engine</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Method', value: 'Fuzzy Title Matching + Hash Comparison' },
            { label: 'Threshold', value: '85% similarity match' },
            { label: 'Action', value: 'Keep highest AI Score, merge duplicates' },
          ].map(item => (
            <div key={item.label} className="p-4 bg-paper rounded-lg border border-border">
              <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-sm font-bold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
