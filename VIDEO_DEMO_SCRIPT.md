# 🎬 Video Demonstration Script - Startup Opportunity Aggregator

## 📋 Video Structure Overview
- **Total Duration**: 8-10 minutes
- **Sections**: 7 main sections
- **Key Focus Areas**: Scraping, Data Pipeline, Dashboard, Bonus Features

---

## 🎥 SECTION 1: INTRODUCTION (0:00 - 1:00)

### Visual Setup
- Show your face or start with project title slide
- Display the project name: "Startup Opportunity Aggregator"
- Show assignment brief on screen briefly

### Script to Speak:
"Hi everyone, I'll demonstrate my Startup Opportunity Aggregator project. It's a web scraping app that collects startup opportunities like grants, accelerators, and conferences from multiple sources.

After scraping, the data is cleaned, normalized, and duplicates are removed. The processed data is stored in structured format and displayed in a searchable dashboard.

Let me show you the implementation and features."

---

## 🎥 SECTION 2: PROJECT OVERVIEW & ARCHITECTURE (1:00 - 2:00)

### Visual Setup
- Open the project folder in VS Code
- Show the README.md file
- Display the architecture diagram from README

### Script to Speak:
"Here's the project structure. It's a full-stack app with React frontend and FastAPI backend. The frontend uses React 19, TypeScript, Vite, and Tailwind CSS. The backend uses FastAPI with APScheduler for automated scraping.

I scrape from 7 sources including Startup India, NASSCOM, DPIIT, and Invest India. The data pipeline handles deduplication, normalization, and AI-powered tagging.

I implemented a persistent storage architecture using a database service layer. Database integration like SQLite or MongoDB can be added easily later."

### Actions to Show:
1. Open `backend/app/main.py` - show the FastAPI setup
2. Open `backend/app/scrapers/runner.py` - show the scraper orchestration
3. Open `src/App.tsx` - show the main React application structure
4. Briefly scroll through the folder structure

---

## 🎥 SECTION 3: RUNNING THE APPLICATION (2:00 - 2:45)

### Visual Setup
- Open terminal in the project directory
- Show both frontend and backend running

### Script to Speak:
"Now I'll start the application. I'll run both frontend and backend servers. Frontend on port 5173, backend on port 8000."

### Commands to Run:
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
npm install
npm run dev
```

### Script to Speak:
"Both servers are running. Backend API at localhost:8000, frontend dashboard at localhost:5173. The app loads 105+ verified opportunities on startup."

### Actions to Show:
1. Show terminal with both servers running
2. Open browser to `http://localhost:5173`
3. Show the dashboard loading

---

## 🎥 SECTION 4: DASHBOARD FEATURES (2:45 - 4:30)

### Visual Setup
- Browser showing the main dashboard
- Navigate through different sections

### Script to Speak:
"Here's the dashboard. It shows real-time stats: total opportunities, new additions, AI match score, and urgent deadlines. There's a live ticker with recent opportunities.

At the top are scraping controls. I can start automatic background scraping or force an immediate scrape. The system shows real-time status and logs."

### Actions to Show:
1. **Dashboard Overview**
   - Point to stat cards (Total Opportunities, New This Week, Avg AI Score, Urgent Deadlines)
   - Show the scrolling ticker at the bottom
   - Click on "Explore All Opportunities" button

2. **Live Scraping Demo**
   - Click "Start" to enable live scraping
   - Show the countdown timer
   - Click "Force Scrape Now" to trigger immediate scraping
   - Show the success toast notification
   - Point to the latest scraper activity banner

3. **Recent Opportunities**
   - Click on a recent opportunity card
   - Show the detail modal with full information
   - Show the direct application link
   - Demonstrate bookmarking functionality

### Script to Speak:
"Each card shows type, urgency, startup stage, reliability score, and deadline. Clicking shows details like description, eligibility, and application link. I can also bookmark opportunities."

---

## 🎥 SECTION 5: OPPORTUNITIES PAGE & SEARCH (4:30 - 6:00)

### Visual Setup
- Navigate to Opportunities page
- Demonstrate search and filters

### Script to Speak:
"Now the Opportunities page with search and filters. I can search by keyword across titles, organizers, sectors, and locations."

### Actions to Show:
1. **Search Functionality**
   - Type "AI" in the search box
   - Show results filtering in real-time
   - Type "Karnataka" to filter by location
   - Type "ONGC" to filter by PSU/organizer

