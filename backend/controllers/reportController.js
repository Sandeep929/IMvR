import db from '../config/sqliteDb.js';

// Get report data — OFFLINE (SQLite)
export const getReportData = (req, res) => {
  try {

    /* ===============================
       Fetch invoices from SQLite
    =============================== */

    const invoices = db.prepare(`
      SELECT * FROM invoices
      ORDER BY date DESC
    `).all();


    /* ===============================
       Monthly revenue data
    =============================== */

    const monthlyData = {};

    invoices.forEach(inv => {
      const date = new Date(inv.date);

      const key =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: key,
          revenue: 0,
          invoiceCount: 0
        };
      }

      monthlyData[key].revenue += inv.amount || 0;
      monthlyData[key].invoiceCount += 1;
    });

    const monthlyReport = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month));


    /* ===============================
       Top customers by revenue
    =============================== */

    const customerData = {};

    invoices.forEach(inv => {
      const name = inv.customerName;

      if (!customerData[name]) {
        customerData[name] = {
          name,
          totalAmount: 0,
          totalBalance: 0,
          invoiceCount: 0
        };
      }

      customerData[name].totalAmount += inv.amount || 0;
      customerData[name].totalBalance += inv.balance || 0;
      customerData[name].invoiceCount += 1;
    });

    const topCustomers = Object.values(customerData)
      .sort((a, b) => b.totalAmount - a.totalAmount);


    /* ===============================
       Product-wise breakdown
    =============================== */

    const productData = {};

    invoices.forEach(inv => {
      const product = inv.product;

      if (!productData[product]) {
        productData[product] = {
          name: product,
          totalQuantity: 0,
          totalAmount: 0,
          invoiceCount: 0
        };
      }

      productData[product].totalQuantity += inv.quantity || 0;
      productData[product].totalAmount += inv.amount || 0;
      productData[product].invoiceCount += 1;
    });

    const productReport = Object.values(productData)
      .sort((a, b) => b.totalAmount - a.totalAmount);


    /* ===============================
       Overall summary
    =============================== */

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + (inv.amount || 0), 0
    );

    const totalBalance = invoices.reduce(
      (sum, inv) => sum + (inv.balance || 0), 0
    );

    const totalCollected = invoices.reduce(
      (sum, inv) => sum + (inv.advance || 0), 0
    );


    /* ===============================
       Response
    =============================== */

    res.json({
      monthlyReport,
      topCustomers,
      productReport,
      summary: {
        totalRevenue,
        totalBalance,
        totalCollected,
        totalInvoices: invoices.length
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};