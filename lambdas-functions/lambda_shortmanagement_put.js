const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.DYNAMO_TABLE;

exports.main = async function(event, context) {
  try {
    if (event.httpMethod !== 'PUT') {
      throw new Error(`Only PUT requests are allowed.`);
    }

    const body = JSON.parse(event.body);
    const shortCode = body.shortCode;
    const new_long_url = body.long_url;

    if (!shortCode || !new_long_url) {
      throw new Error('Both shortCode and new_long_url parameters must be provided.');
    }

    await updateItem({ shortCode }, new_long_url);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Item successfully updated' })
    };

  } catch (error) {
    const body = error.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify(body)
    };
  }
};

async function updateItem(key, new_long_url) {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: 'SET long_url = :new_long_url',
    ExpressionAttributeValues: {
      ':new_long_url': new_long_url
    },
    ReturnValues: 'UPDATED_NEW'
  };

  return dynamo.update(params).promise();
}
