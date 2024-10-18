const cors = require('cors');
const dotenv = require("dotenv");
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRoutes');
const driverRouter = require('./routes/driverRoutes');
const vehicleRouter = require('./routes/vehicleRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const adminRouter = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const schedulerService = require('./services/schedulerService');


const PORT = process.env.PORT || 3001;
const http = require('http');
const setupWebSocket = require('./websockets/trackingSocket');
const { authentication } = require('./middleware/authMiddleware');

require('dotenv').config({ path: './.env' });

console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('MONGO_URL:', process.env.MONGO_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
const server = http.createServer(app);
const io = setupWebSocket(server);
schedulerService.init();



app.use(express.json());
app.use(cookieParser());
app.use(cors({
  // origin: 'http://localhost:3000', // Your frontend URL
  // credentials: true,
  // exposedHeaders: ['X-Log-Entry']
}));
app.use(loggingMiddleware);
// app.get('/api/v2/logs', authentication, (req, res) => {
//   // Fetch recent logs from your logging system
//   // This is just a placeholder, replace with your actual log fetching logic
//   const recentLogs = fetchRecentLogs();
//   res.json({ logs: recentLogs });
// });

app.use("/api/v2/auth", authRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/drivers", driverRouter);
app.use("/api/v2/vehicles", vehicleRouter);
app.use("/api/v2/bookings", bookingRouter);
app.use("/api/v2/admin", adminRouter);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send(`
    <h1>Server has started and API is Working</h1>
    <p>Refer to the Postman Docs here: <a href="https://documenter.getpostman.com/view/37397155/2sA3rwLDt1">Postman Documentation</a></p>
  `);
});

const mongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Database connected Successfully!");
  } catch (err) {
    console.log("Failed to connect to MongoDB:", err);
    throw err;
  }
}

app.listen(PORT, () => {
  mongoDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app, io };
