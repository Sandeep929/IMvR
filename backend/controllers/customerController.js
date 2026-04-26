import db from '../config/sqliteDb.js';
import { v4 as uuidv4 } from 'uuid';

/* ===============================
   Get all customers (OFFLINE)
================================ */
export const getCustomers = (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT * FROM customers WHERE isDeleted = 0
      ORDER BY createdAt DESC
    `).all();

    const mapped = customers.map(c => ({ ...c, id: c.uuid, _id: c.uuid }));
    res.json(mapped);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   Get single customer by ID
================================ */
export const getCustomerById = (req, res) => {
  try {
    const customer = db.prepare(`
      SELECT * FROM customers
      WHERE uuid = ? AND isDeleted = 0
    `).get(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ ...customer, id: customer.uuid, _id: customer.uuid });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   Create new customer (OFFLINE)
================================ */
export const createCustomer = (req, res) => {
  try {

    const uuid = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO customers (
        uuid, name, phone, whatsappNumber, email, address,
        createdAt, updatedAt, isDeleted, synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);

    const result = stmt.run(
      uuid,
      req.body.name,
      req.body.phone,
      req.body.whatsappNumber || null,
      req.body.email,
      req.body.address,
      new Date().toISOString(),
      new Date().toISOString()
    );

    const newCustomer = db.prepare(`
      SELECT * FROM customers WHERE uuid = ?
    `).get(uuid);

    res.status(201).json({ ...newCustomer, id: newCustomer.uuid, _id: newCustomer.uuid });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ===============================
   Update customer (OFFLINE)
================================ */
export const updateCustomer = (req, res) => {
  try {

    const existing = db.prepare(`
      SELECT * FROM customers WHERE uuid = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    db.prepare(`
      UPDATE customers SET
        name = ?, phone = ?, whatsappNumber = ?, email = ?, address = ?,
        updatedAt = ?, synced = 0
      WHERE uuid = ?
    `).run(
      req.body.name,
      req.body.phone,
      req.body.whatsappNumber || null,
      req.body.email,
      req.body.address,
      new Date().toISOString(),
      req.params.id
    );

    const updated = db.prepare(`
      SELECT * FROM customers WHERE uuid = ?
    `).get(req.params.id);

    res.json({ ...updated, id: updated.uuid, _id: updated.uuid });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ===============================
   Delete customer (OFFLINE)
================================ */
export const deleteCustomer = (req, res) => {
  try {

    const existing = db.prepare(`
      SELECT * FROM customers WHERE uuid = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    db.prepare(`
      UPDATE customers SET isDeleted = 1, updatedAt = ?, synced = 0 WHERE uuid = ?
    `).run(new Date().toISOString(), req.params.id);

    res.json({ message: 'Customer deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};