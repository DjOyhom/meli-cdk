exports.main = async function(event, context) {
  try {
    if (event.httpMethod !== 'DELETE') {
      throw new Error(`Only DELETE requests are allowed.`);
    }

    const body = JSON.parse(event.body);
    const shortCodes = body.shortCodes || []; // Asumimos que 'shortCodes' es una lista de códigos

    if (shortCodes.length === 0) {
      throw new Error('The shortCodes parameter must be provided and non-empty.');
    }

    for (const shortCode of shortCodes) {
      await deleteItem({ shortCode });
    }

    // Invoca la Lambda de sincronización con Redis
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
      body: JSON.stringify({ message: 'Items successfully deleted' })
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
