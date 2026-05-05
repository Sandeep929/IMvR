import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

/* Recreate __dirname for ES Modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Create database in config folder */
const dbPath = path.join(__dirname, 'local.db');

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
  pavatiNo TEXT NOT NULL,
  orderNo TEXT,
  date TEXT NOT NULL,
  customerName TEXT NOT NULL,
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
      INSERT INTO invoices_new SELECT * FROM invoices;
      DROP TABLE invoices;
      ALTER TABLE invoices_new RENAME TO invoices;
    `);
  }
} catch (err) {
  console.error("Failed to migrate invoices table:", err);
}

/* Export DB */
export default db;