import { Opportunity, Urgency, OpportunityType } from '../types';

export function getUrgencyColor(urgency: Urgency): string {
  switch (urgency) {
    case 'Critical': return 'bg-red-500/10 text-red-600 border border-red-500/20';
    case 'High': return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    case 'Medium': return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
    case 'Low': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
  }
}

export function getTypeColor(_type: OpportunityType): string {
  return 'bg-surface text-ink border border-border px-2 py-0.5 rounded text-xs font-medium';
}

export function getTypeEmoji(type: OpportunityType): string {
  const symbols: Record<OpportunityType, string> = {
    'Grant': '◈',
    'Accelerator': '↗',
    'Incubator': '⌂',
    'Competition': '⚑',
    'Fellowship': '⚗',
    'Conference': '☖',
    'VC Program': '▤',
    'Innovation Challenge': '✦',
    'Hackathon': '⌬',
    'Funding': '⇗',
    'Loan': '⎄',
  };
  return symbols[type] || '▪';
}

export function getCompanyLogo(organizer: string): { initials: string; bg: string; color: string } {
  const org = organizer.toLowerCase();
  // Global Tech Giants & VCs
  if (org.includes('google')) return { initials: 'GO', bg: 'bg-[#4285F4]/15', color: 'text-[#4285F4]' };
  if (org.includes('microsoft')) return { initials: 'MS', bg: 'bg-[#00A4EF]/15', color: 'text-[#00A4EF]' };
  if (org.includes('y combinator') || org.includes('yc')) return { initials: 'YC', bg: 'bg-[#F26522]/15', color: 'text-[#F26522]' };
  if (org.includes('techstars')) return { initials: 'TS', bg: 'bg-[#00E59B]/15', color: 'text-[#00E59B]' };
  if (org.includes('peak xv') || org.includes('sequoia')) return { initials: 'PX', bg: 'bg-purple-700/15', color: 'text-purple-500' };
  if (org.includes('accel')) return { initials: 'AC', bg: 'bg-red-700/15', color: 'text-red-500' };
  if (org.includes('amazon') || org.includes('aws')) return { initials: 'AW', bg: 'bg-orange-500/15', color: 'text-orange-500' };
  if (org.includes('meta') || org.includes('facebook')) return { initials: 'ME', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('ibm')) return { initials: 'IB', bg: 'bg-blue-800/15', color: 'text-blue-600' };
  if (org.includes('cisco')) return { initials: 'CS', bg: 'bg-sky-700/15', color: 'text-sky-600' };
  if (org.includes('oracle')) return { initials: 'OR', bg: 'bg-red-700/15', color: 'text-red-600' };
  if (org.includes('sap')) return { initials: 'SP', bg: 'bg-blue-600/15', color: 'text-blue-600' };
  if (org.includes('salesforce')) return { initials: 'SF', bg: 'bg-sky-600/15', color: 'text-sky-500' };
  if (org.includes('qualcomm')) return { initials: 'QC', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('intel')) return { initials: 'IN', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('nvidia')) return { initials: 'NV', bg: 'bg-emerald-700/15', color: 'text-emerald-600' };
  if (org.includes('apple')) return { initials: 'AP', bg: 'bg-slate-800/15', color: 'text-slate-700' };
  if (org.includes('twitter') || org.includes('x corp')) return { initials: 'TW', bg: 'bg-slate-700/15', color: 'text-slate-600' };

  // Global Accelerators & VCs
  if (org.includes('500 global') || org.includes('500 startups')) return { initials: '5G', bg: 'bg-emerald-600/15', color: 'text-emerald-500' };
  if (org.includes('antler')) return { initials: 'AN', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('matrix partners')) return { initials: 'MX', bg: 'bg-blue-600/15', color: 'text-blue-600' };
  if (org.includes('elevation capital')) return { initials: 'EL', bg: 'bg-indigo-600/15', color: 'text-indigo-500' };
  if (org.includes('blume ventures')) return { initials: 'BL', bg: 'bg-purple-600/15', color: 'text-purple-500' };
  if (org.includes('entrepreneur first')) return { initials: 'EF', bg: 'bg-amber-600/15', color: 'text-amber-600' };

  // Indian Public Bodies, Ministries & PSUs
  if (org.includes('dpiit') || org.includes('startup india') || org.includes('government of india')) return { initials: 'SI', bg: 'bg-orange-600/15', color: 'text-orange-500' };
  if (org.includes('nasscom')) return { initials: 'NC', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('niti aayog') || org.includes('aim')) return { initials: 'NA', bg: 'bg-emerald-700/15', color: 'text-emerald-600' };
  if (org.includes('meity') || org.includes('ministry of electronics')) return { initials: 'ME', bg: 'bg-indigo-700/15', color: 'text-indigo-500' };
  if (org.includes('birac') || org.includes('dbt')) return { initials: 'BI', bg: 'bg-teal-700/15', color: 'text-teal-600' };
  if (org.includes('dst') || org.includes('nidhi')) return { initials: 'DS', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('isro')) return { initials: 'IS', bg: 'bg-orange-700/15', color: 'text-orange-600' };
  if (org.includes('sidbi')) return { initials: 'SB', bg: 'bg-cyan-700/15', color: 'text-cyan-600' };
  if (org.includes('msme')) return { initials: 'MS', bg: 'bg-amber-700/15', color: 'text-amber-600' };
  if (org.includes('cgtmse')) return { initials: 'CG', bg: 'bg-amber-600/15', color: 'text-amber-500' };
  if (org.includes('ongc')) return { initials: 'ON', bg: 'bg-red-700/15', color: 'text-red-600' };
  if (org.includes('gail')) return { initials: 'GA', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('iocl') || org.includes('indian oil')) return { initials: 'IO', bg: 'bg-orange-700/15', color: 'text-orange-600' };
  if (org.includes('ntpc')) return { initials: 'NT', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('bel') || org.includes('bharat electronics')) return { initials: 'BE', bg: 'bg-sky-700/15', color: 'text-sky-600' };
  if (org.includes('hal') || org.includes('hindustan aeronautics')) return { initials: 'HA', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('oil india')) return { initials: 'OI', bg: 'bg-amber-600/15', color: 'text-amber-500' };
  if (org.includes('pfc') || org.includes('power finance')) return { initials: 'PF', bg: 'bg-indigo-700/15', color: 'text-indigo-600' };
  if (org.includes('rec')) return { initials: 'RE', bg: 'bg-emerald-700/15', color: 'text-emerald-600' };
  if (org.includes('hpcl') || org.includes('hindustan petroleum')) return { initials: 'HP', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('bpcl') || org.includes('bharat petroleum')) return { initials: 'BP', bg: 'bg-yellow-700/15', color: 'text-yellow-600' };
  if (org.includes('bsnl')) return { initials: 'BN', bg: 'bg-blue-600/15', color: 'text-blue-500' };

  // Indian Ministries & Departments
  if (org.includes('ministry of education')) return { initials: 'ED', bg: 'bg-sky-700/15', color: 'text-sky-600' };
  if (org.includes('ministry of agriculture')) return { initials: 'AG', bg: 'bg-emerald-700/15', color: 'text-emerald-600' };
  if (org.includes('ministry of defence')) return { initials: 'DF', bg: 'bg-slate-700/15', color: 'text-slate-600' };

  // Indian Top Private Listed Companies
  if (org.includes('infosys')) return { initials: 'IN', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('wipro')) return { initials: 'WI', bg: 'bg-teal-600/15', color: 'text-teal-500' };
  if (org.includes('tata') && !org.includes('tata communications')) return { initials: 'TA', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('mahindra')) return { initials: 'MA', bg: 'bg-red-700/15', color: 'text-red-600' };
  if (org.includes('flipkart')) return { initials: 'FK', bg: 'bg-yellow-500/15', color: 'text-yellow-600' };
  if (org.includes('reliance') || org.includes('jio')) return { initials: 'RJ', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('hcltech') || org.includes('hcl')) return { initials: 'HC', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('lti') || org.includes('mindtree')) return { initials: 'LT', bg: 'bg-blue-800/15', color: 'text-blue-600' };
  if (org.includes('larsen') || org.includes('l&t')) return { initials: 'LT', bg: 'bg-blue-800/15', color: 'text-blue-600' };
  if (org.includes('adani')) return { initials: 'AD', bg: 'bg-orange-700/15', color: 'text-orange-600' };
  if (org.includes('itc')) return { initials: 'IT', bg: 'bg-blue-800/15', color: 'text-blue-600' };
  if (org.includes('bharti') || org.includes('airtel')) return { initials: 'AI', bg: 'bg-red-700/15', color: 'text-red-600' };
  if (org.includes('aditya birla')) return { initials: 'AB', bg: 'bg-red-700/15', color: 'text-red-600' };
  if (org.includes('tech mahindra')) return { initials: 'TM', bg: 'bg-red-700/15', color: 'text-red-600' };
  if (org.includes('biocon')) return { initials: 'BC', bg: 'bg-teal-700/15', color: 'text-teal-600' };
  if (org.includes('godrej')) return { initials: 'GD', bg: 'bg-purple-700/15', color: 'text-purple-600' };
  if (org.includes('bajaj')) return { initials: 'BJ', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('sun pharma')) return { initials: 'SN', bg: 'bg-orange-600/15', color: 'text-orange-500' };
  if (org.includes('icici')) return { initials: 'IC', bg: 'bg-orange-600/15', color: 'text-orange-500' };
  if (org.includes('hdfc')) return { initials: 'HD', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('axis bank')) return { initials: 'AX', bg: 'bg-purple-600/15', color: 'text-purple-500' };
  if (org.includes('kotak mahindra')) return { initials: 'KM', bg: 'bg-red-600/15', color: 'text-red-500' };

  // Top Indian Unicorns & Tech Startups
  if (org.includes('paytm') || org.includes('one97')) return { initials: 'PY', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('zomato')) return { initials: 'ZO', bg: 'bg-red-600/15', color: 'text-red-500' };
  if (org.includes('swiggy')) return { initials: 'SW', bg: 'bg-orange-600/15', color: 'text-orange-500' };
  if (org.includes('ola')) return { initials: 'OL', bg: 'bg-emerald-600/15', color: 'text-emerald-500' };
  if (org.includes('byju') || org.includes('byjus')) return { initials: 'BY', bg: 'bg-purple-600/15', color: 'text-purple-500' };
  if (org.includes('zerodha')) return { initials: 'ZE', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('cred')) return { initials: 'CR', bg: 'bg-slate-700/15', color: 'text-slate-600' };
  if (org.includes('razorpay')) return { initials: 'RZ', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('phonepe')) return { initials: 'PH', bg: 'bg-indigo-600/15', color: 'text-indigo-500' };

  // Academic Institutions
  if (org.includes('iim')) return { initials: 'IIM', bg: 'bg-amber-700/15', color: 'text-amber-600' };
  if (org.includes('iit')) return { initials: 'IIT', bg: 'bg-indigo-700/15', color: 'text-indigo-500' };
  if (org.includes('iisc')) return { initials: 'IS', bg: 'bg-purple-700/15', color: 'text-purple-600' };
  if (org.includes('iiit')) return { initials: 'IT', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('bits pilani')) return { initials: 'BP', bg: 'bg-amber-700/15', color: 'text-amber-600' };
  if (org.includes('nit ')) return { initials: 'NT', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('isi ') || org.includes('indian statistical')) return { initials: 'IS', bg: 'bg-purple-600/15', color: 'text-purple-500' };

  // Government & Industry Bodies
  if (org.includes('ficci')) return { initials: 'FC', bg: 'bg-blue-600/15', color: 'text-blue-600' };
  if (org.includes('cii ') || org.includes('confederation of indian')) return { initials: 'CI', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('iamai')) return { initials: 'IA', bg: 'bg-indigo-600/15', color: 'text-indigo-500' };
  if (org.includes('npc')) return { initials: 'NP', bg: 'bg-blue-600/15', color: 'text-blue-500' };

  // Conference Organizers
  if (org.includes('tiE global') || org.includes('tie')) return { initials: 'Ti', bg: 'bg-purple-600/15', color: 'text-purple-500' };
  if (org.includes('web summit')) return { initials: 'WS', bg: 'bg-red-600/15', color: 'text-red-500' };
  if (org.includes('slush')) return { initials: 'SL', bg: 'bg-slate-700/15', color: 'text-slate-600' };
  if (org.includes('techcrunch')) return { initials: 'TC', bg: 'bg-emerald-600/15', color: 'text-emerald-500' };
  if (org.includes('vivatech') || org.includes('viva technology')) return { initials: 'VT', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('saas') || org.includes('saastr')) return { initials: 'SA', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('inc42')) return { initials: '42', bg: 'bg-amber-600/15', color: 'text-amber-500' };
  if (org.includes('vccircle')) return { initials: 'VC', bg: 'bg-blue-600/15', color: 'text-blue-500' };

  // Global Conference / Event Organizers
  if (org.includes('collision conf')) return { initials: 'CO', bg: 'bg-purple-600/15', color: 'text-purple-500' };
  if (org.includes('step group') || org.includes('step conference')) return { initials: 'ST', bg: 'bg-emerald-600/15', color: 'text-emerald-500' };
  if (org.includes('e27')) return { initials: 'E7', bg: 'bg-cyan-600/15', color: 'text-cyan-500' };
  if (org.includes('infoCommAsia') || org.includes('infocomm')) return { initials: 'IF', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('gsma') || org.includes('coai') || org.includes('mobile world congress') || org.includes('mwc')) return { initials: 'MW', bg: 'bg-indigo-600/15', color: 'text-indigo-500' };
  if (org.includes('intersolar') || org.includes('messe muenchen')) return { initials: 'IS', bg: 'bg-yellow-600/15', color: 'text-yellow-600' };
  if (org.includes('trescon') || org.includes('world ai show')) return { initials: 'AI', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('publicis') || org.includes('groupe')) return { initials: 'PG', bg: 'bg-purple-600/15', color: 'text-purple-500' };
  if (org.includes('exhibitions india') || org.includes('smart cities')) return { initials: 'SC', bg: 'bg-emerald-600/15', color: 'text-emerald-500' };
  if (org.includes('iet india') || org.includes('iot india congress')) return { initials: 'IO', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('techex') || org.includes('ai & big data expo')) return { initials: 'BD', bg: 'bg-purple-600/15', color: 'text-purple-500' };
  if (org.includes('isf foundation') || org.includes('india startup fest')) return { initials: 'IF', bg: 'bg-orange-600/15', color: 'text-orange-500' };

  // Hackathon / Dev Platform Organizers
  if (org.includes('devpost')) return { initials: 'DP', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('solana')) return { initials: 'SO', bg: 'bg-purple-600/15', color: 'text-purple-500' };
  if (org.includes('polygon')) return { initials: 'PO', bg: 'bg-indigo-600/15', color: 'text-indigo-500' };
  if (org.includes('devfolio')) return { initials: 'DV', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('hackerearth')) return { initials: 'HE', bg: 'bg-sky-600/15', color: 'text-sky-500' };
  if (org.includes('major league hacking') || org.includes('mlh')) return { initials: 'ML', bg: 'bg-slate-700/15', color: 'text-slate-600' };
  if (org.includes('nasa') || org.includes('space apps')) return { initials: 'NA', bg: 'bg-blue-700/15', color: 'text-blue-600' };
  if (org.includes('openai')) return { initials: 'OA', bg: 'bg-emerald-700/15', color: 'text-emerald-600' };
  if (org.includes('lockheed martin')) return { initials: 'LM', bg: 'bg-sky-700/15', color: 'text-sky-600' };
  if (org.includes('wadhwani')) return { initials: 'WA', bg: 'bg-blue-600/15', color: 'text-blue-500' };
  if (org.includes('villgro')) return { initials: 'VL', bg: 'bg-emerald-600/15', color: 'text-emerald-500' };
  if (org.includes('nsrcel')) return { initials: 'NR', bg: 'bg-amber-600/15', color: 'text-amber-500' };
  if (org.includes('fellowship')) return { initials: 'FL', bg: 'bg-purple-600/15', color: 'text-purple-500' };

  // Default monogram
  const parts = organizer.split(' ').filter(Boolean);
  const initials = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'SI';
  return { initials, bg: 'bg-surface-hover', color: 'text-ink' };
}

