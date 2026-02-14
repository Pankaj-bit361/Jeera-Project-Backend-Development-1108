import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Helper
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      if (!process.env.MONGODB_URI) {
        console.error('CRITICAL: MONGODB_URI environment variable is not defined');
        // We don't throw here to allow the app to start and log the error, 
        // but requests requiring DB will fail gracefully or log errors then.
        return;
      }
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected');
    }
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
  }
};

// Middleware to ensure DB is connected for every request (Serverless optimization)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Jeera API is running...');
});

// Start Server locally
// Vercel exports the app, so we ONLY listen if NOT in Vercel
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

// For Vercel Serverless
export default app;