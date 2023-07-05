exports.handler = async function (event, context) {
    const params = JSON.parse(event.body);
    const { image_id } = params;
    try {
        const response = await fetch('https://api.thedogapi.com/v1/favourites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY
            },
            body: JSON.stringify({
                'image_id': image_id
            }),
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