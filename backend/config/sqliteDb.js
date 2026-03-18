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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT,
  synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  rate REAL NOT NULL,
  unit TEXT NOT NULL,
  minStock INTEGER,
  currentStock INTEGER,
  createdAt TEXT,
  updatedAt TEXT,
  synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  pavatiNo TEXT NOT NULL UNIQUE,
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
  PRIMARY KEY (category, setting_key)
);

`);

/* Export DB */
export default db;