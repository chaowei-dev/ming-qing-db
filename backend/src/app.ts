// backend/src/app.ts
import express from 'express';
import itemRoutes from './routes/itemRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

// Use item routes
app.use('/api/items', itemRoutes);

export default app;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
