const Busboy = require('busboy');
exports.handler = async function (event, context) {
    // Recibe datos (event) y el contenido (event.body) a partir de una cadena base64 ej: 'LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5SHFvc...'
    // separa el contenido por 'archivos'
    // guarda en un objeto cada archivo junto con 3 datos(nombre, tipo y contenido) 
    // el contenido es transformado en un objeto buffer ej2: <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64 21>
    // y devuelve el objeto con cada archivo.
    const params = await parseMultipartForm(event); // object { file: [ {filename:'', type:'', content: *ej2*}] }
    const { file } = params;
    const { filename, type, content } = file[0];

    const ui8 = new Uint8Array(content) // Uint8Array(735) [ 255, 216, 255, 224, 0, 16, ... ]
    const blob = new Blob([ui8], { type: type }); //  object Blob { size: 735, type: 'image/jpeg' }
    
    const formData = new FormData();
    formData.append('file', blob, filename);
    try {
        const response = await fetch('https://api.thedogapi.com/v1/images/upload', {
            method: 'POST',
            headers: {
                // 'Content-Type': 'multipart/form-data', // Al definir Content-type manualmente requiere param boundary o marcará error. Se deja a Fetch que defina el content-type con todo y boundary automaticamente. 
                'x-api-key': process.env.API_KEY,
            },
            body: formData, // FormData no requiere parsear el body. 
        });
        if (response.status !== 201) {
            throw new Error(`${ response.status } - ${ response.statusText }`);
        }
        const data = await response.json();
        return {
            statusCode: 201,
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.log(err)
        return {
            statusCode: 422,
            body: JSON.stringify({message: String(err)}) //err.stack
        };
    }
};

function parseMultipartForm(event) {
    return new Promise((resolve) => {
        // we'll store all form fields inside of this
        const fields = {};

        // let's instantiate our busboy instance!
        const busboy = Busboy({
            // it uses request headers
            // to extract the form boundary value (the ----WebKitFormBoundary thing)
            headers: event.headers
        });

        // before parsing anything, we need to set up some handlers.
        // whenever busboy comes across a file ...
        busboy.on("file", (name, file, info) => {
            const { filename, encoding, mimeType } = info;
            file.on("data", (data) => {
                if (!fields[name])
                    fields[name] = []
    
                fields[name].push({
                    filename,
                    type: mimeType,
                    content: data,
                });
            });
        });

        // whenever busboy comes across a normal field ...
        busboy.on("field", (fieldName, value) => {
            // ... we write its value into `fields`.
            fields[fieldName] = value;
        });

        // once busboy is finished, we resolve the promise with the resulted fields.
        busboy.on("close", () => {
            resolve(fields)
        });

        // now that all handlers are set up, we can finally start processing our request!
        // busboy.write(event.body);
        //busboy.write(Buffer.from(event.body, 'base64'))
        busboy.end(Buffer.from(event.body, 'base64'));
    });
}