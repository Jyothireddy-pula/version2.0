import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getTypeEmoji } from '../utils/helpers';
import {
  TrendingUp,
  Globe,
  DollarSign,
  Target,
  Layers,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { opportunities } = useStore();

  const analytics = useMemo(() => {
    const byType: Record<string, number> = {};
    const byStage: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    const byUrgency: Record<string, number> = {};
    const byRemote: Record<string, number> = {};
    const sectorCounts: Record<string, number> = {};

    opportunities.forEach(opp => {
      byType[opp.type] = (byType[opp.type] || 0) + 1;
      byStage[opp.startupStage] = (byStage[opp.startupStage] || 0) + 1;
      bySource[opp.source] = (bySource[opp.source] || 0) + 1;
      byCity[opp.location] = (byCity[opp.location] || 0) + 1;
      byUrgency[opp.urgency] = (byUrgency[opp.urgency] || 0) + 1;
      byRemote[opp.remoteType] = (byRemote[opp.remoteType] || 0) + 1;
      opp.sectors.forEach(s => { sectorCounts[s] = (sectorCounts[s] || 0) + 1; });
    });

    const sorted = (obj: Record<string, number>) => Object.entries(obj).sort((a, b) => b[1] - a[1]);
    const avgScore = Math.round(opportunities.reduce((s, o) => s + o.aiScore, 0) / opportunities.length);
    const withFunding = opportunities.filter(o => o.fundingAmount).length;

    return {
      byType: sorted(byType),
      byStage: sorted(byStage),
      bySource: sorted(bySource),
      byCity: sorted(byCity),
      byUrgency: sorted(byUrgency),
      byRemote: sorted(byRemote),
      sectors: sorted(sectorCounts),
      avgScore,
      withFunding,
    };
  }, [opportunities]);

  const BarRow = ({ label, count, max }: { label: string; count: number; max: number }) => (
    <div className="flex items-center gap-3 group">
      <span className="text-xs font-semibold text-ink w-32 truncate group-hover:text-ocean transition-colors">{label}</span>
      <div className="flex-1 h-2.5 bg-surface-hover rounded-full overflow-hidden border border-border/50 relative">
        <div className="h-full bg-ink rounded-full transition-all duration-700 ease-out shadow-sm" style={{ width: `${(count / max) * 100}%` }} />
      </div>
      <span className="text-xs font-semibold text-ink bg-paper px-2.5 py-0.5 rounded border border-border w-10 text-center flex-shrink-0 shadow-2xs">{count}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
          <TrendingUp size={22} className="text-primary" />
          <span>Analytics Insights</span>
        </h1>
        <p className="text-xs text-muted font-medium">
          Insights into India's startup ecosystem - states, sectors, and funding trends
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Opportunities', value: opportunities.length, icon: Target, color: 'bg-ocean' },
          { label: 'With Funding', value: analytics.withFunding, icon: DollarSign, color: 'bg-success' },
          { label: 'Data Sources', value: analytics.bySource.length, icon: Globe, color: 'bg-plum' },
          { label: 'Avg AI Score', value: analytics.avgScore, icon: TrendingUp, color: 'bg-warning' },
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

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-ocean" />
              <span>By Opportunity Type</span>
            </h3>
            <span className="text-xs font-medium text-muted">105 Verified</span>
          </div>
          <div className="space-y-3.5">
            {analytics.byType.map(([type, count]) => (
              <BarRow key={type} label={`${getTypeEmoji(type as any)} ${type}`} count={count} max={analytics.byType[0][1]} />
            ))}
          </div>
        </div>

        {/* By Source */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <Globe size={14} className="text-plum" />
              <span>By Data Source</span>
            </h3>
            <span className="text-xs font-medium text-muted">Live Ingestion</span>
          </div>
          <div className="space-y-3.5">
            {analytics.bySource.map(([source, count]) => (
              <BarRow key={source} label={source} count={count} max={analytics.bySource[0][1]} />
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <MapPin size={14} className="text-rust" />
              <span>Top Indian Cities</span>
            </h3>
            <span className="text-xs font-medium text-muted">Geo Filtered</span>
          </div>
          <div className="space-y-3.5">
            {analytics.byCity.slice(0, 8).map(([city, count]) => (
              <BarRow key={city} label={city} count={count} max={analytics.byCity[0][1]} />
            ))}
          </div>
        </div>

        {/* By Stage */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} className="text-moss" />
              <span>By Startup Stage</span>
            </h3>
            <span className="text-xs font-medium text-muted">AI Inferred</span>
          </div>
          <div className="space-y-3.5">
            {analytics.byStage.map(([stage, count]) => (
              <BarRow key={stage} label={stage} count={count} max={analytics.byStage[0][1]} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Urgency */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider border-b border-border pb-3">Urgency Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            {analytics.byUrgency.map(([urgency, count]) => {
              const colors: Record<string, string> = { Critical: 'bg-danger', High: 'bg-warning', Medium: 'bg-ocean', Low: 'bg-success' };
              return (
                <div key={urgency} className="p-4 bg-paper rounded-lg border border-border text-center card-shadow group hover:border-ink/20 transition-all">
                  <p className="text-2xl font-bold text-ink">{count}</p>
                  <p className="text-[10px] font-semibold text-muted uppercase mt-1">{urgency}</p>
                  <div className={`w-full h-1.5 ${colors[urgency] || 'bg-ghost'} rounded-full mt-2`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Remote Distribution */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider border-b border-border pb-3">Location Mode</h3>
          <div className="space-y-4 pt-1">
            {analytics.byRemote.map(([remote, count]) => {
              const emojis: Record<string, string> = { Remote: '❖', 'On-Site': '⚲', Hybrid: '⧓' };
              return (
                <div key={remote} className="flex items-center gap-3 group">
                  <span className="text-base flex-shrink-0">{emojis[remote] || '·'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-ink group-hover:text-ocean transition-colors">{remote}</p>
                      <span className="text-xs font-semibold text-ink bg-paper px-2 py-0.5 rounded border border-border shadow-2xs">{count}</span>
                    </div>
                    <div className="h-2 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                      <div className="h-full bg-ink rounded-full transition-all duration-700 ease-out shadow-sm" style={{ width: `${(count / opportunities.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Sectors */}
        <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider border-b border-border pb-3">Top Industry Sectors</h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {analytics.sectors.slice(0, 12).map(([sector, count]) => (
              <span
                key={sector}
                className="px-3 py-1.5 text-xs font-medium bg-paper border border-border rounded-lg hover:bg-surface-hover transition-colors card-shadow"
              >
                {sector} <span className="text-muted ml-1 text-[11px]">({count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPin({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
