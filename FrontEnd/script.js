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
         <style>
            .document-details .detail-group {
                margin-bottom: 20px;
            }
            
            .document-details .detail-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .document-details label {
                display: block;
                font-weight: 600;
                color: var(--neon-green);
                margin-bottom: 8px;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .document-details p {
                color: var(--text-primary);
                margin: 0;
                line-height: 1.5;
            }
            
            .tag-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .tag {
                background: rgba(0, 255, 136, 0.1);
                color: var(--neon-green);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                border: 1px solid rgba(0, 255, 136, 0.3);
            }
            
            .blockchain-info {
                background: rgba(255, 255, 255, 0.02);
                padding: 20px;
                border-radius: 8px;
                border: 1px solid var(--glass-border);
                margin: 24px 0;
            }
            
            .blockchain-info h4 {
                margin-bottom: 16px;
                color: var(--text-primary);
                font-size: 1.1rem;
            }
            
            .hash-value {
                font-family: 'Monaco', monospace;
                font-size: 0.85rem;
                background: rgba(255, 255, 255, 0.05);
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid var(--glass-border);
                word-break: break-all;
            }
            
            .document-actions {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }
            
            .document-actions button {
                flex: 1;
                padding: 12px 20px;
                border: none;
                border-radius: 6px;
                font-family: inherit;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
        </style>
    `;
    
    modal.classList.add('active');
    gsap.fromTo(modal.querySelector('.modal-content'), 
        {scale: 0.8, opacity: 0}, 
        {scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)"}
    );
}

function closeModal() {
    const modal = document.getElementById('document-modal');
    modal.classList.remove('active');
}


document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('document-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeModal();
        });
    }
});

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatSize(bytes) {
    if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    if (bytes > 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' bytes';
}

function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

function initializePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    checkAuthStatus();
    setupNavigation();

    if (currentPage === 'search.html') {
        performDocumentSearch();
        document.getElementById('search-input').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') performDocumentSearch();
        });
        document.getElementById('search-input').addEventListener('input', performSearchDebounced);
        document.getElementById('date-filter').addEventListener('change', applyFilters);
    }

    setupAnimations();
}

function setupAnimations() {
    const fadeElements = document.querySelectorAll('.about, .how-it-works, .auth-form, .upload-form, .search-controls');
    fadeElements.forEach(element => {
        if (element) {
            gsap.fromTo(element, 
                {opacity: 0, y: 50}, 
                {opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.2}
            );
        }
    });
    const steps = document.querySelectorAll('.step');
    if (steps.length > 0) {
        gsap.fromTo(steps, 
            {opacity: 0, y: 30}, 
            {opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", delay: 0.5}
        );
    }
    const features = document.querySelectorAll('.feature');
    if (features.length > 0) {
        gsap.fromTo(features, 
            {opacity: 0, x: -30}, 
            {opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", delay: 0.8}
        );
    }
}

document.addEventListener('DOMContentLoaded', initializePage);
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});