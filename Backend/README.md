# Project Structure
backend/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── environment.js
│   │   └── redis.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── driverController.js
│   │   ├── bookingController.js
│   │   ├── vehicleController.js
│   │   ├── trackingController.js
│   │   ├── pricingController.js
│   │   └── adminController.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Driver.js
│   │   ├── Booking.js
│   │   ├── Vehicle.js
│   │   ├── Location.js
│   │   └── Payment.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── trackingRoutes.js
│   │   ├── pricingRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── rateLimiter.js
│   │
│   ├── services/
│   │   ├── bookingService.js
│   │   ├── pricingService.js
│   │   ├── matchingService.js
│   │   ├── trackingService.js
│   │   ├── notificationService.js
│   │   └── analyticsService.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── apiResponse.js
│   │   ├── geocoding.js
│   │   └── distanceCalculator.js
│   │
│   ├── websockets/
│   │   ├── trackingSocket.js
│   │   └── notificationSocket.js
│   │
│   ├── jobs/
│   │   ├── cleanupJob.js
│   │   └── analyticsJob.js
│   │
│   └── app.js
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── scripts/
│   ├── seed.js
│   └── deploy.sh
│
├── .env
├── .gitignore
├── package.json
└── README.md