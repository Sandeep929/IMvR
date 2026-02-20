import React from 'react';
import { LayoutDashboard, FileText, Users, Package, BarChart3, Settings } from 'lucide-react';
import './sidebar.css';

export function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'invoices', icon: FileText, label: 'Invoices' },
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'products', icon: Package, label: 'Products' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="sidebar-container">
            {/* Logo */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon-box">
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="4" width="28" height="6" fill="white" />
                            <rect x="2" y="13" width="28" height="6" fill="white" />
                            <rect x="2" y="22" width="28" height="6" fill="white" />
                        </svg>
                    </div>
                    <div className="logo-text">
                        <h1 className="logo-title">JC Bricks</h1>
                        <p className="logo-subtitle">Manufacturing</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-menu">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                            >
                                <Icon size={18} className="nav-icon" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="footer-content">
                    <p className="footer-text">Version 1.0.0</p>
                    <p className="footer-text">© 2026 JC Bricks</p>
                </div>
            </div>
        </div>
    );
}
