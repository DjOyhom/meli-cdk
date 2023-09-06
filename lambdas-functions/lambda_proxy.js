const Redis = require('ioredis');
let redisClient;
const defaultUrl = 'https://www.mercadolibre.com.uy'; // URL por defecto como variable

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
  context.callbackWaitsForEmptyEventLoop = false; // No esperar a que se cierren recursos como conexiones a bases de datos
  let client;
  let redirectUrl = defaultUrl; // Usar URL por defecto como inicial

  try {
    client = await getRedisClient();
    
    if (event.httpMethod === 'GET') {
      const pathParts = event.path.split('/');
      const shortCode = pathParts[pathParts.length - 1];

      if (shortCode) {
        const urlFromRedis = await client.get(shortCode);
        if (urlFromRedis) {
          redirectUrl = urlFromRedis;
        }
      }
    }
  } catch (error) {
    console.error("Error occurred:", error); // Log del error
  }

  return {
    statusCode: 302,
    headers: {
      'Location': redirectUrl
    },
    body: ''
  };
};
