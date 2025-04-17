// Main JavaScript for Your Tools Website

document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer dynamically (if needed on this page)
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (headerPlaceholder) {
        loadComponent('header-placeholder', 'header.html');
    }
    
    if (footerPlaceholder) {
        loadComponent('footer-placeholder', 'footer.html');
    }
    
    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Search functionality (for index page)
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const toolCards = document.querySelectorAll('.tool-card');
    
    if (searchForm && searchInput && searchResults) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim().toLowerCase();
            
            if (searchTerm.length < 2) return;
            
            // Show loader
            const loader = document.querySelector('.loader');
            if (loader) loader.style.display = 'block';
            
            // Simulate search delay
            setTimeout(function() {
                let resultsFound = false;
                const resultsList = document.getElementById('results-list');
                resultsList.innerHTML = '';
                
                toolCards.forEach(card => {
                    const title = card.querySelector('.card-title').textContent.toLowerCase();
                    const desc = card.querySelector('.card-text').textContent.toLowerCase();
                    
                    if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                        resultsFound = true;
                        
                        // Clone the card for results
                        const clonedCard = card.cloneNode(true);
                        const listItem = document.createElement('div');
                        listItem.className = 'col-md-4 mb-4';
                        listItem.appendChild(clonedCard);
                        resultsList.appendChild(listItem);
                        
                        // Highlight the search term
                        const cardTitle = clonedCard.querySelector('.card-title');
                        const cardText = clonedCard.querySelector('.card-text');
                        
                        if (title.includes(searchTerm)) {
                            cardTitle.innerHTML = highlightText(cardTitle.textContent, searchTerm);
                        }
                        
                        if (desc.includes(searchTerm)) {
                            cardText.innerHTML = highlightText(cardText.textContent, searchTerm);
                        }
                    }
                });
                
                if (resultsFound) {
                    document.getElementById('results-found').textContent = 'Search results for: ' + searchTerm;
                    searchResults.style.display = 'block';
                    
                    // Scroll to results
                    searchResults.scrollIntoView({ behavior: 'smooth' });
                } else {
                    document.getElementById('results-found').textContent = 'No results found for: ' + searchTerm;
                    searchResults.style.display = 'block';
                }
                
                // Hide loader
                if (loader) loader.style.display = 'none';
            }, 500);
        });
    }
    
    // Category filter functionality
    const categoryFilters = document.querySelectorAll('.category-filter');
    if (categoryFilters.length > 0) {
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', function(e) {
                e.preventDefault();
                
                const category = this.getAttribute('data-category');
                
                // Remove active class from all filters
                categoryFilters.forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked filter
                this.classList.add('active');
                
                if (category === 'all') {
                    // Show all tools
                    toolCards.forEach(card => {
                        card.closest('.col-md-4').style.display = 'block';
                    });
                } else {
                    // Filter tools by category
                    toolCards.forEach(card => {
                        const cardCategory = card.getAttribute('data-category');
                        const cardCol = card.closest('.col-md-4');
                        
                        if (cardCategory === category) {
                            cardCol.style.display = 'block';
                        } else {
                            cardCol.style.display = 'none';
                        }
                    });
                }
            });
        });
    }
    
    // Initialize tooltips
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// Function to load HTML components dynamically
function loadComponent(targetId, componentPath) {
    const target = document.getElementById(targetId);
    if (!target) return;
    
    fetch(componentPath)
        .then(response => response.text())
        .then(html => {
            target.innerHTML = html;
        })
        .catch(error => {
            console.error(`Error loading ${componentPath}:`, error);
        });
}

// Function to highlight search terms
function highlightText(text, term) {
    const regex = new RegExp('(' + term + ')', 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
} 