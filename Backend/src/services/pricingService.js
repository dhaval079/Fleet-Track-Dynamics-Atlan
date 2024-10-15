const calculatePrice = (distance, duration, basePrice = 5, pricePerKm = 1.5, pricePerMinute = 0.5) => {
    const distancePrice = distance * pricePerKm;
    const timePrice = duration * pricePerMinute;
    return basePrice + distancePrice + timePrice;
  };
  
  module.exports = { calculatePrice };