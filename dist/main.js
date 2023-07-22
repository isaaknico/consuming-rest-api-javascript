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

const server = axios.create({
    baseURL: '/.netlify/functions',
});

async function getRandom() {  
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

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

async function getFavorites() {
    try {
        const response = await fetch('/.netlify/functions/get_favorites');
        const data = await response.json();

        data.sort((a, b) => {
            let dateA = new Date(a.created_at);
            let dateB = new Date(b.created_at);
            
            return dateB - dateA;
        });
        
        if (response.status !== 200) {
            showMessage('error', `There was an error in Favorites: ${response.status} ${data.message}`);
            setTimeout(hideMessage, 3000);
        } else {
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

                data.forEach(item => {
                    const div = favTemplate.content.cloneNode(true);
                    const article = div.getElementById('favorite');
                    const button = div.getElementById('favorite-btn');
                    button.onclick = () => deleteFromFavorites(item.id, item.image_id);
                    const img = div.getElementById('favorite-img');
                    img.src = item.image.url;
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

async function saveToFavorites(imgId) {
    const { data, status } = await server.post('/save_to_favorites', {
        image_id: imgId,
    });

    if (status !== 200) {
        showMessage('error', `There was an error in Save to Favorites: ${status} ${data.message}`);
        setTimeout(hideMessage, 3000);
    } else {
        if (imgId == curRandomImgId) {
            switchButtonTo(BUTTON_MODES.DELETE, imgId, data.id);
        }
        getFavorites();
    }

}

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
    const formData = new FormData(form);

    const response = await fetch('/.netlify/functions/upload_photo', {
        method: 'POST',
        body: formData, // FormData does not require parsing the body.
    });
    const data = await response.json();

    if (response.status !== 201) {
        showMessage('error', `There was an error in Upload Photo. ${data.message}`);
        setTimeout(hideMessage, 3000);
    } else {
        saveToFavorites(data.id);
        showMessage('success', 'Photo uploaded successfully. Thanks for sharing.');
        setTimeout(hideMessage, 3000);
    }

    resetForm();
    hideLoader();
}

async function previewImage() {
    const input = document.getElementById('input-file');
    const fileReturn = document.getElementById('file-return');
    const files = input.files; // The files property of the input element returns an array with a list of objects representing the files loaded in the input tag. Saved in the browser, obtained from the OS.

    if (files.length > 0) {
        const fileReader = new FileReader();

        fileReader.readAsDataURL(files[0]); // Reads the first file and converts it from an image file to a Data URL (base64 string).

        fileReader.onload = function() {
            const previewContainer = document.getElementById('preview-container');
            previewContainer.classList.add('related-img-container');
            previewContainer.classList.add('preview-container');
            const previewImage = document.getElementById('preview')
            previewImage.src = fileReader.result; // Assign image to tag.
            previewImage.classList.add('img');
            const previewDeleteBtn = document.getElementById('preview-delete-btn');
            previewDeleteBtn.classList.remove('inactive');

            fileReturn.innerHTML = files[0].name; // Assign file name to tag.
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
        switchButtonTo(BUTTON_MODES.SAVE, imgId);
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

