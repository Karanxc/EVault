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

function displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('results-container');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    
    if (!resultsContainer) return;
    
    if (results.length === 0) {
        resultsContainer.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.textContent = 'No results found';
        return;
    }
    
    resultsContainer.style.display = 'grid';
    noResults.style.display = 'none';
    
    const countText = query ? 
        `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"` :
        `${results.length} document${results.length !== 1 ? 's' : ''}`;
    
    resultsCount.textContent = countText;
    
    resultsContainer.innerHTML = results.map(doc => `
        <div class="document-card" onclick="showDocumentDetails(${doc.id})">
            <div class="document-header">
                <div>
                    <div class="document-title">${doc.title}</div>
                </div>
                <div class="document-type">${doc.type ? doc.type.toUpperCase() : ''}</div>
            </div>
            <div class="document-description">${doc.description}</div>
            <div class="document-meta">
                <div class="document-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${formatDate(doc.date)}
                </div>
                <div class="document-hash">${doc.ipfsCid.substring(0, 12)}...</div>
            </div>
        </div>
    `).join('');
    
    gsap.fromTo('.document-card', 
        {opacity: 0, y: 30}, 
        {opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"}
    );
    window._docs = results;
}

function setView(viewType) {
    const resultsContainer = document.getElementById('results-container');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    currentView = viewType;
    
    viewButtons.forEach(btn => {
        if (btn.dataset.view === viewType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    resultsContainer.className = `results-container ${viewType}-view`;
}

unction showDocumentDetails(docId) {
    const doc = window._docs.find(d => d.id === docId);
    if (!doc) return;
    
    const modal = document.getElementById('document-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = doc.title;
    
    modalBody.innerHTML = `
        <div class="document-details">
            <div class="detail-group">
                <label>Description</label>
                <p>${doc.description}</p>
            </div>
            <div class="detail-row">
                <div class="detail-group">
                    <label>Size</label>
                    <p>${doc.size}</p>
                </div>
            </div>
            <div class="detail-group">
                <label>Upload Date</label>
                <p>${formatDate(doc.date)}</p>
            </div>
            <div class="detail-group">
                <label>Author</label>
                <p>${doc.author}</p>
            </div>
            <div class="detail-group">
                <label>Tags</label>
                <div class="tag-list">
                    ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="blockchain-info">
                <h4>Blockchain Information</h4>
                <div class="detail-group">
                    <label>Document Hash</label>
                    <p class="hash-value">${doc.ipfsCid}</p>
                </div>
                <div class="detail-group">
                    <label>Block Hash</label>
                    <p class="hash-value">${doc.blockHash}</p>
                </div>
                <div class="detail-group">
                    <label>Transaction ID</label>
                    <p class="hash-value">${doc.txHash}</p>
                </div>
            </div>
            <div class="document-actions">
                <a href="https://gateway.pinata.cloud/ipfs/${doc.ipfsCid}" target="_blank" class="btn-primary">Download Document</a>
                <a href="https://sepolia.etherscan.io/tx/${doc.txHash}" target="_blank" class="btn-secondary">Verify on Blockchain</a>
            </div>
        </div>