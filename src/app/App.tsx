import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { Header } from '@/app/components/Header';
import { Dashboard } from '@/app/components/Dashboard';
import { InvoicesList } from '@/app/components/InvoicesList';
import { Login } from '@/app/components/Login';
import { Customers } from '@/app/components/Customers';
import { Products } from '@/app/components/Products';
import { Reports } from '@/app/components/Reports';
import { Settings } from '@/app/components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    // Simple demo authentication - in production, this would call an API
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    setActiveTab('dashboard');
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'invoices':
        return 'Invoice Management';
      case 'customers':
        return 'Customers';
      case 'products':
        return 'Products';
      case 'reports':
        return 'Reports';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'invoices':
        return <InvoicesList />;
      case 'customers':
        return <Customers />;
      case 'products':
        return <Products />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="size-full flex bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTitle()} onLogout={handleLogout} />
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}