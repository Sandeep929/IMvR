import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: 'Standard' },
    description: { type: String },
    rate: { type: Number, required: true },
    unit: { type: String, required: true },
    minStock: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Product', productSchema);
