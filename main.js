const API_URL = 'https://api.thedogapi.com/v1/images/search';
const API_URL_FAVS = 'https://api.thedogapi.com/v1/favourites';
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
            img.src = data[0].url;
        }
        
    } catch (error) {
        console.log(error);
    }
}

// Favorites images
async function getFavorites() {
    try {
        const response = await fetch(`${API_URL_FAVS}?limit=3`, {
            headers: {
                'x-api-key': API_KEY,
            }, 
        });
        const data = await response.json();

        console.log('favorites response', response);
        console.log('favorites data', data);
        
        if (response.status !== 200) {
            spanError.innerHTML = `There was an error in Favorites: ${response.status} ${data.message}`;
            spanError.classList.add('error');
        } else {

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
async function saveToFavorites() {
    const response = await fetch(API_URL_FAVS, { // Se envia un obj como arg
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Indica que estamos trabajando en json
            'x-api-key': API_KEY,
        },
        body: JSON.stringify({ // Contienen la información como tal. // Se convierte a string para que el lenguaje en que está escrito el backend(api) lo pueda leer 
            image_id: '4hsn54Wod', // Pendiente: Id escrito manual
        }),
    });
    const data = await response.json();

    if (response.status !== 200) {
        spanError.innerHTML = `There was an error in Save to Favorites: ${response.status} ${data.message}`;
        spanError.classList.add('error');
    } else {

    }
}

const btn = document.getElementById('btn-random');
btn.onclick = getRandom;

getRandom();
getFavorites();
getRelateds();

