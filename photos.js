// Get modal elements
const modal = document.getElementById('photo-modal');
const modalImg = document.getElementById('modal-image');
const closeBtn = document.getElementsByClassName('close')[0];

// Initialize Google API client
gapi.load('client', function() {
    gapi.client.setToken({ access_token: localStorage.getItem('accessToken') });
    gapi.client.load('drive', 'v3', loadPhotos);
});

// Get or create the app folder
function getAppFolder() {
    return new Promise((resolve) => {
        gapi.client.drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder' name='VajraMeenuApp'",
            fields: 'files(id)'
        }).then(response => {
            const folders = response.result.files;
            if (folders && folders.length > 0) {
                resolve(folders[0].id);
            } else {
                gapi.client.drive.files.create({
                    resource: { name: 'VajraMeenuApp', mimeType: 'application/vnd.google-apps.folder' },
                    fields: 'id'
                }).then(response => resolve(response.result.id));
            }
        });
    });
}

// Get or create the photos folder
function getPhotosFolder() {
    return getAppFolder().then(appFolderId => {
        return new Promise((resolve) => {
            gapi.client.drive.files.list({
                q: `'${appFolderId}' in parents mimeType='application/vnd.google-apps.folder' name='photos'`,
                fields: 'files(id)'
            }).then(response => {
                const folders = response.result.files;
                if (folders && folders.length > 0) {
                    resolve(folders[0].id);
                } else {
                    gapi.client.drive.files.create({
                        resource: { name: 'photos', mimeType: 'application/vnd.google-apps.folder', parents: [appFolderId] },
                        fields: 'id'
                    }).then(response => resolve(response.result.id));
                }
            });
        });
    });
}

// Upload photo to Google Drive
function uploadPhoto(file) {
    return getPhotosFolder().then(folderId => {
        const metadata = { name: file.name, parents: [folderId] };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);
        return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') },
            body: form
        }).then(response => response.json());
    });
}

// Load photos from Google Drive
function loadPhotos() {
    getPhotosFolder().then(folderId => {
        gapi.client.drive.files.list({
            q: `'${folderId}' in parents mimeType contains 'image/'`,
            fields: 'files(id, name)'
        }).then(response => {
            const photosGrid = document.getElementById('photos-grid');
            photosGrid.innerHTML = '';
            const files = response.result.files;
            files.forEach(file => {
                const photoUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
                const photoCard = document.createElement('div');
                photoCard.className = 'photo-card';
                photoCard.innerHTML = `<img src="${photoUrl}" alt="${file.name}">`;
                photoCard.addEventListener('click', () => {
                    modal.style.display = 'flex';
                    modalImg.src = photoUrl;
                });
                photosGrid.appendChild(photoCard);
            });
        });
    });
}

// Handle photo upload
document.getElementById('add-photo-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('photo-file');
    const file = fileInput.files[0];
    if (file) {
        uploadPhoto(file).then(() => {
            loadPhotos();
            fileInput.value = '';
        }).catch(() => alert('Upload failed!'));
    } else {
        alert('Please select a photo to upload!');
    }
});

// Modal controls
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = event => { if (event.target == modal) modal.style.display = 'none'; };