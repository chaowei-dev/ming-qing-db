// backend/src/routes/index.ts
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello from the index route!');
});

export default router;
