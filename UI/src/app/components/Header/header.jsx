import React, { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, Sun, Moon, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import './header.css';

export function Header({ title, onLogout, theme, toggleTheme, onRefresh }) {
    const username = localStorage.getItem('username') || 'Admin';
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="header-container">
            <div className="header-content">
                <div className="header-title-section">
                    <h2 className="header-title">{title}</h2>
                    <p className="header-date">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        onClick={onRefresh}
                        className="theme-toggle-btn"
                        title="Refresh Data"
                        style={{ marginRight: '4px' }}
                    >
                        <RefreshCw size={18} />
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="theme-toggle-btn"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* <div className="search-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="search-input"
                        />
                    </div> */}

                    {/* <button className="notification-btn">
                        <Bell size={20} className="notification-icon" />
                        <span className="notification-badge"></span>
                    </button> */}

                    <div 
                        className="online-indicator" 
                        title={isOnline ? 'System is online and syncing' : 'System is offline - changes saved locally'}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            marginRight: '12px', 
                            padding: '6px 10px',
                            borderRadius: '20px',
                            backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isOnline ? '#10b981' : '#ef4444',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>

                    <div className="user-profile">
                        <div className="user-avatar">
                            <User size={18} className="user-icon" />
                        </div>
                        <div className="user-info">
                            <p className="user-name">{username}</p>
                            <p className="user-role">Administrator</p>
                        </div>
                    </div>

                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="logout-btn"
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
