document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('quality-value');
    const maxWidthInput = document.getElementById('max-width');
    const maxHeightInput = document.getElementById('max-height');
    const outputFormatSelect = document.getElementById('output-format');
    const preserveExifCheckbox = document.getElementById('preserve-exif');
    const compressBtn = document.getElementById('compress-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultsList = document.getElementById('results-list');
    const downloadAllBtn = document.getElementById('download-all');

    // State
    let uploadedFiles = [];
    let compressedFiles = [];

    // Event Listeners
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value;
    });

    // File Drop Area Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        uploadedFiles = [...files].filter(file => file.type.startsWith('image/'));
        
        if (uploadedFiles.length > 0) {
            compressBtn.disabled = false;
        } else {
            alert('Please select valid image files.');
        }
    }

    // Compress Button Click
    compressBtn.addEventListener('click', async function() {
        if (uploadedFiles.length === 0) {
            alert('Please select images to compress');
            return;
        }

        // Show loading state
        compressBtn.disabled = true;
        compressBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Compressing...';
        
        // Clear previous results
        resultsContainer.classList.remove('d-none');
        resultsList.innerHTML = '';
        compressedFiles = [];

        // Process each file
        try {
            for (const file of uploadedFiles) {
                await processFile(file);
            }
            
            // Reset button state
            compressBtn.disabled = false;
            compressBtn.innerHTML = '<i class="fas fa-compress-alt me-2"></i>Compress Images';
            
        } catch (error) {
            console.error("Compression error:", error);
            alert('Error compressing images: ' + error.message);
            compressBtn.disabled = false;
            compressBtn.innerHTML = '<i class="fas fa-compress-alt me-2"></i>Compress Images';
        }
    });

    // Process each file for compression
    async function processFile(file) {
        // Create result list item
        const resultItem = document.createElement('div');
        resultItem.className = 'list-group-item';
        resultItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${file.name}</h5>
                    <p class="mb-1">Original: ${formatFileSize(file.size)}</p>
                    <p class="mb-1 compressed-size">Compressing...</p>
                </div>
                <div class="d-flex align-items-center">
                    <div class="comparison me-3 d-none">
                        <div class="original-preview"></div>
                        <div class="compressed-preview"></div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary download-btn" disabled>
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `;
        resultsList.appendChild(resultItem);

        // Get compression options
        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: Math.max(
                maxWidthInput.value ? parseInt(maxWidthInput.value) : Infinity,
                maxHeightInput.value ? parseInt(maxHeightInput.value) : Infinity
            ),
            useWebWorker: true,
            fileType: outputFormatSelect.value === 'same' ? undefined : 'image/' + outputFormatSelect.value,
            preserveExif: preserveExifCheckbox.checked,
            quality: parseFloat(qualitySlider.value) / 100
        };

        try {
            // Process image with browser-image-compression library
            const compressedFile = await imageCompression(file, options);
            compressedFiles.push(compressedFile);
            
            // Update UI with results
            const compressedSize = resultItem.querySelector('.compressed-size');
            compressedSize.textContent = `Compressed: ${formatFileSize(compressedFile.size)} (${calculateReduction(file.size, compressedFile.size)}% reduction)`;
            
            // Enable download button
            const downloadBtn = resultItem.querySelector('.download-btn');
            downloadBtn.disabled = false;
            downloadBtn.addEventListener('click', function() {
                downloadFile(compressedFile);
            });

            // Add image previews
            const comparison = resultItem.querySelector('.comparison');
            const originalPreview = resultItem.querySelector('.original-preview');
            const compressedPreview = resultItem.querySelector('.compressed-preview');
            
            // Show original image
            const originalImgUrl = URL.createObjectURL(file);
            const originalImg = document.createElement('img');
            originalImg.src = originalImgUrl;
            originalImg.className = 'img-thumbnail';
            originalImg.alt = 'Original';
            originalImg.title = 'Original';
            originalImg.style.maxWidth = '100px';
            originalPreview.appendChild(originalImg);
            
            // Show compressed image
            const compressedImgUrl = URL.createObjectURL(compressedFile);
            const compressedImg = document.createElement('img');
            compressedImg.src = compressedImgUrl;
            compressedImg.className = 'img-thumbnail';
            compressedImg.alt = 'Compressed';
            compressedImg.title = 'Compressed';
            compressedImg.style.maxWidth = '100px';
            compressedPreview.appendChild(compressedImg);
            
            comparison.classList.remove('d-none');

        } catch (error) {
            console.error("Error compressing file:", error);
            resultItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${file.name}</h5>
                        <p class="mb-1 text-danger">Error: ${error.message || 'Failed to compress'}</p>
                    </div>
                </div>
            `;
        }
    }

    // Download All Button
    downloadAllBtn.addEventListener('click', async function() {
        if (compressedFiles.length === 0) {
            alert('No compressed files to download');
            return;
        }

        const zip = new JSZip();
        
        // Add each file to the zip
        compressedFiles.forEach((file, index) => {
            const originalFile = uploadedFiles[index];
            const extension = file.type.split('/')[1];
            zip.file(originalFile.name.replace(/\.[^/.]+$/, '') + '_compressed.' + extension, file);
        });

        // Generate and download the zip
        zip.generateAsync({type: 'blob'}).then(function(content) {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed_images.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    // Helper Functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function calculateReduction(originalSize, compressedSize) {
        return Math.round(((originalSize - compressedSize) / originalSize) * 100);
    }

    function downloadFile(file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.[^/.]+$/, '') + '_compressed.' + file.type.split('/')[1];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Add CSS for drag and drop highlighting
    const style = document.createElement('style');
    style.textContent = `
        #drop-area {
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            transition: all 0.3s ease;
        }
        #drop-area.highlight {
            border-color: #007bff;
            background-color: rgba(0, 123, 255, 0.1);
        }
        .comparison {
            display: flex;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);
}); 