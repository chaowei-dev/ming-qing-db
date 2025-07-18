import express from 'express';
import passport from 'passport';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import entryRoutes from './routes/entryRoutes';
import categoryRoutes from './routes/categoryRoutes';
import './passportConfig';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS
const corsOptions = {
  origin: '*', // Allow all origins
  credentials: true, // Needed for sites hosted on a different domain to send cookies
};
app.use(cors(corsOptions));

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport middleware
app.use(passport.initialize());

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
