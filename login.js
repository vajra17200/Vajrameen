function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    const email = profile.getEmail();
    // Restrict to specific Google accounts (replace with your emails)
    const allowedEmails = ['vajra172007@gmail.com', 'your_email2@gmail.com'];
    if (allowedEmails.includes(email)) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('accessToken', googleUser.getAuthResponse().access_token);
        window.location.assign('home.html');
    } else {
        alert('Access denied. Only specific users are allowed.');
        gapi.auth2.getAuthInstance().signOut();
    }
}