import db from '../config/sqliteDb.js';
import Invoice from '../models/Invoice.js';

export const syncInvoices = async () => {
  // 1. PUSH: Local SQLite -> Cloud MongoDB
  const unsynced = db.prepare(`
    SELECT * FROM invoices WHERE synced = 0
  `).all();

  for (const inv of unsynced) {
    try {
      // Get relational items and payments
      const items = db.prepare('SELECT * FROM invoice_items WHERE invoiceUuid = ?').all(inv.uuid);
      const payments = db.prepare('SELECT * FROM invoice_payments WHERE invoiceUuid = ?').all(inv.uuid);

      // We save the full document to Mongo
      await Invoice.updateOne(
        { uuid: inv.uuid },
        {
          uuid: inv.uuid,
          pavatiNo: inv.pavatiNo,
          orderNo: inv.orderNo,
          date: inv.date,
          customerName: inv.customerName,
          site: inv.site,
          vehicleNo: inv.vehicleNo,
          items: items.map(i => ({ product: i.product, quantity: i.quantity, rate: i.rate, amount: i.amount })),
          payments: payments.map(p => ({ date: p.date, amount: p.amount, method: p.method, remarks: p.remarks })),
          totalAmount: inv.totalAmount,
          totalAdvance: inv.totalAdvance,
          balance: inv.balance,
          marfat: inv.marfat,
          remarks: inv.remarks,
          createdAt: inv.createdAt,
          updatedAt: inv.updatedAt
        },
        { upsert: true }
      );

      // Mark as synced locally
      db.prepare(`
        UPDATE invoices SET synced = 1 WHERE uuid = ?
      `).run(inv.uuid);
    } catch (err) {
      console.error('Error pushing invoice:', inv.uuid, err);
    }
  }

  if (unsynced.length > 0) console.log(`Invoices pushed to cloud: ${unsynced.length}`);

  // 2. PULL: Cloud MongoDB -> Local SQLite
  try {
    const stateRow = db.prepare(`SELECT lastSync FROM sync_state WHERE entity = 'invoices'`).get();
    let lastSyncTime = stateRow ? new Date(stateRow.lastSync) : new Date(0);

    const updatedInCloud = await Invoice.find({ updatedAt: { $gt: lastSyncTime } });

    if (updatedInCloud.length > 0) {
      const insertOrUpdateInvoice = db.prepare(`
        INSERT INTO invoices (
          uuid, pavatiNo, orderNo, date, customerName, site, vehicleNo,
          totalAmount, totalAdvance, balance, marfat, remarks, createdAt, updatedAt, synced
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(uuid) DO UPDATE SET
          pavatiNo = excluded.pavatiNo,
          orderNo = excluded.orderNo,
          date = excluded.date,
          customerName = excluded.customerName,
          site = excluded.site,
          vehicleNo = excluded.vehicleNo,
          totalAmount = excluded.totalAmount,
          totalAdvance = excluded.totalAdvance,
          balance = excluded.balance,
          marfat = excluded.marfat,
          remarks = excluded.remarks,
          createdAt = excluded.createdAt,
          updatedAt = excluded.updatedAt,
          synced = 1
      `);

      const deleteItems = db.prepare(`DELETE FROM invoice_items WHERE invoiceUuid = ?`);
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (invoiceUuid, product, quantity, rate, amount)
        VALUES (?, ?, ?, ?, ?)
      `);

      const deletePayments = db.prepare(`DELETE FROM invoice_payments WHERE invoiceUuid = ?`);
      const insertPayment = db.prepare(`
        INSERT INTO invoice_payments (invoiceUuid, date, amount, method, remarks)
        VALUES (?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction((invoicesFromCloud) => {
        for (const inv of invoicesFromCloud) {
          // 1. Insert/Update main invoice record
          insertOrUpdateInvoice.run(
            inv.uuid, inv.pavatiNo, inv.orderNo, 
            inv.date ? inv.date.toISOString() : null, 
            inv.customerName, inv.site, inv.vehicleNo, 
            inv.totalAmount || 0, inv.totalAdvance || 0, inv.balance || 0, 
            inv.marfat || '', inv.remarks || '', 
            inv.createdAt ? inv.createdAt.toISOString() : null,
            inv.updatedAt ? inv.updatedAt.toISOString() : null
          );

          // 2. Replace items
          deleteItems.run(inv.uuid);
          if (inv.items && inv.items.length > 0) {
            for (const item of inv.items) {
              insertItem.run(inv.uuid, item.product, item.quantity, item.rate, item.amount);
            }
          }

          // 3. Replace payments
          deletePayments.run(inv.uuid);
          if (inv.payments && inv.payments.length > 0) {
            for (const payment of inv.payments) {
              insertPayment.run(inv.uuid, payment.date ? payment.date.toISOString() : null, payment.amount, payment.method, payment.remarks);
            }
          }
        }
      });
      
      transaction(updatedInCloud);
      console.log(`Invoices pulled from cloud: ${updatedInCloud.length}`);

      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO sync_state (entity, lastSync) VALUES ('invoices', ?)
        ON CONFLICT(entity) DO UPDATE SET lastSync = excluded.lastSync
      `).run(now);
    }
  } catch (err) {
      console.error('Error pulling invoices:', err);
  }
};