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

const PORT = process.env.PORT || 3001;
dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v2/auth", authRouter);
app.use("/api/v2/users", userRouter);
app.use("/api/v2/drivers", driverRouter);
app.use("/api/v2/vehicles", vehicleRouter);
app.use("/api/v2/bookings", bookingRouter);

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