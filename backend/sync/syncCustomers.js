import db from '../config/sqliteDb.js';
import Customer from '../models/Customer.js';

export const syncCustomers = async () => {

  const unsynced = db.prepare(`
    SELECT * FROM customers WHERE synced = 0
  `).all();

  for (const c of unsynced) {

    await Customer.updateOne(
      { uuid: c.uuid },
      {
        uuid: c.uuid,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        createdAt: c.createdAt
      },
      { upsert: true }
    );

    db.prepare(`
      UPDATE customers SET synced = 1 WHERE uuid = ?
    `).run(c.uuid);
  }

  console.log(`Customers synced: ${unsynced.length}`);
};