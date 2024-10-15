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


const PORT = process.env.PORT || 3001;
const http = require('http');
const setupWebSocket = require('./websockets/trackingSocket');

require('dotenv').config({ path: './.env' });

console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('MONGO_URL:', process.env.MONGO_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// const cluster = require('cluster');
// const numCPUs = require('os').cpus().length;

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//     cluster.fork(); // Replace the dead worker
//   });
// } else {
//   // Workers can share any TCP connection
//   // In this case it is an HTTP server
//   require('./server');
//   console.log(`Worker ${process.pid} started`);
// }

const app = express();
const server = http.createServer(app);
const io = setupWebSocket(server);

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(loggingMiddleware);

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
