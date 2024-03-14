import express from 'express';
import { getItems, getItemById, createItem, updateItem, deleteItem } from '../controllers/itemController';

const router = express.Router();

// Get all items
router.get('/', getItems);

// Get a single item by id
router.get('/:id', getItemById);

// Create a new item
router.post('/', createItem);

// Update an item
router.put('/:id', updateItem);

// Delete an item
router.delete('/:id', deleteItem);

export default router;
