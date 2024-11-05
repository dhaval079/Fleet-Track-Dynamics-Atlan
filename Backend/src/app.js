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

// Log environment variables
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('MONGO_URL:', process.env.MONGO_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
const server = http.createServer(app); // Create HTTP server first

// Setup Socket.IO with CORS configuration
const io = setupWebSocket(server, {
  cors: {
    origin: "https://logistiq-atlan.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true
  },
  path: '/socket.io' // Explicitly set the path
});

// Initialize scheduler
schedulerService.init();

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://logistiq-atlan.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(loggingMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

// API routes
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/drivers", driverRouter);
app.use("/api/v2/vehicles", vehicleRouter);
app.use("/api/v2/bookings", bookingRouter);
app.use("/api/v2/admin", adminRouter);

// Error handling
app.use(errorHandler);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Home route
app.get('/', (req, res) => {
  res.send(`
    <h1>Server has started and API is Working</h1>
    <p>Refer to the Postman Docs here: <a href="https://documenter.getpostman.com/view/37397155/2sA3rwLDt1">Postman Documentation</a></p>
  `);
});

// MongoDB connection
const mongoDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://dhaval079:eren679999@cluster0.rm7on6v.mongodb.net/Atlan-Transport");
    console.log("MongoDB Database connected Successfully!");
  } catch (err) {
    console.log("Failed to connect to MongoDB:", err);
    throw err;
  }
};

// Server initialization
const PORT = process.env.PORT || 3001;

// IMPORTANT: Use 'server.listen' instead of 'app.listen'
server.listen(PORT, '0.0.0.0', async () => {
  try {
    await mongoDB();
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.IO is initialized with path: ${io.path()}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Export for testing
module.exports = { app, server, io };