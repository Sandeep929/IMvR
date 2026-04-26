import db from '../config/sqliteDb.js';
import { v4 as uuidv4 } from 'uuid';

/* ===============================
   Get all products (OFFLINE)
================================ */
export const getProducts = (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products WHERE isDeleted = 0
      ORDER BY createdAt DESC
    `).all();

    const mapped = products.map(p => ({ ...p, id: p.uuid, _id: p.uuid }));
    res.json(mapped);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   Get single product by ID
================================ */
export const getProductById = (req, res) => {
  try {
    const product = db.prepare(`
      SELECT * FROM products
      WHERE uuid = ? AND isDeleted = 0
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ ...product, id: product.uuid, _id: product.uuid });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   Create new product (OFFLINE)
================================ */
export const createProduct = (req, res) => {
  try {
    const uuid = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO products (
        uuid, name, category, description,
        rate, unit, minStock,
        currentStock, createdAt, updatedAt, isDeleted, synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);

    stmt.run(
      uuid,
      req.body.name,
      req.body.category,
      req.body.description,
      req.body.rate,
      req.body.unit,
      req.body.minStock || 0,
      req.body.currentStock || 0,
      new Date().toISOString(),
      new Date().toISOString()
    );

    const newProduct = db.prepare(`SELECT * FROM products WHERE uuid = ?`).get(uuid);
    res.status(201).json({ ...newProduct, id: newProduct.uuid, _id: newProduct.uuid });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ===============================
   Update product (OFFLINE)
================================ */
export const updateProduct = (req, res) => {
  try {

    const existing = db.prepare(`
      SELECT * FROM products WHERE uuid = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    db.prepare(`
      UPDATE products SET
        name = ?, category = ?, description = ?,
        rate = ?, unit = ?, minStock = ?,
        currentStock = ?, updatedAt = ?, synced = 0
      WHERE uuid = ?
    `).run(
      req.body.name,
      req.body.category,
      req.body.description,
      req.body.rate,
      req.body.unit,
      req.body.minStock || 0,
      req.body.currentStock || 0,
      new Date().toISOString(),
      req.params.id
    );

    const updated = db.prepare(`
      SELECT * FROM products WHERE uuid = ?
    `).get(req.params.id);

    res.json({ ...updated, id: updated.uuid, _id: updated.uuid });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ===============================
   Delete product (OFFLINE)
================================ */
export const deleteProduct = (req, res) => {
  try {

    const existing = db.prepare(`
      SELECT * FROM products WHERE uuid = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    db.prepare(`
      UPDATE products SET isDeleted = 1, updatedAt = ?, synced = 0 WHERE uuid = ?
    `).run(new Date().toISOString(), req.params.id);

    res.json({ message: 'Product deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};