// src/services/trackingService.js

const redis = require('redis');

// const REDIS_URL = process.env.REDIS_URL;
const REDIS_URL = "redis://default:OKcHAKw6SuUiXOcByfu2ytPPPlpmbTqh@redis-10498.c322.us-east-1-2.ec2.redns.redis-cloud.com:10498";

// if (!REDIS_URL) {
//   console.error('REDIS_URL environment variable is not set. Please check your .env file or environment variables.');
//   process.exit(1);
// }

console.log('Connecting to Redis at:', REDIS_URL);

const client = redis.createClient({
  url: REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Successfully connected to Redis'));
client.on('ready', () => console.log('Redis client is ready'));

async function connect() {
  if (!client.isOpen) {
    try {
      await client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }
}

exports.updateLocation = async (bookingId, location) => {
  try {
    await connect();
    const key = `location:${bookingId}`;
    const value = JSON.stringify(location);
    await client.set(key, value);
    console.log(`Updated location for ${key}: ${value}`);
  } catch (error) {
    console.error(`Error updating location for ${bookingId}:`, error);
    throw error;
  }
};

exports.getLocation = async (bookingId) => {
  try {
    await connect();
    const key = `location:${bookingId}`;
    const locationString = await client.get(key);
    console.log(`Retrieved location for ${key}: ${locationString}`);
    return locationString ? JSON.parse(locationString) : null;
  } catch (error) {
    console.error(`Error getting location for ${bookingId}:`, error);
    throw error;
  }
};