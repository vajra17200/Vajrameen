// Load memories from localStorage
function loadMemories() {
    const memories = JSON.parse(localStorage.getItem('memories')) || [];
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
document.getElementById('add-memory-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const date = document.getElementById('memory-date').value;
    const text = document.getElementById('memory-text').value;
    const memories = JSON.parse(localStorage.getItem('memories')) || [];
    memories.push({ date, text });
    localStorage.setItem('memories', JSON.stringify(memories));
    loadMemories();
    document.getElementById('add-memory-form').reset();
});

// Edit memory
function editMemory(index) {
    const memories = JSON.parse(localStorage.getItem('memories'));
    const newText = prompt('Edit memory:', memories[index].text);
    if (newText !== null) {
        memories[index].text = newText;
        localStorage.setItem('memories', JSON.stringify(memories));
        loadMemories();
    }
}

// Initial load
loadMemories();