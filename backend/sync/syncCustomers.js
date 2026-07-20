import db from '../config/sqliteDb.js';
import Customer from '../models/Customer.js';

const safeDateISO = (d) => {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

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
          name: c.name || '',
          phone: c.phone || '',
          whatsappNumber: c.whatsappNumber || null,
          email: c.email || '',
          address: c.address || '',
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
          isDeleted: c.isDeleted === 1
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

    const localCount = db.prepare(`SELECT COUNT(*) as cnt FROM customers`).get();
    if (localCount.cnt === 0) {
      console.log('Customers table empty — forcing full pull from cloud...');
      lastSyncTime = new Date(0);
    }

    // Find customers modified in Mongo *after* our last sync time, or fallback to createdAt
    const updatedInCloud = await Customer.find({
      $or: [
        { updatedAt: { $gt: lastSyncTime } },
        { createdAt: { $gt: lastSyncTime } }
      ]
    });

    if (updatedInCloud.length > 0) {
      const insertOrUpdate = db.prepare(`
        INSERT INTO customers (uuid, name, phone, whatsappNumber, email, address, createdAt, updatedAt, isDeleted, synced)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(uuid) DO UPDATE SET
          name = excluded.name,
          phone = excluded.phone,
          whatsappNumber = excluded.whatsappNumber,
          email = excluded.email,
          address = excluded.address,
          createdAt = excluded.createdAt,
          updatedAt = excluded.updatedAt,
          isDeleted = excluded.isDeleted,
          synced = 1
      `);

      const transaction = db.transaction((customers) => {
        for (const c of customers) {
          if (!c.uuid) continue;
          insertOrUpdate.run(
            c.uuid, 
            c.name || '', 
            c.phone || '', 
            c.whatsappNumber || null,
            c.email || '', 
            c.address || '', 
            safeDateISO(c.createdAt),
            safeDateISO(c.updatedAt),
            c.isDeleted ? 1 : 0
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