import { Request, Response } from 'express';
import { Item } from '../models/item';
import * as ItemService from '../utils/itemService';

// Get all items
export const getItems = (req: Request, res: Response) => {
    res.status(200).json(ItemService.findAll());
};

// Get a single item by id
export const getItemById = (req: Request, res: Response) => {
    const item = ItemService.find(req.params.id);
    if (item) {
        res.status(200).json(item);
    } else {
        res.status(404).send('Item not found');
    }
};

// Create a new item
export const createItem = (req: Request, res: Response) => {
    const item: Item = {
        id: new Date().valueOf().toString(),
        ...req.body,
    };

    ItemService.create(item);
    res.status(201).json(item);
};

// Update an item
export const updateItem = (req: Request, res: Response) => {
    const updatedItem = ItemService.update(req.params.id, req.body);

    if (updatedItem) {
        res.status(200).json(updatedItem);
    } else {
        res.status(404).send('Item not found');
    }
};

// Delete an item
export const deleteItem = (req: Request, res: Response) => {
    const { id } = req.params;
    if (ItemService.remove(id)) {
        res.status(204).send();
    } else {
        res.status(404).send('Item not found');
    }
};
