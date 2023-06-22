const API_URL = 'https://api.thedogapi.com/v1/images/search';
const API_URL_FAVS = 'https://api.thedogapi.com/v1/favourites';
const API_URL_FAVS_DELETE = (id) => `https://api.thedogapi.com/v1/favourites/${id}`;   // Pasa endpoint con id
const API_URL_UPLOAD = 'https://api.thedogapi.com/v1/images/upload';
const API_KEY = 'Your-api-key';
const msjText = document.getElementById('msj-text');
const msj = document.getElementById('msj');
const msjBtn = document.getElementById('msj-btn');
const button = document.getElementById('btnSaveToFav');
const tooltip = document.getElementById('tooltip-text');
const loader = document.getElementById('loader');
const BUTTON_MODES = Object.freeze({
    SAVE: Symbol(),
    DELETE: Symbol(),
});
let curRandomImgId;

// Crea instancia de axios y Agrega headers por defecto
const api = axios.create({
    baseURL: 'https://api.thedogapi.com/v1',
    headers: { 'x-api-key': API_KEY } // Agrega la api-key a cada petición.
});

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
            showMessage('error', `There was an error in Random: ${response.status} ${data.message}`);
            setTimeout(hideMessage, 3000);
        } else {
            const img = document.getElementById('main-img');
            
            img.src = data[0].url;
            const imgId = data[0].id;
            curRandomImgId = imgId;

            const isInFav = await isInFavorites(imgId);

            if (isInFav) {
                switchButtonTo(BUTTON_MODES.DELETE, imgId, isInFav.id);
            } else {
                switchButtonTo(BUTTON_MODES.SAVE, imgId); // Se declara funcion anonima que se llama solo al dar click y por dentro ejecuta otra funcion.
                // button.onclick = saveToFavorites(data[0].id); // ERROR. Esto llamará a la funct automaticamente, o al recargar la pag.
            }
        }
        return data;

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
            showMessage('error', `There was an error in Favorites: ${response.status} ${data.message}`);
            setTimeout(hideMessage, 3000);
        } else {
            // Limpia seccion
            const section = document.getElementById('favorites');

            if (data.length < 1) {
                section.classList.add('single-item');
                section.innerHTML = "";

                const div = document.createElement('div');
                const icon = document.createElement('span');
                icon.textContent = 'grade';
                
                const p = document.createElement('p');
                p.textContent = 'Don\'t lose this doge, save it to favorites';

                div.classList.add('section__caption');
                icon.classList.add('material-symbols-outlined');

                div.append(icon, p);
                section.appendChild(div);
            } else {
                section.classList.remove('single-item');
                section.innerHTML = "";
                // y vuelve a crear titulo
                /*
                const h2 = document.createElement('h2');
                const h2Text = document.createTextNode('Favorites doges');
                h2.appendChild(h2Text);
                h2.classList.add('section__title');
                section.appendChild(h2); */

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
                    button.onclick = () => deleteFromFavorites(item.id, item.image_id); // Asigna id a botón eliminar
                    img.src = item.image.url; // Asigna image al attr src
                    article.appendChild(button); 
                    article.appendChild(img);
                    section.appendChild(article);
                })
            }
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
async function saveToFavorites(imgId) {
    /* Usando fetch
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
    const data = await response.json();  */

    /* Usando Axios */
    const { data, status } = await api.post('/favourites', {
        image_id: imgId,
    });
    // { data, status }: Propiedades del típico obj response obtenido al realizar petición, evitan usar: data=await response.json(); y response.status.
    // Llamamos a instancia que contiene url, indicamos metodo, pasamos endpoint y data.
    // La api-key se agregó con los headers por default.

    if (status !== 200) {
        showMessage('error', `There was an error in Save to Favorites: ${status} ${data.message}`);
        setTimeout(hideMessage, 3000);
    } else {
        console.log('Guardado en favoritos');
        if (imgId == curRandomImgId) {
            switchButtonTo(BUTTON_MODES.DELETE, imgId, data.id);
        }
        getFavorites();
    }

}

