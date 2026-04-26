import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    category: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

settingSchema.index({ category: 1, key: 1 }, { unique: true });

export default mongoose.model('Setting', settingSchema);
