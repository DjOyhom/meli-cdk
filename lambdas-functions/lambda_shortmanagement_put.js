const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

const tableName = process.env.DYNAMO_TABLE;
const lambda_sync = process.env.LAMBDA_SYNC;

exports.main = async function(event, context) {
  try {
    if (event.httpMethod !== 'PUT') {
      throw new Error(`Only PUT requests are allowed.`);
    }

    const body = JSON.parse(event.body);
    const updates = body.updates || [];

    if (updates.length === 0) {
      throw new Error('The updates parameter must be provided and non-empty.');
    }

    for (const { short_url_code, new_short_url_code, new_long_url } of updates) {
      if (!short_url_code || (!new_short_url_code && !new_long_url)) {
        throw new Error('Both short_url_code and either new_short_url_code or new_long_url must be provided for each update.');
      }

      if (new_short_url_code) {
        const existingItem = await getItem({ short_url_code: new_short_url_code });
        if (existingItem) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: `The new_short_url_code ${new_short_url_code} already exists.` })
          };
        }
        await deleteItem({ short_url_code });
        await saveItem({ short_url_code: new_short_url_code, long_url: new_long_url });
      } else {
        if (new_long_url) {
          await updateItem({ short_url_code }, new_long_url);
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
      body: JSON.stringify({ message: 'Items successfully updated' })
    };

  } catch (error) {
    const body = error.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify({error: body})
    };
  }
};

async function getItem(key) {
  const params = {
    TableName: tableName,
    Key: key
  };
  const result = await dynamo.get(params).promise();
  return result.Item;
}

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

async function deleteItem(key) {
  const params = {
    TableName: tableName,
    Key: key
  };
  return await dynamo.delete(params).promise();
}

async function saveItem(item) {
  const params = {
    TableName: tableName,
    Item: item
  };
  return await dynamo.put(params).promise();
}
