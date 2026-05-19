import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getTypeEmoji, getUrgencyColor, getRemoteEmoji, getCompanyLogo } from '../utils/helpers';
import { OpportunityType, StartupStage, RemoteType, Urgency } from '../types';
import {
  Search,
  SlidersHorizontal,
  X,
  Grid,
  List,
  ArrowUpDown,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Clock,
  MailPlus,
  Loader2,
  Sparkles,
  Target,
} from 'lucide-react';

const opportunityTypes: OpportunityType[] = [
  'Grant', 'Accelerator', 'Incubator', 'Competition', 'Fellowship',
  'Conference', 'VC Program', 'Innovation Challenge', 'Hackathon', 'Funding', 'Loan'
];

const startupStages: StartupStage[] = ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth', 'Any'];
const remoteTypes: RemoteType[] = ['Remote', 'On-Site', 'Hybrid'];
const urgencyLevels: Urgency[] = ['Critical', 'High', 'Medium', 'Low'];

export default function OpportunitiesPage() {
  const { 
    filteredOpportunities, 
    opportunities, 
    filters, 
    setFilters, 
    selectOpportunity,
    bookmarkedIds,
    toggleBookmark,
    setShowSubscribeModal,
    isSearching,
    aiSearchSuggestions,
    activeAiSuggestion,
    setActiveAiSuggestion
  } = useStore();

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // AI Profile Matcher States
  const [showProfileMatcher, setShowProfileMatcher] = useState(false);
  const [profileStage, setProfileStage] = useState<StartupStage | 'Any'>('Any');
  const [profileSector, setProfileSector] = useState('');
  const [profileFunding, setProfileFunding] = useState<'All' | 'Grants' | 'Accelerators'>('All');
  const [isProfileApplied, setIsProfileApplied] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const sources = useMemo(() => [...new Set(opportunities.map(o => o.source))], [opportunities]);
  
  const activeFilterCount = [
    filters.types.length > 0,
    filters.sources.length > 0,
    filters.stages.length > 0,
    filters.remoteTypes.length > 0,
    filters.urgency.length > 0,
    filters.deadlineRange !== 'all',
  ].filter(Boolean).length;

  const toggleFilter = <T extends string>(key: keyof typeof filters, value: T) => {
    const current = filters[key] as T[];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setFilters({ [key]: updated });
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filter by bookmarked if toggle is active & compute personalized AI scores
  const displayedOpportunities = useMemo(() => {
    let list = showBookmarkedOnly
      ? filteredOpportunities.filter(o => bookmarkedIds.includes(o.id))
      : filteredOpportunities;

    if (isProfileApplied) {
      const listWithScores = list.map(opp => {
        let stagePts = 0;
        if (profileStage === 'Any' || opp.startupStage === 'Any') {
          stagePts = 40;
        } else if (opp.startupStage === profileStage) {
          stagePts = 40;
        } else {
          // Close stages
          const stages = ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth', 'Any'];
          const idx1 = stages.indexOf(opp.startupStage);
          const idx2 = stages.indexOf(profileStage);
          if (idx1 !== -1 && idx2 !== -1 && Math.abs(idx1 - idx2) <= 1) {
            stagePts = 20;
          }
        }

        let sectorPts = 0;
        if (!profileSector) {
          sectorPts = 25;
        } else {
          const secQuery = profileSector.toLowerCase().trim();
          const matches = opp.sectors.some(s => s.toLowerCase().includes(secQuery)) || 
                          opp.tags.some(t => t.toLowerCase().includes(secQuery)) ||
                          opp.description.toLowerCase().includes(secQuery);
          sectorPts = matches ? 35 : 5;
        }

        let fundingPts = 0;
        if (profileFunding === 'All') {
          fundingPts = 25;
        } else if (profileFunding === 'Grants' && opp.type === 'Grant') {
          fundingPts = 25;
        } else if (profileFunding === 'Accelerators' && opp.type === 'Accelerator') {
          fundingPts = 25;
        } else {
          fundingPts = 5;
        }

        const personalizedScore = stagePts + sectorPts + fundingPts;
        return { ...opp, aiScore: personalizedScore };
      });

      // Sort by personalized score descending
      return listWithScores.sort((a, b) => b.aiScore - a.aiScore);
    }

    return list;
  }, [filteredOpportunities, showBookmarkedOnly, bookmarkedIds, isProfileApplied, profileStage, profileSector, profileFunding]);

  // Paginated slice
  const paginatedOpportunities = useMemo(() => {
    if (pageSize === 9999) return displayedOpportunities;
    const start = (currentPage - 1) * pageSize;
    return displayedOpportunities.slice(start, start + pageSize);
  }, [displayedOpportunities, currentPage, pageSize]);

  const totalPages = pageSize === 9999 ? 1 : Math.ceil(displayedOpportunities.length / pageSize);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cream p-4 rounded border-2 border-ink paper-shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            Explore Opportunities <span className="text-lg">🇮🇳</span>
          </h1>
          <p className="text-xs text-muted font-medium mt-0.5">
            105+ verified grants, incubators, accelerators & PSUs for Indian founders
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border border-ink transition-colors ${
              showBookmarkedOnly ? 'bg-amber text-ink' : 'bg-paper text-ink hover:bg-warm'
            }`}
          >
            {showBookmarkedOnly ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            Bookmarked ({bookmarkedIds.length})
          </button>

          <button
            onClick={() => setShowSubscribeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper rounded text-xs font-bold hover:bg-charcoal transition-colors border border-ink"
          >
            <MailPlus size={14} />
            Subscribe Alerts
          </button>

          <div className="flex items-center gap-1 bg-paper p-1 rounded border border-ink">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
              title="Grid View"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-paper p-3 rounded border border-ink space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative flex items-center">
            <Search size={16} className="absolute left-3 text-muted" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters({ search: e.target.value });
                setCurrentPage(1);
              }}
              placeholder="Debounced Search by title, organizer, PSU, sector, state (e.g. AI, Karnataka, ONGC)..."
              className="w-full pl-9 pr-10 py-2 rounded bg-cream border border-ink text-xs text-ink placeholder-muted focus:outline-none focus:border-ocean transition-colors"
            />
            {isSearching ? (
              <Loader2 size={14} className="absolute right-3 text-ocean animate-spin" />
            ) : filters.search ? (
              <button onClick={() => setFilters({ search: '' })} className="absolute right-3 text-muted hover:text-ink">
                <X size={14} />
              </button>
            ) : null}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded border border-ink text-xs font-bold transition-colors flex-shrink-0 ${
              showFilters || activeFilterCount > 0 ? 'bg-ink text-paper' : 'bg-cream hover:bg-warm text-ink'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-rust text-white rounded font-bold">{activeFilterCount}</span>
            )}
          </button>

          <button
            onClick={() => {
              setShowProfileMatcher(!showProfileMatcher);
              setShowFilters(false); // Close filters when opening matcher
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded border-2 border-warning/50 text-xs font-bold transition-colors flex-shrink-0 ${
              showProfileMatcher || isProfileApplied ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-warning' : 'bg-cream hover:bg-warm text-ink'
            }`}
          >
            <Sparkles size={14} className={isProfileApplied ? "animate-spin" : "animate-pulse"} />
            AI Profile Matcher
            {isProfileApplied && (
              <span className="px-1.5 py-0.5 text-[9px] bg-white text-warning rounded-full font-bold ml-1">ACTIVE</span>
            )}
          </button>
        </div>

        {/* AI Profile Matcher Expandable Form */}
        {showProfileMatcher && (
          <div className="p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded border-2 border-warning/30 space-y-4 animate-slideDown">
            <div className="flex items-center justify-between border-b border-warning/20 pb-2">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-warning animate-pulse" />
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Alignment Matcher Engine</h4>
              </div>
              <button 
                onClick={() => setShowProfileMatcher(false)}
                className="text-muted hover:text-ink text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>
            
            <p className="text-[11px] text-muted leading-relaxed">
              Configure your startup profile below. Our NLP heuristics will dynamically evaluate, score, and rank all scraped opportunities based on compatibility with your team's parameters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-ink uppercase block mb-1">Current Startup Stage</label>
                <select
                  value={profileStage}
                  onChange={(e) => setProfileStage(e.target.value as StartupStage | 'Any')}
                  className="w-full p-2 bg-paper border border-ink rounded text-xs font-semibold text-ink"
                >
                  <option value="Any">Any Stage (Show All)</option>
                  <option value="Idea">Idea / Pre-incorporation</option>
                  <option value="Pre-Seed">Pre-Seed / Working prototype</option>
                  <option value="Seed">Seed / Initial Traction</option>
                  <option value="Series A">Series A / Early Growth</option>
                  <option value="Series B">Series B / Scaling</option>
                  <option value="Growth">Growth / Mature Expansion</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-ink uppercase block mb-1">Target Sector / Keyword</label>
                <input
                  type="text"
                  value={profileSector}
                  onChange={(e) => setProfileSector(e.target.value)}
                  placeholder="e.g. AI, SaaS, Fintech, EV, Biotech"
                  className="w-full p-2 bg-paper border border-ink rounded text-xs text-ink placeholder-muted"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-ink uppercase block mb-1">Funding Preferences</label>
                <select
                  value={profileFunding}
                  onChange={(e) => setProfileFunding(e.target.value as any)}
                  className="w-full p-2 bg-paper border border-ink rounded text-xs font-semibold text-ink"
                >
                  <option value="All">All Opportunity Types</option>
                  <option value="Grants">Equity-Free Grants Only</option>
                  <option value="Accelerators">Funding Programs / Accelerators</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-warning/10">
              {isProfileApplied && (
                <button
                  onClick={() => {
                    setIsProfileApplied(false);
                    setProfileStage('Any');
                    setProfileSector('');
                    setProfileFunding('All');
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-1.5 bg-paper hover:bg-warm border border-ink rounded text-xs font-bold text-muted hover:text-ink transition-colors"
                >
                  Reset Matcher
                </button>
              )}
              <button
                onClick={() => {
                  setIsProfileApplied(true);
                  setShowProfileMatcher(false);
                  setCurrentPage(1);
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded text-xs font-bold hover:brightness-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                <Sparkles size={12} /> Apply AI Recommendation Filter
              </button>
            </div>
          </div>
        )}

        {/* AI Quick Search Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-ink/10">
          <span className="text-[11px] font-bold text-amber flex items-center gap-1">✦ Alignment Search:</span>
          {aiSearchSuggestions.map(sug => (
            <button
              key={sug}
              onClick={() => {
                setActiveAiSuggestion(activeAiSuggestion === sug ? null : sug);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all border ${
                activeAiSuggestion === sug ? 'bg-ink text-paper border-ink shadow-sm' : 'bg-cream text-muted border-ink/20 hover:bg-warm hover:text-ink'
              }`}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Results count & sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-cream p-3 rounded border border-ink">
        <p className="text-xs text-muted font-medium">
          Showing <span className="font-bold text-ink">{paginatedOpportunities.length}</span> of <span className="font-bold text-ink">{displayedOpportunities.length}</span> verified results
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted font-bold">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ sortBy: e.target.value as any })}
              className="text-xs bg-paper border border-ink rounded px-2 py-1 font-bold text-ink focus:outline-none"
            >
              <option value="aiScore">AI Match Score</option>
              <option value="deadline">Urgent Deadline</option>
              <option value="createdAt">Newly Ingested</option>
              <option value="title">Alphabetical</option>
            </select>
            <button
              onClick={() => setFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              className="p-1.5 bg-paper border border-ink rounded hover:bg-warm transition-colors text-ink"
              title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-ink/20">
            <span className="text-[11px] text-muted font-bold">Page Size:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs bg-paper border border-ink rounded px-2 py-1 font-bold text-ink focus:outline-none"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={9999}>All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-cream rounded border-2 border-ink p-5 space-y-5 paper-shadow-sm">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Advanced Production Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setFilters({ types: [], sources: [], stages: [], remoteTypes: [], urgency: [], deadlineRange: 'all' });
                  setCurrentPage(1);
                }}
                className="text-xs text-rust font-bold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Type Filter */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase mb-2 block">Opportunity Type</label>
              <div className="flex flex-wrap gap-1.5">
                {opportunityTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilter('types', type)}
                    className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
                      filters.types.includes(type) ? 'bg-ink text-paper border-ink' : 'bg-paper text-muted border-ink hover:bg-warm hover:text-ink'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase mb-2 block">Startup Stage</label>
              <div className="flex flex-wrap gap-1.5">
                {startupStages.map(stage => (
                  <button
                    key={stage}
                    onClick={() => toggleFilter('stages', stage)}
                    className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
                      filters.stages.includes(stage) ? 'bg-ink text-paper border-ink' : 'bg-paper text-muted border-ink hover:bg-warm hover:text-ink'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Remote Filter */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase mb-2 block">Location Mode</label>
              <div className="flex flex-wrap gap-1.5">
                {remoteTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilter('remoteTypes', type)}
                    className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
                      filters.remoteTypes.includes(type) ? 'bg-ink text-paper border-ink' : 'bg-paper text-muted border-ink hover:bg-warm hover:text-ink'
                    }`}
                  >
                    {getRemoteEmoji(type)} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Filter */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase mb-2 block">Urgency Level</label>
              <div className="flex flex-wrap gap-1.5">
                {urgencyLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => toggleFilter('urgency', level)}
                    className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
                      filters.urgency.includes(level) ? 'bg-ink text-paper border-ink' : 'bg-paper text-muted border-ink hover:bg-warm hover:text-ink'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase mb-2 block">Data Source</label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 border border-ink/10 rounded bg-paper">
                {sources.map(source => (
                  <button
                    key={source}
                    onClick={() => toggleFilter('sources', source)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
                      filters.sources.includes(source) ? 'bg-ink text-paper border-ink' : 'bg-cream text-muted border-ink/20 hover:bg-warm hover:text-ink'
                    }`}
                  >
                    {source.split(' - ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline Range */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase mb-2 block">Deadline Window</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'quarter', label: 'This Quarter' },
                ].map(range => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setFilters({ deadlineRange: range.value as any });
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
                      filters.deadlineRange === range.value ? 'bg-ink text-paper border-ink' : 'bg-paper text-muted border-ink hover:bg-warm hover:text-ink'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Cards */}
      {paginatedOpportunities.length === 0 ? (
        <div className="text-center py-16 bg-cream rounded border-2 border-ink paper-shadow-sm">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-ink mb-1">No matching opportunities found</h3>
          <p className="text-xs text-muted">Try clearing your filters or widening your search query</p>
          <button
            onClick={() => {
              setFilters({ search: '', types: [], sources: [], stages: [], remoteTypes: [], urgency: [], deadlineRange: 'all' });
              setShowBookmarkedOnly(false);
              setCurrentPage(1);
            }}
            className="mt-4 px-4 py-2 bg-ink text-paper rounded text-xs font-bold hover:bg-charcoal transition-colors border border-ink"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedOpportunities.map((opp) => {
            const isBookmarked = bookmarkedIds.includes(opp.id);
            const compLogo = getCompanyLogo(opp.organizer);
            return (
              <div
                key={opp.id}
                onClick={() => selectOpportunity(opp)}
                className="bg-surface rounded-xl border border-border p-6 cursor-pointer hover:bg-surface-hover transition-all card-shadow group flex flex-col justify-between relative"
              >
                <div>
                  {/* Organizer Monogram & Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${compLogo.bg} ${compLogo.color} flex items-center justify-center font-bold text-base border border-current/20 flex-shrink-0 shadow-xs`}>
                      {compLogo.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{opp.organizer}</p>
                      <p className="text-[10px] text-muted truncate">⚲ {opp.location} • {getRemoteEmoji(opp.remoteType)} {opp.remoteType}</p>
                    </div>
                  </div>

                  {/* Top badges */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {isProfileApplied && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-warning animate-pulse">
                        ✦ Alignment Match
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded border border-border bg-paper text-ink`}>
                      {getTypeEmoji(opp.type)} {opp.type}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getUrgencyColor(opp.urgency)}`}>
                      {opp.urgency}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-ocean/10 text-ocean border border-ocean">
                      {opp.startupStage} Stage
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-moss/10 text-moss border border-moss flex items-center gap-1">
                      <ShieldCheck size={12} /> {opp.sourceReliability || 98}% Reliable
                    </span>
                    {opp.featured && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber/20 text-amber border border-amber">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-ink group-hover:text-ocean transition-colors line-clamp-2 mb-2.5">
                    {opp.title}
                  </h3>

                  {/* Funding if present */}
                  {opp.fundingAmount && (
                    <div className="mb-3 bg-paper px-3 py-1.5 rounded-lg border border-border inline-block shadow-xs">
                      <p className="text-xs font-bold text-success">⇗ {opp.fundingAmount}</p>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-muted line-clamp-3 mb-4 leading-relaxed font-normal">{opp.description}</p>
                </div>

                {/* Footer */}
                <div>
                  <div className="flex items-center justify-between pt-3 border-t border-ink/10 mb-3 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted font-medium">via {opp.source.split(' - ')[0]}</span>
                      <span className="text-xs font-bold text-rust flex items-center gap-1 bg-rust/10 px-2 py-0.5 rounded border border-rust/20">
                        <Clock size={12} /> {getDaysLeft(opp.deadline)}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border card-shadow ${
                      isProfileApplied 
                        ? 'bg-amber/15 border-warning/50 text-warning font-extrabold' 
                        : 'bg-paper border-border text-ink'
                    }`}>
                      <span className="text-xs font-bold">{opp.aiScore}% {isProfileApplied ? 'Match ✦' : ''}</span>
                      <div className="w-10 h-1.5 bg-surface-hover rounded-full overflow-hidden border border-border/50">
                        <div className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isProfileApplied ? 'bg-warning' : 'bg-ink'
                        }`} style={{ width: `${opp.aiScore}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectOpportunity(opp);
                      }}
                      className="flex-1 bg-cream text-ink py-2 rounded text-xs font-bold text-center hover:bg-warm transition-colors border border-ink flex items-center justify-center gap-1"
                      title="Contextual AI Analysis"
                    >
                      <span>🤖 AI Match Breakdown</span>
                    </button>

                    <a
                      href={opp.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-ink text-paper py-2 rounded text-xs font-bold text-center hover:bg-charcoal transition-colors border border-ink flex items-center justify-center gap-1"
                    >
                      <span>Direct Link</span> <ExternalLink size={12} />
                    </a>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(opp.id);
                      }}
                      className={`p-2 rounded border border-ink transition-colors ${
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
      ) : (
        <div className="space-y-3">
          {paginatedOpportunities.map((opp) => {
            const isBookmarked = bookmarkedIds.includes(opp.id);
            const compLogo = getCompanyLogo(opp.organizer);
            return (
              <div
                key={opp.id}
                onClick={() => selectOpportunity(opp)}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-surface rounded-xl border border-border cursor-pointer hover:bg-surface-hover transition-all card-shadow group"
              >
                <div className={`w-12 h-12 rounded-lg ${compLogo.bg} ${compLogo.color} flex items-center justify-center font-bold text-lg border border-current/20 flex-shrink-0 shadow-xs`}>
                  {compLogo.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {isProfileApplied && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-warning animate-pulse">
                        ✦ Alignment Match
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded border border-border bg-paper text-ink`}>
                      {getTypeEmoji(opp.type)} {opp.type}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getUrgencyColor(opp.urgency)}`}>
                      {opp.urgency}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-ocean/10 text-ocean border border-ocean">
                      {opp.startupStage} Stage
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-moss/10 text-moss border border-moss flex items-center gap-1">
                      <ShieldCheck size={12} /> {opp.sourceReliability || 98}% Reliable
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink group-hover:text-ocean transition-colors truncate">{opp.title}</h3>
                  <p className="text-xs text-muted truncate mt-0.5">{opp.organizer} • {opp.location}</p>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/10">
                  {opp.fundingAmount && (
                    <span className="text-xs font-bold text-moss bg-paper px-2.5 py-1 rounded border border-ink/10">{opp.fundingAmount}</span>
                  )}
                  <span className="text-xs font-bold text-rust bg-rust/10 px-2.5 py-1 rounded border border-rust/20 flex items-center gap-1">
                    <Clock size={12} /> {getDaysLeft(opp.deadline)}
                  </span>
                  <div className={`text-right px-2.5 py-1 rounded border ${
                    isProfileApplied 
                      ? 'bg-amber/15 border-warning/50 text-warning font-extrabold shadow-sm animate-pulse' 
                      : 'bg-paper border-border text-ink'
                  }`}>
                    <span className="text-xs font-bold">{opp.aiScore}% {isProfileApplied ? 'Fit ✦' : 'AI'}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectOpportunity(opp);
                    }}
                    className="px-3 py-2 bg-cream text-ink rounded text-xs font-bold hover:bg-warm transition-colors flex items-center gap-1 border border-ink"
                    title="Contextual AI Analysis"
                  >
                    <span>🤖 AI Match Breakdown</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(opp.id);
                    }}
                    className={`p-2 rounded border border-ink transition-colors ${
                      isBookmarked ? 'bg-amber text-ink hover:bg-amber-light' : 'bg-paper text-muted hover:text-ink hover:bg-warm'
                    }`}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Opportunity'}
                  >
                    {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>

                  <a
                    href={opp.applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-ink text-paper rounded text-xs font-bold hover:bg-charcoal transition-colors flex items-center gap-1.5 border border-ink"
                  >
                    Direct Link <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-paper p-4 rounded border-2 border-ink paper-shadow-sm">
          <p className="text-xs text-muted font-bold">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-cream border border-ink rounded text-xs font-bold text-ink disabled:opacity-50 disabled:cursor-not-allowed hover:bg-warm transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded border border-ink text-xs font-bold transition-colors ${
                  currentPage === p ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-warm'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-cream border border-ink rounded text-xs font-bold text-ink disabled:opacity-50 disabled:cursor-not-allowed hover:bg-warm transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
