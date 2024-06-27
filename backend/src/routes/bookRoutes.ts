import express from "express";
import {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { isAdmin } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", isAuthenticated, getBooks);
router.get("/:id", isAuthenticated, getBookById);

// Only Admins can add, update and delete books
router.post("/", isAuthenticated, isAdmin, addBook);
router.put("/:id", isAuthenticated, isAdmin, updateBook);
router.delete("/:id", isAuthenticated, isAdmin, deleteBook);

export default router;
