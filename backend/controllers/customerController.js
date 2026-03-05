import db from '../config/sqliteDb.js';
import { v4 as uuidv4 } from 'uuid';

/* ===============================
   Get all customers (OFFLINE)
================================ */
export const getCustomers = (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT * FROM customers
      ORDER BY createdAt DESC
    `).all();

    res.json(customers);

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
      WHERE id = ?
    `).get(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);

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
        uuid, name, phone, email, address,
        createdAt, synced
      )
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    const result = stmt.run(
      uuid,
      req.body.name,
      req.body.phone,
      req.body.email,
      req.body.address,
      new Date().toISOString()
    );

    const newCustomer = db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newCustomer);

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
      SELECT * FROM customers WHERE id = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    db.prepare(`
      UPDATE customers SET
        name = ?, phone = ?, email = ?, address = ?,
        synced = 0
      WHERE id = ?
    `).run(
      req.body.name,
      req.body.phone,
      req.body.email,
      req.body.address,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT * FROM customers WHERE id = ?
    `).get(req.params.id);

    res.json(updated);

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
      SELECT * FROM customers WHERE id = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    db.prepare(`
      DELETE FROM customers WHERE id = ?
    `).run(req.params.id);

    res.json({ message: 'Customer deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};