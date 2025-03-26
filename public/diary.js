// Load diary entries from localStorage
let diaryEntries = JSON.parse(localStorage.getItem('diaryEntries')) || {};

// Get DOM elements
const dateInput = document.getElementById('diary-date');
const textArea = document.getElementById('diary-text');
const saveButton = document.getElementById('save-entry');
const entryDatesList = document.getElementById('entry-dates');

// Load the entry for the selected date
function loadEntry() {
    const selectedDate = dateInput.value;
    if (diaryEntries[selectedDate]) {
        textArea.value = diaryEntries[selectedDate];
    } else {
        textArea.value = '';
    }
}

// Display the list of dates with entries
function displayEntryDates() {
    entryDatesList.innerHTML = '';
    Object.keys(diaryEntries).sort().forEach(date => {
        const listItem = document.createElement('li');
        listItem.textContent = date;
        listItem.addEventListener('click', function() {
            dateInput.value = date;
            loadEntry();
        });
        entryDatesList.appendChild(listItem);
    });
}

// Event listener for date changes
dateInput.addEventListener('change', loadEntry);

// Event listener for save button
saveButton.addEventListener('click', function() {
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
    localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
    displayEntryDates(); // Update the list of dates
    alert('Entry saved!');
});

// Initialize: Set today's date and load any existing entry
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;
loadEntry();
displayEntryDates();