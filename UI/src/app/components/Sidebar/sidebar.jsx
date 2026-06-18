import React from 'react';
import { LayoutDashboard, FileText, Users, Package, BarChart3, Settings, FlaskConical, X, Menu } from 'lucide-react';
import './sidebar.css';
import logo from "../../../assets/jc-bricks.png";
import packageJson from '../../../../package.json';

export function Sidebar({ activeTab, setActiveTab, isOpen, onClose, isCollapsed, onToggleCollapse }) {
    const companyInfo = JSON.parse(localStorage.getItem('companySettings') || '{}');
    const compNameRaw = companyInfo.name || 'JC Bricks Manufacturing';
    const compName = compNameRaw.replace(' Manufacturing', '') || 'JC Bricks';

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'invoices', icon: FileText, label: 'Invoices' },
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'products', icon: Package, label: 'Products' },
        { id: 'statements', icon: FileText, label: 'Statements' },
        { id: 'rawMaterials', icon: FlaskConical, label: 'Raw Materials' },
        { id: 'reports', icon: BarChart3, label: 'Reports' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className={`sidebar-container ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon-box">
                        <img src={logo} alt="logo" className='logo-img'/>
                    </div>
                    {!isCollapsed && (
                        <div className="logo-text">
                            <h1 className="logo-title">{compName}</h1>
                            <p className="logo-subtitle">Manufacturing</p>
                        </div>
                    )}
                </div>
                
                <div className="sidebar-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {onToggleCollapse && (
                        <button className="sidebar-burger-btn" onClick={onToggleCollapse} title="Toggle Sidebar">
                            <Menu size={20} />
                        </button>
                    )}
                    {onClose && (
                        <button className="sidebar-close-btn" onClick={onClose} title="Close Menu">
                            <X size={20} />
                        </button>
                    )}
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
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon size={18} className="nav-icon" />
                                {!isCollapsed && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="footer-content">
                    {isCollapsed ? (
                        <p className="footer-text" title={`Version ${packageJson.version || '1.0.0'}`}>V{packageJson.version || '1.0.0'}</p>
                    ) : (
                        <>
                            <p className="footer-text">Version {packageJson.version || '1.0.0'}</p>
                            <p className="footer-text">© {new Date().getFullYear()} {compName}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
