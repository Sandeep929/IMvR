import db from '../config/sqliteDb.js';
import { v4 as uuidv4 } from 'uuid';
/* ===============================
   Get all invoices (OFFLINE)
================================ */
export const getInvoices = (req, res) => {
  try {
    const invoices = db.prepare(`
      SELECT * FROM invoices
      ORDER BY date DESC
    `).all();

    res.json(invoices);

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
      WHERE id = ?
    `).get(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   Create new invoice (OFFLINE)
================================ */
export const createInvoice = (req, res) => {
  try {

    const uuid = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO invoices (
        uuid, pavatiNo, date, customerName, site,
        vehicleNo, product, quantity, rate,
        amount, advance, balance, marfat,
        remarks, createdAt, synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const result = stmt.run(
      uuid,
      req.body.pavatiNo,
      req.body.date,
      req.body.customerName,
      req.body.site,
      req.body.vehicleNo,
      req.body.product,
      req.body.quantity,
      req.body.rate,
      req.body.amount,
      req.body.advance || 0,
      req.body.balance || 0,
      req.body.marfat || '',
      req.body.remarks,
      new Date().toISOString()
    );

    const newInvoice = db.prepare(`
      SELECT * FROM invoices WHERE uuid = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newInvoice);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ===============================
   Update invoice (OFFLINE)
================================ */
export const updateInvoice = (req, res) => {
  try {

    const existing = db.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    db.prepare(`
      UPDATE invoices SET
        pavatiNo = ?, date = ?, customerName = ?,
        site = ?, vehicleNo = ?, product = ?,
        quantity = ?, rate = ?, amount = ?,
        advance = ?, balance = ?, marfat = ?,
        remarks = ?, synced = 0
      WHERE id = ?
    `).run(
      req.body.pavatiNo,
      req.body.date,
      req.body.customerName,
      req.body.site,
      req.body.vehicleNo,
      req.body.product,
      req.body.quantity,
      req.body.rate,
      req.body.amount,
      req.body.advance || 0,
      req.body.balance || 0,
      req.body.marfat || '',
      req.body.remarks,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).get(req.params.id);

    res.json(updated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ===============================
   Delete invoice (OFFLINE)
================================ */
export const deleteInvoice = (req, res) => {
  try {

    const existing = db.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    db.prepare(`
      DELETE FROM invoices WHERE id = ?
    `).run(req.params.id);

    res.json({ message: 'Invoice deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};