import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ─── Invoices ───────────────────────────────────────────
export const invoiceAPI = {
    getAll: () => api.get('/invoices'),
    getById: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`)
};

// ─── Customers ──────────────────────────────────────────
export const customerAPI = {
    getAll: () => api.get('/customers'),
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`)
};

// ─── Products ───────────────────────────────────────────
export const productAPI = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

// ─── Dashboard ──────────────────────────────────────────
export const dashboardAPI = {
    getStats: () => api.get('/dashboard')
};

// ─── Reports ────────────────────────────────────────────
export const reportAPI = {
    getData: (params) => api.get('/reports', { params }),
    getStatement: (params) => api.get('/reports/statement', { params }),
    getMasterData: (params) => api.get('/reports/master', { params })
};

// ─── Settings ─────────────────────────────────────────────
export const settingsAPI = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data) => api.post('/settings', data)
};

export default api;
