const AWS = require('aws-sdk');
const crypto = require('crypto');
const dynamo = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

const tableName = process.env.DYNAMO_TABLE;
const lambda_sync = process.env.LAMBDA_SYNC;

exports.main = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      throw new Error(`Only POST requests are allowed.`);
    }

    const body = JSON.parse(event.body);
    const long_urls = body.long_urls || [];
    const short_urls = body.short_urls_code || [];
    let shortCodes = [];

    if (long_urls.length === 0) {
      throw new Error('The long_urls parameter must be provided and non-empty.');
    }

    if (short_urls.length !== 0 && short_urls.length !== long_urls.length) {
      throw new Error('If short_urls are provided, their count must match the count of long_urls.');
    }

    for (let i = 0; i < long_urls.length; i++) {
      const long_url = long_urls[i];
      let shortCode = short_urls.length ? short_urls[i] : generateShortCode();
      
      let isSaved = false;
      while (!isSaved) {
        const item = {
          shortCode: shortCode,
          long_url
        };
        
        isSaved = await saveItem(item);
        
        if (isSaved) {
          shortCodes.push({ shortCode, long_url });
        } else if (short_urls.length) {
          throw new Error(`Failed to save custom short_url: ${shortCode}`);
        } else {
          shortCode = generateShortCode(); // Generate a new shortCode and try again
        }
      }
    }

    // Invoke the Redis synchronization Lambda
    const invokeParams = {
      FunctionName: lambda_sync,
      InvocationType: 'Event'
    };
    
    await lambda.invoke(invokeParams).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ links: shortCodes })
    };

  } catch (error) {
    const body = error.message || 'An unknown error occurred';
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify({error: body})
    };
  }
};


function generateShortCode() {
  return crypto.randomBytes(3).toString('hex');  // 3 bytes generarán un string de 6 caracteres hexadecimales
}

async function saveItem(item) {
  const params = {
    TableName: tableName,
    Item: item,
    ConditionExpression: 'attribute_not_exists(shortCode)' // Solo inserta si el shortCode no existe
  };

  try {
    await dynamo.put(params).promise();
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      // El shortCode ya existe en la base de datos, debemos manejar la colisión
      return false;
    }
    throw error;
  }
  return true;
}
