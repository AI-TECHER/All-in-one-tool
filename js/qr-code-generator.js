document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const qrForm = document.getElementById('qr-form');
    const contentType = document.getElementById('content-type');
    const inputFields = document.getElementById('input-fields').children;
    const qrSize = document.getElementById('qr-size');
    const sizeValue = document.getElementById('size-value');
    const resultContainer = document.getElementById('result-container');
    const qrResult = document.getElementById('qr-result');
    
    // Download buttons
    const downloadPNG = document.getElementById('download-png');
    const downloadJPG = document.getElementById('download-jpg');
    const downloadSVG = document.getElementById('download-svg');
    
    // Canvas and SVG elements
    let qrCanvas = null;
    let qrSvg = null;
    
    // Update size value display
    qrSize.addEventListener('input', function() {
        sizeValue.textContent = this.value;
    });
    
    // Toggle input fields based on content type
    contentType.addEventListener('change', function() {
        // Hide all input fields
        for (let field of inputFields) {
            field.classList.add('d-none');
        }
        
        // Show selected input field
        const selectedField = document.getElementById(`${this.value}-input`);
        if (selectedField) {
            selectedField.classList.remove('d-none');
        }
    });
    
    // Generate QR Code
    qrForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get QR code content based on type
        let content = '';
        const type = contentType.value;
        
        switch(type) {
            case 'url':
                content = document.getElementById('url').value;
                break;
            case 'text':
                content = document.getElementById('text').value;
                break;
            case 'email':
                const email = document.getElementById('email').value;
                const subject = document.getElementById('email-subject').value;
                const body = document.getElementById('email-body').value;
                content = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                break;
            case 'phone':
                content = `tel:${document.getElementById('phone').value}`;
                break;
            case 'sms':
                const number = document.getElementById('sms-number').value;
                const message = document.getElementById('sms-message').value;
                content = `sms:${number}?body=${encodeURIComponent(message)}`;
                break;
            case 'vcard':
                const name = document.getElementById('vcard-name').value;
                const company = document.getElementById('vcard-company').value;
                const vcardPhone = document.getElementById('vcard-phone').value;
                const vcardEmail = document.getElementById('vcard-email').value;
                const address = document.getElementById('vcard-address').value;
                const website = document.getElementById('vcard-website').value;
                
                // Format vCard
                content = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nORG:${company}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nADR:;;${address}\nURL:${website}\nEND:VCARD`;
                break;
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value;
                const password = document.getElementById('wifi-password').value;
                const encryption = document.getElementById('wifi-encryption').value;
                const hidden = document.getElementById('wifi-hidden').checked;
                
                content = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden ? 'true' : 'false'};;`;
                break;
            case 'geo':
                const lat = document.getElementById('geo-latitude').value;
                const lng = document.getElementById('geo-longitude').value;
                
                content = `geo:${lat},${lng}`;
                break;
        }
        
        if (!content) {
            alert('Please fill in the required fields');
            return;
        }
        
        // Get QR code options
        const options = {
            width: parseInt(qrSize.value),
            height: parseInt(qrSize.value),
            color: {
                dark: document.getElementById('qr-foreground').value,
                light: document.getElementById('qr-background').value
            },
            errorCorrectionLevel: document.getElementById('qr-correction').value
        };
        
        // Clear previous QR codes
        qrResult.innerHTML = '';
        
        // Generate QR code
        try {
            // Canvas version for PNG/JPG download
            qrCanvas = document.createElement('canvas');
            QRCode.toCanvas(qrCanvas, content, options, function(error) {
                if (error) {
                    console.error(error);
                    alert('Error generating QR code: ' + error);
                    return;
                }
                
                qrResult.appendChild(qrCanvas);
                
                // Also generate SVG version for SVG download
                QRCode.toString(content, {
                    ...options,
                    type: 'svg'
                }, function(error, svg) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    
                    // Store SVG content for download
                    qrSvg = svg;
                });
                
                // Show result container
                resultContainer.classList.remove('d-none');
            });
        } catch (error) {
            console.error(error);
            alert('Error generating QR code: ' + error.message);
        }
    });
    
    // Download QR code as PNG
    downloadPNG.addEventListener('click', function() {
        if (!qrCanvas) return;
        
        // Create an anchor element
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = qrCanvas.toDataURL('image/png');
        link.click();
    });
    
    // Download QR code as JPG
    downloadJPG.addEventListener('click', function() {
        if (!qrCanvas) return;
        
        // Create an anchor element
        const link = document.createElement('a');
        link.download = 'qrcode.jpg';
        link.href = qrCanvas.toDataURL('image/jpeg', 0.9);
        link.click();
    });
    
    // Download QR code as SVG
    downloadSVG.addEventListener('click', function() {
        if (!qrSvg) return;
        
        // Create an anchor element
        const link = document.createElement('a');
        link.download = 'qrcode.svg';
        const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(blob);
        link.click();
    });
}); 