const API_URL = 'https://api.thedogapi.com/v1/images/search';
const API_URL_FAVS = 'https://api.thedogapi.com/v1/favourites?limit=3';

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

        if (response.status !== 200) {
            spanError.innerHTML = `There was an error in Random: ${response.status} ${data.message}`;
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
        const response = await fetch(API_URL_FAVS);
        const data = await response.json();
        console.log('favorites', response);
        console.log('favorites', data);
        if (response.status !== 200) {
            spanError.innerHTML = `There was an error in Favorites: ${response.status} ${data.message}`;
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

const btn = document.getElementById('btn-random');
btn.onclick = getRandom;

getRandom();
getFavorites();
getRelateds();

