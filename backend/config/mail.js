import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Helper to get the transporter dynamically using current process.env values
const getTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
    }
    return null;
};

// Verifies Gmail/SMTP credentials using transporter.verify()
export const verifyMailConfig = async (email, password) => {
    const host = 'smtp.gmail.com';
    const port = 587;

    const testTransporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: {
            user: email,
            pass: password
        }
    });

    try {
        await testTransporter.verify();
        return { success: true };
    } catch (error) {
        console.error('[MAIL SERVICE CONFIG ERROR] Verification failed:', error.message);
        return { success: false, message: error.message };
    }
};

// Updates SMTP credentials in backend/.env file and process.env runtime
export const updateMailConfig = async ({ email, password }) => {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    const updates = {
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '587',
        SMTP_USER: email,
        SMTP_PASS: password
    };

    const lines = envContent.split(/\r?\n/);
    const updatedLines = [];
    const keysHandled = new Set();

    for (const line of lines) {
        const trimmed = line.trim();
        // If line is empty or is a comment, keep it
        if (!trimmed || trimmed.startsWith('#')) {
            updatedLines.push(line);
            continue;
        }

        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) {
            updatedLines.push(line);
            continue;
        }

        const key = trimmed.slice(0, eqIdx).trim();
        if (updates.hasOwnProperty(key)) {
            updatedLines.push(`${key}=${updates[key]}`);
            keysHandled.add(key);
        } else {
            updatedLines.push(line);
        }
    }

    // Add any key that wasn't already present in the .env file
    for (const [key, value] of Object.entries(updates)) {
        if (!keysHandled.has(key)) {
            updatedLines.push(`${key}=${value}`);
        }
    }

    fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');

    // Update active runtime process.env variables immediately
    for (const [key, value] of Object.entries(updates)) {
        process.env[key] = value;
    }

    return { success: true };
};

// Sends OTP via SMTP or console mock fallback
export const sendOTP = async (toEmail, otp) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #ef4444; text-align: center;">JC Bricks Manufacturing</h2>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin-bottom: 20px;" />
            <p>Hello,</p>
            <p>You requested a password reset for your JC Bricks administrator account.</p>
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your One-Time Password (OTP)</p>
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ef4444;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes and can only be used once.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">If you did not request this, please ignore this email or change your password if you suspect unauthorized access.</p>
        </div>
    `;

    const transporter = getTransporter();

    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"JC Bricks System" <${process.env.SMTP_USER}>`,
                to: toEmail,
                subject: "JC Bricks Admin Password Reset OTP",
                html: htmlContent
            });
            console.log(`[MAIL SERVICE] OTP sent to ${toEmail}`);
            return { success: true, mode: 'smtp' };
        } catch (error) {
            console.error(`[MAIL SERVICE ERROR] Failed to send email via SMTP: ${error.message}`);
            console.log(`\n===============================================\n[MAIL SERVICE FALLBACK] Sent OTP: ${otp} to ${toEmail}\n===============================================\n`);
            return { success: true, mode: 'fallback', error: error.message };
        }
    } else {
        console.log(`\n===============================================\n[MAIL SERVICE MOCK] Sent OTP: ${otp} to ${toEmail}\n===============================================\n`);
        return { success: true, mode: 'mock' };
    }
};
