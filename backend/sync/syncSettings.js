import db from '../config/sqliteDb.js';
import Setting from '../models/Setting.js';

export const syncSettings = async () => {
    // 1. PUSH: Local SQLite -> Cloud MongoDB
    const unsynced = db.prepare('SELECT * FROM settings WHERE synced = 0').all();
    
    for (const s of unsynced) {
        try {
            await Setting.updateOne(
                { category: s.category, key: s.setting_key },
                {
                    category: s.category,
                    key: s.setting_key,
                    value: s.setting_value,
                    updatedAt: s.updatedAt || new Date().toISOString()
                },
                { upsert: true }
            );

            db.prepare('UPDATE settings SET synced = 1 WHERE category = ? AND setting_key = ?').run(s.category, s.setting_key);
        } catch (err) {
            console.error('Error pushing setting:', s.category, s.setting_key, err);
        }
    }

    if (unsynced.length > 0) console.log(`Settings pushed to cloud: ${unsynced.length}`);
    
    // 2. PULL: Cloud MongoDB -> Local SQLite
    try {
        const stateRow = db.prepare(`SELECT lastSync FROM sync_state WHERE entity = 'settings'`).get();
        let lastSyncTime = stateRow ? new Date(stateRow.lastSync) : new Date(0);

        const updatedInCloud = await Setting.find({ 
            $or: [
                { updatedAt: { $gt: lastSyncTime } },
                { createdAt: { $gt: lastSyncTime } }
            ]
        });

        if (updatedInCloud.length > 0) {
            const stmt = db.prepare(`
                INSERT INTO settings (category, setting_key, setting_value, updatedAt, synced)
                VALUES (?, ?, ?, ?, 1)
                ON CONFLICT(category, setting_key) DO UPDATE SET
                    setting_value = excluded.setting_value,
                    updatedAt = excluded.updatedAt,
                    synced = 1
            `);
            
            const transaction = db.transaction((settingsObj) => {
                for (const c of settingsObj) {
                    stmt.run(
                        c.category, 
                        c.key, 
                        c.value, 
                        c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString()
                    );
                }
            });
            
            transaction(updatedInCloud);
            console.log(`Settings pulled from cloud: ${updatedInCloud.length}`);
            
            db.prepare(`
                INSERT INTO sync_state (entity, lastSync) VALUES ('settings', ?) 
                ON CONFLICT(entity) DO UPDATE SET lastSync = excluded.lastSync
            `).run(new Date().toISOString());
        }
    } catch (err) {
        console.error('Error pulling settings:', err);
    }
};
