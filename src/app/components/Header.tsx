import { Bell, Search, User, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  onLogout?: () => void;
}

export function Header({ title, onLogout }: HeaderProps) {
  const username = localStorage.getItem('username') || 'Admin';

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-slate-300 bg-white text-sm w-64 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
          
          <button className="p-2 hover:bg-slate-100 relative transition-colors">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 px-3 py-2 border-l border-slate-200 ml-2">
            <div className="w-9 h-9 bg-slate-900 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-white" />
            </div>
            <div className="text-sm">
              <p className="capitalize text-slate-900 leading-tight">{username}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
