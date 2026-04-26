import db from '../config/sqliteDb.js';
import Product from '../models/Product.js';
import { v4 as uuidv4 } from 'uuid';

export const syncProducts = async () => {
  // 1. PUSH: Local SQLite -> Cloud MongoDB
  const unsynced = db.prepare(`
    SELECT * FROM products WHERE synced = 0
  `).all();

  for (const p of unsynced) {
    let prodUuid = p.uuid;
    try {
      await Product.updateOne(
        { uuid: prodUuid },
        {
          uuid: prodUuid,
          name: p.name,
          category: p.category,
          description: p.description,
          rate: p.rate,
          unit: p.unit,
          minStock: p.minStock,
          currentStock: p.currentStock,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
          isDeleted: p.isDeleted === 1
        },
        { upsert: true }
      );

      db.prepare(`
        UPDATE products SET synced = 1 WHERE uuid = ?
      `).run(p.uuid);
    } catch (err) {
      console.error('Error pushing product:', p.uuid, err);
    }
  }

  if (unsynced.length > 0) console.log(`Products pushed to cloud: ${unsynced.length}`);

  // 2. PULL: Cloud MongoDB -> Local SQLite
  try {
    const stateRow = db.prepare(`SELECT lastSync FROM sync_state WHERE entity = 'products'`).get();
    let lastSyncTime = stateRow ? new Date(stateRow.lastSync) : new Date(0);

    const updatedInCloud = await Product.find({
      $or: [
        { updatedAt: { $gt: lastSyncTime } },
        { createdAt: { $gt: lastSyncTime } }
      ]
    });

    if (updatedInCloud.length > 0) {
      const insertOrUpdate = db.prepare(`
        INSERT INTO products (uuid, name, category, description, rate, unit, minStock, currentStock, createdAt, updatedAt, isDeleted, synced)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(uuid) DO UPDATE SET
          name = excluded.name,
          category = excluded.category,
          description = excluded.description,
          rate = excluded.rate,
          unit = excluded.unit,
          minStock = excluded.minStock,
          currentStock = excluded.currentStock,
          createdAt = excluded.createdAt,
          updatedAt = excluded.updatedAt,
          isDeleted = excluded.isDeleted,
          synced = 1
      `);

      const transaction = db.transaction((products) => {
        for (const p of products) {
          // Skip if missing UUID from Mongo
          if (!p.uuid) continue; 
          insertOrUpdate.run(
            p.uuid, p.name, p.category, p.description, p.rate, p.unit, p.minStock, p.currentStock,
            p.createdAt ? p.createdAt.toISOString() : null,
            p.updatedAt ? p.updatedAt.toISOString() : null,
            p.isDeleted ? 1 : 0
          );
        }
      });
      
      transaction(updatedInCloud);
      console.log(`Products pulled from cloud: ${updatedInCloud.length}`);

      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO sync_state (entity, lastSync) VALUES ('products', ?)
        ON CONFLICT(entity) DO UPDATE SET lastSync = excluded.lastSync
      `).run(now);
    }
  } catch (err) {
      console.error('Error pulling products:', err);
  }
};