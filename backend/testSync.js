import connectDB from './config/db.js';
import dotenv from 'dotenv';
import { syncProducts } from './sync/syncProducts.js';

dotenv.config();

const run = async () => {
    await connectDB();
    await syncProducts();
    process.exit(0);
};

run();