export function getRemoteEmoji(remoteType: string): string {
  switch (remoteType) {
    case 'Remote': return '❖';
    case 'On-Site': return '⚲';
    case 'Hybrid': return '⧓';
    default: return '·';
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays} days left`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function getDeadlineUrgency(deadline: string): 'expired' | 'urgent' | 'soon' | 'normal' {
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'urgent';
  if (diffDays <= 30) return 'soon';
  return 'normal';
}

export function removeDuplicates(opportunities: Opportunity[]): Opportunity[] {
  const seen = new Map<string, Opportunity>();
  
  opportunities.forEach(opp => {
    const key = opp.title.toLowerCase().trim();
    const existing = seen.get(key);
    
    if (!existing) {
      seen.set(key, opp);
    } else {
      if (opp.aiScore > existing.aiScore) {
        seen.set(key, { ...opp, isDuplicate: false });
      } else {
        seen.set(key, { ...existing, isDuplicate: false });
      }
    }
  });
  
  return Array.from(seen.values());
}

export function exportToCSV(opportunities: Opportunity[]): string {
  const headers = [
    'Title', 'Type', 'Organizer', 'Location', 'Country', 'Deadline',
    'Source', 'Funding Amount', 'Startup Stage', 'Remote Type', 'AI Score', 'Urgency', 'URL'
  ];
  
  const rows = opportunities.map(opp => [
    `"${opp.title.replace(/"/g, '""')}"`,
    opp.type,
    `"${opp.organizer}"`,
    `"${opp.location}"`,
    opp.country,
    opp.deadline,
    opp.source,
    `"${opp.fundingAmount || 'N/A'}"`,
    opp.startupStage,
    opp.remoteType,
    opp.aiScore.toString(),
    opp.urgency,
    opp.applicationLink,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function exportToJSON(opportunities: Opportunity[]): string {
  return JSON.stringify(opportunities, null, 2);
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  
  let matches = 0;
  const shorter = s1.length < s2.length ? s1 : s2;
  const longer = s1.length < s2.length ? s2 : s1;
  
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  return matches / maxLen;
}