import express from 'express';
import {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getBookCount,
} from '../controllers/bookController';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// All users
router.get('/list/:size/:page/:keyword', isAuthenticated, getBooks);
router.get('/:id', isAuthenticated, getBookById);
router.get('/count/:keyword', isAuthenticated, getBookCount);

// Only Admins can add, update and delete books
router.post('/', isAuthenticated, isAdmin, addBook);
router.put('/:id', isAuthenticated, isAdmin, updateBook);
router.delete('/:id', isAuthenticated, isAdmin, deleteBook);

export default router;
