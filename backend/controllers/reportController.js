import db from '../config/sqliteDb.js';

/* Helper to prevent N+1 Queries */
const attachItemsAndPayments = (invoices, fetchPayments = true) => {
    if (invoices.length === 0) return invoices;
    
    const invoiceUuids = invoices.map(inv => inv.uuid);
    const itemsMap = {};
    const paymentsMap = {};
    const chunkSize = 500;

    for (let i = 0; i < invoiceUuids.length; i += chunkSize) {
        const chunk = invoiceUuids.slice(i, i + chunkSize);
        const placeholders = chunk.map(() => '?').join(',');
        
        const items = db.prepare(`SELECT * FROM invoice_items WHERE invoiceUuid IN (${placeholders})`).all(chunk);
        for (const item of items) {
            if (!itemsMap[item.invoiceUuid]) itemsMap[item.invoiceUuid] = [];
            itemsMap[item.invoiceUuid].push(item);
        }

        if (fetchPayments) {
            const payments = db.prepare(`SELECT * FROM invoice_payments WHERE invoiceUuid IN (${placeholders})`).all(chunk);
            for (const payment of payments) {
                if (!paymentsMap[payment.invoiceUuid]) paymentsMap[payment.invoiceUuid] = [];
                paymentsMap[payment.invoiceUuid].push(payment);
            }
        }
    }

    return invoices.map(inv => ({
        ...inv,
        items: itemsMap[inv.uuid] || [],
        ...(fetchPayments ? { payments: paymentsMap[inv.uuid] || [] } : {})
    }));
};

