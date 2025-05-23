const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store: { [ip]: { count, startTime } }
const reqData = {};
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  //reqData : {count, startTIme}
  if (!reqData[ip] || now - reqData[ip].startTime > WINDOW_MS) {
    reqData[ip] = { count: 1, startTime: now };
  } else {
    reqData[ip].count += 1;
  }

  if (reqData[ip].count > MAX_REQUESTS) {
    return res.status(429).send('Too many requests – please try again later.');
  }

  next();
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
