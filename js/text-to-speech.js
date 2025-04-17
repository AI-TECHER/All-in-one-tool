document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const charCounter = document.getElementById('char-counter');
    const voiceSelect = document.getElementById('voice-select');
    const languageSelect = document.getElementById('language-select');
    const rateSlider = document.getElementById('rate-slider');
    const rateValue = document.getElementById('rate-value');
    const pitchSlider = document.getElementById('pitch-slider');
    const pitchValue = document.getElementById('pitch-value');
    const speakBtn = document.getElementById('speak-btn');
    const clearBtn = document.getElementById('clear-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const audioContainer = document.getElementById('audio-container');
    const audioPlayer = document.getElementById('audio-player');
    const downloadBtn = document.getElementById('download-btn');
    const newTextBtn = document.getElementById('new-text-btn');
    const historyContainer = document.getElementById('history-container');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Variables
    let speechSynthesis = window.speechSynthesis;
    let voices = [];
    let audioBlob = null;
    let currentUtterance = null;
    let history = JSON.parse(localStorage.getItem('ttsHistory')) || [];

    // Initialize
    init();

    function init() {
        // Load available voices
        loadVoices();
        
        // Try again if voices aren't loaded immediately
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
        
        // Update character counter
        updateCharCount();
        
        // Display history if available
        updateHistoryDisplay();
        
        // Setup event listeners
        setupEventListeners();
    }

    function loadVoices() {
        voices = speechSynthesis.getVoices();
        
        // Clear voice select
        voiceSelect.innerHTML = '';
        
        if (voices.length > 0) {
            // Group voices by language
            const voicesByLang = {};
            voices.forEach(voice => {
                if (!voicesByLang[voice.lang]) {
                    voicesByLang[voice.lang] = [];
                }
                voicesByLang[voice.lang].push(voice);
            });
            
            // Create option groups by language
            for (const lang in voicesByLang) {
                const langVoices = voicesByLang[lang];
                // Create options
                langVoices.forEach(voice => {
                    const option = document.createElement('option');
                    option.textContent = `${voice.name} (${voice.lang})`;
                    option.setAttribute('data-lang', voice.lang);
                    option.setAttribute('data-name', voice.name);
                    option.value = voice.name;
                    voiceSelect.appendChild(option);
                });
            }
            
            // Select default voice
            selectDefaultVoice();
        } else {
            // No voices available
            const option = document.createElement('option');
            option.textContent = 'No voices available';
            option.value = '';
            voiceSelect.appendChild(option);
            voiceSelect.disabled = true;
            speakBtn.disabled = true;
        }
    }

    function selectDefaultVoice() {
        // Try to select a voice that matches the selected language
        const langCode = languageSelect.value;
        const matchingVoices = voices.filter(voice => voice.lang.startsWith(langCode));
        
        if (matchingVoices.length > 0) {
            // Prefer voices that are not "Google" or have "natural" in name
            const preferredVoice = matchingVoices.find(voice => 
                !voice.name.includes('Google') && voice.name.includes('Natural'));
            
            if (preferredVoice) {
                voiceSelect.value = preferredVoice.name;
            } else {
                voiceSelect.value = matchingVoices[0].name;
            }
        }
    }

    function setupEventListeners() {
        // Text input
        textInput.addEventListener('input', updateCharCount);
        
        // Language select
        languageSelect.addEventListener('change', selectDefaultVoice);
        
        // Rate slider
        rateSlider.addEventListener('input', () => {
            rateValue.textContent = rateSlider.value;
        });
        
        // Pitch slider
        pitchSlider.addEventListener('input', () => {
            pitchValue.textContent = pitchSlider.value;
        });
        
        // Speak button
        speakBtn.addEventListener('click', speakText);
        
        // Clear button
        clearBtn.addEventListener('click', () => {
            textInput.value = '';
            updateCharCount();
        });
        
        // Paste button
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                textInput.value = text;
                updateCharCount();
            } catch (err) {
                alert('Failed to read clipboard. Please paste manually.');
            }
        });
        
        // Download button
        downloadBtn.addEventListener('click', downloadAudio);
        
        // New text button
        newTextBtn.addEventListener('click', () => {
            audioContainer.classList.add('d-none');
            textInput.value = '';
            updateCharCount();
        });
        
        // Clear history button
        clearHistoryBtn.addEventListener('click', clearHistory);
        
        // History item click
        historyList.addEventListener('click', (event) => {
            if (event.target.matches('.history-play-btn')) {
                const text = event.target.closest('.list-group-item').getAttribute('data-text');
                const voiceName = event.target.closest('.list-group-item').getAttribute('data-voice');
                const rate = parseFloat(event.target.closest('.list-group-item').getAttribute('data-rate'));
                const pitch = parseFloat(event.target.closest('.list-group-item').getAttribute('data-pitch'));
                
                textInput.value = text;
                updateCharCount();
                voiceSelect.value = voiceName;
                rateSlider.value = rate;
                rateValue.textContent = rate;
                pitchSlider.value = pitch;
                pitchValue.textContent = pitch;
                
                speakText();
            }
        });
    }

    function updateCharCount() {
        const count = textInput.value.length;
        charCounter.textContent = `${count}/5000 characters`;
        
        // Disable speak button if text is empty or too long
        speakBtn.disabled = count === 0 || count > 5000;
        
        // Change color if approaching limit
        if (count > 4500) {
            charCounter.classList.add('text-danger');
        } else {
            charCounter.classList.remove('text-danger');
        }
    }

    function speakText() {
        // Cancel any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        const text = textInput.value.trim();
        if (!text || text.length > 5000) return;
        
        // Get selected voice
        const selectedVoiceName = voiceSelect.value;
        const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);
        
        if (!selectedVoice) {
            alert('Please select a voice to continue.');
            return;
        }
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.rate = parseFloat(rateSlider.value);
        utterance.pitch = parseFloat(pitchSlider.value);
        utterance.lang = selectedVoice.lang;
        
        // Store current utterance
        currentUtterance = utterance;
        
        // Show loader
        speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        speakBtn.disabled = true;
        
        // Speak
        speechSynthesis.speak(utterance);
        
        // Add to history
        addToHistory(text, selectedVoiceName, utterance.rate, utterance.pitch);
        
        // Record audio with MediaRecorder
        recordSpeech(utterance);
        
        // Events
        utterance.onend = () => {
            speakBtn.innerHTML = '<i class="fas fa-play me-2"></i>Speak Text';
            speakBtn.disabled = false;
        };
        
        utterance.onerror = (e) => {
            console.error('SpeechSynthesis error:', e);
            speakBtn.innerHTML = '<i class="fas fa-play me-2"></i>Speak Text';
            speakBtn.disabled = false;
            alert('An error occurred while generating speech. Please try again.');
        };
    }

    function recordSpeech(utterance) {
        // This is a workaround to capture the audio, as Web Speech API doesn't natively support downloading
        // In a production environment, you'd typically use a server-side TTS service that returns audio files
        
        // Simulate audio generation and display player
        setTimeout(() => {
            // In a real implementation, this would be replaced with actual audio blob generation
            // For now, we'll create a simple beep sound as a placeholder
            createAudioBlob().then(blob => {
                audioBlob = blob;
                const audioURL = URL.createObjectURL(blob);
                audioPlayer.src = audioURL;
                
                // Show audio container
                audioContainer.classList.remove('d-none');
                speakBtn.innerHTML = '<i class="fas fa-play me-2"></i>Speak Text';
                speakBtn.disabled = false;
            });
        }, 1000 + (utterance.text.length * 30)); // Simulate longer processing for longer text
    }

    function createAudioBlob() {
        return new Promise((resolve) => {
            // Create a simple beep sound as a placeholder
            // In a real implementation, this would be the actual TTS audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 440; // A4 note
            gainNode.gain.value = 0.5;
            
            const duration = 1; // 1 second
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
            
            // Record the audio
            const mediaStreamDestination = audioContext.createMediaStreamDestination();
            gainNode.connect(mediaStreamDestination);
            
            const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/mp3' });
                resolve(blob);
            };
            
            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
            }, duration * 1000);
        });
    }

    function downloadAudio() {
        if (!audioBlob) return;
        
        // Create a short text preview for the filename
        const textPreview = textInput.value.slice(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `tts_${textPreview}_${Date.now()}.mp3`;
        
        // Create download link
        const a = document.createElement('a');
        a.href = URL.createObjectURL(audioBlob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function addToHistory(text, voiceName, rate, pitch) {
        // Limit text preview
        const textPreview = text.length > 50 ? text.substring(0, 50) + '...' : text;
        
        // Create history item
        const historyItem = {
            id: Date.now(),
            text: text,
            textPreview: textPreview,
            voiceName: voiceName,
            rate: rate,
            pitch: pitch,
            timestamp: new Date().toISOString()
        };
        
        // Add to beginning of array
        history.unshift(historyItem);
        
        // Limit history to 10 items
        if (history.length > 10) {
            history.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('ttsHistory', JSON.stringify(history));
        
        // Update display
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        if (history.length === 0) {
            historyContainer.classList.add('d-none');
            return;
        }
        
        // Show history container
        historyContainer.classList.remove('d-none');
        
        // Clear list
        historyList.innerHTML = '';
        
        // Add items
        history.forEach(item => {
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.setAttribute('data-text', item.text);
            listItem.setAttribute('data-voice', item.voiceName);
            listItem.setAttribute('data-rate', item.rate);
            listItem.setAttribute('data-pitch', item.pitch);
            
            // Format timestamp
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            listItem.innerHTML = `
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${item.textPreview}</div>
                    <small class="text-muted">Voice: ${item.voiceName.split(' ')[0]} | ${formattedDate}</small>
                </div>
                <button class="btn btn-sm btn-primary history-play-btn">
                    <i class="fas fa-play"></i>
                </button>
            `;
            
            historyList.appendChild(listItem);
        });
    }

    function clearHistory() {
        // Clear history array
        history = [];
        
        // Clear localStorage
        localStorage.removeItem('ttsHistory');
        
        // Hide history container
        historyContainer.classList.add('d-none');
    }
}); 