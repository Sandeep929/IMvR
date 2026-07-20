import db from '../config/sqliteDb.js';
import Invoice from '../models/Invoice.js';

const safeDateISO = (d) => {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

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
          pavatiNo: inv.pavatiNo || '',
          orderNo: inv.orderNo || '',
          date: inv.date || new Date().toISOString(),
          customerName: inv.customerName || '',
          customerPhone: inv.customerPhone || '',
          site: inv.site || '',
          vehicleNo: inv.vehicleNo || '',
          items: items.map(i => ({ product: i.product || '', quantity: i.quantity || 0, rate: i.rate || 0, amount: i.amount || 0 })),
          payments: payments.map(p => ({ date: p.date || new Date().toISOString(), amount: p.amount || 0, method: p.method || '', remarks: p.remarks || '' })),
          totalAmount: inv.totalAmount || 0,
          totalAdvance: inv.totalAdvance || 0,
          balance: inv.balance || 0,
          marfat: inv.marfat || '',
          remarks: inv.remarks || '',
          createdAt: inv.createdAt || new Date().toISOString(),
          updatedAt: inv.updatedAt || new Date().toISOString(),
          isDeleted: inv.isDeleted === 1
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

    // If local table is empty, force full pull regardless of stored sync_state
    const localCount = db.prepare(`SELECT COUNT(*) as cnt FROM invoices`).get();
    if (localCount.cnt === 0) {
      console.log('Invoices table empty — forcing full pull from cloud...');
      lastSyncTime = new Date(0);
    }

    const updatedInCloud = await Invoice.find({
      $or: [
        { updatedAt: { $gt: lastSyncTime } },
        { createdAt: { $gt: lastSyncTime } }
      ]
    });

    if (updatedInCloud.length > 0) {
      const insertOrUpdateInvoice = db.prepare(`
        INSERT INTO invoices (
          uuid, pavatiNo, orderNo, date, customerName, customerPhone, site, vehicleNo,
          totalAmount, totalAdvance, balance, marfat, remarks, createdAt, updatedAt, isDeleted, synced
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(uuid) DO UPDATE SET
          pavatiNo = excluded.pavatiNo,
          orderNo = excluded.orderNo,
          date = excluded.date,
          customerName = excluded.customerName,
          customerPhone = excluded.customerPhone,
          site = excluded.site,
          vehicleNo = excluded.vehicleNo,
          totalAmount = excluded.totalAmount,
          totalAdvance = excluded.totalAdvance,
          balance = excluded.balance,
          marfat = excluded.marfat,
          remarks = excluded.remarks,
          createdAt = excluded.createdAt,
          updatedAt = excluded.updatedAt,
          isDeleted = excluded.isDeleted,
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
          if (!inv.uuid) continue;

          // 1. Insert/Update main invoice record
          insertOrUpdateInvoice.run(
            inv.uuid,
            inv.pavatiNo || '',
            inv.orderNo || '', 
            safeDateISO(inv.date), 
            inv.customerName || '',
            inv.customerPhone || '',
            inv.site || '',
            inv.vehicleNo || '', 
            inv.totalAmount || 0,
            inv.totalAdvance || 0,
            inv.balance || 0, 
            inv.marfat || '',
            inv.remarks || '', 
            safeDateISO(inv.createdAt),
            safeDateISO(inv.updatedAt),
            inv.isDeleted ? 1 : 0
          );

          // 2. Replace items
          deleteItems.run(inv.uuid);
          if (inv.items && inv.items.length > 0) {
            for (const item of inv.items) {
              insertItem.run(
                inv.uuid,
                item.product || '',
                item.quantity || 0,
                item.rate || 0,
                item.amount || 0
              );
            }
          }

          // 3. Replace payments
          deletePayments.run(inv.uuid);
          if (inv.payments && inv.payments.length > 0) {
            for (const payment of inv.payments) {
              insertPayment.run(
                inv.uuid,
                safeDateISO(payment.date),
                payment.amount || 0,
                payment.method || '',
                payment.remarks || ''
              );
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