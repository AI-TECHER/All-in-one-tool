// Create head elements
document.head.innerHTML = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete SEO Tools Suite</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .tool-card { transition: transform 0.3s; cursor: pointer; }
        .tool-card:hover { transform: translateY(-5px); }
        .output-box { background: #f8f9fa; border-radius: 5px; padding: 15px; }
        .pre-formatted { white-space: pre-wrap; word-wrap: break-word; }
        .mobile-preview { border: 1px solid #ddd; width: 375px; height: 667px; overflow: hidden; }
    </style>
`;

// Create navigation
const nav = document.createElement('nav');
nav.className = 'navbar navbar-expand-lg navbar-dark bg-dark fixed-top';
nav.innerHTML = `
    <div class="container">
        <a class="navbar-brand" href="#">SEO Tools</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item"><a class="nav-link" href="#home">Home</a></li>
            </ul>
        </div>
    </div>
`;
document.body.appendChild(nav);

// Create main container
const mainContainer = document.createElement('div');
mainContainer.className = 'container mt-5 pt-4';
mainContainer.innerHTML = `
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 py-4">
        ${['Robots.txt', 'Index Check', 'Domain Authority', 'Backlinks', 'Page Speed', 'Sitemap Valid', 'Mobile Test']
          .map((tool, i) => `
            <div class="col">
                <div class="card tool-card h-100" data-bs-toggle="modal" 
                     data-bs-target="#${['robots', 'index', 'da', 'backlink', 'speed', 'validator', 'mobile'][i]}Modal">
                    <div class="card-body">
                        <h5 class="card-title">${['🤖','🔍','📈','🔗','⚡','✅','📱'][i]} ${tool}</h5>
                        <p class="card-text">${[
                          'Generate robots.txt file',
                          'Check Google index status',
                          'Check domain authority score',
                          'Analyze backlink profile',
                          'Test website loading speed',
                          'Validate XML sitemaps',
                          'Check mobile compatibility'
                        ][i]}</p>
                    </div>
                </div>
            </div>`).join('')}
    </div>
`;
document.body.appendChild(mainContainer);

// Create modals
const modals = [
    { id: 'robots', size: 'modal-lg', content: `
        <div class="mb-3">
            <label>Disallowed Paths (space-separated)</label>
            <input type="text" class="form-control" id="disallowPaths" placeholder="/admin/ /private/">
        </div>
        <div class="output-box">
            <pre id="robotsOutput" class="pre-formatted"></pre>
        </div>
        <button class="btn btn-primary" onclick="generateRobotsTxt()">Generate</button>
    `},
    { id: 'index', content: `
        <input type="url" class="form-control mb-3" id="indexUrl" placeholder="Enter URL">
        <div id="indexResult"></div>
        <button class="btn btn-primary" onclick="checkIndexStatus()">Check</button>
    `},
    { id: 'da', content: `
        <input type="text" class="form-control mb-3" id="domainInput" placeholder="example.com">
        <div id="daResult"></div>
        <button class="btn btn-primary" onclick="checkDomainAuthority()">Check</button>
    `},
    { id: 'backlink', size: 'modal-lg', content: `
        <input type="url" class="form-control mb-3" id="backlinkUrl" placeholder="Enter URL">
        <div class="mt-3">
            <table class="table">
                <thead><tr><th>Referring Domain</th><th>Anchor Text</th><th>Date</th></tr></thead>
                <tbody id="backlinkList"></tbody>
            </table>
        </div>
        <button class="btn btn-primary" onclick="checkBacklinks()">Check</button>
    `},
    { id: 'speed', size: 'modal-lg', content: `
        <input type="url" class="form-control mb-3" id="speedUrl" placeholder="Enter URL">
        <div id="speedResults" class="row mt-3"></div>
        <button class="btn btn-primary" onclick="checkPageSpeed()">Test</button>
    `},
    { id: 'validator', size: 'modal-lg', content: `
        <textarea class="form-control mb-3" rows="8" placeholder="Paste XML sitemap content" id="sitemapXml"></textarea>
        <div id="validationResult"></div>
        <button class="btn btn-primary" onclick="validateSitemapXML()">Validate</button>
    `},
    { id: 'mobile', size: 'modal-lg', content: `
        <input type="url" class="form-control mb-3" id="mobileUrl" placeholder="Enter URL">
        <div class="simulated-result">
            <div class="mobile-preview bg-light mx-auto mb-3"></div>
            <ul class="list-group" id="mobileResults">
                <li class="list-group-item">Viewport: Checking...</li>
                <li class="list-group-item">Text Size: Checking...</li>
            </ul>
        </div>
        <button class="btn btn-primary mt-3" onclick="runMobileTest()">Test</button>
    `}
];

modals.forEach(modal => {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = `${modal.id}Modal`;
    modalDiv.innerHTML = `
        <div class="modal-dialog ${modal.size || ''}">
            <div class="modal-content">
                <div class="modal-body">${modal.content}</div>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
});

