let currentUser = null;
let isAuthenticated = false;
let currentView = 'grid';
let searchTimeout = null;

function checkAuthStatus() {
    const userData = localStorage.getItem('docchain_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        isAuthenticated = true;
        updateNavigation();
    }
}

function updateNavigation() {
    const authNav = document.getElementById('auth-nav');
    const uploadNav = document.getElementById('upload-nav');
    const logoutNav = document.getElementById('logout-nav');
    
    if (isAuthenticated) {
        authNav.style.display = 'none';
        uploadNav.style.display = 'block';
        logoutNav.style.display = 'block';
    } else {
        authNav.style.display = 'block';
        uploadNav.style.display = 'none';
        logoutNav.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('docchain_user');
    currentUser = null;
    isAuthenticated = false;
    updateNavigation();
    showSuccessMessage('Logged Out', 'You have been successfully logged out.', () => {
        window.location.href = 'index.html';
    });
}