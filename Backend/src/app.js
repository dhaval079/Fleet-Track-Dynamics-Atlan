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

require('dotenv').config()

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
  origin: 'https://fleet-track-dynamics-atlan.vercel.app', // Replace with your actual frontend URL
  credentials: true,
}));
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://fleet-track-dynamics-atlan.vercel.app'],
//   credentials: true
// }));
app.use(cookieParser());
app.use(loggingMiddleware);
// app.get('/api/v2/logs', authentication, (req, res) => {
//   // Fetch recent logs from your logging system
//   // This is just a placeholder, replace with your actual log fetching logic
//   const recentLogs = fetchRecentLogs();
//   res.json({ logs: recentLogs });
// });
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

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
    await mongoose.connect("mongodb+srv://dhaval079:eren679999@cluster0.rm7on6v.mongodb.net/Atlan-Transport");
    console.log("MongoDB Database connected Successfully!");
  } catch (err) {
    console.log("Failed to connect to MongoDB:", err);
    throw err;
  }
}

app.listen(PORT, '0.0.0.0', () => {
  mongoDB();
  console.log(`Server is running on port ${PORT}`);
});


module.exports = { app, io };
