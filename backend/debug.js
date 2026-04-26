import Database from 'better-sqlite3';
import fs from 'fs';
const db = new Database('config/local.db');
const settings = db.prepare('SELECT * FROM settings').all();
const syncState = db.prepare('SELECT * FROM sync_state').all();
fs.writeFileSync('debug_output.json', JSON.stringify({settings, syncState}, null, 2));
