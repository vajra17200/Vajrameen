// Show/Hide Modal
const modal = document.getElementById('settings-modal');
const btn = document.getElementById('settings-btn');
const span = document.getElementsByClassName('close')[0];

btn.onclick = function() {
    modal.style.display = 'block';
}
span.onclick = function() {
    modal.style.display = 'none';
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Apply Styles
document.getElementById('apply-styles').addEventListener('click', function() {
    const fontSize = document.getElementById('font-size').value + 'px';
    const fontFamily = document.getElementById('font-family').value;
    document.body.style.fontSize = fontSize;
    document.body.style.fontFamily = fontFamily;
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('fontFamily', fontFamily);
});

// Set Background
document.getElementById('set-background').addEventListener('click', function() {
    const backgroundUrl = document.getElementById('background-url').value;
    if (backgroundUrl) {
        document.body.style.backgroundImage = `url(${backgroundUrl})`;
        document.body.style.backgroundSize = 'cover';
        localStorage.setItem('background', backgroundUrl);
    }
});

// Load Saved Styles
window.onload = function() {
    const savedFontSize = localStorage.getItem('fontSize');
    const savedFontFamily = localStorage.getItem('fontFamily');
    const savedBackground = localStorage.getItem('background');
    if (savedFontSize) document.body.style.fontSize = savedFontSize;
    if (savedFontFamily) document.body.style.fontFamily = savedFontFamily;
    if (savedBackground) {
        document.body.style.backgroundImage = `url(${savedBackground})`;
        document.body.style.backgroundSize = 'cover';
    }
};