// Get report data — OFFLINE (SQLite)
export const getReportData = (req, res) => {
  try {

    /* ===============================
       Date windows from query param
    =============================== */

    const { days } = req.query;
    const daysInt  = days ? parseInt(days, 10) : null;

    // Current period start
    const now         = new Date();
    const periodStart = daysInt ? new Date(now.getTime() - daysInt * 86400000) : null;

    // Previous period window (equal length, immediately before current period)
    const prevStart   = daysInt ? new Date(now.getTime() - 2 * daysInt * 86400000) : null;
    const prevEnd     = periodStart; // exclusive upper bound


    /* ===============================
       Fetch current-period invoices
    =============================== */

    let query  = `SELECT * FROM invoices WHERE isDeleted = 0`;
    const params = [];

    if (periodStart) {
      query += ` AND date >= ?`;
      params.push(periodStart.toISOString());
    }

    query += ` ORDER BY date DESC`;
    const invoices = db.prepare(query).all(...params);

    const fullInvoices = attachItemsAndPayments(invoices, true);


    /* ===============================
       Fetch PREVIOUS period invoices (for comparison)
    =============================== */

    let prevInvoices = [];
    if (prevStart && prevEnd) {
      prevInvoices = db.prepare(`
        SELECT * FROM invoices
        WHERE isDeleted = 0 AND date >= ? AND date < ?
      `).all(prevStart.toISOString(), prevEnd.toISOString());
    }


    /* ===============================
       Monthly revenue data (for table)
    =============================== */

    const monthlyData = {};

    fullInvoices.forEach(inv => {
      const date = new Date(inv.date);
      const key  = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[key]) {
        monthlyData[key] = { month: key, revenue: 0, invoiceCount: 0 };
      }

      monthlyData[key].revenue      += inv.totalAmount || 0;
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
        customerData[name] = { name, totalAmount: 0, totalBalance: 0, invoiceCount: 0 };
      }
      customerData[name].totalAmount  += inv.totalAmount || 0;
      customerData[name].totalBalance += inv.balance     || 0;
      customerData[name].invoiceCount += 1;
    });

    const topCustomers = Object.values(customerData)
      .sort((a, b) => b.totalAmount - a.totalAmount);


    /* ===============================
       Product-wise breakdown
    =============================== */

    const productData = {};

    fullInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        const product = item.product;
        if (!productData[product]) {
          productData[product] = { name: product, totalQuantity: 0, totalAmount: 0, invoiceCount: 0 };
        }
        productData[product].totalQuantity += item.quantity || 0;
        productData[product].totalAmount   += item.amount   || 0;
        productData[product].invoiceCount  += 1;
      });
    });

    const productReport = Object.values(productData)
      .sort((a, b) => b.totalAmount - a.totalAmount);


    /* ===============================
       Current period summary
    =============================== */

    const totalRevenue   = fullInvoices.reduce((s, i) => s + (i.totalAmount  || 0), 0);
    const totalBalance   = fullInvoices.reduce((s, i) => s + (i.balance      || 0), 0);
    const totalCollected = fullInvoices.reduce((s, i) => s + (i.totalAdvance || 0), 0);
    const totalInvoices  = fullInvoices.length;
    const avgInvoiceVal  = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;


    /* ===============================
       Previous period summary + growth %
    =============================== */

    const prevRevenue   = prevInvoices.reduce((s, i) => s + (i.totalAmount  || 0), 0);
    const prevBalance   = prevInvoices.reduce((s, i) => s + (i.balance      || 0), 0);
    const prevCount     = prevInvoices.length;
    const prevAvgVal    = prevCount > 0 ? prevRevenue / prevCount : 0;

    const pct = (curr, prev) => {
      if (prev > 0)    return parseFloat(((curr - prev) / prev * 100).toFixed(1));
      if (curr > 0)    return 'new'; // no previous data
      return 0;
    };

    const revenueGrowth = pct(totalRevenue, prevRevenue);
    const invoiceGrowth = pct(totalInvoices, prevCount);
    const avgGrowth     = pct(avgInvoiceVal, prevAvgVal);

    const periodLabel     = daysInt ? `Last ${daysInt} days` : 'All time';
    const prevPeriodLabel = daysInt ? `Prev ${daysInt} days` : '';


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
        totalInvoices,
        avgInvoiceVal: Math.round(avgInvoiceVal),

        // Comparison
        revenueGrowth,
        invoiceGrowth,
        avgGrowth,
        prevRevenue,
        prevBalance,
        prevCount,
        periodLabel,
        prevPeriodLabel,
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

    let qEndDate = endDate;
    if (qEndDate && qEndDate.length === 10) {
      qEndDate += 'T23:59:59.999Z';
    }

    let query = `SELECT * FROM invoices WHERE customerName = ? AND isDeleted = 0`;
    const params = [customerName];

    if (startDate && endDate) {
      query += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, qEndDate);
    } else if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND date <= ?`;
      params.push(qEndDate);
    }

    query += ` ORDER BY date ASC`;

    const invoices = db.prepare(query).all(...params);

    if (invoices.length === 0) {
      return res.json({ 
        customerName, 
        lines: [], 
        summary: { totalBricks: 0, totalAmount: 0, deposit: 0, totalBalance: 0 } 
      });
    }

    let totalBricks = 0;
    let totalAmount = 0;
    let deposit = 0;
    let totalBalance = 0;

    const statementLines = [];

    const fullInvoices = attachItemsAndPayments(invoices, false);

    // Following the JC Bricks Manufacturing sample structure
    fullInvoices.forEach(inv => {
      const items = inv.items;
      
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
        site: inv.site,
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

    let query = `
      SELECT i.*, c.phone as customerPhone 
      FROM invoices i
      LEFT JOIN customers c ON i.customerName = c.name
      WHERE i.isDeleted = 0
    `;
    const params = [];
    const conditions = [];

    let qEndDate = endDate;
    if (qEndDate && qEndDate.length === 10) {
      qEndDate += 'T23:59:59.999Z';
    }

    if (customerName) {
      conditions.push(`i.customerName = ?`);
      params.push(customerName);
    }

    if (startDate && endDate) {
      conditions.push(`i.date BETWEEN ? AND ?`);
      params.push(startDate, qEndDate);
    } else if (startDate) {
      conditions.push(`i.date >= ?`);
      params.push(startDate);
    } else if (endDate) {
      conditions.push(`i.date <= ?`);
      params.push(qEndDate);
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ');
    }

    query += ` ORDER BY i.date DESC`;

    const invoices = db.prepare(query).all(...params);

    const masterData = attachItemsAndPayments(invoices, true);

    res.json(masterData);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};