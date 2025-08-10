const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const wasteItemRoutes = require('./routes/wasteItems');
const binRoutes = require('./routes/bins');
const wasteLogRoutes = require('./routes/wasteLogs');
const valuableMaterialRoutes = require('./routes/valuableMaterials');
const scrapPriceRoutes = require('./routes/scrapPrices');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and performance middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      message: 'EcoSort Backend is running smoothly! 🌱',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }
  });
});

// API routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waste-items', wasteItemRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/waste-logs', wasteLogRoutes);
app.use('/api/valuable-materials', valuableMaterialRoutes);
app.use('/api/scrap-prices', scrapPriceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: '🌱 Welcome to EcoSort API!',
      description: 'Smart Waste Management System',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth/*',
        users: '/api/users/*',
        wasteItems: '/api/waste-items/*',
        bins: '/api/bins/*',
        wasteLogs: '/api/waste-logs/*',
        valuableMaterials: '/api/valuable-materials/*',
        scrapPrices: '/api/scrap-prices/*',
        dashboard: '/api/dashboard/*'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Database connection check and server start
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('🗄️  Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 EcoSort Backend running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 API Documentation available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;