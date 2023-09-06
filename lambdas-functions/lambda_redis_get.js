const Redis = require('ioredis');

exports.main = async function(event, context) {
  let redisClient;
  try {
    // Solo logueamos el inicio si es realmente necesario para depuración
    // console.log(`Inicio de la función Lambda para probar la conexión a Redis. - ${process.env.REDIS_ADDRESS}`);
    
    redisClient = new Redis({
      host: process.env.REDIS_ADDRESS,
      port: 6379
    });

    const allItems = await getAllItems(redisClient);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({allItems})
    };
  } catch (error) {
    console.error('Error occurred:', error);  // Logueamos el error
    const body = error.message || 'An unknown error occurred';
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify({error: body})
    };
  } finally {
    if (redisClient) {
      await redisClient.quit(); // No olvides cerrar la conexión
    }
  }
};

async function getAllItems(redisClient) {
  try {
    const keys = await redisClient.keys('*');
    const pipeline = redisClient.pipeline();

    for (const key of keys) {
      pipeline.get(key);
    }

    const results = await pipeline.exec();
    const allItems = {};

    for (let i = 0; i < keys.length; i++) {
      allItems[keys[i]] = results[i][1];
    }

    return allItems;
  } catch (error) {
    console.error('Error in getAllItems:', error); // Logueamos el error en esta función también
    throw new Error('Failed to get all items from Redis');
  }
}
