import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Save, User, Lock, Bell, Printer, Globe, DollarSign } from 'lucide-react';
import { settingsAPI } from '../../../services/api';
import './settings.css';

export function Settings() {
    const [activeTab, setActiveTab] = useState('company');
    const [companyInfo, setCompanyInfo] = useState({
        name: 'JC Bricks Manufacturing',
        address: 'Village Bisnawda Dhar Road Indore-453001 (M.P.) India',
        phone: '9826305085, 9926777485',
        whatsapp: '9977175856',
        email: 'jcbricksmanufacturing@gmail.com',
        gst: 'GST123456789',
        website: 'www.jcbricks.com'
    });

    const [userSettings, setUserSettings] = useState({
        username: 'admin',
        email: 'admin@jcbricks.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [invoiceSettings, setInvoiceSettings] = useState({
        invoicePrefix: 'INV',
        startingNumber: '1001',
        taxRate: '18',
        currency: 'INR',
        paymentTerms: '30',
        defaultRate: '6.8'
    });

    const [gmailConfig, setGmailConfig] = useState({
        email: '',
        password: ''
    });
    const [isSavingGmail, setIsSavingGmail] = useState(false);
    const [gmailError, setGmailError] = useState('');
    const [gmailSuccess, setGmailSuccess] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await settingsAPI.getSettings();
            const data = res.data;
            if (data.company && Object.keys(data.company).length > 0) {
                setCompanyInfo(prev => ({ ...prev, ...data.company }));
                setGmailConfig(prev => ({ ...prev, email: data.company.email || '' }));
            }
            if (data.user && Object.keys(data.user).length > 0) setUserSettings(prev => ({ ...prev, ...data.user }));
            if (data.invoice && Object.keys(data.invoice).length > 0) setInvoiceSettings(prev => ({ ...prev, ...data.invoice }));
        } catch (err) {
            console.error('Failed to load settings:', err);
        }
    };

    const handleGmailSubmit = async (e) => {
        e.preventDefault();
        setGmailError('');
        setGmailSuccess('');
        setIsSavingGmail(true);
        try {
            const res = await settingsAPI.updateEmailSettings(gmailConfig);
            if (res.data && res.data.success) {
                setGmailSuccess('Gmail SMTP settings verified and saved successfully.');
                setGmailConfig(prev => ({ ...prev, password: '' })); // Clear password field
            } else {
                setGmailError(res.data?.message || 'Failed to verify and save Gmail settings.');
            }
        } catch (err) {
            setGmailError(err.response?.data?.message || 'Gmail SMTP verification failed. Please verify your Gmail ID and App Password.');
        } finally {
            setIsSavingGmail(false);
        }
    };

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const showNotification = (type, text) => {
        if (type === 'success') {
            setSuccessMessage(text);
            setErrorMessage('');
            setTimeout(() => setSuccessMessage(''), 4000);
        } else {
            setErrorMessage(text);
            setSuccessMessage('');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleSaveSettings = async (category, settings) => {
        try {
            await settingsAPI.updateSettings({ category, settings });
            showNotification('success', `${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`);
        } catch (err) {
            showNotification('error', `Failed to save ${category} settings`);
            console.error(err);
        }
    };

    const handleCompanySubmit = (e) => {
        e.preventDefault();
        handleSaveSettings('company', companyInfo);
        localStorage.setItem('companySettings', JSON.stringify(companyInfo));
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        if (userSettings.newPassword && userSettings.newPassword !== userSettings.confirmPassword) {
            showNotification('error', 'New passwords do not match');
            return;
        }
        
        const updatedSettings = { ...userSettings };
        if (userSettings.newPassword) {
            updatedSettings.password = userSettings.newPassword;
        } else if (!updatedSettings.password && userSettings.currentPassword) {
            updatedSettings.password = userSettings.currentPassword;
        }
        
        updatedSettings.currentPassword = '';
        updatedSettings.newPassword = '';
        updatedSettings.confirmPassword = '';
        
        handleSaveSettings('user', updatedSettings);
    };

    const handleInvoiceSubmit = (e) => {
        e.preventDefault();
        handleSaveSettings('invoice', invoiceSettings);
    };

    const tabs = [
        { id: 'company', label: 'Company Info', icon: Building2 },
        { id: 'user', label: 'User Account', icon: User },
        { id: 'invoice', label: 'Invoice Settings', icon: Printer },
        { id: 'email', label: 'Gmail Setup', icon: Mail }
    ];

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h3 className="settings-title">System Settings</h3>
                <p className="settings-subtitle">Manage your application configuration and preferences</p>
            </div>

            <div className="settings-layout">
                {/* Sidebar */}
                <div className="settings-sidebar">
                    <div className="sidebar-card">
                        <div className="sidebar-header">
                            <h4 className="sidebar-title">Settings</h4>
                        </div>
                        <nav className="sidebar-nav">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`nav-item ${activeTab === tab.id ? 'active' : 'inactive'}`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="settings-content">
                    {successMessage && (
                        <div className="settings-global-success" style={{
                            padding: '1rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            borderLeft: '4px solid #10b981',
                            marginBottom: '1.5rem',
                            borderRadius: '0.25rem',
                            color: '#065f46',
                            fontSize: '0.875rem'
                        }}>
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="settings-global-error" style={{
                            padding: '1rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            borderLeft: '4px solid #ef4444',
                            marginBottom: '1.5rem',
                            borderRadius: '0.25rem',
                            color: '#991b1b',
                            fontSize: '0.875rem'
                        }}>
                            {errorMessage}
                        </div>
                    )}
                    {activeTab === 'company' && (
                        <div className="content-card">
                            <div className="content-header">
                                <h4 className="content-title">Company Information</h4>
                                <p className="content-subtitle">Update your company details and contact information</p>
                            </div>
                            <form onSubmit={handleCompanySubmit}>
                                <div className="settings-form-body">
                                    <div className="form-group-stack">
                                        <div>
                                            <label className="form-label">
                                                Company Name <span className="required-star">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={companyInfo.name}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                                                required
                                                className="settings-input"
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label">
                                                Address <span className="required-star">*</span>
                                            </label>
                                            <textarea
                                                value={companyInfo.address}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                                                required
                                                rows={3}
                                                className="settings-textarea"
                                            />
                                        </div>

                                        <div className="form-row-2">
                                            <div>
                                                <label className="form-label">
                                                    Phone Number <span className="required-star">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={companyInfo.phone}
                                                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                                                    required
                                                    className="settings-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">
                                                    WhatsApp Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={companyInfo.whatsapp}
                                                    onChange={(e) => setCompanyInfo({ ...companyInfo, whatsapp: e.target.value })}
                                                    className="settings-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row-2">
                                            <div>
                                                <label className="form-label">
                                                    Email Address <span className="required-star">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={companyInfo.email}
                                                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                                                    required
                                                    className="settings-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">
                                                    GST Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={companyInfo.gst}
                                                    onChange={(e) => setCompanyInfo({ ...companyInfo, gst: e.target.value })}
                                                    className="settings-input"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label">
                                                Website
                                            </label>
                                            <input
                                                type="text"
                                                value={companyInfo.website}
                                                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                                                className="settings-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="settings-form-footer">
                                    <button
                                        type="submit"
                                        className="save-btn"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'user' && (
                        <div className="content-card">
                            <div className="content-header">
                                <h4 className="content-title">User Account</h4>
                                <p className="content-subtitle">Manage your account details and password</p>
                            </div>
                            <form onSubmit={handleUserSubmit}>
                                <div className="settings-form-body">
                                    <div className="form-row-2">
                                        <div>
                                            <label className="form-label">
                                                Username <span className="required-star">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={userSettings.username}
                                                onChange={(e) => setUserSettings({ ...userSettings, username: e.target.value })}
                                                required
                                                className="settings-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">
                                                Email Address <span className="required-star">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={userSettings.email}
                                                onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                                                required
                                                className="settings-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="password-section">
                                        <h5 className="password-section-title">Change Password</h5>
                                        <div className="form-group-stack">
                                            <div>
                                                <label className="form-label">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={userSettings.currentPassword}
                                                    onChange={(e) => setUserSettings({ ...userSettings, currentPassword: e.target.value })}
                                                    className="settings-input"
                                                />
                                            </div>
                                            <div className="form-row-2">
                                                <div>
                                                    <label className="form-label">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={userSettings.newPassword}
                                                        onChange={(e) => setUserSettings({ ...userSettings, newPassword: e.target.value })}
                                                        className="settings-input"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={userSettings.confirmPassword}
                                                        onChange={(e) => setUserSettings({ ...userSettings, confirmPassword: e.target.value })}
                                                        className="settings-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="settings-form-footer">
                                    <button
                                        type="submit"
                                        className="save-btn"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'invoice' && (
                        <div className="content-card">
                            <div className="content-header">
                                <h4 className="content-title">Invoice Settings</h4>
                                <p className="content-subtitle">Configure invoice defaults and preferences</p>
                            </div>
                            <form onSubmit={handleInvoiceSubmit}>
                                <div className="settings-form-body">
                                    <div className="form-row-2">
                                        <div>
                                            <label className="form-label">
                                                Invoice Prefix
                                            </label>
                                            <input
                                                type="text"
                                                value={invoiceSettings.invoicePrefix}
                                                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                                                className="settings-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">
                                                Starting Number
                                            </label>
                                            <input
                                                type="text"
                                                value={invoiceSettings.startingNumber}
                                                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, startingNumber: e.target.value })}
                                                className="settings-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row-2">
                                        <div>
                                            <label className="form-label">
                                                Default Tax Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={invoiceSettings.taxRate}
                                                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, taxRate: e.target.value })}
                                                step="0.01"
                                                className="settings-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">
                                                Currency
                                            </label>
                                            <select
                                                value={invoiceSettings.currency}
                                                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, currency: e.target.value })}
                                                className="settings-select"
                                            >
                                                <option value="INR">INR (₹)</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row-2">
                                        <div>
                                            <label className="form-label">
                                                Payment Terms (Days)
                                            </label>
                                            <input
                                                type="number"
                                                value={invoiceSettings.paymentTerms}
                                                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, paymentTerms: e.target.value })}
                                                className="settings-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">
                                                Default Rate (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={invoiceSettings.defaultRate}
                                                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, defaultRate: e.target.value })}
                                                step="0.01"
                                                className="settings-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="settings-form-footer">
                                    <button
                                        type="submit"
                                        className="save-btn"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="content-card">
                            <div className="content-header">
                                <h4 className="content-title">Gmail SMTP Settings</h4>
                                <p className="content-subtitle">Configure system email to send OTP codes for password reset</p>
                            </div>
                            
                            {gmailError && (
                                <div className="settings-error-banner" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #ef4444', marginBottom: '1.5rem', borderRadius: '0.25rem', color: '#991b1b', fontSize: '0.875rem' }}>
                                    {gmailError}
                                </div>
                            )}

                            {gmailSuccess && (
                                <div className="settings-success-banner" style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', borderLeft: '4px solid #10b981', marginBottom: '1.5rem', borderRadius: '0.25rem', color: '#065f46', fontSize: '0.875rem' }}>
                                    {gmailSuccess}
                                </div>
                            )}

                            <form onSubmit={handleGmailSubmit}>
                                <div className="settings-form-body">
                                    <div className="form-group-stack">
                                        <div>
                                            <label className="form-label">
                                                Gmail Address <span className="required-star">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={gmailConfig.email}
                                                onChange={(e) => setGmailConfig({ ...gmailConfig, email: e.target.value })}
                                                required
                                                placeholder="example@gmail.com"
                                                className="settings-input"
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label">
                                                Gmail App Password <span className="required-star">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={gmailConfig.password}
                                                onChange={(e) => setGmailConfig({ ...gmailConfig, password: e.target.value })}
                                                required
                                                placeholder="Enter 16-character App Password"
                                                className="settings-input"
                                            />
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                Note: For security reasons, do not use your regular account password. Generate a 16-character Google App Password in your Google Account security settings.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="settings-form-footer">
                                    <button
                                        type="submit"
                                        disabled={isSavingGmail}
                                        className="save-btn"
                                    >
                                        <Save size={18} />
                                        {isSavingGmail ? 'Verifying & Saving...' : 'Save & Verify Config'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
