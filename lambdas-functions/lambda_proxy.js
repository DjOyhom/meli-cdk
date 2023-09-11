const Redis = require('ioredis');
let redisClient;
const defaultUrl = 'https://www.mercadolibre.com.uy';

async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    host: process.env.REDIS_ADDRESS,
    port: 6379
  });
  
  await new Promise((resolve, reject) => {
    redisClient.on('ready', resolve);
    redisClient.on('error', reject);
  });

  return redisClient;
}

exports.main = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false; 
  let redirectUrl = defaultUrl;  

  if (event.httpMethod === 'GET') {
    const pathParts = event.path.split('/');
    const shortCode = pathParts[pathParts.length - 1];
    console.log(`ShortCode used: ${shortCode}`);

    if (shortCode) {
      try {
        const client = await getRedisClient();
        const urlFromRedis = await client.get(shortCode);
        if (urlFromRedis) {
          redirectUrl = urlFromRedis;
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    }
  }

  return {
    statusCode: 302,
    headers: {
      'Location': redirectUrl
    },
    body: ''
  };
};
