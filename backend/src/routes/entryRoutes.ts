import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

export default router;