2. **Filter System**
   - Click "Filters" button to expand filter panel
   - Select "Grant" and "Accelerator" types
   - Select "Seed" and "Series A" stages
   - Select "Remote" and "Hybrid" for location mode
   - Select "High" and "Critical" urgency
   - Select specific sources like "Startup India"
   - Set deadline range to "This Week"
   - Show the filter count badge updating

3. **AI Profile Matcher**
   - Click "AI Profile Matcher" button
   - Set startup stage to "Seed"
   - Set sector to "AI"
   - Set funding preference to "Grants"
   - Click "Apply Profile"
   - Show opportunities re-ranked with personalized scores
   - Point out the "Alignment Match" badges

### Script to Speak:
"I can filter by type, stage, location, urgency, source, and deadline. Multiple filters can be combined.

The AI Profile Matcher is a bonus feature. I set my startup stage, sector, and funding preferences. The system ranks opportunities by compatibility using NLP. You can see match scores and alignment badges."

### Actions to Show:
4. **View Modes**
   - Toggle between grid and list view
   - Show bookmarked opportunities filter
   - Demonstrate pagination

5. **Export Functionality**
   - Navigate to Export page
   - Show CSV export option
   - Show JSON export option
   - Click "Export to CSV" and show the downloaded file

---

## 🎥 SECTION 6: ANALYTICS & ALERTS (6:00 - 7:15)

### Visual Setup
- Navigate to Analytics page
- Navigate to Alerts page

### Script to Speak:
"Here's the Analytics page with insights into the data. I can see distribution by type, source, location, stage, urgency, and remote work preferences."

### Actions to Show:
1. **Analytics Dashboard**
   - Show type distribution chart
   - Show source distribution
   - Show city/state distribution
   - Show startup stage breakdown
   - Show urgency analysis
   - Show remote vs on-site distribution
   - Show top sectors analysis

### Script to Speak:
"The Alerts system is a bonus feature. I can set custom alerts for new opportunities matching my criteria. I configure keywords and choose notification channels like email, Slack, Discord, or webhooks."

### Actions to Show:
2. **Alerts Configuration**
   - Navigate to Alerts page
   - Click "Create New Alert"
   - Set alert name: "AI Grants Alert"
   - Set keywords: "AI, machine learning"
   - Select notification channels: Email and Slack
   - Enable the alert
   - Show the alert in the active alerts list

3. **Email Subscription**
   - Click "Subscribe Alerts" button in header
   - Enter email: "founder@startup.in"
   - Select category: "AI Startup Grants"
   - Click "Confirm Subscription"
   - Show the success confirmation

### Script to Speak:
"I can also subscribe to email alerts for specific categories. The system uses SendGrid/SMTP for notifications with smart deduplication to avoid spam."

---

## 🎥 SECTION 7: SCRAPERS & LOGS (7:15 - 8:00)

### Visual Setup
- Navigate to Scrapers page
- Navigate to Logs page

### Script to Speak:
"Here's the Scrapers page for real-time monitoring. I can see status, success rates, last run times, and error logs for each scraper."

### Actions to Show:
1. **Scraper Status**
   - Navigate to Scrapers page
   - Show all 7 scrapers with their status
   - Show success rates and last run times
   - Click "Run Now" on a specific scraper
   - Show the real-time status update

2. **Scraping Logs**
   - Navigate to Logs page
   - Show recent scraping logs
   - Show successful runs with records found/added
   - Show any error logs with details
   - Filter logs by source or status

### Script to Speak:
"The Logs page shows scraping history: records found, added, duplicates removed, and execution times. This helps track data quality and performance."

---

## 🎥 SECTION 8: TECHNICAL IMPLEMENTATION & CHALLENGES (8:00 - 9:00)

### Visual Setup
- Show code files in VS Code
- Display the scraping challenges section from README

### Script to Speak:
"For technical implementation, I used asyncio for concurrent requests and BeautifulSoup for parsing. I added exponential backoff, rotating user agents, and request throttling as anti-scraping measures.

A major challenge was inconsistent data formats. I solved this with a normalization pipeline that standardizes dates, amounts, and locations.

For duplicates, I implemented fuzzy matching using Levenshtein distance with 85% similarity threshold.

For dynamic JavaScript content, I used Playwright as a headless browser fallback. Scrapers are self-healing with fallback selectors."

### Actions to Show:
1. Open `backend/app/scrapers/startup_india.py` - show scraper implementation
2. Open `backend/app/pipeline/deduplicate.py` - show deduplication logic
3. Open `backend/app/pipeline/normalize.py` - show normalization
4. Open `backend/app/scheduler/jobs.py` - show scheduling implementation
5. Show the README section on scraping challenges

