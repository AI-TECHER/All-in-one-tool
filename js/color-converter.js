document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    const colorPreview = document.getElementById('color-preview');
    const hexInput = document.getElementById('hex-input');
    const rgbR = document.getElementById('rgb-r');
    const rgbG = document.getElementById('rgb-g');
    const rgbB = document.getElementById('rgb-b');
    const hslH = document.getElementById('hsl-h');
    const hslS = document.getElementById('hsl-s');
    const hslL = document.getElementById('hsl-l');
    const colorPicker = document.getElementById('color-picker');
    
    // Results elements
    const resultHex = document.getElementById('result-hex');
    const resultRgb = document.getElementById('result-rgb');
    const resultHsl = document.getElementById('result-hsl');
    const resultCssVar = document.getElementById('result-css-var');
    const resultRgbPercent = document.getElementById('result-rgb-percent');
    const resultHsv = document.getElementById('result-hsv');
    
    // Palette elements
    const complementary = document.getElementById('complementary');
    const complementaryHex = document.getElementById('complementary-hex');
    const analogous1 = document.getElementById('analogous1');
    const analogous1Hex = document.getElementById('analogous1-hex');
    const analogous2 = document.getElementById('analogous2');
    const analogous2Hex = document.getElementById('analogous2-hex');
    const triadic1 = document.getElementById('triadic1');
    const triadic1Hex = document.getElementById('triadic1-hex');
    const triadic2 = document.getElementById('triadic2');
    const triadic2Hex = document.getElementById('triadic2-hex');
    const monochromatic1 = document.getElementById('monochromatic1');
    const monochromatic1Hex = document.getElementById('monochromatic1-hex');
    const monochromatic2 = document.getElementById('monochromatic2');
    const monochromatic2Hex = document.getElementById('monochromatic2-hex');
    const shades = document.getElementById('shades');
    const shadesHex = document.getElementById('shades-hex');

    // Set default color
    let currentColor = {
        hex: '#1a73e8',
        rgb: { r: 26, g: 115, b: 232 },
        hsl: { h: 217, s: 82, l: 51 }
    };
    
    updateUI(currentColor);
    
    // Event listeners for conversion buttons
    document.getElementById('convert-from-hex').addEventListener('click', function() {
        const hex = hexInput.value.trim();
        if (isValidHex(hex)) {
            currentColor = calculateFromHex(hex);
            updateUI(currentColor);
        } else {
            showError('Please enter a valid 6-digit HEX color code');
        }
    });
    
    document.getElementById('convert-from-rgb').addEventListener('click', function() {
        const r = parseInt(rgbR.value);
        const g = parseInt(rgbG.value);
        const b = parseInt(rgbB.value);
        
        if (isValidRGB(r, g, b)) {
            currentColor = calculateFromRGB(r, g, b);
            updateUI(currentColor);
        } else {
            showError('Please enter valid RGB values (0-255)');
        }
    });
    
    document.getElementById('convert-from-hsl').addEventListener('click', function() {
        const h = parseInt(hslH.value);
        const s = parseInt(hslS.value);
        const l = parseInt(hslL.value);
        
        if (isValidHSL(h, s, l)) {
            currentColor = calculateFromHSL(h, s, l);
            updateUI(currentColor);
        } else {
            showError('Please enter valid HSL values (H: 0-360, S/L: 0-100)');
        }
    });
    
    document.getElementById('convert-from-picker').addEventListener('click', function() {
        const hex = colorPicker.value;
        currentColor = calculateFromHex(hex.substring(1)); // Remove # symbol
        updateUI(currentColor);
    });
    
    colorPicker.addEventListener('input', function() {
        const hex = colorPicker.value;
        currentColor = calculateFromHex(hex.substring(1)); // Remove # symbol
        updateUI(currentColor);
    });
    
    // Sample colors
    document.querySelectorAll('.sample-color').forEach(color => {
        color.addEventListener('click', function() {
            const hex = this.getAttribute('data-hex');
            currentColor = calculateFromHex(hex);
            updateUI(currentColor);
        });
    });
    
    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            copyToClipboard(targetElement.value);
            showCopySuccess();
        });
    });
    
    document.querySelectorAll('.copy-palette-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            copyToClipboard(targetElement.textContent);
            showCopySuccess();
        });
    });
    
    // Copy all button
    document.getElementById('copy-all-btn').addEventListener('click', function() {
        const allValues = `HEX: ${resultHex.value}
RGB: ${resultRgb.value}
HSL: ${resultHsl.value}
CSS Variable: ${resultCssVar.value}
RGB Percentage: ${resultRgbPercent.value}
HSV: ${resultHsv.value}`;
        
        copyToClipboard(allValues);
        showCopySuccess();
    });
    
    // Color conversion functions
    function calculateFromHex(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        
        // Parse hex to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Convert RGB to HSL
        const hsl = rgbToHsl(r, g, b);
        
        return {
            hex: '#' + hex.toUpperCase(),
            rgb: { r, g, b },
            hsl
        };
    }
    
    function calculateFromRGB(r, g, b) {
        // Convert RGB to Hex
        const hex = rgbToHex(r, g, b);
        
        // Convert RGB to HSL
        const hsl = rgbToHsl(r, g, b);
        
        return {
            hex,
            rgb: { r, g, b },
            hsl
        };
    }
    
    function calculateFromHSL(h, s, l) {
        // Convert HSL to RGB
        const rgb = hslToRgb(h, s, l);
        
        // Convert RGB to Hex
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        
        return {
            hex,
            rgb,
            hsl: { h, s, l }
        };
    }
    
    // Utility functions
    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
    
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
    
    function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, v = max;
        
        const d = max - min;
        s = max === 0 ? 0 : d / max;
        
        if (max === min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }
    
    function generateComplementary(h, s, l) {
        // Complementary color is 180 degrees away on the color wheel
        const newH = (h + 180) % 360;
        return { h: newH, s, l };
    }
    
    function generateAnalogous(h, s, l) {
        // Analogous colors are 30 degrees away on the color wheel
        const h1 = (h + 30) % 360;
        const h2 = (h + 330) % 360; // or (h - 30 + 360) % 360
        return [
            { h: h1, s, l },
            { h: h2, s, l }
        ];
    }
    
    function generateTriadic(h, s, l) {
        // Triadic colors are 120 degrees away on the color wheel
        const h1 = (h + 120) % 360;
        const h2 = (h + 240) % 360;
        return [
            { h: h1, s, l },
            { h: h2, s, l }
        ];
    }
    
    function generateMonochromatic(h, s, l) {
        // Lighter and darker versions of the same hue
        return [
            { h, s, l: Math.min(l + 20, 100) }, // Lighter
            { h, s, l: Math.max(l - 20, 0) }    // Darker
        ];
    }
    
    function generateShades(h, s, l) {
        // Just adjusts the lightness
        return { h, s, Math.max(l - 40, 0) };
    }
    
    // Validation functions
    function isValidHex(hex) {
        return /^[0-9A-Fa-f]{6}$/.test(hex);
    }
    
    function isValidRGB(r, g, b) {
        return !isNaN(r) && !isNaN(g) && !isNaN(b) &&
               r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
    }
    
    function isValidHSL(h, s, l) {
        return !isNaN(h) && !isNaN(s) && !isNaN(l) &&
               h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
    }
    
    // UI update
    function updateUI(color) {
        // Update preview
        colorPreview.style.backgroundColor = color.hex;
        colorPicker.value = color.hex;
        
        // Update inputs
        hexInput.value = color.hex.substring(1);
        rgbR.value = color.rgb.r;
        rgbG.value = color.rgb.g;
        rgbB.value = color.rgb.b;
        hslH.value = color.hsl.h;
        hslS.value = color.hsl.s;
        hslL.value = color.hsl.l;
        
        // Update results
        resultHex.value = color.hex;
        resultRgb.value = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
        resultHsl.value = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
        resultCssVar.value = `--color: ${color.hex};`;
        resultRgbPercent.value = `rgb(${Math.round(color.rgb.r / 2.55)}%, ${Math.round(color.rgb.g / 2.55)}%, ${Math.round(color.rgb.b / 2.55)}%)`;
        
        // Calculate HSV
        const hsv = rgbToHsv(color.rgb.r, color.rgb.g, color.rgb.b);
        resultHsv.value = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
        
        // Update palette
        updatePalette(color.hsl);
    }
    
    function updatePalette(hsl) {
        // Complementary
        const comp = generateComplementary(hsl.h, hsl.s, hsl.l);
        const compRgb = hslToRgb(comp.h, comp.s, comp.l);
        const compHex = rgbToHex(compRgb.r, compRgb.g, compRgb.b);
        complementary.style.backgroundColor = compHex;
        complementaryHex.textContent = compHex;
        
        // Analogous
        const ana = generateAnalogous(hsl.h, hsl.s, hsl.l);
        
        const ana1Rgb = hslToRgb(ana[0].h, ana[0].s, ana[0].l);
        const ana1Hex = rgbToHex(ana1Rgb.r, ana1Rgb.g, ana1Rgb.b);
        analogous1.style.backgroundColor = ana1Hex;
        analogous1Hex.textContent = ana1Hex;
        
        const ana2Rgb = hslToRgb(ana[1].h, ana[1].s, ana[1].l);
        const ana2Hex = rgbToHex(ana2Rgb.r, ana2Rgb.g, ana2Rgb.b);
        analogous2.style.backgroundColor = ana2Hex;
        analogous2Hex.textContent = ana2Hex;
        
        // Triadic
        const tri = generateTriadic(hsl.h, hsl.s, hsl.l);
        
        const tri1Rgb = hslToRgb(tri[0].h, tri[0].s, tri[0].l);
        const tri1Hex = rgbToHex(tri1Rgb.r, tri1Rgb.g, tri1Rgb.b);
        triadic1.style.backgroundColor = tri1Hex;
        triadic1Hex.textContent = tri1Hex;
        
        const tri2Rgb = hslToRgb(tri[1].h, tri[1].s, tri[1].l);
        const tri2Hex = rgbToHex(tri2Rgb.r, tri2Rgb.g, tri2Rgb.b);
        triadic2.style.backgroundColor = tri2Hex;
        triadic2Hex.textContent = tri2Hex;
        
        // Monochromatic
        const mono = generateMonochromatic(hsl.h, hsl.s, hsl.l);
        
        const mono1Rgb = hslToRgb(mono[0].h, mono[0].s, mono[0].l);
        const mono1Hex = rgbToHex(mono1Rgb.r, mono1Rgb.g, mono1Rgb.b);
        monochromatic1.style.backgroundColor = mono1Hex;
        monochromatic1Hex.textContent = mono1Hex;
        
        const mono2Rgb = hslToRgb(mono[1].h, mono[1].s, mono[1].l);
        const mono2Hex = rgbToHex(mono2Rgb.r, mono2Rgb.g, mono2Rgb.b);
        monochromatic2.style.backgroundColor = mono2Hex;
        monochromatic2Hex.textContent = mono2Hex;
        
        // Shades
        const shade = generateShades(hsl.h, hsl.s, hsl.l);
        const shadeRgb = hslToRgb(shade.h, shade.s, shade.l);
        const shadeHex = rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);
        shades.style.backgroundColor = shadeHex;
        shadesHex.textContent = shadeHex;
    }
    
    // Helper functions
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    function showCopySuccess() {
        // You could implement a toast notification here
        alert('Copied to clipboard!');
    }
    
    function showError(message) {
        alert(message);
    }
}); 