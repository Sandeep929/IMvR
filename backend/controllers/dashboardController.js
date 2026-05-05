import db from '../config/sqliteDb.js';

// Get dashboard stats — OFFLINE (SQLite)
export const getDashboardStats = (req, res) => {
  try {

    /* ===============================
       Fetch all active invoices
    =============================== */

    const allInvoices = db.prepare(`
      SELECT * FROM invoices WHERE isDeleted = 0
    `).all();

    const totalCustomers = db.prepare(`
      SELECT COUNT(*) AS count FROM customers WHERE isDeleted = 0
    `).get().count;

    const totalProducts = db.prepare(`
      SELECT COUNT(*) AS count FROM products WHERE isDeleted = 0
    `).get().count;


    /* ===============================
       All-time totals (for secondary cards)
    =============================== */

    const allTimeRevenue  = allInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const allTimeQuantity = 0; // computed in frontend from invoiceAPI


    /* ===============================
       Month boundaries
    =============================== */

    const now              = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthInvoices = allInvoices.filter(inv =>
      new Date(inv.date) >= currentMonthStart
    );

    const lastMonthInvoices = allInvoices.filter(inv => {
      const d = new Date(inv.date);
      return d >= lastMonthStart && d < currentMonthStart;
    });


    /* ===============================
       Current month KPIs
    =============================== */

    const currentMonthRevenue  = currentMonthInvoices.reduce((s, i) => s + (i.totalAmount  || 0), 0);
    const currentMonthAdvance  = currentMonthInvoices.reduce((s, i) => s + (i.totalAdvance || 0), 0);
    const currentMonthBalance  = currentMonthInvoices.reduce((s, i) => s + (i.balance      || 0), 0);
    const currentMonthCount    = currentMonthInvoices.length;
    const currentMonthPaid     = currentMonthInvoices.filter(i => (i.balance || 0) === 0).length;


    /* ===============================
       Last month KPIs (full month — for comparison)
    =============================== */

    const lastMonthRevenue  = lastMonthInvoices.reduce((s, i) => s + (i.totalAmount  || 0), 0);
    const lastMonthAdvance  = lastMonthInvoices.reduce((s, i) => s + (i.totalAdvance || 0), 0);
    const lastMonthBalance  = lastMonthInvoices.reduce((s, i) => s + (i.balance      || 0), 0);
    const lastMonthCount    = lastMonthInvoices.length;


    /* ===============================
       Growth % helpers (current month vs full last month)
    =============================== */

    const pct = (current, last) => {
      if (last > 0)    return parseFloat(((current - last) / last * 100).toFixed(1));
      if (current > 0) return 'new'; // no previous data — not a % comparison
      return 0;
    };

    const revenueGrowth  = pct(currentMonthRevenue, lastMonthRevenue);
    const advanceGrowth  = pct(currentMonthAdvance,  lastMonthAdvance);
    const balanceGrowth  = pct(currentMonthBalance,  lastMonthBalance);
    const invoiceGrowth  = pct(currentMonthCount,    lastMonthCount);


    /* ===============================
       Recent invoices (last 5)
    =============================== */

    const recentInvoices = db.prepare(`
      SELECT * FROM invoices WHERE isDeleted = 0
      ORDER BY date DESC LIMIT 5
    `).all().map(inv => {
      const items    = db.prepare('SELECT * FROM invoice_items    WHERE invoiceUuid = ?').all(inv.uuid);
      const payments = db.prepare('SELECT * FROM invoice_payments WHERE invoiceUuid = ?').all(inv.uuid);
      return { ...inv, items, payments };
    });


    /* ===============================
       Response
    =============================== */

    res.json({
      // ── Monthly KPIs (main 4 cards) ──────────────────
      totalRevenue : currentMonthRevenue,
      totalAdvance : currentMonthAdvance,
      totalBalance : currentMonthBalance,
      totalInvoices: currentMonthCount,
      currentMonthPaid,

      // ── Growth vs full previous month ─────────────────
      revenueGrowth,
      advanceGrowth,
      balanceGrowth,
      invoiceGrowth,

      // ── Previous month (for tooltip / reference) ──────
      lastMonthRevenue,
      lastMonthAdvance,
      lastMonthBalance,
      lastMonthCount,

      // ── All-time / contextual ─────────────────────────
      allTimeRevenue,
      totalCustomers,
      totalProducts,
      recentInvoices,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};