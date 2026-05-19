import { useStore } from '../store/useStore';
import {
  LayoutDashboard,
  List,
  BarChart3,
  Server,
  Bell,
  Download,
  ScrollText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'opportunities', label: 'Opportunities', icon: List },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'scrapers', label: 'Scrapers', icon: Server },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'logs', label: 'Scrape Logs', icon: ScrollText },
] as const;

export default function Sidebar() {
  const { currentView, setView, sidebarOpen, toggleSidebar, user, uiTheme } = useStore();

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-border bg-surface transition-all duration-300"
      style={{ width: sidebarOpen ? 240 : 64 }}
    >
      {/* Logo */}
      <div className="p-2.5 flex items-center justify-between border-b border-border h-14">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-black flex items-center justify-center flex-shrink-0 text-white border border-border/10 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="text-sm font-bold text-ink whitespace-nowrap leading-tight tracking-tight">
                StartupIntel
              </h1>
              <p className="text-[11px] text-muted whitespace-nowrap font-medium leading-tight">
                Production SaaS
              </p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md bg-surface-hover text-muted hover:text-ink transition-colors border border-border"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-2.5 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-all duration-150 group relative text-left ${
                isActive
                  ? uiTheme === 'figma'
                    ? 'bg-ink text-paper font-semibold shadow-sm'
                    : 'bg-black text-white font-semibold shadow-sm'
                  : 'text-muted hover:bg-surface-hover hover:text-ink'
              }`}
            >
              <Icon
                size={16}
                className={`flex-shrink-0 ${isActive ? (uiTheme === 'figma' ? 'text-paper' : 'text-white') : 'text-muted group-hover:text-ink'}`}
              />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {item.id === 'alerts' && sidebarOpen && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-[#e68100] text-white rounded-md">
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stats ticker */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-border bg-surface">
          <div className="flex items-center gap-2 text-xs text-muted font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Daemon Active</span>
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-3.5 border-t border-border bg-surface">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center flex-shrink-0 border border-border text-ink text-xs font-bold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{user.name}</p>
              <p className="text-[10px] text-muted capitalize">{user.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
