const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || "redis://default:OKcHAKw6SuUiXOcByfu2ytPPPlpmbTqh@redis-10498.c322.us-east-1-2.ec2.redns.redis-cloud.com:10498";

console.log('Connecting to Redis at:', REDIS_URL);

const redisClient = new Redis(REDIS_URL);

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Successfully connected to Redis'));
redisClient.on('ready', () => console.log('Redis client is ready'));

module.exports = redisClient;