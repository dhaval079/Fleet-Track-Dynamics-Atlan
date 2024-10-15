// test-redis.js

const redis = require('redis');

const client = redis.createClient({
  url: 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));
client.on('ready', () => console.log('Redis Client Ready'));

async function testRedis() {
  try {
    await client.connect();
    
    await client.set('testKey', 'Hello, Redis!');
    const value = await client.get('testKey');
    console.log('Retrieved value:', value);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.quit();
  }
}

testRedis();