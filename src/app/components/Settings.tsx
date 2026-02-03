import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Save, User, Lock, Bell, Printer, Globe, DollarSign } from 'lucide-react';

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

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    paymentReminders: true,
    invoiceUpdates: false
  });

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Company information updated successfully');
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userSettings.newPassword !== userSettings.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    alert('User settings updated successfully');
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Invoice settings updated successfully');
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Notification preferences updated successfully');
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'user', label: 'User Account', icon: User },
    { id: 'invoice', label: 'Invoice Settings', icon: Printer },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="p-8 bg-slate-50">
      <div className="mb-6">
        <h3 className="text-lg text-slate-900 mb-1">System Settings</h3>
        <p className="text-sm text-slate-600">Manage your application configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h4 className="text-xs text-slate-600 uppercase tracking-wide">Settings</h4>
            </div>
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
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
        <div className="lg:col-span-3">
          {activeTab === 'company' && (
            <div className="bg-white border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-200">
                <h4 className="text-base text-slate-900">Company Information</h4>
                <p className="text-sm text-slate-600 mt-1">Update your company details and contact information</p>
              </div>
              <form onSubmit={handleCompanySubmit}>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Company Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Address <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                      required
                      rows={3}
                      className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyInfo.phone}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                        required
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={companyInfo.whatsapp}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, whatsapp: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                        required
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={companyInfo.gst}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, gst: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={companyInfo.website}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'user' && (
            <div className="bg-white border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-200">
                <h4 className="text-base text-slate-900">User Account</h4>
                <p className="text-sm text-slate-600 mt-1">Manage your account details and password</p>
              </div>
              <form onSubmit={handleUserSubmit}>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Username <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={userSettings.username}
                        onChange={(e) => setUserSettings({ ...userSettings, username: e.target.value })}
                        required
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        value={userSettings.email}
                        onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                        required
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h5 className="text-sm text-slate-900 mb-4">Change Password</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={userSettings.currentPassword}
                          onChange={(e) => setUserSettings({ ...userSettings, currentPassword: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={userSettings.newPassword}
                            onChange={(e) => setUserSettings({ ...userSettings, newPassword: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-700 mb-2">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={userSettings.confirmPassword}
                            onChange={(e) => setUserSettings({ ...userSettings, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="bg-white border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-200">
                <h4 className="text-base text-slate-900">Invoice Settings</h4>
                <p className="text-sm text-slate-600 mt-1">Configure invoice defaults and preferences</p>
              </div>
              <form onSubmit={handleInvoiceSubmit}>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Invoice Prefix
                      </label>
                      <input
                        type="text"
                        value={invoiceSettings.invoicePrefix}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Starting Number
                      </label>
                      <input
                        type="text"
                        value={invoiceSettings.startingNumber}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, startingNumber: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Default Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={invoiceSettings.taxRate}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, taxRate: e.target.value })}
                        step="0.01"
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={invoiceSettings.currency}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, currency: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Payment Terms (Days)
                      </label>
                      <input
                        type="number"
                        value={invoiceSettings.paymentTerms}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, paymentTerms: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Default Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={invoiceSettings.defaultRate}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, defaultRate: e.target.value })}
                        step="0.01"
                        className="w-full px-3 py-2.5 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-200">
                <h4 className="text-base text-slate-900">Notification Preferences</h4>
                <p className="text-sm text-slate-600 mt-1">Manage how you receive alerts and updates</p>
              </div>
              <form onSubmit={handleNotificationSubmit}>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200">
                    <div>
                      <p className="text-sm text-slate-900 mb-1">Email Notifications</p>
                      <p className="text-xs text-slate-600">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-checked:bg-slate-900 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200">
                    <div>
                      <p className="text-sm text-slate-900 mb-1">Low Stock Alerts</p>
                      <p className="text-xs text-slate-600">Get notified when stock is low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.lowStockAlerts}
                        onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-checked:bg-slate-900 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200">
                    <div>
                      <p className="text-sm text-slate-900 mb-1">Payment Reminders</p>
                      <p className="text-xs text-slate-600">Reminders for pending payments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.paymentReminders}
                        onChange={(e) => setNotifications({ ...notifications, paymentReminders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-checked:bg-slate-900 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200">
                    <div>
                      <p className="text-sm text-slate-900 mb-1">Invoice Updates</p>
                      <p className="text-xs text-slate-600">Notifications for invoice changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.invoiceUpdates}
                        onChange={(e) => setNotifications({ ...notifications, invoiceUpdates: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-checked:bg-slate-900 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Save size={18} />
                    Save Preferences
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
