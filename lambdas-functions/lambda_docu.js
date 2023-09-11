const documentation = {
    "endpoints": [
        {
            "path": "/{shortcode}",
            "method": "GET",
            "description": "Redirect to the original URL using the short code.",
            "lambda_code": "./lambdas-functions/lambda_proxy.js"
        },
        {
            "path": "/docu",
            "method": "GET",
            "description": "Show this documentation.",
            "lambda_code": "./lambdas-functions/lambda_docu.js"
        },
        {
            "path": "/short_management",
            "method": "GET",
            "description": "List all shortened URL.",
            "lambda_code": "./lambdas-functions/lambda_shortmanagement_get.js"
        },
        {
            "path": "/short_management",
            "method": "POST",
            "description": "Create a shortened URL.",
            "body_parameters": {
                "long_url": "[\"List of URLs to be shortened.\"",
                "short_urls_code": "[\"Optional. List of shortened code.\""
            },
            "lambda_code": "./lambdas-functions/lambda_shortmanagement_post.js"
        },
        {
            "path": "/short_management",
            "method": "PUT",
            "description": "Update multiple original URLs associated with their respective short codes.",
            "body_parameters": {
                "updates": "An array of update objects. Each object contains:",
                "updates_object": {
                    "currentShortCode": "The current short code to identify the long_url",
                    "newShortCode": "Optional. The new short code to update",
                    "newLongUrl": "Optional. The new URL to associate with the short code."
                }
            },
            "lambda_code": "./lambdas-functions/lambda_shortmanagement_put_bulk.js"
        },          
        {
            "path": "/short_management",
            "method": "DELETE",
            "description": "Delete a URL shortening entry.",
            "body_parameters": {
                "shortCode": "The short code for the URL to be deleted."
            },
            "lambda_code": "./lambdas-functions/lambda_shortmanagement_delete.js"
        },
        {
            "path": "/redis_management",
            "method": "GET",
            "description": "List all cache content.",
            "lambda_code": "./lambdas-functions/lambda_redis_get.js"
        },
        {
            "path": "/redis_management",
            "method": "POST",
            "description": "This endpoint is to trigger the cache sync.",
            "lambda_code": "./lambdas-functions/lambda_redis_sync.js"
        }
    ]
};
exports.main = async function (event, context) {
    try {
        if (event.httpMethod !== 'GET') {
            throw new Error(`Only GET requests are allowed for documentation.`);
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(documentation, null, 2)
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
