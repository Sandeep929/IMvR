import { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = onLogin(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                              linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="28" height="6" fill="white"/>
                  <rect x="2" y="13" width="28" height="6" fill="white"/>
                  <rect x="2" y="22" width="28" height="6" fill="white"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl tracking-tight">JC Bricks Manufacturing</h1>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Enterprise Management System</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl mb-4 leading-tight">
                Invoice Management<br />Made Professional
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Comprehensive solution for managing invoices, payments, and customer records
                with real-time analytics and reporting.
              </p>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red-500"></div>
                <p className="text-sm text-slate-300">Complete invoice lifecycle management</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red-500"></div>
                <p className="text-sm text-slate-300">Real-time payment tracking and analytics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red-500"></div>
                <p className="text-sm text-slate-300">Professional invoice generation and printing</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red-500"></div>
                <p className="text-sm text-slate-300">Secure admin access control</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-12">
            <p className="text-xs text-slate-500">
              Village Bisnawda Dhar Road Indore-453001 (M.P.) India
            </p>
            <p className="text-xs text-slate-500 mt-1">
              © 2026 JC Bricks Manufacturing. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="28" height="6" fill="white"/>
                  <rect x="2" y="13" width="28" height="6" fill="white"/>
                  <rect x="2" y="22" width="28" height="6" fill="white"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg">JC Bricks Manufacturing</h1>
              </div>
            </div>
            <h2 className="text-3xl text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-600">Enter your credentials to access the system</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3 hover:bg-slate-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-100 border border-slate-200">
            <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide">Demo Credentials</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-700">Username:</span>
              <code className="px-2 py-1 bg-white border border-slate-300 text-slate-900">admin</code>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-slate-700">Password:</span>
              <code className="px-2 py-1 bg-white border border-slate-300 text-slate-900">admin123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
