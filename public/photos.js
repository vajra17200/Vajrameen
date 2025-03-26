// Get modal elements
const modal = document.getElementById('photo-modal');
const modalImg = document.getElementById('modal-image');
const closeBtn = document.getElementsByClassName('close')[0];

// Load photos from localStorage
function loadPhotos() {
    const photos = JSON.parse(localStorage.getItem('photos')) || [];
    const photosGrid = document.getElementById('photos-grid');
    photosGrid.innerHTML = ''; // Clear the grid
    photos.forEach(photoUrl => {
        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card';
        photoCard.innerHTML = `<img src="${photoUrl}" alt="Photo">`;
        // Add click event to open the modal
        photoCard.addEventListener('click', function() {
            modal.style.display = 'flex'; // Show the modal
            modalImg.src = photoUrl; // Set the modal image
        });
        photosGrid.appendChild(photoCard);
    });
}

// Close the modal when the close button is clicked
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Close the modal when clicking outside the image
modal.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle photo uploads
document.getElementById('add-photo-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('photo-file');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoDataUrl = e.target.result; // Image as a data URL
            const photos = JSON.parse(localStorage.getItem('photos')) || [];
            photos.push(photoDataUrl);
            localStorage.setItem('photos', JSON.stringify(photos));
            loadPhotos(); // Refresh the grid
            document.getElementById('add-photo-form').reset(); // Clear the form
        };
        reader.readAsDataURL(file);
    }
});

// Load photos when the page opens
loadPhotos();