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
  synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  pavatiNo TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  customerName TEXT NOT NULL,
  site TEXT,
  vehicleNo TEXT,
  product TEXT NOT NULL,
  quantity REAL NOT NULL,
  rate REAL NOT NULL,
  amount REAL NOT NULL,
  advance REAL,
  balance REAL,
  marfat TEXT,
  remarks TEXT,
  createdAt TEXT,
  synced INTEGER DEFAULT 0
);

`);

/* Export DB */
export default db;