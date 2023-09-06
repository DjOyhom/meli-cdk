exports.main = async function (event, context) {
    try {
        if (event.httpMethod !== 'GET') {
            throw new Error(`Only GET requests are allowed for documentation.`);
        }

        const documentation = {
            "endpoints": [
                {
                    "path": "/{shortcode}",
                    "method": "GET",
                    "description": "Redirect to the original URL using the short code."
                },
                {
                    "path": "/short_management",
                    "method": "POST",
                    "description": "Create a new shortened URL.",
                    "parameters": {
                        "long_url": "The URL to be shortened."
                    }
                },
                {
                    "path": "/short_management",
                    "method": "PUT",
                    "description": "Update the original URL associated with the short code.",
                    "parameters": {
                        "shortCode": "The short code to identify the long_url",
                        "long_url": "The new URL to associate with the short code."
                    }
                },
                {
                    "path": "/short_management",
                    "method": "DELETE",
                    "description": "Delete a URL shortening entry.",
                    "parameters": {
                        "shortCode": "The short code for the URL to be deleted."
                    }
                },
                {
                    "path": "/short_management",
                    "method": "GET",
                    "description": "List all shortened URLs.",
                    "parameters": {}
                }
            ]
        };

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
