document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const validUsers = {
        'kunjoo': 'vennamavale',
        'musii': 'vennamavane'
    };

    if (validUsers[username] && validUsers[username] === password) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.assign('home.html');
    } else {
        alert('Invalid username or password');
    }
});