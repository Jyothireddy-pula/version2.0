export type OpportunityType = 
  | 'Grant' 
  | 'Accelerator' 
  | 'Incubator' 
  | 'Competition' 
  | 'Fellowship' 
  | 'Conference' 
  | 'VC Program' 
  | 'Innovation Challenge' 
  | 'Hackathon' 
  | 'Funding'
  | 'Loan';

export type StartupStage = 
  | 'Idea' 
  | 'Pre-Seed' 
  | 'Seed' 
  | 'Series A' 
  | 'Series B' 
  | 'Growth' 
  | 'Any';

export type RemoteType = 'Remote' | 'On-Site' | 'Hybrid';

export type Urgency = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  organizer: string;
  location: string;
  country: string;
  deadline: string; // YYYY-MM-DD
  source: string;
  sourceUrl: string;
  description: string;
  fundingAmount?: string;
  startupStage: StartupStage;
  remoteType: RemoteType;
  sectors: string[];
  eligibility: string;
  urgency: Urgency;
  aiScore: number;
  tags: string[];
  featured: boolean;
  equityRequired: boolean;
  applicationLink: string;
  createdAt: string;
  updatedAt: string;
  isDuplicate?: boolean;
  sourceReliability?: number; // E.g. 98 for 98% Reliable
}

export interface FilterState {
  search: string;
  types: OpportunityType[];
  sources: string[];
  stages: StartupStage[];
  remoteTypes: RemoteType[];
  urgency: Urgency[];
  deadlineRange: 'all' | 'week' | 'month' | 'quarter';
  sortBy: 'deadline' | 'aiScore' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface AlertConfig {
  id: string;
  name: string;
  keywords: string[];
  types: OpportunityType[];
  minAiScore: number;
  enabled: boolean;
  channel: 'email' | 'webhook' | 'slack' | 'discord';
  endpoint: string;
  lastTriggered?: string;
  matchCount: number;
}

export interface ScraperStatus {
  source: string;
  status: 'running' | 'idle' | 'error' | 'completed';
  lastRun: string;
  nextRun: string;
  itemsScraped: number;
  successRate: number;
  avgResponseTime: number;
  errorLog?: string[];
  strategy?: 'Static (BeautifulSoup)' | 'Dynamic (Playwright)' | 'API Direct';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'founder' | 'viewer';
  avatar?: string;
}

export interface ScrapingLog {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
  itemsFound?: number;
}

export interface DuplicateMatch {
  originalId: string;
  duplicateId: string;
  similarity: number;
  reason: string;
}

export interface EmailSubscription {
  id: string;
  email: string;
  category: string;
  createdAt: string;
}

export interface AdminMonitoringStats {
  failedScrapes: number;
  sourceHealth: number; // percentage
  duplicateRate: number; // percentage
  totalScrapedToday: number;
}

export interface AntiScrapingConfig {
  userAgentsCount: number;
  proxyEnabled: boolean;
  retryAttempts: number;
  minDelayMs: number;
  maxDelayMs: number;
}
