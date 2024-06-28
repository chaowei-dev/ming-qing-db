import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/roleMiddleware';
import { getEntries, countEntries } from '../controllers/entryController';

const router = express.Router();

router.get('/list/:size/:page/:keyword', isAuthenticated, getEntries);
router.get('/count/:keyword', isAuthenticated, countEntries);

export default router;
