exports.handler = async function (event, context) {
    try {
        const response = await fetch('https://api.thedogapi.com/v1/favourites', {
            headers: {
                'x-api-key': process.env.API_KEY,
            },
        });
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (err) {
        return {
            statusCode: 422,
            body: err.stack
        };
    }
};