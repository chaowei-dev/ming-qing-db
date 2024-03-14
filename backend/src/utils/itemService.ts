import { Item } from "../models/item";

const items: Item[] = [];

export const findAll = (): Item[] => items;

export const find = (id: string): Item | undefined => items.find(item => item.id === id);

export const create = (newItem: Item): void => {
    items.push(newItem);
};

export const update = (id: string, itemUpdate: Partial<Item>): Item | undefined => {
    const item = find(id);
    if (!item) return undefined;

    Object.assign(item, itemUpdate);
    return item;
};

export const remove = (id: string): boolean => {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    return true;
};
