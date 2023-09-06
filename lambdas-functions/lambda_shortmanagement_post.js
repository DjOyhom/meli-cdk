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
    const long_url = body.long_url;
    let shortCode = body.shortCode;

    if (!long_url) {
      throw new Error('The long_url parameter must be provided.');
    }

    if (!shortCode) {
      // Generate a new shortCode
      shortCode = generateShortCode();
    }

    const item = {
      shortCode,
      long_url
    };

    await saveItem(item);

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
      body: JSON.stringify(item)
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
  return crypto.randomBytes(6).toString('hex');
}

async function saveItem(item) {
  const params = {
    TableName: tableName,
    Item: item
  };
  return await dynamo.put(params).promise();
}
