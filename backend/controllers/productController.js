import db from '../config/sqliteDb.js';

/* ===============================
   Get all products (OFFLINE)
================================ */
export const getProducts = (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products
      ORDER BY createdAt DESC
    `).all();

    res.json(products);

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
      WHERE id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ===============================
   Create new product (OFFLINE)
================================ */
export const createProduct = (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO products (
        name, category, description,
        rate, unit, minStock,
        currentStock, createdAt, synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const result = stmt.run(
      req.body.name,
      req.body.category,
      req.body.description,
      req.body.rate,
      req.body.unit,
      req.body.minStock || 0,
      req.body.currentStock || 0,
      new Date().toISOString()
    );

    res.status(201).json({ id: result.lastInsertRowid });

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
      SELECT * FROM products WHERE id = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    db.prepare(`
      UPDATE products SET
        name = ?, category = ?, description = ?,
        rate = ?, unit = ?, minStock = ?,
        currentStock = ?, synced = 0
      WHERE id = ?
    `).run(
      req.body.name,
      req.body.category,
      req.body.description,
      req.body.rate,
      req.body.unit,
      req.body.minStock || 0,
      req.body.currentStock || 0,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT * FROM products WHERE id = ?
    `).get(req.params.id);

    res.json(updated);

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
      SELECT * FROM products WHERE id = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    db.prepare(`
      DELETE FROM products WHERE id = ?
    `).run(req.params.id);

    res.json({ message: 'Product deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};