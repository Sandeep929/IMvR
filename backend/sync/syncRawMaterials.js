import db from '../config/sqliteDb.js';
import RawMaterial from '../models/RawMaterial.js';
import RawMaterialExpense from '../models/RawMaterialExpense.js';

export const syncRawMaterials = async () => {

    // ── PUSH: Local SQLite → Cloud MongoDB ──────────────────────────────────

    // Push raw_materials master
    const unsyncedMaterials = db.prepare(`SELECT * FROM raw_materials WHERE synced = 0`).all();
    for (const m of unsyncedMaterials) {
        try {
            await RawMaterial.updateOne(
                { uuid: m.uuid },
                {
                    uuid: m.uuid,
                    name: m.name,
                    unit: m.unit || null,
                    currentStock: m.currentStock || 0,
                    createdAt: m.createdAt || new Date().toISOString(),
                    updatedAt: m.updatedAt || new Date().toISOString(),
                    isDeleted: m.isDeleted === 1
                },
                { upsert: true }
            );
            db.prepare(`UPDATE raw_materials SET synced = 1 WHERE uuid = ?`).run(m.uuid);
        } catch (err) {
            console.error('Error pushing raw_material:', m.uuid, err.message);
        }
    }
    if (unsyncedMaterials.length > 0) console.log(`Raw materials pushed to cloud: ${unsyncedMaterials.length}`);

    // Push raw_material_expenses
    const unsyncedExpenses = db.prepare(`SELECT * FROM raw_material_expenses WHERE synced = 0`).all();
    for (const e of unsyncedExpenses) {
        try {
            await RawMaterialExpense.updateOne(
                { uuid: e.uuid },
                {
                    uuid: e.uuid,
                    date: e.date,
                    materialName: e.materialName,
                    quantity: e.quantity,
                    rate: e.rate,
                    supplier: e.supplier || null,
                    totalCost: e.totalCost,
                    notes: e.notes || null,
                    createdAt: e.createdAt || new Date().toISOString(),
                    updatedAt: e.updatedAt || new Date().toISOString(),
                    isDeleted: e.isDeleted === 1
                },
                { upsert: true }
            );
            db.prepare(`UPDATE raw_material_expenses SET synced = 1 WHERE uuid = ?`).run(e.uuid);
        } catch (err) {
            console.error('Error pushing raw_material_expense:', e.uuid, err.message);
        }
    }
    if (unsyncedExpenses.length > 0) console.log(`Raw material expenses pushed to cloud: ${unsyncedExpenses.length}`);

    // ── PULL: Cloud MongoDB → Local SQLite ──────────────────────────────────

    // Pull raw_materials
    try {
        const matStateRow = db.prepare(`SELECT lastSync FROM sync_state WHERE entity = 'raw_materials'`).get();
        const matLastSync = matStateRow ? new Date(matStateRow.lastSync) : new Date(0);

        const cloudMaterials = await RawMaterial.find({
            $or: [
                { updatedAt: { $gt: matLastSync } },
                { createdAt: { $gt: matLastSync } }
            ]
        });

        if (cloudMaterials.length > 0) {
            const upsertMat = db.prepare(`
                INSERT INTO raw_materials (uuid, name, unit, currentStock, createdAt, updatedAt, isDeleted, synced)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                ON CONFLICT(uuid) DO UPDATE SET
                    name = excluded.name,
                    unit = excluded.unit,
                    currentStock = excluded.currentStock,
                    createdAt = excluded.createdAt,
                    updatedAt = excluded.updatedAt,
                    isDeleted = excluded.isDeleted,
                    synced = 1
            `);

            const txnMat = db.transaction((mats) => {
                for (const m of mats) {
                    upsertMat.run(
                        m.uuid, m.name, m.unit || null, m.currentStock || 0,
                        m.createdAt ? m.createdAt.toISOString() : null,
                        m.updatedAt ? m.updatedAt.toISOString() : null,
                        m.isDeleted ? 1 : 0
                    );
                }
            });
            txnMat(cloudMaterials);
            console.log(`Raw materials pulled from cloud: ${cloudMaterials.length}`);

            const now = new Date().toISOString();
            db.prepare(`
                INSERT INTO sync_state (entity, lastSync) VALUES ('raw_materials', ?)
                ON CONFLICT(entity) DO UPDATE SET lastSync = excluded.lastSync
            `).run(now);
        }
    } catch (err) {
        console.error('Error pulling raw_materials:', err.message);
    }

    // Pull raw_material_expenses
    try {
        const expStateRow = db.prepare(`SELECT lastSync FROM sync_state WHERE entity = 'raw_material_expenses'`).get();
        const expLastSync = expStateRow ? new Date(expStateRow.lastSync) : new Date(0);

        const cloudExpenses = await RawMaterialExpense.find({
            $or: [
                { updatedAt: { $gt: expLastSync } },
                { createdAt: { $gt: expLastSync } }
            ]
        });

        if (cloudExpenses.length > 0) {
            const upsertExp = db.prepare(`
                INSERT INTO raw_material_expenses
                    (uuid, date, materialName, quantity, rate, supplier, totalCost, notes, createdAt, updatedAt, isDeleted, synced)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                ON CONFLICT(uuid) DO UPDATE SET
                    date = excluded.date,
                    materialName = excluded.materialName,
                    quantity = excluded.quantity,
                    rate = excluded.rate,
                    supplier = excluded.supplier,
                    totalCost = excluded.totalCost,
                    notes = excluded.notes,
                    createdAt = excluded.createdAt,
                    updatedAt = excluded.updatedAt,
                    isDeleted = excluded.isDeleted,
                    synced = 1
            `);

            const txnExp = db.transaction((expenses) => {
                for (const e of expenses) {
                    upsertExp.run(
                        e.uuid,
                        e.date ? (e.date instanceof Date ? e.date.toISOString().split('T')[0] : e.date) : null,
                        e.materialName, e.quantity, e.rate,
                        e.supplier || null, e.totalCost, e.notes || null,
                        e.createdAt ? e.createdAt.toISOString() : null,
                        e.updatedAt ? e.updatedAt.toISOString() : null,
                        e.isDeleted ? 1 : 0
                    );
                }
            });
            txnExp(cloudExpenses);
            console.log(`Raw material expenses pulled from cloud: ${cloudExpenses.length}`);

            const now = new Date().toISOString();
            db.prepare(`
                INSERT INTO sync_state (entity, lastSync) VALUES ('raw_material_expenses', ?)
                ON CONFLICT(entity) DO UPDATE SET lastSync = excluded.lastSync
            `).run(now);
        }
    } catch (err) {
        console.error('Error pulling raw_material_expenses:', err.message);
    }
};