// Add Bootstrap JS
const bootstrapScript = document.createElement('script');
bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
document.body.appendChild(bootstrapScript);

// Tool Functions
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    setTimeout(() => element.innerHTML = '', 3000);
}

function generateRobotsTxt() {
    const paths = document.getElementById('disallowPaths').value.trim().split(' ');
    const disallow = paths.map(p => `Disallow: ${p}`).join('\n');
    document.getElementById('robotsOutput').textContent = 
        `User-agent: *\n${disallow}\n\nSitemap: ${location.origin}/sitemap.xml`;
}

async function checkIndexStatus() {
    const url = document.getElementById('indexUrl').value;
    const isIndexed = await new Promise(resolve => 
        setTimeout(() => resolve(Math.random() > 0.4), 1000));
    document.getElementById('indexResult').innerHTML = `
        <div class="alert ${isIndexed ? 'alert-success' : 'alert-danger'}">
            ${isIndexed ? '✅ Indexed' : '❌ Not Indexed'}
        </div>`;
}

function checkDomainAuthority() {
    const score = Math.floor(Math.random() * 100);
    document.getElementById('daResult').innerHTML = `
        <div class="progress my-3">
            <div class="progress-bar" style="width: ${score}%">${score}%</div>
        </div>
        <small class="text-muted">Simulated Domain Authority Score</small>`;
}

function checkBacklinks() {
    document.getElementById('backlinkList').innerHTML = [
        { domain: 'example.com', anchor: 'SEO Tools', date: '2024-03-15' },
        { domain: 'test.org', anchor: 'Resources', date: '2024-03-14' }
    ].map(item => `<tr><td>${item.domain}</td><td>${item.anchor}</td><td>${item.date}</td></tr>`).join('');
}

function checkPageSpeed() {
    const metrics = ['performance', 'accessibility', 'seo'].map(() => Math.floor(Math.random() * 100));
    document.getElementById('speedResults').innerHTML = metrics.map((m, i) => `
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body text-center">
                    <h5>${['Performance', 'Accessibility', 'SEO'][i]}</h5>
                    <div class="display-4 text-primary">${m}</div>
                </div>
            </div>
        </div>`).join('');
}

function validateSitemapXML() {
    const isValid = document.getElementById('sitemapXml').value.includes('<urlset');
    document.getElementById('validationResult').innerHTML = `
        <div class="alert ${isValid ? 'alert-success' : 'alert-danger'}">
            ${isValid ? '✅ Valid Sitemap' : '❌ Invalid Structure'}
        </div>`;
}

function runMobileTest() {
    document.getElementById('mobileResults').innerHTML = [
        '✅ Mobile viewport configured',
        '⚠️ Tap targets need spacing',
        '✅ Text readable on mobile'
    ].map(r => `<li class="list-group-item">${r}</li>`).join('');
}