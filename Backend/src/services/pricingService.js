const calculatePrice = (distance, vehicleType, currentDemand) => {
  const basePrice = 5;
  const pricePerKm = {
    'sedan': 1.5,
    'suv': 2,
    'van': 2.5,
    'truck': 3
  };
  const demandMultiplier = 1 + (currentDemand / 100); // Assumes currentDemand is a percentage

  const distancePrice = distance * (pricePerKm[vehicleType] || pricePerKm['sedan']);
  const totalPrice = (basePrice + distancePrice) * demandMultiplier;

  return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
};

const getCurrentDemand = async () => {
  // This is a placeholder. In a real system, you'd calculate this based on
  // current bookings, available drivers, time of day, etc.
  return Math.floor(Math.random() * 50); // Returns a random number between 0 and 50
};

module.exports = { calculatePrice, getCurrentDemand };