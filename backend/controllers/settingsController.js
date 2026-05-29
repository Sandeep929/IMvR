import db from '../config/sqliteDb.js';
import { v4 as uuidv4 } from 'uuid';
import { sendOTP, verifyMailConfig, updateMailConfig } from '../config/mail.js';

// In-memory store for OTP and Password Reset Tokens
let currentOtpStore = null; 
let currentResetTokenStore = null;

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
      DO UPDATE SET setting_value = excluded.setting_value, updatedAt = CURRENT_TIMESTAMP, synced = 0
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

export const forgotPassword = async (req, res) => {
  try {
    const emailRow = db.prepare("SELECT setting_value FROM settings WHERE category = 'company' AND setting_key = 'email'").get();
    
    if (!emailRow || !emailRow.setting_value) {
      return res.status(400).json({ success: false, message: 'No registered company email found in settings.' });
    }

    const companyEmail = emailRow.setting_value;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    currentOtpStore = {
      code: otp,
      email: companyEmail,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    const mailResult = await sendOTP(companyEmail, otp);

    const [localPart, domain] = companyEmail.split('@');
    const maskedLocal = localPart.length > 3 
      ? localPart.slice(0, 3) + '*'.repeat(localPart.length - 3) 
      : localPart.slice(0, 1) + '*'.repeat(localPart.length - 1);
    const maskedEmail = `${maskedLocal}@${domain}`;

    res.json({ 
      success: true, 
      message: 'OTP has been sent to the registered email address.', 
      maskedEmail,
      mode: mailResult.mode 
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required.' });
    }

    if (!currentOtpStore) {
      return res.status(400).json({ success: false, message: 'No OTP request found. Please request a new OTP.' });
    }

    if (Date.now() > currentOtpStore.expiresAt) {
      currentOtpStore = null;
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (currentOtpStore.code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }

    currentOtpStore = null;

    const resetToken = uuidv4();
    currentResetTokenStore = {
      token: resetToken,
      expiresAt: Date.now() + 15 * 60 * 1000
    };

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }

    if (!currentResetTokenStore) {
      return res.status(400).json({ success: false, message: 'Reset session has expired or is invalid. Please request a new OTP.' });
    }

    if (Date.now() > currentResetTokenStore.expiresAt) {
      currentResetTokenStore = null;
      return res.status(400).json({ success: false, message: 'Reset session has expired. Please request a new OTP.' });
    }

    if (currentResetTokenStore.token !== resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid reset token. Please restart the forgot password process.' });
    }

    currentResetTokenStore = null;

    const stmt = db.prepare(`
      INSERT INTO settings (category, setting_key, setting_value) 
      VALUES ('user', 'password', ?) 
      ON CONFLICT(category, setting_key) 
      DO UPDATE SET setting_value = excluded.setting_value, updatedAt = CURRENT_TIMESTAMP, synced = 0
    `);
    
    stmt.run(newPassword);

    res.json({
      success: true,
      message: 'Password updated successfully. You can now log in.'
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmailSettings = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Gmail address and App password are required.' });
    }

    const verificationResult = await verifyMailConfig(email, password);
    if (!verificationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: `Gmail SMTP verification failed: ${verificationResult.message}. Please verify your Gmail ID and App Password, and ensure that SMTP connections are permitted.`
      });
    }

    await updateMailConfig({ email, password });

    res.json({
      success: true,
      message: 'Gmail settings verified and saved successfully to the system environment config.'
    });
  } catch (error) {
    console.error('updateEmailSettings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
