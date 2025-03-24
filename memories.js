let memories = [];

// Initialize Google API client
gapi.load('client', function() {
    gapi.client.setToken({ access_token: localStorage.getItem('accessToken') });
    gapi.client.load('drive', 'v3', () => {
        initMemories();
    });
});

// Get or create app folder
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

// Get or create memories.json
function getMemoriesFile() {
    return getAppFolder().then(appFolderId => {
        return new Promise((resolve) => {
            gapi.client.drive.files.list({
                q: `'${appFolderId}' in parents name='memories.json'`,
                fields: 'files(id)'
            }).then(response => {
                const files = response.result.files;
                if (files && files.length > 0) {
                    resolve(files[0].id);
                } else {
                    const metadata = { name: 'memories.json', mimeType: 'application/json', parents: [appFolderId] };
                    const content = JSON.stringify([]);
                    const form = new FormData();
                    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                    form.append('file', new Blob([content], { type: 'application/json' }));
                    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') },
                        body: form
                    }).then(response => response.json()).then(file => resolve(file.id));
                }
            });
        });
    });
}

// Load memories
function loadMemories() {
    return getMemoriesFile().then(fileId => {
        return gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        }).then(response => JSON.parse(response.body));
    });
}

// Save memories
function saveMemories(memories) {
    return getMemoriesFile().then(fileId => {
        const content = JSON.stringify(memories);
        return fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
                'Content-Type': 'application/json'
            },
            body: content
        });
    });
}

// Initialize memories
async function initMemories() {
    memories = (await loadMemories()) || [];
    loadMemoriesUI();
}

// Load memories UI
function loadMemoriesUI() {
    const memoriesList = document.getElementById('memories-list');
    memoriesList.innerHTML = '';
    memories.forEach((memory, index) => {
        const memoryCard = document.createElement('div');
        memoryCard.className = 'card';
        memoryCard.innerHTML = `
            <div class="heart"></div>
            <h3>${memory.date}</h3>
            <p>${memory.text}</p>
            <button onclick="editMemory(${index})">Edit</button>
        `;
        memoriesList.appendChild(memoryCard);
    });
}

// Add new memory
document.getElementById('add-memory-form').addEventListener('submit', async event => {
    event.preventDefault();
    const date = document.getElementById('memory-date').value;
    const text = document.getElementById('memory-text').value;
    memories.push({ date, text });
    await saveMemories(memories);
    loadMemoriesUI();
    document.getElementById('add-memory-form').reset();
});

// Edit memory
function editMemory(index) {
    const newText = prompt('Edit memory:', memories[index].text);
    if (newText !== null) {
        memories[index].text = newText;
        saveMemories(memories).then(loadMemoriesUI);
    }
}