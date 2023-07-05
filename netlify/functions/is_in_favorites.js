exports.handler = async function (event, context) {
    const params = JSON.parse(event.body);
    const { image_id } = params;
    const url = `https://api.thedogapi.com/v1/favourites?image_id=${image_id}`;
    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': process.env.API_KEY
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