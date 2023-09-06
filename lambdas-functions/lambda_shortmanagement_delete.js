const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.DYNAMO_TABLE;

exports.main = async function(event, context) {
  try {
    if (event.httpMethod !== 'DELETE') {
      throw new Error(`Only DELETE requests are allowed.`);
    }

    const body = JSON.parse(event.body);
    const shortCode = body.shortCode;

    if (!shortCode) {
      throw new Error('shortCode parameter must be provided.');
    }

    await deleteItem({ shortCode });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Item successfully deleted' })
    };

  } catch (error) {
    console.error('An error occurred:', error);  // Log the error for debugging
    const body = error.message || 'An unknown error occurred';
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify({error: body})
    };
  }
};

async function deleteItem(key) {
  try {
    const params = {
      TableName: tableName,
      Key: key
    };

    return await dynamo.delete(params).promise();

  } catch (error) {
    console.error('Error in deleteItem:', error);  // Log the error
    throw new Error('Failed to delete item from DynamoDB');
  }
}
