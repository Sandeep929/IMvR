import db from '../config/sqliteDb.js';
import { v4 as uuidv4 } from 'uuid';
/* ===============================
   Get all invoices (OFFLINE)
================================ */
/* ===============================
   Get all invoices (OFFLINE)
================================ */
export const getInvoices = (req, res) => {
  try {
    const invoices = db.prepare(`
      SELECT * FROM invoices WHERE isDeleted = 0
      ORDER BY date DESC
    `).all();

    if (invoices.length === 0) {
      return res.json([]);
    }

    const invoiceUuids = invoices.map(inv => inv.uuid);
    
    const itemsMap = {};
    const paymentsMap = {};

    // SQLite has a limit on variables in IN clauses, so we chunk the queries
    const chunkSize = 500;
    for (let i = 0; i < invoiceUuids.length; i += chunkSize) {
      const chunk = invoiceUuids.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '?').join(',');
      
      const items = db.prepare(`SELECT * FROM invoice_items WHERE invoiceUuid IN (${placeholders})`).all(chunk);
      for (const item of items) {
        if (!itemsMap[item.invoiceUuid]) itemsMap[item.invoiceUuid] = [];
        itemsMap[item.invoiceUuid].push(item);
      }

      const payments = db.prepare(`SELECT * FROM invoice_payments WHERE invoiceUuid IN (${placeholders})`).all(chunk);
      for (const payment of payments) {
        if (!paymentsMap[payment.invoiceUuid]) paymentsMap[payment.invoiceUuid] = [];
        paymentsMap[payment.invoiceUuid].push(payment);
      }
    }

    const fullInvoices = invoices.map(invoice => {
      return { 
        ...invoice, 
        items: itemsMap[invoice.uuid] || [], 
        payments: paymentsMap[invoice.uuid] || [], 
        id: invoice.uuid, 
        _id: invoice.uuid 
      };
    });

    res.json(fullInvoices);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   Get single invoice by ID
================================ */
export const getInvoiceById = (req, res) => {
  try {
    const invoice = db.prepare(`
      SELECT * FROM invoices
      WHERE uuid = ? AND isDeleted = 0
    `).get(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const items = db.prepare('SELECT * FROM invoice_items WHERE invoiceUuid = ?').all(invoice.uuid);
    const payments = db.prepare('SELECT * FROM invoice_payments WHERE invoiceUuid = ?').all(invoice.uuid);

    res.json({ ...invoice, items, payments, id: invoice.uuid, _id: invoice.uuid });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   Create new invoice (OFFLINE)
================================ */
export const createInvoice = (req, res) => {
  const {
    pavatiNo, orderNo, date, customerName, customerPhone, site,
    vehicleNo, items, payments, totalAmount,
    totalAdvance, balance, marfat, remarks
  } = req.body;

  const uuid = uuidv4();

  try {
    const insertInvoice = db.prepare(`
      INSERT INTO invoices (
        uuid, pavatiNo, orderNo, date, customerName, customerPhone, site,
        vehicleNo, totalAmount, totalAdvance, balance, 
        marfat, remarks, createdAt, updatedAt, isDeleted, synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);

    const insertItem = db.prepare(`
      INSERT INTO invoice_items (invoiceUuid, product, quantity, rate, amount)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertPayment = db.prepare(`
      INSERT INTO invoice_payments (invoiceUuid, date, amount, method, remarks)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Use a transaction for atomicity
    const transaction = db.transaction(() => {
      insertInvoice.run(
        uuid, pavatiNo, orderNo, date, customerName, customerPhone, site,
        vehicleNo, totalAmount, totalAdvance, balance,
        marfat, remarks, new Date().toISOString(), new Date().toISOString()
      );

      if (items && Array.isArray(items)) {
        for (const item of items) {
          insertItem.run(uuid, item.product, item.quantity, item.rate, item.amount);
        }
      }

      if (payments && Array.isArray(payments)) {
        for (const payment of payments) {
          insertPayment.run(uuid, payment.date, payment.amount, payment.method, payment.remarks);
        }
      }
    });

    transaction();

    const newInvoice = db.prepare('SELECT * FROM invoices WHERE uuid = ?').get(uuid);
    const newItems = db.prepare('SELECT * FROM invoice_items WHERE invoiceUuid = ?').all(uuid);
    const newPayments = db.prepare('SELECT * FROM invoice_payments WHERE invoiceUuid = ?').all(uuid);

    res.status(201).json({ ...newInvoice, items: newItems, payments: newPayments, id: newInvoice.uuid, _id: newInvoice.uuid });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ===============================
   Update invoice (OFFLINE)
================================ */
export const updateInvoice = (req, res) => {
  const {
    pavatiNo, orderNo, date, customerName, customerPhone, site,
    vehicleNo, items, payments, totalAmount,
    totalAdvance, balance, marfat, remarks
  } = req.body;

  try {
    const existing = db.prepare('SELECT uuid FROM invoices WHERE uuid = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const uuid = existing.uuid;

    const updateInvoiceStmt = db.prepare(`
      UPDATE invoices SET
        pavatiNo = ?, orderNo = ?, date = ?, customerName = ?, customerPhone = ?,
        site = ?, vehicleNo = ?, totalAmount = ?,
        totalAdvance = ?, balance = ?, marfat = ?,
        remarks = ?, updatedAt = ?, synced = 0
      WHERE uuid = ?
    `);

    const deleteItems = db.prepare('DELETE FROM invoice_items WHERE invoiceUuid = ?');
    const insertItem = db.prepare(`
      INSERT INTO invoice_items (invoiceUuid, product, quantity, rate, amount)
      VALUES (?, ?, ?, ?, ?)
    `);

    const deletePayments = db.prepare('DELETE FROM invoice_payments WHERE invoiceUuid = ?');
    const insertPayment = db.prepare(`
      INSERT INTO invoice_payments (invoiceUuid, date, amount, method, remarks)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      updateInvoiceStmt.run(
        pavatiNo, orderNo, date, customerName, customerPhone, site,
        vehicleNo, totalAmount, totalAdvance, balance,
        marfat, remarks, new Date().toISOString(), req.params.id
      );

      // Re-insert items
      deleteItems.run(uuid);
      if (items && Array.isArray(items)) {
        for (const item of items) {
          insertItem.run(uuid, item.product, item.quantity, item.rate, item.amount);
        }
      }

      // Re-insert payments
      deletePayments.run(uuid);
      if (payments && Array.isArray(payments)) {
        for (const payment of payments) {
          insertPayment.run(uuid, payment.date, payment.amount, payment.method, payment.remarks);
        }
      }
    });

    transaction();

    const updated = db.prepare('SELECT * FROM invoices WHERE uuid = ?').get(req.params.id);
    const updatedItems = db.prepare('SELECT * FROM invoice_items WHERE invoiceUuid = ?').all(uuid);
    const updatedPayments = db.prepare('SELECT * FROM invoice_payments WHERE invoiceUuid = ?').all(uuid);

    res.json({ ...updated, items: updatedItems, payments: updatedPayments, id: updated.uuid, _id: updated.uuid });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ===============================
   Delete invoice (OFFLINE)
================================ */
export const deleteInvoice = (req, res) => {
  try {
    const existing = db.prepare('SELECT uuid FROM invoices WHERE uuid = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    db.prepare('UPDATE invoices SET isDeleted = 1, updatedAt = ?, synced = 0 WHERE uuid = ?').run(new Date().toISOString(), req.params.id);

    res.json({ message: 'Invoice deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
