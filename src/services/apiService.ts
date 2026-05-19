import { Opportunity, ScrapingLog } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

function mapOpportunity(row: any): Opportunity {
  return {
    id: String(row.id),
    title: row.title,
    type: row.type,
    organizer: row.organizer || 'Unknown',
    location: row.location || 'Global',
    country: row.country || 'Global',
    deadline: row.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    source: row.source,
    sourceUrl: row.source_url,
    description: row.description || '',
    fundingAmount: row.funding_amount || undefined,
    startupStage: row.startup_stage || 'Any',
    remoteType: row.remote_type || 'Hybrid',
    sectors: row.sectors || [],
    eligibility: row.eligibility || 'See official source for eligibility.',
    urgency: 'Medium',
    aiScore: row.ai_score || 0,
    tags: row.tags || [],
    featured: Boolean(row.featured),
    equityRequired: Boolean(row.equity_required),
    applicationLink: row.application_link || row.source_url,
    createdAt: row.scraped_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    sourceReliability: row.source_reliability || 95,
  } as Opportunity;
}

export function isApiConfigured() {
  return Boolean(API_BASE);
}

export async function fetchOpportunitiesFromApi(params: Record<string, string> = {}): Promise<Opportunity[]> {
  if (!API_BASE) return [];
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/opportunities${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch opportunities from backend API');
  const rows = await res.json();
  return rows.map(mapOpportunity);
}

export async function runScrapersApi(keyword?: string, region?: string) {
  if (!API_BASE) return null;
  const query = new URLSearchParams();
  if (keyword) query.set('keyword', keyword);
  if (region) query.set('region', region);
  const res = await fetch(`${API_BASE}/scrapers/run${query.toString() ? `?${query.toString()}` : ''}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run backend scrapers');
  return res.json();
}

export async function fetchLogsFromApi(): Promise<ScrapingLog[]> {
  if (!API_BASE) return [];
  const res = await fetch(`${API_BASE}/scrapers/logs`);
  if (!res.ok) throw new Error('Failed to fetch scraper logs');
  const rows = await res.json();
  return rows.map((row: any) => ({
    id: String(row.id),
    timestamp: row.timestamp,
    source: row.source,
    message: row.message || row.status,
    level: row.status === 'error' ? 'error' : 'success',
    itemsFound: row.records_found,
  }));
}

export function exportCsvApiUrl() {
  return API_BASE ? `${API_BASE}/export/csv` : '';
}

export function exportJsonApiUrl() {
  return API_BASE ? `${API_BASE}/export/json` : '';
}