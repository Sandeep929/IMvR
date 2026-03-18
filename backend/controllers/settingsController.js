import db from '../config/sqliteDb.js';

export const getSettings = (req, res) => {
  try {
    const settingsRows = db.prepare('SELECT * FROM settings').all();
    
    // Group settings by category for the frontend
    const config = {
      company: {},
      user: {},
      invoice: {},
      notifications: {}
    };

    settingsRows.forEach(row => {
      if (config[row.category]) {
        // Parse boolean strings back to booleans for notifications
        let val = row.setting_value;
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        
        config[row.category][row.setting_key] = val;
      }
    });

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = (req, res) => {
  try {
    const { category, settings } = req.body;

    if (!category || !settings) {
      return res.status(400).json({ message: 'Category and settings object required' });
    }

    const stmt = db.prepare(`
      INSERT INTO settings (category, setting_key, setting_value) 
      VALUES (?, ?, ?) 
      ON CONFLICT(category, setting_key) 
      DO UPDATE SET setting_value = excluded.setting_value, updatedAt = CURRENT_TIMESTAMP
    `);

    const updateTx = db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        // Convert booleans/objects to strings for simple key-value storage
        const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
        stmt.run(category, key, strVal);
      }
    });

    updateTx(settings);

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
