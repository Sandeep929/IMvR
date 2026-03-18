import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },
    pavatiNo: { type: String, required: true },
    orderNo: { type: String },
    date: { type: Date, required: true },
    customerName: { type: String, required: true },
    site: { type: String },
    vehicleNo: { type: String },
    items: [{
        product: { type: String, required: true },
        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    payments: [{
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        method: { type: String },
        remarks: { type: String }
    }],
    totalAmount: { type: Number, default: 0 },
    totalAdvance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    marfat: { type: String, default: '' },
    remarks: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

invoiceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Invoice', invoiceSchema);
