import db from '../config/sqliteDb.js';

// Get report data — OFFLINE (SQLite)
export const getReportData = (req, res) => {
  try {

    /* ===============================
       Fetch invoices + items from SQLite
    =============================== */

    const invoices = db.prepare(`
      SELECT * FROM invoices
      ORDER BY date DESC
    `).all();

    // Attach items and payments to each invoice
    const fullInvoices = invoices.map(inv => {
      const items = db.prepare('SELECT * FROM invoice_items WHERE invoiceUuid = ?').all(inv.uuid);
      const payments = db.prepare('SELECT * FROM invoice_payments WHERE invoiceUuid = ?').all(inv.uuid);
      return { ...inv, items, payments };
    });


    /* ===============================
       Monthly revenue data
    =============================== */

    const monthlyData = {};

    fullInvoices.forEach(inv => {
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

      monthlyData[key].revenue += inv.totalAmount || 0;
      monthlyData[key].invoiceCount += 1;
    });

    const monthlyReport = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month));


    /* ===============================
       Top customers by revenue
    =============================== */

    const customerData = {};

    fullInvoices.forEach(inv => {
      const name = inv.customerName;

      if (!customerData[name]) {
        customerData[name] = {
          name,
          totalAmount: 0,
          totalBalance: 0,
          invoiceCount: 0
        };
      }

      customerData[name].totalAmount += inv.totalAmount || 0;
      customerData[name].totalBalance += inv.balance || 0;
      customerData[name].invoiceCount += 1;
    });

    const topCustomers = Object.values(customerData)
      .sort((a, b) => b.totalAmount - a.totalAmount);


    /* ===============================
       Product-wise breakdown (from invoice_items)
    =============================== */

    const productData = {};

    fullInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const product = item.product;

        if (!productData[product]) {
          productData[product] = {
            name: product,
            totalQuantity: 0,
            totalAmount: 0,
            invoiceCount: 0
          };
        }

        productData[product].totalQuantity += item.quantity || 0;
        productData[product].totalAmount += item.amount || 0;
        productData[product].invoiceCount += 1;
      });
    });

    const productReport = Object.values(productData)
      .sort((a, b) => b.totalAmount - a.totalAmount);


    /* ===============================
       Overall summary
    =============================== */

    const totalRevenue = fullInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || 0), 0
    );

    const totalBalance = fullInvoices.reduce(
      (sum, inv) => sum + (inv.balance || 0), 0
    );

    const totalCollected = fullInvoices.reduce(
      (sum, inv) => sum + (inv.totalAdvance || 0), 0
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
        totalInvoices: fullInvoices.length
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};