---

## 🎥 SECTION 9: CONCLUSION & DELIVERABLES (9:00 - 10:00)

### Visual Setup
- Show the GitHub repository
- Display the assignment requirements checklist
- Show final working dashboard

### Script to Speak:
"In conclusion, I've implemented all core requirements and bonus features.

Core: Scraping from 7 sources, keyword search, extracting all required fields, duplicate removal, structured data storage, full dashboard with filters, and automated scheduling.

Bonus: AI-powered tagging, alert system with multiple channels, pagination, anti-scraping measures, and export to CSV and JSON.

Deliverables: GitHub repository with README, working dashboard with 105+ entries, and detailed notes on scraping challenges.

The app is production-ready with error handling, logging, and monitoring."

### Actions to Show:
1. Show the GitHub repository URL
2. Display the requirements checklist from README
3. Show the final dashboard with all features working
4. Show the data storage structure

### Script to Speak:
"Thank you for watching. The Startup Opportunity Aggregator is a fully functional, production-ready application that meets all requirements with AI-powered features and comprehensive monitoring."

---

## 🎬 Additional Tips for Recording

### Before Recording:
1. **Test Everything**: Run the application and test all features
2. **Clean Environment**: Close unnecessary applications and browser tabs
3. **Prepare Data**: Ensure the database has good sample data
4. **Check Audio**: Test microphone quality and reduce background noise

### During Recording:
1. **Speak Clearly**: Use a steady, confident pace
2. **Mouse Movement**: Move mouse smoothly and deliberately
3. **Zoom In**: Use screen zoom for code snippets when needed
4. **Wait for Loading**: Allow time for pages to load before speaking
5. **Highlight Actions**: Verbally describe what you're doing

### Technical Setup:
1. **Screen Resolution**: 1920x1080 recommended
2. **Browser**: Use Chrome or Firefox in full screen
3. **Terminal**: Use a terminal with good contrast colors
4. **Editor**: Use VS Code with a clean, readable theme

### Common Mistakes to Avoid:
1. Don't rush through demonstrations
2. Don't skip error handling explanations
3. Don't forget to show the data storage structure
4. Don't neglect the bonus features
5. Don't forget to mention the evaluation criteria

### Evaluation Criteria Coverage:
- **Scraper Reliability (35%)**: Emphasize the 7 sources, error handling, retry logic, and monitoring
- **Data Pipeline & Storage (25%)**: Show the normalization, deduplication, and data storage structure
- **Dashboard UI & Usability (25%)**: Demonstrate search, filters, analytics, and user experience
- **Code Quality & Documentation (15%)**: Show the README, code structure, and type hints

---

## 📝 Quick Reference Commands

```bash
# Start Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Start Frontend
npm install
npm run dev

# Access Application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs

# Data Storage
# Structured format with easy database integration

# Key Files to Show
# - README.md (Project overview)
# - backend/app/main.py (FastAPI setup)
# - backend/app/scrapers/runner.py (Scraper orchestration)
# - backend/app/pipeline/deduplicate.py (Deduplication logic)
# - src/components/Dashboard.tsx (Main dashboard)
# - src/components/OpportunitiesPage.tsx (Search and filters)
```

---

## 🎯 Key Talking Points Summary

1. **Project Scope**: Full-stack web scraping and data pipeline application
2. **Tech Stack**: React, FastAPI, asyncio, BeautifulSoup
3. **Data Sources**: 7 government and institutional portals
4. **Core Features**: Scraping, deduplication, storage, dashboard, scheduling
5. **Bonus Features**: AI tagging, alerts, export, anti-scraping
6. **Data Quality**: 105+ verified opportunities with comprehensive metadata
7. **Reliability**: Error handling, retry logic, monitoring, logging
8. **User Experience**: Modern UI, real-time search, advanced filters, analytics

---

## ⏱️ Timing Summary

- Section 1: Introduction - 1 minute
- Section 2: Architecture - 1 minute
- Section 3: Running App - 45 seconds
- Section 4: Dashboard - 1 minute 45 seconds
- Section 5: Search & Filters - 1 minute 30 seconds
- Section 6: Analytics & Alerts - 1 minute 15 seconds
- Section 7: Scrapers & Logs - 45 seconds
- Section 8: Technical Details - 1 minute
- Section 9: Conclusion - 1 minute

**Total**: Approximately 9-10 minutes

---

Good luck with your video demonstration! 🎬