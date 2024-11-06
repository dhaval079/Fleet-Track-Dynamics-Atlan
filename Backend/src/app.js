const cors = require('cors');
const dotenv = require("dotenv");
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const setupWebSocket = require('./websockets/trackingSocket');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRoutes');
const driverRouter = require('./routes/driverRoutes');
const vehicleRouter = require('./routes/vehicleRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const adminRouter = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const { authentication } = require('./middleware/authMiddleware');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const schedulerService = require('./services/schedulerService');


require('dotenv').config();

// Load environment variables first
dotenv.config();

// Create Express app
const app = express();

// Setup Socket.IO with CORS configuration
// const io = setupWebSocket(server, {
//   cors: {
//     origin: "https://LogistiQ-atlan.vercel.app",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Authorization"],
//     credentials: true
//   },
//   path: '/socket.io' // Explicitly set the path
// });

// Initialize scheduler
schedulerService.init();

// Middleware setup
app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//   origin: 'https://LogistiQ-atlan.vercel.app',
  
const corsOptions = {
  origin: ['https://logistiq-fleet.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS before other middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with CORS configuration
const io = setupWebSocket(server, {
  cors: corsOptions,
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// MongoDB connection with retry logic
const connectMongoDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB Database connected Successfully!");
      return;
    } catch (err) {
      console.log(`Failed to connect to MongoDB (attempt ${i + 1}/${retries}):`, err);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
    }
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Health check with detailed status
app.get('/health', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1;
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus ? 'connected' : 'disconnected',
        server: 'running'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Routes setup
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/drivers", driverRouter);
app.use("/api/v2/vehicles", vehicleRouter);
app.use("/api/v2/bookings", bookingRouter);
app.use("/api/v2/admin", adminRouter);

// Server initialization with better error handling
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectMongoDB();
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Socket.IO is initialized with path: ${io.path()}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, retrying...`);
        setTimeout(() => {
          server.close();
          server.listen(PORT, '0.0.0.0');
        }, 1000);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
