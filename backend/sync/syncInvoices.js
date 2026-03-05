import db from '../config/sqliteDb.js';
import Invoice from '../models/Invoice.js';

export const syncInvoices = async () => {

  const unsynced = db.prepare(`
    SELECT * FROM invoices WHERE synced = 0
  `).all();

  for (const inv of unsynced) {
    console.log(inv.uuid);
    // Check if invoice already exists in Mongo using UUID
    const existing = await Invoice.findOne({ uuid: inv.uuid });
    if (!existing) {
      // Create new Mongo record
      await Invoice.create({
        uuid: inv.uuid,
        pavatiNo: inv.pavatiNo,
        date: inv.date,
        customerName: inv.customerName,
        site: inv.site,
        vehicleNo: inv.vehicleNo,
        product: inv.product,
        quantity: inv.quantity,
        rate: inv.rate,
        amount: inv.amount,
        advance: inv.advance,
        balance: inv.balance,
        marfat: inv.marfat,
        remarks: inv.remarks,
        createdAt: inv.createdAt
      });
    } else {
      // Optional: update Mongo record if needed
      await Invoice.updateOne(
        { uuid: inv.uuid },
        {
          pavatiNo: inv.pavatiNo,
          date: inv.date,
          customerName: inv.customerName,
          site: inv.site,
          vehicleNo: inv.vehicleNo,
          product: inv.product,
          quantity: inv.quantity,
          rate: inv.rate,
          amount: inv.amount,
          advance: inv.advance,
          balance: inv.balance,
          marfat: inv.marfat,
          remarks: inv.remarks
        }
      );
    }

    // Mark as synced locally
    db.prepare(`
      UPDATE invoices SET synced = 1 WHERE uuid = ?
    `).run(inv.uuid);
  }

  console.log(`Invoices synced: ${unsynced.length}`);
};