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

async function fetchDocumentsFromSmartContract() {
    try {
        const res = await fetch('/api/search');
        const docs = await res.json();
        return docs.map((doc, idx) => ({
            id: idx,
            title: doc.title,
            description: doc.description,
            type: doc.tags && doc.tags.match(/pdf|doc|image|text/i) ? doc.tags.match(/pdf|doc|image|text/i)[0] : '',
            date: doc.timestamp ? new Date(doc.timestamp * 1000).toISOString().slice(0, 10) : '',
            ipfsCid: doc.ipfsCid || '',
            blockHash: doc.blockHash || '',
            txHash: doc.txHash || '',
            tags: Array.isArray(doc.tags) ? doc.tags : (doc.tags ? doc.tags.split(',').map(t => t.trim()) : []),
            size: doc.size ? (typeof doc.size === 'number' ? formatSize(doc.size) : doc.size) : '',
            author: doc.author || ''
        }));
    } catch (err) {
        return [];
    }
}

async function performDocumentSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim().toLowerCase();
    const docs = await fetchDocumentsFromSmartContract();

    const filtered = docs.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
        doc.author.toLowerCase().includes(query)
    );

    displaySearchResults(filtered, query);
}

function performSearchDebounced() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performDocumentSearch, 300);
}

async function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const dateFilter = document.getElementById('date-filter');
    const query = searchInput.value.trim().toLowerCase();
    const dateValue = dateFilter.value;

    let docs = await fetchDocumentsFromSmartContract();

    let filtered = docs.filter(doc =>
        (!query ||
            doc.title.toLowerCase().includes(query) ||
            doc.description.toLowerCase().includes(query) ||
            doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
            doc.author.toLowerCase().includes(query))
    );

    if (dateValue) {
        const now = new Date();
        filtered = filtered.filter(doc => {
            const docDate = new Date(doc.date);
            if (dateValue === 'today') {
                return docDate.toDateString() === now.toDateString();
            } else if (dateValue === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return docDate >= weekAgo;
            } else if (dateValue === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return docDate >= monthAgo;
            } else if (dateValue === 'year') {
                return docDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    }

    displaySearchResults(filtered, query);
}