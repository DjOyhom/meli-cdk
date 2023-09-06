const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.DYNAMO_TABLE;

exports.main = async function(event, context) {
  try {
    const items = await getAllItems();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(items)
    };
  } catch (error) {
    console.error('An error occurred:', error); // Log the error for debugging
    const body = error.message || 'An unknown error occurred';
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify({error: body})
    };
  }
};

async function getAllItems() {
  try {
    const params = {
      TableName: tableName
    };
    const result = await dynamo.scan(params).promise();
    return result.Items;
  } catch (error) {
    console.error('Error in getAllItems:', error); // Log the error
    throw new Error('Failed to get items from DynamoDB');
  }
}
