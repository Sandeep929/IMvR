import db from '../config/sqliteDb.js';

// Get dashboard stats — OFFLINE (SQLite)
export const getDashboardStats = (req, res) => {
  try {

    /* ===============================
       Fetch data from SQLite
    =============================== */

    const invoices = db.prepare(`
      SELECT * FROM invoices
    `).all();

    const totalCustomers = db.prepare(`
      SELECT COUNT(*) AS count FROM customers
    `).get().count;

    const totalProducts = db.prepare(`
      SELECT COUNT(*) AS count FROM products
    `).get().count;


    /* ===============================
       Revenue & Balance
    =============================== */

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + (inv.amount || 0), 0
    );

    const totalBalance = invoices.reduce(
      (sum, inv) => sum + (inv.balance || 0), 0
    );


    /* ===============================
       Counts
    =============================== */

    const totalInvoices = invoices.length;


    /* ===============================
       Recent invoices (last 5)
    =============================== */

    const recentInvoices = db.prepare(`
      SELECT * FROM invoices
      ORDER BY date DESC
      LIMIT 5
    `).all();


    /* ===============================
       Monthly Revenue
    =============================== */

    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );


    const currentMonthInvoices = invoices.filter(inv =>
      new Date(inv.date) >= currentMonthStart
    );

    const lastMonthInvoices = invoices.filter(inv =>
      new Date(inv.date) >= lastMonthStart &&
      new Date(inv.date) < currentMonthStart
    );


    const currentMonthRevenue = currentMonthInvoices.reduce(
      (sum, inv) => sum + (inv.amount || 0), 0
    );

    const lastMonthRevenue = lastMonthInvoices.reduce(
      (sum, inv) => sum + (inv.amount || 0), 0
    );


    const revenueGrowth =
      lastMonthRevenue > 0
        ? (
            (currentMonthRevenue - lastMonthRevenue) /
            lastMonthRevenue * 100
          ).toFixed(1)
        : 0;


    /* ===============================
       Response
    =============================== */

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