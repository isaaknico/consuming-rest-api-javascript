console.log('Hello worlds');
const URL = 'https://nekos.best/api/v2/neko';

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
async function getRandom() {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        const img = document.querySelector('img');
        img.src = data.results[0].url;
        
    } catch (error) {
        console.log(error)
    }
}

const btn = document.querySelector('button');
btn.onclick = getRandom;

getRandom();

