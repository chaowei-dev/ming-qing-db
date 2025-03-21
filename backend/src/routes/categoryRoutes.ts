import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

router.get('/', isAuthenticated, getCategories);
router.post('/', isAuthenticated, isAdmin, createCategory);
router.put('/:id', isAuthenticated, isAdmin, updateCategory);
router.delete('/:id', isAuthenticated, isAdmin, deleteCategory);

export default router;