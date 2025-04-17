document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const htmlInput = document.getElementById('html-input');
    const markdownOutput = document.getElementById('markdown-output');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const keepHtmlCheck = document.getElementById('keep-html-check');
    const simplifyLinksCheck = document.getElementById('simplify-links-check');
    const templateBtns = document.querySelectorAll('.template-btn');
    const charCounterHtml = document.getElementById('char-counter-html');
    const charCounterMarkdown = document.getElementById('char-counter-markdown');

    // Initialize
    init();

    function init() {
        // Update character counters
        updateCharCount();
        
        // Setup event listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        // Input change event
        htmlInput.addEventListener('input', updateCharCount);
        
        // Convert button
        convertBtn.addEventListener('click', convertHtmlToMarkdown);
        
        // Clear button
        clearBtn.addEventListener('click', () => {
            htmlInput.value = '';
            markdownOutput.value = '';
            updateCharCount();
        });
        
        // Copy button
        copyBtn.addEventListener('click', copyToClipboard);
        
        // Download button
        downloadBtn.addEventListener('click', downloadMarkdown);
        
        // Template buttons
        templateBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const template = getTemplate(btn.getAttribute('data-template'));
                htmlInput.value = template;
                updateCharCount();
                convertHtmlToMarkdown();
            });
        });
    }

    function updateCharCount() {
        const htmlCount = htmlInput.value.length;
        const markdownCount = markdownOutput.value.length;
        
        charCounterHtml.textContent = `${htmlCount} characters`;
        charCounterMarkdown.textContent = `${markdownCount} characters`;
        
        // Enable/disable convert button
        convertBtn.disabled = htmlCount === 0;
    }

    function convertHtmlToMarkdown() {
        const html = htmlInput.value.trim();
        if (!html) return;
        
        // Show loader
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Converting...';
        convertBtn.disabled = true;
        
        // Get options
        const options = {
            ghCompatibleHeaderId: true,
            simpleLineBreaks: true,
            keepHtml: keepHtmlCheck.checked,
            simplifiedAutoLink: simplifyLinksCheck.checked,
        };

        try {
            // Use Showdown to convert HTML to Markdown
            const converter = new showdown.Converter(options);
            converter.setFlavor('github');
            
            // Convert HTML to Markdown
            // We first convert HTML to Markdown
            let markdown = converter.makeMarkdown(html);
            
            // Clean up the markdown (remove excessive newlines, etc.)
            markdown = cleanupMarkdown(markdown);
            
            // Display result
            markdownOutput.value = markdown;
            updateCharCount();
            
            // Show output section if hidden
            document.getElementById('output-section').classList.remove('d-none');
            
            // Scroll to output
            markdownOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            console.error('Conversion error:', error);
            markdownOutput.value = 'Error converting HTML to Markdown. Please check your HTML syntax.';
        } finally {
            // Reset button
            convertBtn.innerHTML = '<i class="fas fa-code me-2"></i>Convert to Markdown';
            convertBtn.disabled = false;
        }
    }

    function cleanupMarkdown(markdown) {
        // Remove excessive newlines
        markdown = markdown.replace(/\n{3,}/g, '\n\n');
        
        // Fix code blocks (ensure they have proper spacing)
        markdown = markdown.replace(/```(\w+)\n/g, '```$1\n');
        
        // Fix lists that might have extra spacing
        markdown = markdown.replace(/\n\s*[-*+]\s/g, '\n- ');
        
        return markdown;
    }

    function copyToClipboard() {
        const markdown = markdownOutput.value;
        if (!markdown) return;
        
        navigator.clipboard.writeText(markdown)
            .then(() => {
                // Change button text temporarily
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy to clipboard. Please copy the text manually.');
            });
    }

    function downloadMarkdown() {
        const markdown = markdownOutput.value;
        if (!markdown) return;
        
        // Create a blob
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-markdown.md';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function getTemplate(templateName) {
        const templates = {
            basic: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Document</title>
</head>
<body>
    <h1>Hello World</h1>
    <p>This is a <strong>sample</strong> HTML document.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
    <a href="https://example.com">Example Link</a>
</body>
</html>`,
            article: `<article>
    <h1>Sample Article Title</h1>
    <p>Published by <a href="https://example.com/author">John Doe</a> on <time>January 1, 2023</time></p>
    
    <p>This is the introduction paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    
    <h2>First Section</h2>
    <p>Here is the content of the first section with some <em>emphasized text</em> and <strong>strong text</strong>.</p>
    
    <h2>Second Section</h2>
    <p>This section includes:</p>
    <ul>
        <li>A bullet point list</li>
        <li>With multiple items</li>
        <li>And <a href="https://example.com">a link</a></li>
    </ul>
    
    <h3>A Subsection</h3>
    <p>And here's a code example:</p>
    <pre><code>function helloWorld() {
    console.log("Hello, world!");
}</code></pre>
    
    <blockquote>
        <p>This is a blockquote with a famous saying or quote.</p>
        <footer>— Famous Person</footer>
    </blockquote>
    
    <figure>
        <img src="https://via.placeholder.com/600x400" alt="A placeholder image">
        <figcaption>Figure 1: A sample image</figcaption>
    </figure>
    
    <h2>Conclusion</h2>
    <p>This is the conclusion of the article.</p>
</article>`,
            table: `<table border="1">
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Occupation</th>
            <th>Location</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John Doe</td>
            <td>32</td>
            <td>Web Developer</td>
            <td>New York</td>
        </tr>
        <tr>
            <td>Jane Smith</td>
            <td>28</td>
            <td>UX Designer</td>
            <td>San Francisco</td>
        </tr>
        <tr>
            <td>Robert Johnson</td>
            <td>45</td>
            <td>Product Manager</td>
            <td>Chicago</td>
        </tr>
        <tr>
            <td>Emily Davis</td>
            <td>37</td>
            <td>Marketing Director</td>
            <td>Austin</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="4">Data is for demonstration purposes only</td>
        </tr>
    </tfoot>
</table>`
        };
        
        return templates[templateName] || '';
    }
}); 