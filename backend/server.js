// backend/server.js - Fallback JSON engine activated
// Main entry point for our MERN backend server.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// 1. Load environment variables from .env
dotenv.config();

// 2. Establish connection to MongoDB database
connectDB();

// 3. Initialize Express Application
const app = express();

// 4. Mount Global Middlewares
// Enable Cross-Origin Resource Sharing so our React frontend (running on port 5173) can talk to this backend
app.use(
  cors({
    origin: '*', // Allow all origins for beginner ease-of-use, or configure to your frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Built-in parser to read incoming application/json requests
app.use(express.json());

// Log incoming API calls during local development
app.use((req, res, next) => {
  console.log(`[API Call] ${req.method} ${req.url}`);
  next();
});

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);

// Base Status Route (Useful to confirm the backend is up and running in browser)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FinFlow REST API is running successfully!',
    version: '1.0.0',
    status: 'Healthy',
  });
});

// 6. Mount Global Fallback Error Middleware
// Note: This must be mounted AFTER routes so it catches failures that fall through!
app.use(errorHandler);

// 7. Fire up Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `⚡ Server is actively running on port ${PORT}`);
  console.log(`\x1b[34m%s\x1b[0m`, `→ Access healthcheck: http://localhost:${PORT}/`);
});
