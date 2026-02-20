import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    pavatiNo: { type: String, required: true },
    date: { type: Date, required: true },
    customerName: { type: String, required: true },
    site: { type: String },
    vehicleNo: { type: String },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    advance: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    marfat: { type: String, default: '' },
    remarks: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Invoice', invoiceSchema);
