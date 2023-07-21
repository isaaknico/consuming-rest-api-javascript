const API_URL = 'https://api.thedogapi.com/v1/images/search';
const msjText = document.getElementById('msj-text');
const msj = document.getElementById('msj');
const msjBtn = document.getElementById('msj-btn');
const button = document.getElementById('btnSaveToFav');
const tooltip = document.getElementById('tooltip-text');
const loader = document.getElementById('loader');
const favContainer = document.getElementById('favorites');
const favTemplate = document.getElementById('favorite-template');
const BUTTON_MODES = Object.freeze({
    SAVE: Symbol(),
    DELETE: Symbol(),
});
let curRandomImgId;

// Crea instancia de axios y Agrega headers por defecto
const server = axios.create({
    baseURL: '/.netlify/functions',
    //headers: { 'x-api-key': API_KEY } // API_KEY ahora se leerá desde el servidor, donde también se realizará el pedido a la API.
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
            printMainImage(data[0].id, data[0].url);
        }
        return data;

    } catch (error) {
        console.log(error);
    }
}

// Favorites images
async function getFavorites() {
    try {
        const response = await fetch('/.netlify/functions/get_favorites');
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
                    const div = favTemplate.content.cloneNode(true);
                    const article = div.getElementById('favorite');
                    const button = div.getElementById('favorite-btn');
                    button.onclick = () => deleteFromFavorites(item.id, item.image_id); // Asigna id a botón eliminar
                    const img = div.getElementById('favorite-img');
                    img.src = item.image.url; // Asigna image al attr src
                    img.alt = "Favorite dog image"
                    img.onclick = () => { 
                        printMainImage(item.image_id, item.image.url);
                        window.scrollTo(0, 0);
                    };
                    article.onkeydown = (e) => {
                        if (e.code === 'Enter' || e.code === 'Space') {
                            e.preventDefault();
                            printMainImage(item.image_id, item.image.url);
                            window.scrollTo(0, 0);
                        }
                    };
                    section.append(div);
                })
            }
        }

    } catch (error) {
        console.log(error);
    }
}

// Related images
async function getRelateds() {
    const container = document.getElementById('relateds');
    const relatedTemplate = document.getElementById('related-template');
    renderSkeletons(relatedTemplate, container, 4);

    try {
        const resRelated = await fetch(`${API_URL}?limit=4`);
        const dataRelated = await resRelated.json();

        container.innerHTML = '';

        for (let i = 0; i < 4; i++) {
            const div = relatedTemplate.content.cloneNode(true);
            const article = div.getElementById('related');
            const img = div.getElementById('related-img');
            img.src = dataRelated[i].url;
            img.alt = 'Related dog image';
            img.onclick = () => { 
                printMainImage(dataRelated[i].id, dataRelated[i].url);
                window.scrollTo(0, 0);
            };
            article.onkeydown = (e) => { 
                if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    printMainImage(dataRelated[i].id, dataRelated[i].url);
                    window.scrollTo(0, 0);
                    const btnSave = document.getElementById('btnSaveToFav');
                    btnSave.focus();
                }
            };
            container.append(div);
        };
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
    const { data, status } = await server.post('/save_to_favorites', {
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
    const response = await fetch('/.netlify/functions/delete_from_favorites', {
        method: 'POST',
        body: JSON.stringify({
            favorite_id: id,
        })
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
    const isFormValid = validateForm();
    if (!isFormValid) {
        return false;
    }

    showLoader();

    const form = document.getElementById('uploadingForm');
    const formData = new FormData(form); // Crea instancia FormData y le pasa un form con todos los valores de los input que contenga

    console.log(formData.get('file')); // Obtenemos la llave file, que es el valor del input con name='file' del form.

    const response = await fetch('/.netlify/functions/upload_photo', {
        method: 'POST',
        body: formData, // FormData no requiere parsear el body.
    });
    const data = await response.json();

    if (response.status !== 201) { // Se compara con status created 201
        showMessage('error', `There was an error in Upload Photo. ${data.message}`);
        setTimeout(hideMessage, 3000);
    } else {
        console.log('Foto subida correctamente');
        console.log('data:', data);
        console.log('data.url:',data.url);
        saveToFavorites(data.id); // Guarda imagen subida en favoritos
        showMessage('success', 'Photo uploaded successfully. Thanks for sharing.');
        setTimeout(hideMessage, 3000);
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
    const { data } = await server.post('/is_in_favorites', {
        image_id: imgId,
    });
    return data[0] ? data[0] : false;
}

async function printMainImage(imgId, url) {
    const img = document.getElementById('main-img');
            
    img.src = url;
    img.alt = "Random dog image"
    curRandomImgId = imgId;

    const isInFav = await isInFavorites(imgId);

    if (isInFav) {
        switchButtonTo(BUTTON_MODES.DELETE, imgId, isInFav.id);
    } else {
        switchButtonTo(BUTTON_MODES.SAVE, imgId); // Se declara funcion anonima que se llama solo al dar click y por dentro ejecuta otra funcion.
        // button.onclick = saveToFavorites(data[0].id); // ERROR. Esto llamará a la funct automaticamente, o al recargar la pag.
    }
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

function validateForm() {
    const fileInput = document.getElementById('input-file');
    const file = fileInput.files[0];

    if (!file) {
        showMessage('error', `You have not selected any file.`)
        setTimeout(hideMessage, 3000);
        return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        showMessage('error', `The selected file is not a valid image. Please select a JPEG, PNG or GIF image.`)
        setTimeout(hideMessage, 3000);
        return false;
    }

    return true;
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
    document.getElementById('uploadingForm').reset();
}

function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}

function renderSkeletons(template, container, quantity) {
    for (let i = 0; i < quantity; i++) {
        container.append(template.content.cloneNode(true));
    }
}

const btn = document.getElementById('btn-random');
btn.onclick = getRandom;

getRandom();
renderSkeletons(favTemplate, favContainer, 6);
getFavorites();
getRelateds();

