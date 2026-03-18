import express from 'express';
import { getReportData, getCustomerStatement, getMasterData } from '../controllers/reportController.js';

const router = express.Router();

router.get('/', getReportData);
router.get('/statement', getCustomerStatement);
router.get('/master', getMasterData);

export default router;
