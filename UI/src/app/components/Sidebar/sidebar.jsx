import React from 'react';
import { LayoutDashboard, FileText, Users, Package, BarChart3, Settings } from 'lucide-react';
import './sidebar.css';
import logo from "../../../assets/Gemini_Generated_Image_98lfx498lfx498lf.png";

export function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'invoices', icon: FileText, label: 'Invoices' },
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'products', icon: Package, label: 'Products' },
        { id: 'statements', icon: FileText, label: 'Statements' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="sidebar-container">
            {/* Logo */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon-box">
                        <img src={logo} alt="logo" className='logo-img'/>
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
