import db from '../config/sqliteDb.js';
import { v4 as uuidv4 } from 'uuid';

// ─── GET all expenses (non-deleted) ────────────────────────────────────────
export const getExpenses = (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT * FROM raw_material_expenses
            WHERE isDeleted = 0
            ORDER BY date DESC
        `).all();
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('getExpenses error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── CREATE expense ─────────────────────────────────────────────────────────
export const createExpense = (req, res) => {
    try {
        const { date, materialName, quantity, rate, supplier, notes } = req.body;
        if (!date || !materialName || !quantity || !rate) {
            return res.status(400).json({ success: false, message: 'date, materialName, quantity, and rate are required.' });
        }

        const totalCost = parseFloat(quantity) * parseFloat(rate);
        const now = new Date().toISOString();
        const uuid = uuidv4();

        db.prepare(`
            INSERT INTO raw_material_expenses
              (uuid, date, materialName, quantity, rate, supplier, totalCost, notes, createdAt, updatedAt, isDeleted, synced)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
        `).run(uuid, date, materialName, parseFloat(quantity), parseFloat(rate), supplier || null, totalCost, notes || null, now, now);

        // Upsert material master (update currentStock)
        const existing = db.prepare(`SELECT * FROM raw_materials WHERE name = ? AND isDeleted = 0`).get(materialName);
        if (existing) {
            db.prepare(`
                UPDATE raw_materials SET currentStock = currentStock + ?, updatedAt = ?, synced = 0 WHERE uuid = ?
            `).run(parseFloat(quantity), now, existing.uuid);
        } else {
            const matUuid = uuidv4();
            db.prepare(`
                INSERT INTO raw_materials (uuid, name, unit, currentStock, createdAt, updatedAt, isDeleted, synced)
                VALUES (?, ?, ?, ?, ?, ?, 0, 0)
            `).run(matUuid, materialName, 'units', parseFloat(quantity), now, now);
        }

        const created = db.prepare(`SELECT * FROM raw_material_expenses WHERE uuid = ?`).get(uuid);
        res.status(201).json({ success: true, data: created });
    } catch (err) {
        console.error('createExpense error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE expense ─────────────────────────────────────────────────────────
export const updateExpense = (req, res) => {
    try {
        const { id } = req.params;
        const { date, materialName, quantity, rate, supplier, notes } = req.body;

        const old = db.prepare(`SELECT * FROM raw_material_expenses WHERE uuid = ? AND isDeleted = 0`).get(id);
        if (!old) return res.status(404).json({ success: false, message: 'Expense not found.' });

        const newQty = quantity !== undefined ? parseFloat(quantity) : old.quantity;
        const newRate = rate !== undefined ? parseFloat(rate) : old.rate;
        const totalCost = newQty * newRate;
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE raw_material_expenses
            SET date = ?, materialName = ?, quantity = ?, rate = ?, supplier = ?, totalCost = ?, notes = ?, updatedAt = ?, synced = 0
            WHERE uuid = ?
        `).run(
            date || old.date,
            materialName || old.materialName,
            newQty, newRate, 
            supplier !== undefined ? supplier : old.supplier,
            totalCost,
            notes !== undefined ? notes : old.notes,
            now, id
        );

        // Adjust stock if quantity changed
        const qtyDiff = newQty - old.quantity;
        if (qtyDiff !== 0) {
            const matName = materialName || old.materialName;
            const mat = db.prepare(`SELECT * FROM raw_materials WHERE name = ? AND isDeleted = 0`).get(matName);
            if (mat) {
                db.prepare(`UPDATE raw_materials SET currentStock = currentStock + ?, updatedAt = ?, synced = 0 WHERE uuid = ?`)
                  .run(qtyDiff, now, mat.uuid);
            }
        }

        const updated = db.prepare(`SELECT * FROM raw_material_expenses WHERE uuid = ?`).get(id);
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('updateExpense error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── SOFT DELETE expense ────────────────────────────────────────────────────
export const deleteExpense = (req, res) => {
    try {
        const { id } = req.params;
        const now = new Date().toISOString();

        const expense = db.prepare(`SELECT * FROM raw_material_expenses WHERE uuid = ? AND isDeleted = 0`).get(id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });

        db.prepare(`UPDATE raw_material_expenses SET isDeleted = 1, updatedAt = ?, synced = 0 WHERE uuid = ?`).run(now, id);

        // Subtract from stock
        const mat = db.prepare(`SELECT * FROM raw_materials WHERE name = ? AND isDeleted = 0`).get(expense.materialName);
        if (mat) {
            db.prepare(`UPDATE raw_materials SET currentStock = MAX(0, currentStock - ?), updatedAt = ?, synced = 0 WHERE uuid = ?`)
              .run(expense.quantity, now, mat.uuid);
        }

        res.json({ success: true, message: 'Expense deleted.' });
    } catch (err) {
        console.error('deleteExpense error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── UPDATE current quantity (edit stock directly) ──────────────────────────
export const updateMaterialQuantity = (req, res) => {
    try {
        const { id } = req.params;
        const { currentStock } = req.body;
        if (currentStock === undefined) return res.status(400).json({ success: false, message: 'currentStock is required.' });

        const now = new Date().toISOString();
        // id here is the expense uuid — find the material by materialName
        const expense = db.prepare(`SELECT * FROM raw_material_expenses WHERE uuid = ? AND isDeleted = 0`).get(id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });

        const mat = db.prepare(`SELECT * FROM raw_materials WHERE name = ? AND isDeleted = 0`).get(expense.materialName);
        if (mat) {
            db.prepare(`UPDATE raw_materials SET currentStock = ?, updatedAt = ?, synced = 0 WHERE uuid = ?`)
              .run(parseFloat(currentStock), now, mat.uuid);
        }

        res.json({ success: true, message: 'Stock updated.' });
    } catch (err) {
        console.error('updateMaterialQuantity error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
export const getAnalytics = (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
        const end   = endDate   || new Date().toISOString().split('T')[0];

        // 1. Consumption trend — monthly qty per material
        const consumptionTrend = db.prepare(`
            SELECT
                strftime('%Y-%m', date) AS month,
                materialName,
                SUM(quantity) AS totalQty,
                SUM(totalCost) AS totalCost
            FROM raw_material_expenses
            WHERE isDeleted = 0 AND date BETWEEN ? AND ?
            GROUP BY month, materialName
            ORDER BY month ASC, totalQty DESC
        `).all(start, end);

        // 2. Cost increase alerts — compare avg rate this month vs last month (>=10% increase)
        const currentMonth  = new Date().toISOString().slice(0, 7);
        const prevMonthDate = new Date();
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const prevMonth = prevMonthDate.toISOString().slice(0, 7);

        const ratesCurrent = db.prepare(`
            SELECT materialName, AVG(rate) AS avgRate
            FROM raw_material_expenses
            WHERE isDeleted = 0 AND strftime('%Y-%m', date) = ?
            GROUP BY materialName
        `).all(currentMonth);

        const ratesPrev = db.prepare(`
            SELECT materialName, AVG(rate) AS avgRate
            FROM raw_material_expenses
            WHERE isDeleted = 0 AND strftime('%Y-%m', date) = ?
            GROUP BY materialName
        `).all(prevMonth);

        const prevRateMap = {};
        ratesPrev.forEach(r => { prevRateMap[r.materialName] = r.avgRate; });

        const costAlerts = ratesCurrent
            .filter(r => prevRateMap[r.materialName] && r.avgRate > prevRateMap[r.materialName] * 1.10)
            .map(r => ({
                materialName: r.materialName,
                currentAvgRate: parseFloat(r.avgRate.toFixed(2)),
                prevAvgRate: parseFloat(prevRateMap[r.materialName].toFixed(2)),
                increasePercent: parseFloat((((r.avgRate - prevRateMap[r.materialName]) / prevRateMap[r.materialName]) * 100).toFixed(1))
            }));

        // 3. Selling rate — material qty per order (using invoice_items quantity grouped by product + invoices count)
        const invoiceCount = db.prepare(`
            SELECT COUNT(*) AS cnt FROM invoices WHERE isDeleted = 0 AND date BETWEEN ? AND ?
        `).get(start, end);

        const totalOrdersInPeriod = invoiceCount?.cnt || 1;

        const materialTotals = db.prepare(`
            SELECT materialName, SUM(quantity) AS totalQty, SUM(totalCost) AS totalCost
            FROM raw_material_expenses
            WHERE isDeleted = 0 AND date BETWEEN ? AND ?
            GROUP BY materialName
            ORDER BY totalQty DESC
        `).all(start, end);

        const sellingRate = materialTotals.map(m => ({
            materialName: m.materialName,
            totalQty: m.totalQty,
            totalCost: m.totalCost,
            qtyPerOrder: parseFloat((m.totalQty / totalOrdersInPeriod).toFixed(3)),
            costPerOrder: parseFloat((m.totalCost / totalOrdersInPeriod).toFixed(2))
        }));

        // 4. Most consumed material
        const mostConsumed = materialTotals.length > 0 ? materialTotals[0] : null;

        // 5. Current stock levels
        const stockLevels = db.prepare(`
            SELECT name, unit, currentStock FROM raw_materials WHERE isDeleted = 0 ORDER BY name ASC
        `).all();

        res.json({
            success: true,
            data: {
                consumptionTrend,
                costAlerts,
                sellingRate,
                mostConsumed,
                stockLevels,
                totalOrders: totalOrdersInPeriod,
                period: { start, end }
            }
        });
    } catch (err) {
        console.error('getAnalytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
