import request from 'supertest';
import app from '../../app';
import * as ItemService from '../../utils/itemService';

describe('GET /api/items/:id', () => {
    it('should return 404 if item does not exist', async () => {
        const nonExistentItemId = 'non-existent-id';
        const response = await request(app).get(`/api/items/${nonExistentItemId}`);
        
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Item not found' });
    });

    it('should return the item if it exists', async () => {
        // Assuming there's an item with id 'existing-id' in the database
        const existingItemId = 'existing-id';
        // Mock the behavior of the ItemService.find() function to return a mock item
        jest.spyOn(ItemService, 'find').mockReturnValue({ id: existingItemId, name: 'Test Item' });
        
        const response = await request(app).get(`/api/items/${existingItemId}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: existingItemId, name: 'Test Item' });
    });
});
