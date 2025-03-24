let diaryEntries = {};

// DOM elements
const dateInput = document.getElementById('diary-date');
const textArea = document.getElementById('diary-text');
const saveButton = document.getElementById('save-entry');
const entryDatesList = document.getElementById('entry-dates');

// Initialize Google API client and load entries
gapi.load('client', function() {
    gapi.client.setToken({ access_token: localStorage.getItem('accessToken') });
    gapi.client.load('drive', 'v3', () => {
        initDiary();
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

// Get or create diary.json
function getDiaryFile() {
    return getAppFolder().then(appFolderId => {
        return new Promise((resolve) => {
            gapi.client.drive.files.list({
                q: `'${appFolderId}' in parents name='diary.json'`,
                fields: 'files(id)'
            }).then(response => {
                const files = response.result.files;
                if (files && files.length > 0) {
                    resolve(files[0].id);
                } else {
                    const metadata = { name: 'diary.json', mimeType: 'application/json', parents: [appFolderId] };
                    const content = JSON.stringify({});
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

// Load diary entries
function loadDiaryEntries() {
    return getDiaryFile().then(fileId => {
        return gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        }).then(response => JSON.parse(response.body));
    });
}

// Save diary entries
function saveDiaryEntries(entries) {
    return getDiaryFile().then(fileId => {
        const content = JSON.stringify(entries);
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

// Initialize diary
async function initDiary() {
    diaryEntries = (await loadDiaryEntries()) || {};
    displayEntryDates();
    loadEntry();
}

// Load entry for selected date
function loadEntry() {
    const selectedDate = dateInput.value;
    textArea.value = diaryEntries[selectedDate] || '';
}

// Display dates with entries
function displayEntryDates() {
    entryDatesList.innerHTML = '';
    Object.keys(diaryEntries).sort().forEach(date => {
        const listItem = document.createElement('li');
        listItem.textContent = date;
        listItem.addEventListener('click', () => {
            dateInput.value = date;
            loadEntry();
        });
        entryDatesList.appendChild(listItem);
    });
}

// Event listeners
dateInput.addEventListener('change', loadEntry);
saveButton.addEventListener('click', async () => {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
        alert('Please select a date.');
        return;
    }
    const entryText = textArea.value.trim();
    if (entryText) {
        diaryEntries[selectedDate] = entryText;
    } else {
        delete diaryEntries[selectedDate];
    }
    await saveDiaryEntries(diaryEntries);
    displayEntryDates();
    alert('Entry saved!');
});

// Set today's date
dateInput.value = new Date().toISOString().split('T')[0];