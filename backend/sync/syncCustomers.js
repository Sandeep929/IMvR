import db from '../config/sqliteDb.js';
import Customer from '../models/Customer.js';

export const syncCustomers = async () => {
  // 1. PUSH: Local SQLite -> Cloud MongoDB
  const unsynced = db.prepare(`
    SELECT * FROM customers WHERE synced = 0
  `).all();

  for (const c of unsynced) {
    try {
      await Customer.updateOne(
        { uuid: c.uuid },
        {
          uuid: c.uuid,
          name: c.name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        },
        { upsert: true }
      );

      db.prepare(`
        UPDATE customers SET synced = 1 WHERE uuid = ?
      `).run(c.uuid);
    } catch (err) {
      console.error('Error pushing customer:', c.uuid, err);
    }
  }

  if (unsynced.length > 0) console.log(`Customers pushed to cloud: ${unsynced.length}`);

  // 2. PULL: Cloud MongoDB -> Local SQLite
  try {
    // Get last sync time for customers
    const stateRow = db.prepare(`SELECT lastSync FROM sync_state WHERE entity = 'customers'`).get();
    let lastSyncTime = stateRow ? new Date(stateRow.lastSync) : new Date(0);

    // Find customers modified in Mongo *after* our last sync time
    const updatedInCloud = await Customer.find({ updatedAt: { $gt: lastSyncTime } });

    if (updatedInCloud.length > 0) {
      const insertOrUpdate = db.prepare(`
        INSERT INTO customers (uuid, name, phone, email, address, createdAt, updatedAt, synced)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(uuid) DO UPDATE SET
          name = excluded.name,
          phone = excluded.phone,
          email = excluded.email,
          address = excluded.address,
          createdAt = excluded.createdAt,
          updatedAt = excluded.updatedAt,
          synced = 1
      `);

      const transaction = db.transaction((customers) => {
        for (const c of customers) {
          insertOrUpdate.run(
            c.uuid, 
            c.name, 
            c.phone, 
            c.email, 
            c.address, 
            c.createdAt ? c.createdAt.toISOString() : null,
            c.updatedAt ? c.updatedAt.toISOString() : null
          );
        }
      });
      
      transaction(updatedInCloud);
      console.log(`Customers pulled from cloud: ${updatedInCloud.length}`);

      // Update sync state
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO sync_state (entity, lastSync) VALUES ('customers', ?)
        ON CONFLICT(entity) DO UPDATE SET lastSync = excluded.lastSync
      `).run(now);
    }
  } catch (err) {
      console.error('Error pulling customers:', err);
  }
};