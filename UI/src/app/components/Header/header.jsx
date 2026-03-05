import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import './header.css';

export function Header({ title, onLogout }) {
    const username = localStorage.getItem('username') || 'Admin';

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
