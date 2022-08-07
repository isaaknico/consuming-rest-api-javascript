console.log('Hello worlds');
const API_URL = 'https://nekos.best/api/v2/neko';

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
        const img = document.getElementById('main-img');
        img.src = data.results[0].url;
        
    } catch (error) {
        console.log(error)
    }
}

// Related images
async function getRelated() {
    try {
        const resRelated = await fetch(`${API_URL}?amount=4`);
        const dataRelated = await resRelated.json();

        console.log(dataRelated);
        const imgRelated1 = document.getElementById('related-img-1');
        const imgRelated2 = document.getElementById('related-img-2');
        const imgRelated3 = document.getElementById('related-img-3');
        const imgRelated4 = document.getElementById('related-img-4');

        imgRelated1.src = dataRelated.results[0].url;
        imgRelated2.src = dataRelated.results[1].url;
        imgRelated3.src = dataRelated.results[2].url;
        imgRelated4.src = dataRelated.results[3].url;
    } catch (error) {
        console.log(error)
    }
}

const btn = document.querySelector('button');
btn.onclick = getRandom;

getRandom();
getRelated();

