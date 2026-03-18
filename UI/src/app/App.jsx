import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar/sidebar';
import { Header } from './components/Header/header';
import { Dashboard } from './components/Dashboard/dashboard';
import { InvoicesList } from './components/InvoicesList/invoicesList';
import { Login } from './components/Login/login';
import { Customers } from './components/Customers/customers';
import { Products } from './components/Products/products';
import { Reports } from './components/Reports/reports';
import { Settings } from './components/Settings/settings';
import { InvoiceForm } from './components/InvoiceForm/invoiceForm';
import { InvoiceDetailView } from './components/InvoiceDetailView/invoiceDetailView';
import { CustomerStatement } from './components/CustomerStatement/CustomerStatement';
import '../styles/theme.css';
import './App.css';

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Check if user is already logged in
    useEffect(() => {
        const authStatus = localStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (username, password) => {
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
            case 'statements':
                return 'Customer Statements';
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
            case 'statements':
                return <CustomerStatement />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="app-main">
                <Header
                    title={getTitle()}
                    onLogout={handleLogout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
                <div className="app-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
