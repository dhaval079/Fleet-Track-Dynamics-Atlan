const moment = require('moment');

const calculatePrice = (distance, vehicleType, currentDemand, dateTime) => {
  const basePrice = 5;
  const pricePerKm = {
    'sedan': 1.5,
    'suv': 2,
    'van': 2.5,
    'truck': 3
  };

  // Time-based multiplier
  const hour = moment(dateTime).hour();
  let timeMultiplier = 1;
  if (hour >= 22 || hour < 6) {
    timeMultiplier = 1.5; // Night time surcharge
  } else if (hour >= 7 && hour < 10 || hour >= 16 && hour < 19) {
    timeMultiplier = 1.3; // Peak hours surcharge
  }

  // Day-based multiplier
  const day = moment(dateTime).day();
  const dayMultiplier = (day === 0 || day === 6) ? 1.2 : 1; // Weekend surcharge

  const demandMultiplier = 1 + (currentDemand / 100);

  const distancePrice = distance * (pricePerKm[vehicleType] || pricePerKm['sedan']);
  const totalPrice = (basePrice + distancePrice) * timeMultiplier * dayMultiplier * demandMultiplier;

  return Math.round(totalPrice * 100) / 100;
};

const getCurrentDemand = async () => {
  return Math.floor(Math.random() * 50); // Returns a random number between 0 and 50
};

module.exports = { calculatePrice, getCurrentDemand };