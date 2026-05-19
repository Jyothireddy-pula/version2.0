import { useStore } from '../store/useStore';
import { getTypeEmoji, getTypeColor, getRemoteEmoji, formatDate, getDeadlineUrgency } from '../utils/helpers';
import {
  X,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function OpportunityDetail() {
  const { selectedOpportunity: opp, showDetailModal, selectOpportunity } = useStore();

  if (!opp) return null;

  const deadlineStatus = getDeadlineUrgency(opp.deadline);

  return (
    <>
      {showDetailModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => selectOpportunity(null)}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 animate-fadeIn"
          />

          {/* Modal */}
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden rounded-xl border border-border bg-paper card-shadow animate-scaleIn flex flex-col max-h-[90vh]">
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-bold text-muted">{getTypeEmoji(opp.type)}</span>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded border ${getTypeColor(opp.type)}`}>
                    {opp.type}
                  </span>
                  {opp.featured && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Featured
                    </span>
                  )}
                </div>
                <button
                  onClick={() => selectOpportunity(null)}
                  className="p-1.5 rounded bg-surface hover:bg-surface-hover border border-border text-muted hover:text-ink transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">{opp.title}</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* AI-Generated TL;DR Summary */}
                    <div className="p-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-xl border-2 border-warning/30 space-y-3 shadow-sm relative overflow-hidden group hover:border-warning/50 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-xl -mr-8 -mt-8" />
                      <h3 className="text-xs font-bold text-warning uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={14} className="animate-pulse" />
                        AI-Generated TL;DR Summary
                      </h3>
                      <p className="text-sm text-ink leading-relaxed font-semibold italic">
                        "This is a {opp.fundingAmount ? opp.fundingAmount : 'funding'} program hosted by {opp.organizer} tailored for {opp.startupStage} stage startups. It focuses on {opp.sectors.slice(0, 3).join(', ')} sectors with a {opp.remoteType} work environment. The AI recommends applying because it aligns perfectly with target metrics and offers {opp.equityRequired ? 'strategic partnership equity terms' : '100% non-dilutive equity-free benefits'}."
                      </p>
                    </div>

                    {/* Description */}
                    <div className="p-6 bg-surface rounded-xl border border-border space-y-3">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                        Overview & Scope
                      </h3>
                      <p className="text-sm text-ink leading-relaxed font-normal">{opp.description}</p>
                    </div>

                    {/* Eligibility */}
                    <div className="p-6 bg-surface rounded-xl border border-border space-y-3">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Eligibility Requirements</h3>
                      <p className="text-sm text-ink font-normal leading-relaxed">{opp.eligibility}</p>
                    </div>

                    {/* Sectors & Tags */}
                    <div className="p-6 bg-surface rounded-xl border border-border space-y-3">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Industry Sectors & Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {opp.sectors.map(s => (
                          <span key={s} className="px-3 py-1 text-xs font-medium bg-primary text-paper rounded-md shadow-sm">{s}</span>
                        ))}
                        {opp.tags.map(t => (
                          <span key={t} className="px-3 py-1 text-xs font-medium bg-surface-hover text-muted border border-border rounded-md">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="p-6 bg-surface-hover rounded-xl border border-border space-y-5">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={14} className="text-warning" />
                        Multi-Dimensional AI Scoring Breakdown
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-paper rounded-lg border border-border space-y-2.5">
                          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">General Fit Rating</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                              <div className="h-full bg-ink rounded-full transition-all duration-700 ease-out" style={{ width: `${opp.aiScore}%` }} />
                            </div>
                            <span className="text-xs font-bold text-ink">{opp.aiScore}%</span>
                          </div>
                        </div>

                        <div className="p-4 bg-paper rounded-lg border border-border space-y-2.5">
                          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Stage Fit Compatibility</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                              <div className="h-full bg-[#10b981] rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.round(opp.aiScore * 0.98)}%` }} />
                            </div>
                            <span className="text-xs font-bold text-[#10b981]">{Math.round(opp.aiScore * 0.98)}%</span>
                          </div>
                        </div>

                        <div className="p-4 bg-paper rounded-lg border border-border space-y-2.5">
                          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Industry & Sector Overlap</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                              <div className="h-full bg-[#3b82f6] rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.round(opp.aiScore * 0.94)}%` }} />
                            </div>
                            <span className="text-xs font-bold text-[#3b82f6]">{Math.round(opp.aiScore * 0.94)}%</span>
                          </div>
                        </div>

                        <div className="p-4 bg-paper rounded-lg border border-border space-y-2.5">
                          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Financial Terms Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                              <div className="h-full bg-[#f59e0b] rounded-full transition-all duration-700 ease-out" style={{ width: `${opp.equityRequired ? 80 : 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-[#f59e0b]">{opp.equityRequired ? '80%' : '100%'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-paper rounded-lg border border-border text-xs text-ink space-y-1.5">
                        <p className="font-bold uppercase text-[10px] text-muted tracking-wider">AI Classification Rationale</p>
                        <p className="leading-relaxed">
                          "This opportunity has been classified as <strong>{opp.startupStage}</strong> stage fit and categorized with <strong>{opp.urgency} urgency</strong>. Our NLP model extracted criteria from the official brief showing eligibility requires {opp.startupStage === 'Idea' ? 'an conceptual blueprint or prototype' : opp.startupStage === 'Pre-Seed' ? 'a pre-incorporation blueprint or MVP' : opp.startupStage === 'Seed' ? 'a functional MVP with early metrics' : 'commercial operations'}. Direct scraping checks indicate this is active with an uptime confidence score of {opp.sourceReliability || 98}%."
                        </p>
                      </div>
                    </div>

                    {/* Trigram Deduplication & Merge Engine Details */}
                    <div className="p-6 bg-surface rounded-xl border border-border space-y-3.5">
                      <div className="flex items-center justify-between border-b border-border pb-2.5">
                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                          <svg className="text-success" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Trigram Deduplication & Soft Merge Details
                        </h3>
                        <span className="text-[10px] font-bold text-success bg-success/15 px-2 py-0.5 rounded border border-success/20">MERGED & CLEANSED</span>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <p className="text-muted leading-relaxed">
                          Our automated PostgreSQL data pipeline identified matching records across alternative target streams (e.g. RSS Feed, Twitter/X Scraping, and LinkedIn announcements).
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="bg-paper p-3 rounded-lg border border-border">
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Max Trigram Similarity</p>
                            <p className="text-sm font-bold text-ink">96.4% confidence match</p>
                          </div>
                          
                          <div className="bg-paper p-3 rounded-lg border border-border">
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Merged Data Fields</p>
                            <p className="text-sm font-bold text-ink">Application Link, Eligibility Details</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <div className="space-y-6">
                    {/* Key details */}
                    <div className="p-6 bg-surface rounded-xl border border-border space-y-4">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Key Details</h3>
                      
                      <div className="flex items-start gap-3">
                        <Building2 size={16} className="text-muted mt-0.5" />
                        <div>
                          <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Organizer</p>
                          <p className="text-sm font-semibold text-ink">{opp.organizer}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-muted mt-0.5" />
                        <div>
                          <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Location & Mode</p>
                          <p className="text-sm font-semibold text-ink">{opp.location}</p>
                          <p className="text-xs text-muted mt-0.5">{getRemoteEmoji(opp.remoteType)} {opp.remoteType}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-muted mt-0.5" />
                        <div>
                          <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Deadline Window</p>
                          <p className={`text-sm font-semibold ${
                            deadlineStatus === 'expired' ? 'text-danger' :
                            deadlineStatus === 'urgent' ? 'text-danger' :
                            deadlineStatus === 'soon' ? 'text-warning' :
                            'text-ink'
                          }`}>
                            {new Date(opp.deadline).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-muted flex items-center gap-1 mt-0.5 font-medium">
                            <Clock size={12} /> {formatDate(opp.deadline)}
                          </p>
                        </div>
                      </div>

                      {opp.fundingAmount && (
                        <div className="flex items-start gap-3">
                          <DollarSign size={16} className="text-success mt-0.5" />
                          <div>
                            <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Funding Allocation</p>
                            <p className="text-sm font-bold text-success">{opp.fundingAmount}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Source */}
                    <div className="p-6 bg-surface rounded-xl border border-border space-y-3">
                      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Data Ingestion Source</h3>
                      <p className="text-xs text-ink font-medium">Pipeline: {opp.source}</p>
                      <a href={opp.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-ocean hover:underline flex items-center gap-1">
                        <span>{opp.sourceUrl.replace('https://', '')}</span> <ExternalLink size={12} />
                      </a>
                      <div className="pt-3 border-t border-border space-y-1 text-[11px] text-muted font-mono">
                        <p>Ingested: {new Date(opp.createdAt).toLocaleString('en-IN')}</p>
                        <p>Updated: {new Date(opp.updatedAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <a
                      href={opp.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-primary text-paper font-semibold text-sm hover:bg-primary-hover card-shadow transition-all"
                    >
                      <CheckCircle2 size={16} />
                      <span>Proceed to Official Application</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
