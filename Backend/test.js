// // test-redis.js

// const redis = require('redis');

// const client = redis.createClient({
//   url: 'redis://localhost:6379'
// });

// client.on('error', (err) => console.log('Redis Client Error', err));
// client.on('connect', () => console.log('Redis Client Connected'));
// client.on('ready', () => console.log('Redis Client Ready'));

// async function testRedis() {
//   try {
//     await client.connect();
    
//     await client.set('testKey', 'Hello, Redis!');
//     const value = await client.get('testKey');
//     console.log('Retrieved value:', value);
//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     await client.quit();
//   }
// }

// testRedis();


const fetch = require('node-fetch'); // Make sure to install node-fetch if not already installed

const API_KEY = 'AlzaSy4STdH82R8gHqMhU-oldo3-trDZJZKBWBV'; // Replace with your actual API key

export const geocodeAddress1 = async (address) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;

  console.log("Request URL:", url); // Log the request URL
  console.log("Using API Key:", API_KEY); // Log the API key

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Geocode API response for:", address, data);

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log("Geocoded location:", location);
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error('Geocoding failed for:', address, 'Status:', data.status);
      throw new Error(`Geocoding failed for ${address}: ${data.status}`);
    }
  } catch (error) {
    console.error('Error during geocoding for:', address, error);
    throw error;
  }
};

(async () => {
  const address = "Bangalore Palace, Palace Cross Road, Vasanth Nagar, Bengaluru, Karnataka, India";
  try {
    const coords = await geocodeAddress1(address);
    console.log("Coordinates:", coords);
  } catch (error) {
    console.error("Failed to get coordinates:", error);
  }
})();

