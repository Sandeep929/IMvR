import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    unit: { type: String },
    currentStock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

rawMaterialSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('RawMaterial', rawMaterialSchema);
