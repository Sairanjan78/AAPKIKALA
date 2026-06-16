const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const artistRoutes = require('./routes/artists');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const messageRoutes = require('./routes/messages');

// Initialize Express app
const app = express();

// Middleware
// Dynamic CORS configuration
const allowedOrigins = [
  "https://aapkikala.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.log('🚫 CORS Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local media assets (Move ABOVE frontend static to avoid clashing)
const uploadsPath = path.resolve(__dirname, 'uploads');

console.log('📁 Serving uploads from:', uploadsPath);

app.use('/uploads', express.static(uploadsPath));

// Serve static files from frontend directory (HTML/CSS/JS)
app.use(express.static(path.resolve(__dirname, '../frontend')));

const connectDB = async () => {
    try {
        console.log('⏳ Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully (Atlas)');
    } catch (err) {
        console.error('❌ Primary MongoDB connection failed:', err.message);
        console.log('🔄 Attempting to connect to local MongoDB fallback...');
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/artMarketplace');
            console.log('✅ Connected to Local MongoDB successfully!');
        } catch (localErr) {
            console.error('❌ Failed to connect to local MongoDB as well:', localErr.message);
            return; // Exit if both fail
        }
    }

    // Auto-seed admin user from environment variables
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        try {
            const adminAccount = await User.findOne({ email: process.env.ADMIN_EMAIL });
            if (!adminAccount) {
                await User.create({
                    name: 'System Admin',
                    email: process.env.ADMIN_EMAIL,
                    password: process.env.ADMIN_PASSWORD,
                    role: 'admin',
                    isVerified: true
                });
                console.log(`👑 Admin user (${process.env.ADMIN_EMAIL}) created automatically`);
            } else if (adminAccount.role !== 'admin') {
                adminAccount.role = 'admin';
                await adminAccount.save();
                console.log(`⬆️  Existing user (${process.env.ADMIN_EMAIL}) promoted to Admin`);
            }
        } catch (err) {
            console.error('❌ Error seeding admin user:', err.message);
        }
    }
};

connectDB();

// Routes
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Welcome to the Indian Art Marketplace API',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        message: 'AAPKIKALA API is running',
        timestamp: new Date().toISOString()
    });
});

// SPA Routing: Serve index.html for all non-API routes (must be LAST)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server with auto-recovery for port conflicts
const PORT = process.env.PORT || 5000;
const { execSync } = require('child_process');

function startServer() {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 API available at http://localhost:${PORT}/api`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${PORT} is busy. Auto-killing the old process...`);
            try {
                // Find and kill whatever is on this port
                const result = execSync(`netstat -ano | findstr ":${PORT}"`, { encoding: 'utf8' });
                const lines = result.trim().split('\n');
                const pids = new Set();
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && pid !== '0' && pid !== String(process.pid)) {
                        pids.add(pid);
                    }
                }
                for (const pid of pids) {
                    try { execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' }); } catch (e) {}
                }
                console.log(`✅ Killed ${pids.size} process(es). Restarting in 1.5s...`);
            } catch (e) {
                console.log('⚠️  Could not auto-kill. Retrying anyway...');
            }
            // Retry after a short delay
            setTimeout(() => startServer(), 1500);
            return;
        }
        throw err;
    });

    // Store server reference globally for shutdown handlers
    global.__server = server;
    return server;
}

const server = startServer();

// MongoDB connection event listeners
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
});

// Global error handlers — prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️  Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err.message);
    console.error(err.stack);
    const s = global.__server;
    if (s) s.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 3000);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
    const s = global.__server;
    if (s) {
        s.close(() => {
            mongoose.connection.close(false).then(() => {
                console.log('✅ MongoDB connection closed');
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
    // Force exit after 5 seconds
    setTimeout(() => process.exit(1), 5000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
