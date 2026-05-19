import { useState } from 'react';
import { useStore } from '../store/useStore';
import { exportToCSV, exportToJSON, downloadFile } from '../utils/helpers';
import { exportCsvApiUrl, exportJsonApiUrl, isApiConfigured } from '../services/apiService';
import { Download, FileJson, FileSpreadsheet, CheckCircle2, Filter } from 'lucide-react';

export default function ExportPage() {
  const { opportunities, filteredOpportunities } = useStore();
  const [scope, setScope] = useState<'all' | 'filtered'>('filtered');
  const [lastExport, setLastExport] = useState<string | null>(null);

  const data = scope === 'all' ? opportunities : filteredOpportunities;

  const handleExport = (fmt: 'csv' | 'json') => {
    if (isApiConfigured() && scope === 'all') {
      const url = fmt === 'csv' ? exportCsvApiUrl() : exportJsonApiUrl();
      if (url) {
        window.open(url, '_blank');
        setLastExport(fmt);
        setTimeout(() => setLastExport(null), 2000);
        return;
      }
    }
    const content = fmt === 'csv' ? exportToCSV(data) : exportToJSON(data);
    const filename = `startupintel-india-${new Date().toISOString().split('T')[0]}.${fmt}`;
    downloadFile(content, filename, fmt === 'csv' ? 'text/csv' : 'application/json');
    setLastExport(fmt);
    setTimeout(() => setLastExport(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Export Data</h1>
        <p className="text-xs text-muted font-medium">Export Indian startup opportunity data in CSV or JSON format</p>
      </div>

      {/* Scope */}
      <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
            <Filter size={14} className="text-ocean" />
            <span>Export Scope</span>
          </h3>
          <span className="text-xs font-medium text-muted">{data.length} Records</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'all' as const, label: 'All Opportunities', count: opportunities.length, desc: 'Complete dataset' },
            { id: 'filtered' as const, label: 'Filtered Results', count: filteredOpportunities.length, desc: 'Based on current filters' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setScope(opt.id)}
              className={`p-5 rounded-xl text-left transition-all card-shadow hover:scale-[1.01] ${
                scope === opt.id ? 'bg-primary text-paper border border-border shadow-sm' : 'bg-paper text-ink border border-border hover:border-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">{opt.label}</span>
                {scope === opt.id && <CheckCircle2 size={14} />}
              </div>
              <p className="text-3xl font-bold">{opt.count}</p>
              <p className={`text-[10px] mt-1 ${scope === opt.id ? 'text-muted' : 'text-muted'}`}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Export Formats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                fmt: 'csv' as const,
                label: 'CSV Format',
                desc: 'Open in Excel, Google Sheets, or any spreadsheet app',
                icon: FileSpreadsheet,
                color: 'bg-success',
                tags: ['Excel', 'Google Sheets', 'Data Analysis'],
              },
              {
                fmt: 'json' as const,
                label: 'JSON Format',
                desc: 'Structured data for APIs, processing, or integration',
                icon: FileJson,
                color: 'bg-ocean',
                tags: ['APIs', 'Data Processing', 'Backup'],
              },
            ].map(exp => (
              <div
                key={exp.fmt}
                onClick={() => handleExport(exp.fmt)}
                className="bg-surface rounded-xl border border-border p-6 cursor-pointer hover:border-muted transition-all card-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${exp.color}/10 flex items-center justify-center border border-border card-shadow`}>
                    <exp.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink">{exp.label}</h3>
                    <p className="text-xs text-muted">{exp.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {exp.tags.map(t => <span key={t} className="px-2 py-1 text-[10px] font-medium bg-paper border border-border rounded">{t}</span>)}
                </div>
                <button className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-lg border border-border text-xs font-semibold transition-all card-shadow ${
                  lastExport === exp.fmt ? 'bg-success text-paper' : 'bg-paper hover:bg-surface-hover'
                }`}>
                  {lastExport === exp.fmt ? <><CheckCircle2 size={14} /> Downloaded!</> : <><Download size={14} /> Export ({data.length} items)</>}
                </button>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-surface rounded-xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Data Preview</h3>
              <span className="text-xs font-medium text-muted">{data.length} Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[10px] font-semibold text-muted uppercase pb-3 pr-4 tracking-wider">Title</th>
                    <th className="text-left text-[10px] font-semibold text-muted uppercase pb-3 pr-4 tracking-wider">Type</th>
                    <th className="text-left text-[10px] font-semibold text-muted uppercase pb-3 pr-4 tracking-wider">Organizer</th>
                    <th className="text-left text-[10px] font-semibold text-muted uppercase pb-3 pr-4 tracking-wider">Deadline</th>
                    <th className="text-left text-[10px] font-semibold text-muted uppercase pb-3 tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map(opp => (
                    <tr key={opp.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-3 pr-4 text-xs font-semibold text-ink max-w-[200px] truncate">{opp.title}</td>
                      <td className="py-3 pr-4 text-xs text-muted">{opp.type}</td>
                      <td className="py-3 pr-4 text-xs text-muted">{opp.organizer}</td>
                      <td className="py-3 pr-4 text-xs text-muted">{opp.deadline}</td>
                      <td className="py-3 text-xs font-bold text-ink">{opp.aiScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && <p className="text-[10px] text-muted text-center mt-4">...and {data.length - 5} more records</p>}
            </div>
          </div>
    </div>
  );
}
