require('dotenv').config();

// Force DNS resolution to prefer IPv4 (fixes IPv6 ENETUNREACH errors on Render/other hostings)
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { startCleanupJob } = require('./utils/fileCleanup');
const { v4: uuidv4 } = require('uuid');
const { runStartupDiagnostics } = require('./utils/diagnostics');

// Route imports
const authRoutes = require('./routes/auth');
const downloadRoutes = require('./routes/download');
const adminRoutes = require('./routes/admin');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Trust proxy (necessary for express-rate-limit behind Render/Vercel reverse proxies)
app.set('trust proxy', 1);

// Serve static assets (like mobile APKs) from public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// ─── Security Middleware ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// ─── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://downloader-seven-xi.vercel.app',
];

if (process.env.CLIENT_URL) {
  // Support comma-separated URLs in CLIENT_URL env
  const origins = process.env.CLIENT_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...origins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is explicitly allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Dynamically match any vercel.app domains (including preview deployments) associated with the project
    const isVercelOrigin = origin.endsWith('.vercel.app') && 
      (origin.includes('downloader') || origin.includes('pratikshah2056'));
      
    if (isVercelOrigin) {
      return callback(null, true);
    }
    
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
}));

// ─── Body Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Injection Protection ─────────────────────────────────
app.use(mongoSanitize());

// ─── Request Logging ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  morgan.token('id', (req) => req.id);
  app.use(morgan('[:id] :method :url :status :res[content-length] - :response-time ms'));
}

// ─── Rate Limiting ────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Universal Media Downloader API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ─── Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

let serverListener;

// ─── Start Server ─────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Validate required production environment variables
    if (process.env.NODE_ENV === 'production') {
      const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
      const missingEnv = requiredEnv.filter(key => !process.env[key]);
      if (missingEnv.length > 0) {
        console.error(`\n❌ Startup Error: Missing production environment variables: ${missingEnv.join(', ')}\n`);
        process.exit(1);
      }
    }

    // Connect to MongoDB
    await connectDB();

    // Run system diagnostics checks
    if (process.env.NODE_ENV !== 'test') {
      await runStartupDiagnostics();
    }

    // Start file cleanup cron job
    startCleanupJob();

    // Start Express server
    serverListener = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`💊 Health: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('\n🔄 SIGTERM/SIGINT received. Shutting down gracefully...');
  if (serverListener) {
    serverListener.close(async () => {
      console.log('💻 HTTP server closed.');
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close(false);
        console.log('🗄️ MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during graceful shutdown:', err.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app; // Export for testing
