const API_URL = 'https://api.thedogapi.com/v1/images/search';
const API_URL_FAVS = 'https://api.thedogapi.com/v1/favourites';
const API_URL_FAVS_DELETE = (id) => `https://api.thedogapi.com/v1/favourites/${id}`;   // Pasa endpoint con id
const API_KEY = 'Your-api-key';

const spanError = document.getElementById('error');

/* Usando fetch y .then
function fetchData() {
    fetch(URL)
    .then(res => res.json()) // Convierte respuesta de promesa y api a algo que JS entienda
    .then(data => {
        const img = document.querySelector('img');
        img.src = data.results[0].url;
        
        // En caso de ser un array accedemos directo al elem 0: data[0].propiedad
    });
} */

// Usando Async Await
// Main image
async function getRandom() {  
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log('random data', data);

        if (response.status !== 200) {
            spanError.innerHTML = `There was an error in Random: ${response.status} ${data.message}`;
            spanError.classList.add('error');
        } else {
            const img = document.getElementById('main-img');
            const button = document.getElementById('btnSaveToFav');
            
            img.src = data[0].url;
            button.onclick = () => saveToFavorites(data[0].id); // Se declara funcion anonima que se llama solo al dar click y por dentro ejecuta otra funcion.
            // button.onclick = saveToFavorites(data[0].id); // ERROR. Esto llamará a la funct automaticamente, o al recargar la pag.
        }
        
    } catch (error) {
        console.log(error);
    }
}

// Favorites images
async function getFavorites() {
    try {
        const response = await fetch(`${API_URL_FAVS}`, {
            headers: {
                'x-api-key': API_KEY,
            }, 
        });
        const data = await response.json();

        // Ordena por agregados recientemente
        data.sort((a, b) => {
            let dateA = new Date(a.created_at);
            let dateB = new Date(b.created_at);
            
            return dateB - dateA;
        });

        console.log('favorites response', response);
        console.log('favorites data', data);
        
        if (response.status !== 200) {
            spanError.innerHTML = `There was an error in Favorites: ${response.status} ${data.message}`;
            spanError.classList.add('error');
        } else {
            // Limpia seccion y vuelve a crear titulo
            const section = document.getElementById('favorites');
            section.innerHTML = "";

            const h2 = document.createElement('h2');
            const h2Text = document.createTextNode('Favorites doges');
            h2.appendChild(h2Text);
            h2.classList.add('section__title');
            section.appendChild(h2);

            // Recorre cada uno de los elems
            data.forEach(item => {
                // Manipula el DOM dinamicamente
                const article = document.createElement('article');
                article.classList.add('related-img-container');

                const button = document.createElement('button');
                button.classList.add('img__btn--delete');

                const span = document.createElement('span');
                span.classList.add('material-symbols-outlined');

                const spanText = document.createTextNode('delete'); // Crea un texto para un nodo html, se debe indicar el texto que queremos crear.

                const img = document.createElement('img');
                img.classList.add('img');

                span.appendChild(spanText); // Inserta texto dentro de elem span
                button.appendChild(span); // Inserta span dentro del botón
                button.onclick = () => deleteFromFavorites(item.id); // Asigna id a botón eliminar
                img.src = item.image.url; // Asigna image al attr src
                article.appendChild(button); 
                article.appendChild(img);
                section.appendChild(article);
            })
        }

    } catch (error) {
        console.log(error);
    }
}

// Related images
async function getRelateds() {
    try {
        const resRelated = await fetch(`${API_URL}?limit=4`);
        const dataRelated = await resRelated.json();

        const imgRelated1 = document.getElementById('related-img-1');
        const imgRelated2 = document.getElementById('related-img-2');
        const imgRelated3 = document.getElementById('related-img-3');
        const imgRelated4 = document.getElementById('related-img-4');

        imgRelated1.src = dataRelated[0].url;
        imgRelated2.src = dataRelated[1].url;
        imgRelated3.src = dataRelated[2].url;
        imgRelated4.src = dataRelated[3].url;
    } catch (error) {
        console.log(error)
    }
}

// Save image to Favorites
async function saveToFavorites(id) {
    const response = await fetch(API_URL_FAVS, { // Se envia un obj como arg
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Indica que estamos trabajando en json
            'x-api-key': API_KEY,
        },
        body: JSON.stringify({ // Contienen la información como tal. // Se convierte a string para que el lenguaje en que está escrito el backend(api) lo pueda leer 
            image_id: id,
        }),
    });
    const data = await response.json();

    if (response.status !== 200) {
        spanError.innerHTML = `There was an error in Save to Favorites: ${response.status} ${data.message}`;
        spanError.classList.add('error');
    } else {
        console.log('Guardado en favoritos');
        getFavorites();
    }
}

// Delete image from Favorites
async function deleteFromFavorites(id) {
    const response = await fetch(API_URL_FAVS_DELETE(id), {
        method: 'DELETE',
        headers: {
            'x-api-key': API_KEY,
        }, 
    });
    const data = await response.json();

    if (response.status !== 200) {
        spanError.innerHTML = `There was an error in Delete from Favorites: ${response.status} ${data.message}`;
        spanError.classList.add('error');
    } else {
        console.log('Eliminado de favoritos');
        getFavorites();
    }
}

const btn = document.getElementById('btn-random');
btn.onclick = getRandom;

getRandom();
getFavorites();
getRelateds();

