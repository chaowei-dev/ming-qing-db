import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/roleMiddleware';
import {
  getEntries,
  countEntries,
  addEntry,
} from '../controllers/entryController';

const router = express.Router();

router.get('/list/:size/:page/:keyword', isAuthenticated, getEntries);
router.get('/count/:keyword', isAuthenticated, countEntries);
router.post('/add', isAuthenticated, isAdmin, addEntry);

export default router;
