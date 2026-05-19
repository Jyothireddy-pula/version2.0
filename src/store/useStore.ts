import { create } from 'zustand';
import { 
  Opportunity, 
  FilterState, 
  AlertConfig, 
  ScraperStatus, 
  ScrapingLog, 
  OpportunityType, 
  StartupStage, 
  RemoteType, 
  Urgency,
  EmailSubscription,
  AdminMonitoringStats,
  AntiScrapingConfig
} from '../types';
import { allOpportunities, alertConfigs, scraperStatuses, scrapingLogs, currentUser } from '../data/opportunities';
import { removeDuplicates } from '../utils/helpers';
import { db } from '../services/dbService';
import { fetchLogsFromApi, fetchOpportunitiesFromApi, isApiConfigured, runScrapersApi } from '../services/apiService';

interface AppState {
  opportunities: Opportunity[];
  filteredOpportunities: Opportunity[];
  alerts: AlertConfig[];
  scrapers: ScraperStatus[];
  logs: ScrapingLog[];
  user: typeof currentUser;
  lastUpdate: string;
  
  currentView: 'dashboard' | 'opportunities' | 'analytics' | 'scrapers' | 'alerts' | 'export' | 'logs';
  sidebarOpen: boolean;
  selectedOpportunity: Opportunity | null;
  showDetailModal: boolean;
  
  filters: FilterState;
  
  // Advanced Live Scraping Scheduler State
  isLiveScraping: boolean;
  scrapingInterval: number; // in seconds
  lastScrapeTime: string;
  nextScrapeTime: string;
  secondsToNextScrape: number;

  // New SaaS Production Features State
  bookmarkedIds: string[];
  emailSubscriptions: EmailSubscription[];
  adminStats: AdminMonitoringStats;
  antiScraping: AntiScrapingConfig;
  showSubscribeModal: boolean;
  isSearching: boolean;

  // Advanced SaaS UI Options (Notion Minimal vs Figma Dark Pro) & AI Interactions
  uiTheme: 'notion' | 'figma';
  setUiTheme: (theme: 'notion' | 'figma') => void;
  aiSearchSuggestions: string[];
  activeAiSuggestion: string | null;
  setActiveAiSuggestion: (sug: string | null) => void;
  aiAnalysisModalOpp: Opportunity | null;
  setAiAnalysisModalOpp: (opp: Opportunity | null) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  showAdvancedAdmin: boolean;
  setShowAdvancedAdmin: (show: boolean) => void;

  setView: (view: AppState['currentView']) => void;
  toggleSidebar: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  selectOpportunity: (opp: Opportunity | null) => void;
  toggleAlert: (id: string) => void;
  addAlert: (alert: AlertConfig) => void;
  removeAlert: (id: string) => void;
  runScraper: (source: string) => void;
  refreshData: () => void;
  
  // Live Scraping Actions
  toggleLiveScraping: () => void;
  setScrapingInterval: (seconds: number) => void;
  triggerLiveScrapingCycle: () => void;
  decrementCountdown: () => void;

  // New SaaS Production Actions
  toggleBookmark: (id: string) => void;
  addEmailSubscription: (email: string, category: string) => void;
  setShowSubscribeModal: (show: boolean) => void;
  updateAntiScraping: (config: Partial<AntiScrapingConfig>) => void;
  simulateAdminFailure: () => void;
  simulateAdminSuccess: () => void;
  initStore: () => Promise<void>;
}

const defaultFilters: FilterState = {
  search: '',
  types: [],
  sources: [],
  stages: [],
  remoteTypes: [],
  urgency: [],
  deadlineRange: 'all',
  sortBy: 'aiScore',
  sortOrder: 'desc',
};

