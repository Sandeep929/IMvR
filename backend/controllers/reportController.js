import db from '../config/sqliteDb.js';

// Get report data — OFFLINE (SQLite)
export const getReportData = (req, res) => {
  try {

    /* ===============================
       Fetch invoices + items from SQLite
    =============================== */

    const { days } = req.query;

    let query = `SELECT * FROM invoices`;
    const params = [];

    if (days) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - parseInt(days, 10));
      query += ` WHERE date >= ?`;
      params.push(pastDate.toISOString());
    }

    query += ` ORDER BY date DESC`;
    const invoices = db.prepare(query).all(...params);

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

/* ===============================
   Get Customer Statement (Invoice Group)
=============================== */
export const getCustomerStatement = (req, res) => {
  try {
    const { customerName, startDate, endDate } = req.query;

    if (!customerName) {
      return res.status(400).json({ message: 'customerName is required' });
    }

    let query = `SELECT * FROM invoices WHERE customerName = ?`;
    const params = [customerName];

    if (startDate && endDate) {
      query += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY date ASC`;

    const invoices = db.prepare(query).all(...params);

    if (invoices.length === 0) {
      return res.json({ 
        customerName, 
        invoices: [], 
        summary: { totalBricks: 0, totalAmount: 0, deposit: 0, totalBalance: 0 } 
      });
    }

    let totalBricks = 0;
    let totalAmount = 0;
    let deposit = 0;
    let totalBalance = 0;

    const statementLines = [];

    // Following the JC Bricks Manufacturing sample structure
    invoices.forEach(inv => {
      const items = db.prepare('SELECT * FROM invoice_items WHERE invoiceUuid = ?').all(inv.uuid);
      
      let invBricks = 0;
      let invAmount = 0;
      
      const productLines = [];
      items.forEach(item => {
        // Assuming "Bricks" is the primary product, we sum the quantity
        invBricks += item.quantity;
        invAmount += item.amount;
        
        productLines.push({
          productDetail: item.product,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        });
      });

      // Based on the photo format, if there are multiple products per invoice, it might map to multiple lines.
      // Usually, there is 1 product type per Pavti in their business.
      const primaryProduct = productLines.length > 0 ? productLines[0].productDetail : 'Goods';
      const totalQuantity = productLines.reduce((sum, p) => sum + p.quantity, 0);

      statementLines.push({
        date: inv.date,
        productDetail: primaryProduct, // simplified to first product for the grid row
        quantity: totalQuantity,
        pavtiNo: inv.pavatiNo,
        rate: productLines.length > 0 ? productLines[0].rate : 0,
        totalAmount: inv.totalAmount > 0 ? inv.totalAmount : invAmount,
        advanceAmount: inv.totalAdvance || 0,
        balance: inv.balance || 0
      });

      totalBricks += totalQuantity;
      totalAmount += (inv.totalAmount > 0 ? inv.totalAmount : invAmount);
      deposit += (inv.totalAdvance || 0);
      totalBalance += (inv.balance || 0);
    });

    res.json({
      customerName,
      dateRange: { startDate, endDate },
      lines: statementLines,
      summary: {
        totalBricks,
        totalAmount,
        deposit,
        totalBalance // Note: totalBalance usually isn't just a sum of balances, it's totalAmount - deposit. We provide both to match UI calculation.
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   Get Master Data Download
=============================== */
export const getMasterData = (req, res) => {
  try {
    const { customerName, startDate, endDate } = req.query;

    let query = `SELECT * FROM invoices`;
    const params = [];
    const conditions = [];

    if (customerName) {
      conditions.push(`customerName = ?`);
      params.push(customerName);
    }

    if (startDate && endDate) {
      conditions.push(`date BETWEEN ? AND ?`);
      params.push(startDate, endDate);
    } else if (startDate) {
      conditions.push(`date >= ?`);
      params.push(startDate);
    } else if (endDate) {
      conditions.push(`date <= ?`);
      params.push(endDate);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY date DESC`;

    const invoices = db.prepare(query).all(...params);

    const masterData = invoices.map(inv => {
      const items = db.prepare('SELECT * FROM invoice_items WHERE invoiceUuid = ?').all(inv.uuid);
      const payments = db.prepare('SELECT * FROM invoice_payments WHERE invoiceUuid = ?').all(inv.uuid);
      return { ...inv, items, payments };
    });

    res.json(masterData);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};