import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Bell,
  BellPlus,
  Mail,
  MessageSquare,
  Hash,
  Webhook,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Zap,
} from 'lucide-react';

function getChannelIcon(channel: string) {
  switch (channel) {
    case 'email': return <Mail size={14} className="text-ocean" />;
    case 'slack': return <MessageSquare size={14} className="text-success" />;
    case 'discord': return <Hash size={14} className="text-plum" />;
    case 'webhook': return <Webhook size={14} className="text-warning" />;
    default: return <Bell size={14} className="text-muted" />;
  }
}

export default function AlertsPage() {
  const { alerts, toggleAlert, removeAlert, addAlert } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleAdd = () => {
    if (name && keywords) {
      addAlert({
        id: Date.now().toString(),
        name,
        keywords: keywords.split(',').map(k => k.trim()),
        types: [],
        minAiScore: 70,
        enabled: true,
        channel: 'email',
        endpoint: '',
        matchCount: 0,
      });
      setName('');
      setKeywords('');
      setShowNew(false);
    }
  };

  const enabledCount = alerts.filter(a => a.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Alert Configuration</h1>
          <p className="text-xs text-muted font-medium">Set up notifications for matching Indian startup opportunities</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-2 bg-ink text-paper rounded text-xs font-bold hover:bg-charcoal transition-colors border-2 border-ink"
        >
          <BellPlus size={12} />
          New Alert
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Alerts', value: alerts.length, icon: Bell, color: 'bg-ocean' },
          { label: 'Active', value: enabledCount, icon: Zap, color: 'bg-success' },
          { label: 'Matches Today', value: 12, icon: Bell, color: 'bg-warning' },
        ].map(stat => (
          <div key={stat.label} className="p-5 bg-surface rounded-xl border border-border card-shadow hover:border-muted transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color}/10 flex items-center justify-center border border-border shadow-2xs`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Live</span>
            </div>
            <p className="text-3xl font-bold text-ink">{stat.value}</p>
            <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* New Alert Form */}
      {showNew && (
        <div className="bg-cream rounded border-2 border-ink p-4">
          <h3 className="text-xs font-bold text-ink mb-3">Create New Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-bold text-muted mb-1 block">Alert Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., AI Startup Grants"
                className="w-full px-3 py-2 bg-paper border-2 border-ink rounded text-xs focus:outline-none focus:border-ocean"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted mb-1 block">Keywords (comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="e.g., AI, machine learning, deep tech"
                className="w-full px-3 py-2 bg-paper border-2 border-ink rounded text-xs focus:outline-none focus:border-ocean"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-xs font-bold text-muted hover:text-ink">Cancel</button>
            <button onClick={handleAdd} className="px-3 py-1.5 bg-ink text-paper rounded text-xs font-bold hover:bg-charcoal">Create</button>
          </div>
        </div>
      )}

      {/* Alert Cards */}
      <div className="space-y-2">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`bg-cream rounded border-2 border-ink p-4 transition-opacity ${!alert.enabled ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-paper flex items-center justify-center border border-ink">
                  {getChannelIcon(alert.channel)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">{alert.name}</h3>
                  <p className="text-[9px] text-muted capitalize">{alert.channel} • Min AI: {alert.minAiScore} • {alert.matchCount} matches</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleAlert(alert.id)}>
                  {alert.enabled ? <ToggleRight size={24} className="text-moss" /> : <ToggleLeft size={24} className="text-muted" />}
                </button>
                <button onClick={() => removeAlert(alert.id)} className="p-1.5 rounded hover:bg-warm text-muted hover:text-rust transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {alert.keywords.map(k => (
                <span key={k} className="px-1.5 py-0.5 text-[8px] font-bold bg-paper border border-ink rounded">{k}</span>
              ))}
              {alert.types.map(t => (
                <span key={t} className="px-1.5 py-0.5 text-[8px] font-bold bg-ocean/10 text-ocean border border-ocean rounded">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Channels */}
      <div className="bg-surface rounded-xl border border-border p-5 card-shadow">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Supported Channels</h3>
          <span className="text-[10px] font-medium text-muted">Email, team chat, and webhook delivery</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              name: 'Email',
              icon: Mail,
              status: 'Connected',
              iconWrap: 'bg-blue-500/10 border-blue-500/20',
              iconClass: 'text-blue-600',
            },
            {
              name: 'Slack',
              icon: MessageSquare,
              status: 'Connected',
              iconWrap: 'bg-emerald-500/10 border-emerald-500/20',
              iconClass: 'text-emerald-600',
            },
            {
              name: 'Discord',
              icon: Hash,
              status: 'Available',
              iconWrap: 'bg-violet-500/10 border-violet-500/20',
              iconClass: 'text-violet-600',
            },
            {
              name: 'Webhook',
              icon: Webhook,
              status: 'Available',
              iconWrap: 'bg-amber-500/10 border-amber-500/20',
              iconClass: 'text-amber-600',
            },
          ].map(ch => (
            <div key={ch.name} className="p-4 bg-paper rounded-xl border border-border text-center card-shadow hover:border-muted transition-all">
              <div className={`w-9 h-9 mx-auto rounded-lg ${ch.iconWrap} flex items-center justify-center border mb-3`}>
                <ch.icon size={16} className={ch.iconClass} strokeWidth={2.2} />
              </div>
              <p className="text-xs font-semibold text-ink">{ch.name}</p>
              <p className={`text-[10px] font-semibold mt-0.5 ${ch.status === 'Connected' ? 'text-success' : 'text-muted'}`}>{ch.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
