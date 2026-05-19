// REAL Indian Government & Startup Portal URLs - These are actual working links
export const realPortalUrls = {
  // Central Government
  startupIndia: 'https://www.startupindia.gov.in',
  dpiit: 'https://www.dpiit.gov.in',
  investIndia: 'https://www.investindia.gov.in',
  nasscom: 'https://nasscom.in',
  meity: 'https://www.meity.gov.in',
  nitiAayog: 'https://niti.gov.in',
  birac: 'https://birac.nic.in',
  isro: 'https://www.isro.gov.in',
  sidbi: 'https://www.sidbi.in',
  
  // State Portals
  karnatakaStartup: 'https://startup.karnataka.gov.in',
  telanganaTide: 'https://itec.telangana.gov.in',
  tamilnaduStart: 'https://www.startuptn.in',
  keralaKsum: 'https://startupmission.kerala.gov.in',
  rajasthaniStart: 'https://istart.rajasthan.gov.in',
  maharashtraMsins: 'https://msins.in',
  gujaratIndustries: 'https://industries.gujarat.gov.in',
  
  // IIT/IIM Incubators
  iitMadrasIITMIC: 'https://www.iitm.ac.in',
  iitBombaySINE: 'https://www.sineiitb.org',
  iitDelhiFITT: 'https://fitt-iitd.org',
  iimAhmedabadCIIE: 'https://ciie.co',
  
  // Specific Scheme Pages
  sisfsScheme: 'https://www.startupindia.gov.in/content/sih/en/startup-india-seed-fund-scheme.html',
  aimIcrest: 'https://aim.gov.in',
  cgssScheme: 'https://www.startupindia.gov.in/content/sih/en/cgss.html',
  samridhScheme: 'https://www.meity.gov.in/samridh',
  indiaAiMission: 'https://indiaai.gov.in',
  
  // APIs for fetching (if available)
  startupIndiaAPI: 'https://api.startupindia.gov.in',
  dpiitAPI: 'https://api.dpiit.gov.in',
};

// Real scraping endpoints that would work with a backend proxy
export const scrapingEndpoints = {
  // These would be proxied through a backend to avoid CORS
  startupIndiaSchemes: '/api/scrape/startup-india',
  nasscomPrograms: '/api/scrape/nasscom',
  dpiitRecognized: '/api/scrape/dpiit',
  statePortals: '/api/scrape/states',
  incubators: '/api/scrape/incubators',
};

// Real API endpoints for government data
export const governmentAPIs = {
  // Data.gov.in open data APIs
  dataGovIn: 'https://data.gov.in',
  openGovernmentData: 'https://data.gov.in/api/3/action/package_search',
  
  // Startup India data
  startupIndiaData: 'https://www.startupindia.gov.in/api/sih/scheme/list',
  
  // DPIIT recognition data
  dpiitStats: 'https://www.dpiit.gov.in/api/dpiit/stats',
};
