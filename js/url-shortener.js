document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadComponent('../header.html', 'header');
    loadComponent('../footer.html', 'footer');

    // DOM Elements
    const urlForm = document.getElementById('url-form');
    const longUrlInput = document.getElementById('long-url');
    const customAliasInput = document.getElementById('custom-alias');
    const expirationSelect = document.getElementById('expiration');
    const trackClicksCheck = document.getElementById('track-clicks');
    const resultContainer = document.getElementById('result-container');
    const shortUrlDisplay = document.getElementById('short-url');
    const qrCodeContainer = document.getElementById('qr-code');
    const copyBtn = document.getElementById('copy-btn');
    const generateQrBtn = document.getElementById('generate-qr-btn');
    const historyContainer = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const errorMsg = document.getElementById('error-message');

    // URL History from localStorage
    let urlHistory = JSON.parse(localStorage.getItem('shortUrlHistory')) || [];
    
    // Display history on load
    displayUrlHistory();

    // Submit form event
    urlForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate URL
        const longUrl = longUrlInput.value.trim();
        if (!isValidUrl(longUrl)) {
            showError('Please enter a valid URL including http:// or https://');
            return;
        }
        
        // Clear previous error
        hideError();
        
        // Get form values
        const customAlias = customAliasInput.value.trim();
        const expiration = expirationSelect.value;
        const trackClicks = trackClicksCheck.checked;
        
        // Generate short URL (in a real app, this would call an API)
        shortenUrl(longUrl, customAlias, expiration, trackClicks);
    });
    
    // Copy button event
    copyBtn.addEventListener('click', function() {
        const shortUrl = shortUrlDisplay.textContent;
        navigator.clipboard.writeText(shortUrl)
            .then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            })
            .catch(err => {
                showError('Failed to copy: ' + err);
            });
    });
    
    // Generate QR Code button event
    generateQrBtn.addEventListener('click', function() {
        const shortUrl = shortUrlDisplay.textContent;
        if (shortUrl) {
            generateQRCode(shortUrl);
        }
    });
    
    // Clear history button event
    clearHistoryBtn.addEventListener('click', function() {
        urlHistory = [];
        localStorage.setItem('shortUrlHistory', JSON.stringify(urlHistory));
        displayUrlHistory();
    });
    
    // URL shortening function (simulated)
    function shortenUrl(longUrl, customAlias, expiration, trackClicks) {
        // Show loading state
        resultContainer.classList.add('d-none');
        document.getElementById('loading').classList.remove('d-none');
        
        // Simulate API call with setTimeout
        setTimeout(() => {
            // Hide loading
            document.getElementById('loading').classList.add('d-none');
            
            // Generate a random short code if no custom alias
            const shortCode = customAlias || generateRandomCode(6);
            const domain = 'short.ly/';
            const shortUrl = domain + shortCode;
            
            // Display result
            shortUrlDisplay.textContent = shortUrl;
            resultContainer.classList.remove('d-none');
            
            // Save to history
            const historyItem = {
                longUrl: longUrl,
                shortUrl: shortUrl,
                created: new Date().toISOString(),
                expiration: expiration,
                trackClicks: trackClicks,
                clicks: 0
            };
            urlHistory.unshift(historyItem);
            
            // Keep only the last 10 items
            if (urlHistory.length > 10) {
                urlHistory = urlHistory.slice(0, 10);
            }
            
            // Save to localStorage
            localStorage.setItem('shortUrlHistory', JSON.stringify(urlHistory));
            
            // Update history display
            displayUrlHistory();
            
            // Generate QR code
            generateQRCode(shortUrl);
        }, 1500);
    }
    
    // Display URL history
    function displayUrlHistory() {
        if (urlHistory.length === 0) {
            historyContainer.innerHTML = '<p class="text-muted">No shortened URLs yet</p>';
            clearHistoryBtn.classList.add('d-none');
            return;
        }
        
        clearHistoryBtn.classList.remove('d-none');
        historyContainer.innerHTML = '';
        
        urlHistory.forEach((item, index) => {
            const createdDate = new Date(item.created);
            const formattedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item mb-3 p-3 border rounded';
            historyItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-top">
                    <div>
                        <p class="mb-1 text-truncate" style="max-width: 250px;" title="${item.longUrl}">
                            <strong>Original:</strong> ${item.longUrl}
                        </p>
                        <p class="mb-1"><strong>Short URL:</strong> <a href="#" class="short-url-link">${item.shortUrl}</a></p>
                        <p class="mb-1 small text-muted">Created: ${formattedDate}</p>
                        ${item.trackClicks ? `<p class="mb-1 small">Clicks: ${item.clicks}</p>` : ''}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary copy-history" data-url="${item.shortUrl}">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
            
            historyContainer.appendChild(historyItem);
            
            // Add event listener for copy button in history
            const copyHistoryBtn = historyItem.querySelector('.copy-history');
            copyHistoryBtn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                navigator.clipboard.writeText(url)
                    .then(() => {
                        this.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            this.innerHTML = '<i class="fas fa-copy"></i>';
                        }, 2000);
                    });
            });
            
            // Add event listener for short URL click (to simulate tracking)
            const shortUrlLink = historyItem.querySelector('.short-url-link');
            shortUrlLink.addEventListener('click', function(e) {
                e.preventDefault();
                if (item.trackClicks) {
                    item.clicks++;
                    localStorage.setItem('shortUrlHistory', JSON.stringify(urlHistory));
                    displayUrlHistory();
                }
                window.open(item.longUrl, '_blank');
            });
        });
    }
    
    // Generate QR Code
    function generateQRCode(url) {
        qrCodeContainer.innerHTML = '';
        
        // Create QR code using a simulated library
        // In a real implementation, you would use a library like qrcode.js
        const qrImg = document.createElement('img');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
        qrImg.alt = 'QR Code for ' + url;
        qrImg.className = 'img-fluid';
        
        qrCodeContainer.appendChild(qrImg);
    }
    
    // Generate random code for short URL
    function generateRandomCode(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Validate URL
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Show error message
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('d-none');
    }
    
    // Hide error message
    function hideError() {
        errorMsg.textContent = '';
        errorMsg.classList.add('d-none');
    }
    
    // Helper function to load components
    function loadComponent(url, elementId) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                document.getElementById(elementId).innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading component:', error);
            });
    }
}); 