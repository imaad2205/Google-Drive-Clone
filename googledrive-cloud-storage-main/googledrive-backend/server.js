const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables (only needed for local development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Debug: Log environment loading
console.log('Environment:', process.env.NODE_ENV);
console.log('MONGODB_URI loaded:', process.env.MONGODB_URI ? 'YES' : 'NO');

// Import routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

// Import database connection
const connectDB = require('./config/database');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// CORS configuration - Manual headers to guarantee it works
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

// Manual CORS middleware - runs before everything
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Security middleware - after CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder for uploads (will be replaced with S3)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('💚 Health check hit!');
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

console.log('🚀 Server script loaded, attempting to start...');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Required for Render

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Health check: http://localhost:${PORT}/health`);
  }
});

// Handle unhandled promise rejections
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection Error: ${err.message}`);
  console.error(err.stack);
  // Do NOT exit, just log it to keep server alive during debug
  // server.close(() => process.exit(1)); 
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // Do NOT exit
});

module.exports = app;
