import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/* Recreate __dirname for ES Modules — also works when bundled to CJS by esbuild */
// In CJS context (bundled), __dirname is available natively
// In native ESM, fall back to import.meta.url
const __dirname_compat = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

/* Use AppData path in packaged app, local path in dev */
const dbPath = process.env.USER_DATA_PATH
  ? path.join(process.env.USER_DATA_PATH, 'local.db')
  : path.join(__dirname_compat, 'local.db');

/* Create an automatic physical backup of the SQLite database on startup */
try {
  if (fs.existsSync(dbPath)) {
    const backupPath = dbPath + '.backup';
    fs.copyFileSync(dbPath, backupPath);
    console.log(`[Backup] SQLite database successfully backed up to: ${backupPath}`);
  }
} catch (err) {
  console.error('[Backup] Failed to auto-backup SQLite database:', err);
}

/* Open SQLite database */
const db = new Database(dbPath);

/* Create tables if not exist */
db.exec(`

CREATE TABLE IF NOT EXISTS customers (
  uuid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsappNumber TEXT,
  email TEXT,
  address TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT,
  isDeleted INTEGER DEFAULT 0,
  synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  uuid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  rate REAL NOT NULL,
  unit TEXT NOT NULL,
  minStock INTEGER,
  currentStock INTEGER,
  createdAt TEXT,
  updatedAt TEXT,
  isDeleted INTEGER DEFAULT 0,
  synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
  uuid TEXT PRIMARY KEY,
  customerUuid TEXT,
  pavatiNo TEXT NOT NULL,
  orderNo TEXT,
  date TEXT NOT NULL,
  customerName TEXT NOT NULL,
  customerPhone TEXT,
  site TEXT,
  vehicleNo TEXT,
  totalAmount REAL NOT NULL DEFAULT 0,
  totalAdvance REAL NOT NULL DEFAULT 0,
  balance REAL NOT NULL DEFAULT 0,
  marfat TEXT,
  remarks TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  isDeleted INTEGER DEFAULT 0,
  synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoiceUuid TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity REAL NOT NULL,
  rate REAL NOT NULL,
  amount REAL NOT NULL,
  FOREIGN KEY (invoiceUuid) REFERENCES invoices (uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoice_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoiceUuid TEXT NOT NULL,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  method TEXT,
  remarks TEXT,
  FOREIGN KEY (invoiceUuid) REFERENCES invoices (uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity TEXT UNIQUE NOT NULL,
  lastSync TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  category TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced INTEGER DEFAULT 0,
  PRIMARY KEY (category, setting_key)
);

CREATE TABLE IF NOT EXISTS raw_materials (
  uuid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT,
  currentStock REAL DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT,
  isDeleted INTEGER DEFAULT 0,
  synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS raw_material_expenses (
  uuid TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  materialName TEXT NOT NULL,
  quantity REAL NOT NULL,
  rate REAL NOT NULL,
  supplier TEXT,
  totalCost REAL NOT NULL,
  notes TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  isDeleted INTEGER DEFAULT 0,
  synced INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_customers_isDeleted ON customers(isDeleted);
CREATE INDEX IF NOT EXISTS idx_invoices_isDeleted ON invoices(isDeleted);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoiceUuid ON invoice_items(invoiceUuid);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoiceUuid ON invoice_payments(invoiceUuid);

`);

/* Simple migration to add missing columns */
const tables = ['customers', 'products', 'invoices'];
tables.forEach(table => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN updatedAt TEXT`);
  } catch (err) {
    // Ignore if column already exists
  }
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN createdAt TEXT`);
  } catch (err) {
    // Ignore if column already exists
  }
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN isDeleted INTEGER DEFAULT 0`);
  } catch (err) {
    // Ignore if column already exists
  }
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN isDeleted INTEGER DEFAULT 0`);
  } catch (err) {
    // Ignore if column already exists
  }
});

/* Specific migration for whatsappNumber */
try {
  db.exec(`ALTER TABLE customers ADD COLUMN whatsappNumber TEXT`);
} catch (err) {
  // Ignore if column already exists
}

/* Specific migration for customerPhone in invoices */
try {
  db.exec(`ALTER TABLE invoices ADD COLUMN customerPhone TEXT`);
} catch (err) {
  // Ignore if column already exists
}

