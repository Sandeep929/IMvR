import express from 'express';
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    updateMaterialQuantity,
    getAnalytics
} from '../controllers/rawMaterialController.js';

const router = express.Router();

router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);
router.put('/expenses/:id/quantity', updateMaterialQuantity);
router.get('/analytics', getAnalytics);

export default router;
