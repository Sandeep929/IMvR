import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';

// Get dashboard stats — matches the Dashboard UI page
export const getDashboardStats = async (req, res) => {
    try {
        // Total revenue
        const invoices = await Invoice.find();
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

        // Outstanding balance
        const totalBalance = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);

        // Counts
        const totalInvoices = invoices.length;
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await Product.countDocuments();

        // Recent invoices (last 5)
        const recentInvoices = await Invoice.find()
            .sort({ date: -1 })
            .limit(5);

        // Monthly revenue (current month vs last month)
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const currentMonthInvoices = invoices.filter(inv =>
            new Date(inv.date) >= currentMonthStart
        );
        const lastMonthInvoices = invoices.filter(inv =>
            new Date(inv.date) >= lastMonthStart && new Date(inv.date) < currentMonthStart
        );

        const currentMonthRevenue = currentMonthInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

        const revenueGrowth = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : 0;

        res.json({
            totalRevenue,
            totalBalance,
            totalInvoices,
            totalCustomers,
            totalProducts,
            recentInvoices,
            currentMonthRevenue,
            lastMonthRevenue,
            revenueGrowth
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