/* Remove UNIQUE constraint from pavatiNo */
try {
  const invoicesTableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='invoices'").get();
  if (invoicesTableInfo && invoicesTableInfo.sql.includes('UNIQUE')) {
    console.log("Migrating invoices table to remove UNIQUE constraint on pavatiNo...");
    db.exec(`
      CREATE TABLE invoices_new (
        uuid TEXT PRIMARY KEY,
        pavatiNo TEXT NOT NULL,
        orderNo TEXT,
        date TEXT NOT NULL,
        customerName TEXT NOT NULL,
        customerPhone TEXT,
        site TEXT,
        vehicleNo TEXT,
        totalAmount REAL NOT NULL DEFAULT 0,
        totalAdvance REAL NOT NULL DEFAULT 0,
        balance REAL NOT NULL DEFAULT 0,
        marfat TEXT,
        remarks TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        isDeleted INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0
      );
      INSERT INTO invoices_new (
        uuid, customerUuid, pavatiNo, orderNo, date, customerName, customerPhone, site, vehicleNo,
        totalAmount, totalAdvance, balance, marfat, remarks, createdAt, updatedAt, isDeleted, synced
      )
      SELECT
        uuid, NULL, pavatiNo, orderNo, date, customerName, customerPhone, site, vehicleNo,
        totalAmount, totalAdvance, balance, marfat, remarks, createdAt, updatedAt, isDeleted, synced
      FROM invoices;
      DROP TABLE invoices;
      ALTER TABLE invoices_new RENAME TO invoices;
    `);
  }
} catch (err) {
  console.error("Failed to migrate invoices table:", err);
}

/* Specific migration for customerUuid in invoices */
try {
  db.exec(`ALTER TABLE invoices ADD COLUMN customerUuid TEXT`);
} catch (err) {
  // Ignore if column already exists
}

/* Self-healing migration: Link invoices to customers using name or phone number matching */
try {
  const unlinkedCount = db.prepare("SELECT COUNT(*) as cnt FROM invoices WHERE customerUuid IS NULL").get();
  if (unlinkedCount && unlinkedCount.cnt > 0) {
    console.log(`[Migration] Found ${unlinkedCount.cnt} unlinked invoices. Attempting to match with customers...`);
    const customers = db.prepare('SELECT uuid, name, phone FROM customers').all();
    const updateStmt = db.prepare('UPDATE invoices SET customerUuid = ?, synced = 0 WHERE uuid = ?');
    
    db.transaction(() => {
      const unlinked = db.prepare('SELECT uuid, customerName, customerPhone FROM invoices WHERE customerUuid IS NULL').all();
      let linkedCount = 0;
      for (const inv of unlinked) {
        // 1. Match by exact name
        let matched = customers.find(c => c.name.trim().toLowerCase() === inv.customerName.trim().toLowerCase());
        
        // 2. Match by phone number if name didn't match (for edited names)
        if (!matched && inv.customerPhone) {
          const invPhones = inv.customerPhone.split(/[,/]/).map(p => p.trim()).filter(Boolean);
          for (const phone of invPhones) {
            matched = customers.find(c => {
              if (!c.phone) return false;
              const cPhones = c.phone.split(/[,/]/).map(p => p.trim()).filter(Boolean);
              return cPhones.some(cp => cp === phone || cp.includes(phone) || phone.includes(cp));
            });
            if (matched) break;
          }
        }

        if (matched) {
          updateStmt.run(matched.uuid, inv.uuid);
          linkedCount++;
        }
      }
      console.log(`[Migration] Successfully linked ${linkedCount} out of ${unlinked.length} invoices to customer records.`);
    })();
  }
} catch (err) {
  console.error('[Migration] Error running invoice customerUuid linking migration:', err);
}

/* Migration: Update vehicle number from MP 09 HA 1284 / MP 09 ha 1284 to MP 41 HA 1284 */
try {
  const targetOldVehicles = ['MP 09 ha 1284', 'MP 09 HA 1284'];
  const updateVehicleStmt = db.prepare(`
    UPDATE invoices
    SET vehicleNo = 'MP 41 HA 1284',
        synced = 0,
        updatedAt = ?
    WHERE vehicleNo = ?
  `);

  const selectVehicleStmt = db.prepare(`
    SELECT uuid FROM invoices WHERE vehicleNo = ?
  `);

  db.transaction(() => {
    let updatedCount = 0;
    const now = new Date().toISOString();
    for (const oldVeh of targetOldVehicles) {
      const records = selectVehicleStmt.all(oldVeh);
      if (records.length > 0) {
        const info = updateVehicleStmt.run(now, oldVeh);
        updatedCount += info.changes;
      }
    }
    if (updatedCount > 0) {
      console.log(`[Migration] Updated ${updatedCount} invoice records: vehicle number changed from MP 09 HA 1284 to MP 41 HA 1284.`);
    }
  })();
} catch (err) {
  console.error('[Migration] Failed to update vehicle numbers in database:', err);
}

/* Export DB */
export default db;