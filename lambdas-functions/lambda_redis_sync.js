const AWS = require('aws-sdk');
const Redis = require('ioredis');
const dynamo = new AWS.DynamoDB.DocumentClient();

const redisClient = new Redis({
  host: process.env.REDIS_ADDRESS,
  port: 6379
});

const tableName = process.env.DYNAMO_TABLE;

exports.main = async function(event, context) {
  try {
    // console.log('Event received:', JSON.stringify(event));  // Solo si es necesario

    const scanParams = {
      TableName: tableName
    };

    // console.log('Fetching data from DynamoDB.');  // Solo si es necesario
    const dynamoData = await dynamo.scan(scanParams).promise();

    // console.log('Fetching keys from Redis.');  // Solo si es necesario
    const redisKeys = await redisClient.keys('*');

    const dynamoShortCodes = new Set(dynamoData.Items.map(item => item.shortCode));

    for (const item of dynamoData.Items) {
      const { shortCode, long_url } = item;

      const redisValue = await redisClient.get(shortCode);

      if (redisValue !== long_url) {
        // console.log(`Updating Redis: setting ${shortCode} to ${long_url}.`);  // Solo si es necesario
        await redisClient.set(shortCode, long_url);
      }
    }

    for (const key of redisKeys) {
      if (!dynamoShortCodes.has(key)) {
        // console.log(`Removing extra key ${key} from Redis.`);  // Solo si es necesario
        await redisClient.del(key);
      }
    }

    // console.log('Synchronization completed.');  // Solo si es necesario
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Synchronization completed' })
    };

  } catch (error) {
    console.error('An error occurred:', error);  // Logueamos el error
    const body = error.message || 'An unknown error occurred';
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify({error: body})
    };
  } finally {
    // console.log('Closing Redis connection.');  // Solo si es necesario
    await redisClient.quit();  // No olvides cerrar la conexión
  }
};
