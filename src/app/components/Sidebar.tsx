import { LayoutDashboard, FileText, Users, Package, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'invoices', icon: FileText, label: 'Invoices' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="28" height="6" fill="white"/>
              <rect x="2" y="13" width="28" height="6" fill="white"/>
              <rect x="2" y="22" width="28" height="6" fill="white"/>
            </svg>
          </div>
          <div className="text-white">
            <h1 className="text-sm leading-tight">JC Bricks</h1>
            <p className="text-xs text-slate-400">Manufacturing</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                  ${isActive 
                    ? 'bg-slate-800 text-white border-l-2 border-red-600' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800">
        <div className="text-xs text-slate-500 space-y-1">
          <p>Version 1.0.0</p>
          <p>© 2026 JC Bricks</p>
        </div>
      </div>
    </div>
  );
}