// Delete image from Favorites
async function deleteFromFavorites(id, imgId) {
    const response = await fetch(API_URL_FAVS_DELETE(id), {
        method: 'DELETE',
        headers: {
            'x-api-key': API_KEY,
        }, 
    });
    const data = await response.json();

    if (response.status !== 200) {
        showMessage('error', `There was an error in Delete from Favorites: ${response.status} ${data.message}`);
        setTimeout(hideMessage, 3000);
    } else {
        console.log('Eliminado de favoritos');
        if (imgId == curRandomImgId) {
            switchButtonTo(BUTTON_MODES.SAVE, imgId);
        }
        getFavorites();
    }
}

async function uploadPhoto() {
    showLoader();

    const form = document.getElementById('uploadingForm');
    const formData = new FormData(form); // Crea instancia FormData y le pasa un form con todos los valores de los input que contenga

    console.log(formData.get('file')); // Obtenemos la llave file, que es el valor del input con name='file' del form.

    const response = await fetch(API_URL_UPLOAD, {
        method: 'POST',
        headers: {
            // 'Content-Type': 'multipart/form-data', // Al definir Content-type manualmente requiere param boundary o marcará error. Se deja a Fetch que defina el content-type con todo y boundary automaticamente. 
            'x-api-key': API_KEY,
        },
        body: formData, // FormData no requiere parsear el body.
        
    });

    const data = await response.json();

    if (response.status !== 201) { // Se compara con status created 201
        showMessage('error', `There was an error in Upload Photo: ${response.status} ${data.message}`);
        setTimeout(hideMessage, 3000);
    } else {
        console.log('Foto subida correctamente');
        console.log('data:', data);
        console.log('data.url:',data.url);
        saveToFavorites(data.id); // Guarda imagen subida en favoritos
    }

    resetForm();
    hideLoader();
}

async function previewImage() {
    const input = document.getElementById('input-file');
    const fileReturn = document.getElementById('file-return');
    const files = input.files; // La propiedad files del elemento input nos devuelve un array con una lista de objetos representando los archivos cargados en la etiqueta input. Guardados en el navegador, obtenidos del SO.
    console.log('file:', files)

    if (files.length > 0) {
        const fileReader = new FileReader(); // Crea instancia de FileReader

        fileReader.readAsDataURL(files[0]); // Lee el primer archivo. Y convierte archivo de imagen en string base64.

        fileReader.onload = function() {
            const previewContainer = document.getElementById('preview-container');
            previewContainer.classList.add('related-img-container');
            previewContainer.classList.add('preview-container');
            const previewImage = document.getElementById('preview')
            previewImage.src = fileReader.result; // Asigna imagen a etiqueta
            previewImage.classList.add('img');
            const previewDeleteBtn = document.getElementById('preview-delete-btn');
            previewDeleteBtn.classList.remove('inactive');

            fileReturn.innerHTML = files[0].name; // Retorna el nombre del archivo
        }
    }
}

async function isInFavorites(imgId) {
    const { data } = await api.get(`/favourites?image_id=${imgId}`);
    return data[0] ? data[0] : false;
}

function showMessage(type, message) {
    msj.classList.remove('msj--error');
    msj.classList.remove('msj--success');
    msj.classList.add(`msj--${type}`);
    msjText.textContent = message;
    msj.style.display = 'flex';
    msjBtn.addEventListener('click', hideMessage);
}

function hideMessage() {
    msj.style.display = 'none';
}

function switchButtonTo(mode, imgId, id = false) {
	if (mode == BUTTON_MODES.SAVE) {
		button.classList.remove('favorite');
        tooltip.innerHTML = 'Add to favorites';
	    button.onclick = () => saveToFavorites(imgId);
	} else if (mode == BUTTON_MODES.DELETE) {
		button.classList.add('favorite');
        tooltip.innerHTML = 'Delete from favorites';
        button.onclick = () => deleteFromFavorites(id, imgId);
	}
}

function resetForm() {            
    const previewContainer = document.getElementById('preview-container');
    previewContainer.classList.remove('related-img-container');
    previewContainer.classList.remove('preview-container');
    const previewImage = document.getElementById('preview')
    previewImage.src = '';
    previewImage.classList.remove('img');
    const previewDeleteBtn = document.getElementById('preview-delete-btn');
    previewDeleteBtn.classList.add('inactive');
    const fileReturn = document.getElementById('file-return');
    fileReturn.textContent = '';
}

function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}

const btn = document.getElementById('btn-random');
btn.onclick = getRandom;

getRandom();
getFavorites();
getRelateds();