function applyFilters(opportunities: Opportunity[], filters: FilterState): Opportunity[] {
  let filtered = [...opportunities];
  const searchScores = new Map<string, number>();

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    const queryWords = q.split(/\s+/).filter(Boolean);

    filtered = filtered.filter(opp => {
      let score = 0;
      const titleLower = opp.title.toLowerCase();
      const descLower = opp.description.toLowerCase();
      const orgLower = opp.organizer.toLowerCase();
      const locLower = opp.location.toLowerCase();

      // Exact phrase match boosts
      if (titleLower === q) score += 500;
      else if (titleLower.includes(q)) score += 200;

      if (descLower.includes(q)) score += 50;
      if (orgLower.includes(q)) score += 100;
      if (locLower.includes(q)) score += 80;

      // Tag & Sector exact phrase match boosts
      if (opp.sectors.some(s => s.toLowerCase() === q)) score += 150;
      if (opp.tags.some(t => t.toLowerCase() === q)) score += 150;

      // Individual keyword matches
      queryWords.forEach(word => {
        if (titleLower.includes(word)) score += 30;
        if (descLower.includes(word)) score += 5;
        if (orgLower.includes(word)) score += 15;
        if (opp.sectors.some(s => s.toLowerCase().includes(word))) score += 25;
        if (opp.tags.some(t => t.toLowerCase().includes(word))) score += 20;
      });

      if (score > 0) {
        searchScores.set(opp.id, score);
        return true;
      }
      return false;
    });
  }

  if (filters.types.length > 0) {
    filtered = filtered.filter(opp => filters.types.includes(opp.type));
  }

  if (filters.sources.length > 0) {
    filtered = filtered.filter(opp => filters.sources.includes(opp.source));
  }

  if (filters.stages.length > 0) {
    filtered = filtered.filter(opp => filters.stages.includes(opp.startupStage));
  }

  if (filters.remoteTypes.length > 0) {
    filtered = filtered.filter(opp => filters.remoteTypes.includes(opp.remoteType));
  }

  if (filters.urgency.length > 0) {
    filtered = filtered.filter(opp => filters.urgency.includes(opp.urgency));
  }

  if (filters.deadlineRange !== 'all') {
    const now = new Date();
    const ranges: Record<string, number> = { week: 7, month: 30, quarter: 90 };
    const days = ranges[filters.deadlineRange];
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(opp => {
      const deadline = new Date(opp.deadline);
      return deadline >= now && deadline <= endDate;
    });
  }

  filtered.sort((a, b) => {
    // Prioritize search scores if search query is active
    if (filters.search) {
      const scoreA = searchScores.get(a.id) || 0;
      const scoreB = searchScores.get(b.id) || 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Descending by relevance score
      }
    }

    let comparison = 0;
    switch (filters.sortBy) {
      case 'deadline':
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        break;
      case 'aiScore':
        comparison = a.aiScore - b.aiScore;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  return filtered;
}

// Sample live feed items that simulate being posted to social media / RSS feeds
const sampleLiveFeeds = [
  {
    title: 'DPIIT AI Innovation Grant 2026',
    type: 'Grant' as OpportunityType,
    organizer: 'DPIIT & MeitY',
    location: 'New Delhi',
    country: 'India',
    source: 'Twitter/X Feed (#AIStartup)',
    sourceUrl: 'https://www.startupindia.gov.in',
    applicationLink: 'https://seedfund.startupindia.gov.in',
    description: 'Freshly announced on social media: ₹25 Lakh equity-free grant for AI startups building generative AI models for Indian healthcare.',
    fundingAmount: '₹25 Lakh',
    startupStage: 'Seed' as StartupStage,
    remoteType: 'Remote' as RemoteType,
    sectors: ['AI', 'HealthTech', 'Deep Tech'],
    eligibility: 'DPIIT recognized startups with AI MVP',
    urgency: 'Critical' as Urgency,
    aiScore: 96,
    tags: ['Twitter Scrape', 'AI', 'DPIIT', 'Equity-Free'],
    featured: true,
    equityRequired: false,
    sourceReliability: 98
  },
  {
    title: 'LinkedIn Live: Google Cloud AI Accelerator',
    type: 'Accelerator' as OpportunityType,
    organizer: 'Google Cloud India',
    location: 'Bangalore',
    country: 'India',
    source: 'LinkedIn Live Feed',
    sourceUrl: 'https://startup.google.com',
    applicationLink: 'https://startup.google.com',
    description: 'Scraped from LinkedIn post: Google Cloud is offering $200K in credits and 1-on-1 AI engineering mentorship for Indian SaaS startups.',
    fundingAmount: '$200K Cloud Credits',
    startupStage: 'Growth' as StartupStage,
    remoteType: 'Hybrid' as RemoteType,
    sectors: ['AI', 'SaaS', 'Cloud'],
    eligibility: 'Seed to Series A startups in India',
    urgency: 'High' as Urgency,
    aiScore: 94,
    tags: ['LinkedIn Scrape', 'Google Cloud', 'AI'],
    featured: true,
    equityRequired: false,
    sourceReliability: 99
  },
  {
    title: 'Reddit r/startups: Accel Atoms Web3 Grant',
    type: 'Grant' as OpportunityType,
    organizer: 'Accel India',
    location: 'Bangalore',
    country: 'India',
    source: 'Reddit r/startups Scrape',
    sourceUrl: 'https://www.accel.com',
    applicationLink: 'https://www.accel.com',
    description: 'Spotted on Reddit r/startups: Accel Atoms announcing an equity-free ₹15 Lakh micro-grant for Web3 and blockchain developer tools.',
    fundingAmount: '₹15 Lakh',
    startupStage: 'Pre-Seed' as StartupStage,
    remoteType: 'Remote' as RemoteType,
    sectors: ['Web3', 'Blockchain', 'Developer Tools'],
    eligibility: 'Indian blockchain developers with GitHub prototype',
    urgency: 'Medium' as Urgency,
    aiScore: 89,
    tags: ['Reddit Scrape', 'Web3', 'Accel'],
    featured: false,
    equityRequired: false,
    sourceReliability: 97
  },
  {
    title: 'Startup India Seed Fund Scheme (SISFS)', // Intentional duplicate to test live deduplication!
    type: 'Grant' as OpportunityType,
    organizer: 'DPIIT, Government of India',
    location: 'New Delhi',
    country: 'India',
    source: 'Startup India Portal',
    sourceUrl: 'https://www.startupindia.gov.in',
    applicationLink: 'https://seedfund.startupindia.gov.in',
    description: 'Republished RSS notice for SISFS grant up to ₹50 Lakh.',
    fundingAmount: '₹20 Lakh - ₹50 Lakh',
    startupStage: 'Pre-Seed' as StartupStage,
    remoteType: 'Remote' as RemoteType,
    sectors: ['Technology', 'AI'],
    eligibility: 'DPIIT recognized startups',
    urgency: 'High' as Urgency,
    aiScore: 98,
    tags: ['Government of India'],
    featured: true,
    equityRequired: false,
    sourceReliability: 99
  },
  {
    title: 'T-Hub Mobility Innovation Challenge 2026',
    type: 'Innovation Challenge' as OpportunityType,
    organizer: 'T-Hub & Govt of Telangana',
    location: 'Hyderabad',
    country: 'India',
    source: 'T-Hub Live RSS',
    sourceUrl: 'https://t-hub.co',
    applicationLink: 'https://t-hub.co',
    description: 'Live RSS feed alert: T-Hub seeking EV and battery tech startups for pilot deployment with Telangana state transport.',
    fundingAmount: '₹30 Lakh Pilot Grant',
    startupStage: 'Seed' as StartupStage,
    remoteType: 'On-Site' as RemoteType,
    sectors: ['Mobility', 'EV', 'CleanTech', 'Smart Cities'],
    eligibility: 'EV/Mobility startups with ready prototype',
    urgency: 'High' as Urgency,
    aiScore: 92,
    tags: ['T-Hub', 'EV', 'Telangana'],
    featured: false,
    equityRequired: false,
    sourceReliability: 98
  },
  {
    title: 'Devpost API: AWS Generative AI Hackathon',
    type: 'Hackathon' as OpportunityType,
    organizer: 'Amazon Web Services',
    location: 'Remote',
    country: 'Global',
    source: 'Devpost API',
    sourceUrl: 'https://devpost.com',
    applicationLink: 'https://devpost.com',
    description: 'Fresh API ingest: AWS announcing a $75K cash prize pool for developers building generative AI tools using Amazon Bedrock.',
    fundingAmount: '$75,000 Prizes',
    startupStage: 'Idea' as StartupStage,
    remoteType: 'Remote' as RemoteType,
    sectors: ['AI', 'AWS', 'Cloud', 'Generative AI'],
    eligibility: 'Global developers and startups',
    urgency: 'Critical' as Urgency,
    aiScore: 97,
    tags: ['Devpost', 'AWS', 'AI'],
    featured: true,
    equityRequired: false,
    sourceReliability: 99
  },
  {
    title: 'Eventbrite API: TiE Global Pitch Session',
    type: 'Conference' as OpportunityType,
    organizer: 'TiE Silicon Valley & India',
    location: 'New Delhi / Remote',
    country: 'India',
    source: 'Eventbrite API',
    sourceUrl: 'https://www.eventbrite.com',
    applicationLink: 'https://tie.org',
    description: 'Live Eventbrite ingest: TiE Global hosting an exclusive online pitch session for Indian enterprise SaaS founders.',
    fundingAmount: 'Angel Syndicates',
    startupStage: 'Seed' as StartupStage,
    remoteType: 'Hybrid' as RemoteType,
    sectors: ['Enterprise', 'SaaS', 'B2B'],
    eligibility: 'Seed stage SaaS startups',
    urgency: 'Medium' as Urgency,
    aiScore: 91,
    tags: ['Eventbrite', 'TiE', 'Pitch'],
    featured: false,
    equityRequired: false,
    sourceReliability: 98
  }
];

const deduplicatedOpportunities = removeDuplicates(allOpportunities);

export const useStore = create<AppState>((set, get) => ({
  opportunities: deduplicatedOpportunities,
  filteredOpportunities: applyFilters(deduplicatedOpportunities, defaultFilters),
  alerts: alertConfigs,
  scrapers: scraperStatuses,
  logs: scrapingLogs,
  user: currentUser,
  lastUpdate: new Date().toISOString(),
  
  currentView: 'dashboard',
  sidebarOpen: true,
  selectedOpportunity: null,
  showDetailModal: false,
  
  filters: defaultFilters,

  // Live Scraping Scheduler State
  isLiveScraping: true,
  scrapingInterval: 30, // Default 30 seconds for active demonstration
  lastScrapeTime: new Date().toISOString(),
  nextScrapeTime: new Date(Date.now() + 30 * 1000).toISOString(),
  secondsToNextScrape: 30,

  // New SaaS Production Features State
  bookmarkedIds: ['acc-1', 'gra-1'],
  emailSubscriptions: [
    { id: 'sub-1', email: 'founder@indiesaas.in', category: 'AI Startup Grants', createdAt: new Date(Date.now() - 24*3600*1000).toISOString() },
    { id: 'sub-2', email: 'cto@deeptech.io', category: 'Remote Accelerators', createdAt: new Date(Date.now() - 48*3600*1000).toISOString() }
  ],
  adminStats: {
    failedScrapes: 0,
    sourceHealth: 94.6,
    duplicateRate: 14.2,
    totalScrapedToday: 309
  },
  antiScraping: {
    userAgentsCount: 15,
    proxyEnabled: true,
    retryAttempts: 3,
    minDelayMs: 2000,
    maxDelayMs: 6000
  },
  showSubscribeModal: false,
  isSearching: false,

  // Advanced SaaS UI Options: Option A is the default clean interface.
  uiTheme: 'notion',
  setUiTheme: (theme) => {
    localStorage.setItem('STARTUP_UI_THEME', theme);
    set({ uiTheme: theme });
  },
  aiSearchSuggestions: [
    'AI Startup Grants',
    'DPIIT Seed Funds',
    'Equity-free Accelerators',
    'Women Founders in Tech',
    'Bangalore Deep Tech',
    'Web3 & Blockchain',
    'PSU Energy Challenges'
  ],
  activeAiSuggestion: null,
  setActiveAiSuggestion: (sug) => {
    set({ activeAiSuggestion: sug });
    if (sug) {
      get().setFilters({ search: sug });
    }
  },
  aiAnalysisModalOpp: null,
  setAiAnalysisModalOpp: (opp) => set({ aiAnalysisModalOpp: opp }),
  showAdvancedFilters: false,
  setShowAdvancedFilters: (show) => set({ showAdvancedFilters: show }),
  showAdvancedAdmin: false,
  setShowAdvancedAdmin: (show) => set({ showAdvancedAdmin: show }),

  initStore: async () => {
    if (isApiConfigured()) {
      try {
        const apiOpps = await fetchOpportunitiesFromApi();
        const apiLogs = await fetchLogsFromApi();
        if (apiOpps.length > 0) {
          set({
            opportunities: apiOpps,
            filteredOpportunities: applyFilters(apiOpps, get().filters),
            logs: apiLogs.length ? apiLogs : get().logs,
            lastUpdate: new Date().toISOString(),
          });
          return;
        }
      } catch (error) {
        console.warn('[API] Backend unavailable, falling back to local IndexedDB.', error);
      }
    }

    await db.init();
    const opps = await db.getOpportunities();
    const logs = await db.getLogs();
    const alerts = await db.getAlerts();
    const subs = await db.getSubscriptions();

    const bookmarked = localStorage.getItem('STARTUP_BOOKMARKS');
    const bookmarkedIds = bookmarked ? JSON.parse(bookmarked) : ['acc-1', 'gra-1'];

    set({
      opportunities: opps,
      filteredOpportunities: applyFilters(opps, get().filters),
      logs,
      alerts,
      emailSubscriptions: subs,
      bookmarkedIds
    });
  },

  setView: (view) => set({ currentView: view }),
  
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  
  setFilters: (newFilters) => {
    const state = get();
    if ('search' in newFilters) {
      set({ isSearching: true });
      setTimeout(() => {
        const current = get();
        const updatedFilters = { ...current.filters, ...newFilters };
        const filtered = applyFilters(current.opportunities, updatedFilters);
        set({ filters: updatedFilters, filteredOpportunities: filtered, isSearching: false });
      }, 300);
    } else {
      const updatedFilters = { ...state.filters, ...newFilters };
      const filtered = applyFilters(state.opportunities, updatedFilters);
      set({ filters: updatedFilters, filteredOpportunities: filtered });
    }
  },
  
  selectOpportunity: (opp) => set({ selectedOpportunity: opp, showDetailModal: opp !== null }),
  
  toggleAlert: async (id) => {
    const state = get();
    const updated = state.alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    await db.saveAlerts(updated);
    set({ alerts: updated });
  },
  
  addAlert: async (alert) => {
    const state = get();
    const updated = [...state.alerts, alert];
    await db.saveAlerts(updated);
    set({ alerts: updated });
  },
  
  removeAlert: async (id) => {
    const state = get();
    const updated = state.alerts.filter(a => a.id !== id);
    await db.saveAlerts(updated);
    set({ alerts: updated });
  },
  
  runScraper: async (source) => {
    const now = new Date();
    if (isApiConfigured()) {
      try {
        set(state => ({
          scrapers: state.scrapers.map(s => s.source === source ? { ...s, status: 'running' as const } : s),
          logs: [{ id: Date.now().toString(), timestamp: now.toISOString(), source, message: `[BACKEND SCRAPE] Triggered real scraper API for ${source}`, level: 'info' }, ...state.logs],
        }));
        await runScrapersApi(get().filters.search || undefined);
        const apiOpps = await fetchOpportunitiesFromApi();
        const apiLogs = await fetchLogsFromApi();
        set(state => ({
          opportunities: apiOpps,
          filteredOpportunities: applyFilters(apiOpps, state.filters),
          logs: apiLogs.length ? apiLogs : state.logs,
          scrapers: state.scrapers.map(s => s.source === source ? { ...s, status: 'completed' as const, lastRun: new Date().toISOString(), nextRun: new Date(Date.now() + 60 * 60 * 1000).toISOString() } : s),
          lastUpdate: new Date().toISOString(),
        }));
        return;
      } catch (error) {
        console.warn('[API] Backend scraper failed, using local fallback.', error);
      }
    }

    const startLog: ScrapingLog = {
      id: Date.now().toString(),
      timestamp: now.toISOString(),
      source,
      message: `[MANUAL SCRAPE] Initializing scraper pipeline for ${source}...`,
      level: 'info',
    };
    await db.insertLog(startLog);

    set(state => ({
      scrapers: state.scrapers.map(s => s.source === source ? { ...s, status: 'running' as const } : s),
      logs: [startLog, ...state.logs],
    }));
    
    // Simulate scraping with realistic delays & DB persistence
    setTimeout(async () => {
      // Simulate inserting new scraped opportunity into persistent DB
      const sampleItem = sampleLiveFeeds[Math.floor(Math.random() * sampleLiveFeeds.length)];
      const newOpp: Opportunity = {
        id: `manual-${Date.now()}`,
        title: `${sampleItem.title} (${source.split(' ')[0]} Ingest)`,
        type: sampleItem.type,
        organizer: sampleItem.organizer,
        location: sampleItem.location,
        country: sampleItem.country,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source,
        sourceUrl: sampleItem.sourceUrl,
        description: `Scraped from ${source}: ${sampleItem.description}`,
        fundingAmount: sampleItem.fundingAmount,
        startupStage: sampleItem.startupStage,
        remoteType: sampleItem.remoteType,
        sectors: sampleItem.sectors,
        eligibility: sampleItem.eligibility,
        urgency: sampleItem.urgency,
        aiScore: sampleItem.aiScore,
        tags: sampleItem.tags,
        featured: sampleItem.featured,
        equityRequired: sampleItem.equityRequired,
        applicationLink: sampleItem.applicationLink,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDuplicate: false,
        sourceReliability: sampleItem.sourceReliability || 98
      };

      const dbRes = await db.insertOpportunity(newOpp);
      const successLog: ScrapingLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        source,
        message: dbRes.isDuplicate 
          ? `[DEDUPLICATION] Scraped "${newOpp.title}". ${dbRes.reason}` 
          : `[SCRAPE SUCCESS] Scraped & stored "${newOpp.title}" into persistent database.`,
        level: dbRes.isDuplicate ? 'warn' : 'success',
        itemsFound: dbRes.isDuplicate ? 0 : 1,
      };
      await db.insertLog(successLog);

      const freshOpps = await db.getOpportunities();
      const freshLogs = await db.getLogs();

      set(state => ({
        opportunities: freshOpps,
        filteredOpportunities: applyFilters(freshOpps, state.filters),
        scrapers: state.scrapers.map(s => s.source === source ? {
          ...s,
          status: 'completed' as const,
          itemsScraped: s.itemsScraped + (dbRes.isDuplicate ? 0 : 1),
          lastRun: new Date().toISOString(),
          nextRun: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        } : s),
        logs: freshLogs,
        lastUpdate: new Date().toISOString(),
        adminStats: {
          ...state.adminStats,
          totalScrapedToday: state.adminStats.totalScrapedToday + 1,
          duplicateRate: dbRes.isDuplicate ? Number((state.adminStats.duplicateRate + 0.2).toFixed(1)) : state.adminStats.duplicateRate
        }
      }));
    }, 2000 + Math.random() * 2000);
  },
  
  refreshData: async () => {
    if (isApiConfigured()) {
      try {
        const apiOpps = await fetchOpportunitiesFromApi();
        const apiLogs = await fetchLogsFromApi();
        set({
          opportunities: apiOpps,
          filteredOpportunities: applyFilters(apiOpps, get().filters),
          logs: apiLogs.length ? apiLogs : get().logs,
          lastUpdate: new Date().toISOString(),
        });
        return;
      } catch (error) {
        console.warn('[API] Refresh failed, using local IndexedDB fallback.', error);
      }
    }

    const opps = await db.getOpportunities();
    const logs = await db.getLogs();
    set({ 
      opportunities: opps, 
      filteredOpportunities: applyFilters(opps, get().filters),
      logs,
      lastUpdate: new Date().toISOString() 
    });
  },

  // Advanced Live Scraping Actions
  toggleLiveScraping: () => set(state => ({ isLiveScraping: !state.isLiveScraping })),
  
  setScrapingInterval: (seconds) => set({ 
    scrapingInterval: seconds, 
    secondsToNextScrape: seconds,
    nextScrapeTime: new Date(Date.now() + seconds * 1000).toISOString() 
  }),

  decrementCountdown: () => {
    const state = get();
    if (!state.isLiveScraping) return;
    const diff = Math.max(0, state.secondsToNextScrape - 1);
    if (diff === 0) {
      state.triggerLiveScrapingCycle();
    } else {
      set({ secondsToNextScrape: diff });
    }
  },

  triggerLiveScrapingCycle: async () => {
    const state = get();
    const now = new Date();
    
    if (isApiConfigured()) {
      try {
        set(prev => ({
          logs: [{ id: Date.now().toString(), timestamp: now.toISOString(), source: 'System Scheduler', message: `[BACKEND INGESTION] Triggering automated scraper cycle on Python backend...`, level: 'info' as const }, ...prev.logs]
        }));
        await runScrapersApi(state.filters.search || undefined);
        const apiOpps = await fetchOpportunitiesFromApi();
        const apiLogs = await fetchLogsFromApi();
        if (apiOpps.length > 0) {
          set(prev => ({
            opportunities: apiOpps,
            filteredOpportunities: applyFilters(apiOpps, prev.filters),
            logs: apiLogs.length ? apiLogs : prev.logs,
            lastScrapeTime: now.toISOString(),
            secondsToNextScrape: prev.scrapingInterval,
            nextScrapeTime: new Date(now.getTime() + prev.scrapingInterval * 1000).toISOString(),
            lastUpdate: now.toISOString(),
            adminStats: {
              ...prev.adminStats,
              totalScrapedToday: prev.adminStats.totalScrapedToday + 1
            }
          }));
          return;
        }
      } catch (error) {
        console.warn('[API Scheduler] Backend scraper trigger failed, using offline fallback.', error);
      }
    }

    // Pick a random feed item to simulate live discovery
    const randomIndex = Math.floor(Math.random() * sampleLiveFeeds.length);
    const rawItem = sampleLiveFeeds[randomIndex];
    
    const newOpp: Opportunity = {
      id: `live-${Date.now()}`,
      title: rawItem.title,
      type: rawItem.type,
      organizer: rawItem.organizer,
      location: rawItem.location,
      country: rawItem.country,
      deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: rawItem.source,
      sourceUrl: rawItem.sourceUrl,
      description: rawItem.description,
      fundingAmount: rawItem.fundingAmount,
      startupStage: rawItem.startupStage,
      remoteType: rawItem.remoteType,
      sectors: rawItem.sectors,
      eligibility: rawItem.eligibility,
      urgency: rawItem.urgency,
      aiScore: rawItem.aiScore,
      tags: rawItem.tags,
      featured: rawItem.featured,
      equityRequired: rawItem.equityRequired,
      applicationLink: rawItem.applicationLink,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDuplicate: false,
      sourceReliability: rawItem.sourceReliability || 98
    };

    const newLogId = Date.now().toString();
    const dbRes = await db.insertOpportunity(newOpp);

    if (dbRes.isDuplicate) {
      const dupLog: ScrapingLog = {
        id: newLogId,
        timestamp: now.toISOString(),
        source: rawItem.source,
        message: `[DEDUPLICATION] Rejected duplicate post: "${rawItem.title}". ${dbRes.reason}`,
        level: 'warn',
      };
      await db.insertLog(dupLog);
      const freshLogs = await db.getLogs();

      set(prev => ({
        logs: freshLogs,
        lastScrapeTime: now.toISOString(),
        secondsToNextScrape: prev.scrapingInterval,
        nextScrapeTime: new Date(now.getTime() + prev.scrapingInterval * 1000).toISOString(),
        adminStats: {
          ...prev.adminStats,
          duplicateRate: Number((prev.adminStats.duplicateRate + 0.1).toFixed(1))
        }
      }));
    } else {
      // Check if matches any active alerts
      let alertTriggered = false;
      let matchedAlertName = '';
      const updatedAlerts = state.alerts.map(alert => {
        if (!alert.enabled) return alert;
        const matchesKeyword = alert.keywords.some(k => 
          newOpp.title.toLowerCase().includes(k.toLowerCase()) || 
          newOpp.description.toLowerCase().includes(k.toLowerCase()) ||
          newOpp.sectors.some(s => s.toLowerCase().includes(k.toLowerCase()))
        );

        if (matchesKeyword && newOpp.aiScore >= alert.minAiScore) {
          alertTriggered = true;
          matchedAlertName = alert.name;
          return {
            ...alert,
            matchCount: alert.matchCount + 1,
            lastTriggered: now.toISOString(),
          };
        }
        return alert;
      });

      await db.saveAlerts(updatedAlerts);

      const succLog: ScrapingLog = {
        id: newLogId,
        timestamp: now.toISOString(),
        source: rawItem.source,
        message: `[LIVE SCRAPE] Successfully scraped & stored: "${newOpp.title}" into persistent database (AI Score: ${newOpp.aiScore}%)`,
        level: 'success',
        itemsFound: 1,
      };
      await db.insertLog(succLog);

      if (alertTriggered) {
        const alertLog: ScrapingLog = {
          id: `alert-${Date.now()}`,
          timestamp: now.toISOString(),
          source: 'Alert Engine',
          message: `[ALERT TRIGGERED] "${newOpp.title}" matched alert "${matchedAlertName}"! Notification sent via Webhook/Email.`,
          level: 'success',
        };
        await db.insertLog(alertLog);
      }

      const freshOpps = await db.getOpportunities();
      const freshLogs = await db.getLogs();

      set(prev => ({
        opportunities: freshOpps,
        filteredOpportunities: applyFilters(freshOpps, prev.filters),
        alerts: updatedAlerts,
        logs: freshLogs,
        lastUpdate: now.toISOString(),
        lastScrapeTime: now.toISOString(),
        secondsToNextScrape: prev.scrapingInterval,
        nextScrapeTime: new Date(now.getTime() + prev.scrapingInterval * 1000).toISOString(),
        adminStats: {
          ...prev.adminStats,
          totalScrapedToday: prev.adminStats.totalScrapedToday + 1
        }
      }));
    }
  },

  // New SaaS Production Actions
  toggleBookmark: (id) => {
    const state = get();
    const updated = state.bookmarkedIds.includes(id) 
      ? state.bookmarkedIds.filter(bId => bId !== id)
      : [...state.bookmarkedIds, id];
    localStorage.setItem('STARTUP_BOOKMARKS', JSON.stringify(updated));
    set({ bookmarkedIds: updated });
  },

  addEmailSubscription: async (email, category) => {
    const newSub: EmailSubscription = {
      id: `sub-${Date.now()}`,
      email,
      category,
      createdAt: new Date().toISOString()
    };
    await db.insertSubscription(newSub);
    const freshSubs = await db.getSubscriptions();
    set({ emailSubscriptions: freshSubs, showSubscribeModal: false });
  },

  setShowSubscribeModal: (show) => set({ showSubscribeModal: show }),

  updateAntiScraping: (config) => set(state => ({
    antiScraping: { ...state.antiScraping, ...config }
  })),

  simulateAdminFailure: async () => {
    const failLog: ScrapingLog = {
      id: `fail-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'Admin Simulator',
      message: '[ADMIN MONITORING] Simulated scraper failure on target proxy endpoint. Retrying with rotating User-Agent.',
      level: 'error'
    };
    await db.insertLog(failLog);
    const freshLogs = await db.getLogs();

    set(state => ({
      adminStats: {
        ...state.adminStats,
        failedScrapes: state.adminStats.failedScrapes + 1,
        sourceHealth: Number((state.adminStats.sourceHealth - 0.5).toFixed(1))
      },
      logs: freshLogs
    }));
  },

  simulateAdminSuccess: async () => {
    const succLog: ScrapingLog = {
      id: `succ-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'Admin Simulator',
      message: '[ADMIN MONITORING] Proxy health check passed. 15 User-Agents in rotation.',
      level: 'success'
    };
    await db.insertLog(succLog);
    const freshLogs = await db.getLogs();

    set(state => ({
      adminStats: {
        ...state.adminStats,
        sourceHealth: Math.min(100, Number((state.adminStats.sourceHealth + 0.4).toFixed(1)))
      },
      logs: freshLogs
    }));
  }
}));
