import db from '../config/sqliteDb.js';
import Product from '../models/Product.js';

export const syncProducts = async () => {

  const unsynced = db.prepare(`
    SELECT * FROM products WHERE synced = 0
  `).all();

  for (const p of unsynced) {

    await Product.create({
      name: p.name,
      category: p.category,
      description: p.description,
      rate: p.rate,
      unit: p.unit,
      minStock: p.minStock,
      currentStock: p.currentStock,
      createdAt: p.createdAt
    });

    db.prepare(`
      UPDATE products SET synced = 1 WHERE id = ?
    `).run(p.id);
  }

  console.log(`Products synced: ${unsynced.length}`);
};