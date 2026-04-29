import mongoose from 'mongoose';

const rawMaterialExpenseSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    materialName: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    supplier: { type: String },
    totalCost: { type: Number, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

rawMaterialExpenseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('RawMaterialExpense', rawMaterialExpenseSchema);
