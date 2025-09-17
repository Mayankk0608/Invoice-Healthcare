// voice.js - Voice Recognition and Text-to-Speech functionality

class VoiceManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isGlobalVoiceActive = false;
        this.currentLanguage = 'en-US';
        this.voices = [];
        
        // Language mapping for speech recognition and synthesis
        this.languageMap = {
            'en': { code: 'en-US', name: 'English' },
            'hi': { code: 'hi-IN', name: 'हिंदी' },
            'ta': { code: 'ta-IN', name: 'தமிழ்' },
            'te': { code: 'te-IN', name: 'తెలుగు' }
        };
        
        this.initializeSpeechRecognition();
        this.loadVoices();
        this.setupEventListeners();
    }
    
    initializeSpeechRecognition() {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;
        this.recognition.maxAlternatives = 3;
        
        // Set up event listeners
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceButton(true);
            this.showVoiceFeedback('Listening... Speak now');
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                this.handleVoiceResult(finalTranscript.trim());
            } else if (interimTranscript) {
                this.showVoiceFeedback(`Listening: ${interimTranscript}`);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButton(false);
            
            let errorMessage = 'Voice recognition error occurred';
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'Microphone access denied or unavailable.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone permission denied.';
                    break;
                case 'network':
                    errorMessage = 'Network error occurred. Check your connection.';
                    break;
            }
            
            this.showVoiceFeedback(errorMessage, 'error');
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton(false);
        };
    }
    
    loadVoices() {
        const loadVoicesImpl = () => {
            this.voices = this.synthesis.getVoices();
            
            // Filter voices by supported languages
            this.supportedVoices = {
                'en-US': this.voices.filter(voice => voice.lang.includes('en')),
                'hi-IN': this.voices.filter(voice => voice.lang.includes('hi')),
                'ta-IN': this.voices.filter(voice => voice.lang.includes('ta')),
                'te-IN': this.voices.filter(voice => voice.lang.includes('te'))
            };
        };
        
        // Load voices immediately if available
        loadVoicesImpl();
        
        // Also load when voices change (some browsers load them asynchronously)
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = loadVoicesImpl;
        }
    }
    
    setupEventListeners() {
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.setLanguage(event.detail.language);
        });
        
        // Listen for page visibility changes to stop recognition
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isListening) {
                this.stopListening();
            }
        });
    }
    
    setLanguage(languageCode) {
        if (this.languageMap[languageCode]) {
            this.currentLanguage = this.languageMap[languageCode].code;
            if (this.recognition) {
                this.recognition.lang = this.currentLanguage;
            }
        }
    }
    
    startListening(targetElement = null) {
        if (!this.recognition) {
            this.showVoiceFeedback('Voice recognition not available', 'error');
            return false;
        }
        
        if (this.isListening) {
            this.stopListening();
            return false;
        }
        
        this.targetElement = targetElement;
        
        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showVoiceFeedback('Could not start voice recognition', 'error');
            return false;
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    handleVoiceResult(transcript) {
        console.log('Voice result:', transcript);
        
        // Update the target element with the transcript
        if (this.targetElement) {
            if (this.targetElement.tagName === 'TEXTAREA' || this.targetElement.tagName === 'INPUT') {
                this.targetElement.value = transcript;
                this.targetElement.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                this.targetElement.textContent = transcript;
            }
        }
        
        // Show success feedback
        this.showVoiceFeedback(`Captured: "${transcript}"`, 'success');
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('voiceResult', {
            detail: { transcript, targetElement: this.targetElement }
        }));
    }
    
    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        // Stop any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure utterance
        utterance.lang = options.lang || this.currentLanguage;
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 0.8;
        
        // Select appropriate voice
        const availableVoices = this.supportedVoices[utterance.lang] || [];
        if (availableVoices.length > 0) {
            // Prefer female voice if available, otherwise use first available
            const preferredVoice = availableVoices.find(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman')
            ) || availableVoices[0];
            
            utterance.voice = preferredVoice;
        }
        
        // Set up event listeners
        utterance.onstart = () => {
            console.log('Started speaking:', text);
        };
        
        utterance.onend = () => {
            console.log('Finished speaking');
            if (options.onEnd) options.onEnd();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            if (options.onError) options.onError(event);
        };
        
        // Speak the text
        this.synthesis.speak(utterance);
    }
    
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
    
    updateVoiceButton(isRecording) {
        const voiceBtn = document.getElementById('voice-record-btn');
        if (voiceBtn) {
            const voiceText = voiceBtn.querySelector('.voice-text');
            
            if (isRecording) {
                voiceBtn.classList.add('recording');
                if (voiceText) voiceText.textContent = 'Listening...';
            } else {
                voiceBtn.classList.remove('recording');
                if (voiceText) voiceText.textContent = 'Click to Speak';
            }
        }
    }
    
    showVoiceFeedback(message, type = 'info') {
        const feedbackElement = document.getElementById('voice-feedback');
        if (feedbackElement) {
            feedbackElement.innerHTML = `<p class="feedback-${type}">${message}</p>`;
            
            // Auto-hide feedback after 5 seconds
            setTimeout(() => {
                if (feedbackElement.innerHTML.includes(message)) {
                    feedbackElement.innerHTML = '<p>Voice recognition ready. Click the button and start speaking...</p>';
                }
            }, 5000);
        }
    }
    
    toggleGlobalVoice() {
        this.isGlobalVoiceActive = !this.isGlobalVoiceActive;
        
        const indicator = document.getElementById('voice-assistant-indicator');
        if (indicator) {
            indicator.style.display = this.isGlobalVoiceActive ? 'block' : 'none';
        }
        
        if (this.isGlobalVoiceActive) {
            this.speak('Voice assistant activated. I can help you navigate and use the application.');
        } else {
            this.speak('Voice assistant deactivated.');
        }
    }
    
    // Utility method to check if voice features are available
    isVoiceSupported() {
        return !!(this.recognition && this.synthesis);
    }
    
    // Get available languages
    getSupportedLanguages() {
        return Object.keys(this.languageMap).map(key => ({
            code: key,
            name: this.languageMap[key].name,
            speechCode: this.languageMap[key].code
        }));
    }
}

// Initialize voice manager
const voiceManager = new VoiceManager();

// Global voice functions
function toggleVoiceRecording() {
    const symptomText = document.getElementById('symptom-text');
    voiceManager.startListening(symptomText);
}

function toggleGlobalVoice() {
    voiceManager.toggleGlobalVoice();
}

function readResultsAloud() {
    const resultsContainer = document.getElementById('analysis-results');
    if (resultsContainer && resultsContainer.style.display !== 'none') {
        let textToRead = '';
        
        // Read urgency level
        const urgencyBadge = document.getElementById('urgency-badge');
        if (urgencyBadge) {
            textToRead += `Urgency level: ${urgencyBadge.textContent}. `;
        }
        
        // Read possible conditions
        const conditionList = document.getElementById('condition-list');
        if (conditionList) {
            const conditions = conditionList.querySelectorAll('.condition-item');
            if (conditions.length > 0) {
                textToRead += 'Possible conditions: ';
                conditions.forEach((condition, index) => {
                    const name = condition.querySelector('.condition-name')?.textContent;
                    const probability = condition.querySelector('.condition-probability')?.textContent;
                    if (name) {
                        textToRead += `${name} with ${probability} probability. `;
                    }
                });
            }
        }
        
        // Read recommendations
        const recommendationList = document.getElementById('recommendation-list');
        if (recommendationList) {
            const recommendations = recommendationList.querySelectorAll('.recommendation-item');
            if (recommendations.length > 0) {
                textToRead += 'Recommendations: ';
                recommendations.forEach((rec) => {
                    const text = rec.querySelector('.recommendation-text')?.textContent;
                    if (text) {
                        textToRead += `${text}. `;
                    }
                });
            }
        }
        
        if (textToRead) {
            voiceManager.speak(textToRead);
        }
    }
}

function changeLanguage(languageCode) {
    voiceManager.setLanguage(languageCode);
    
    // Update UI text based on language (simplified implementation)
    const languageTexts = {
        'en': {
            listening: 'Listening... Speak now',
            clickToSpeak: 'Click to Speak',
            voiceReady: 'Voice recognition ready. Click the button and start speaking...'
        },
        'hi': {
            listening: 'सुन रहा है... अब बोलें',
            clickToSpeak: 'बोलने के लिए क्लिक करें',
            voiceReady: 'आवाज पहचान तैयार है। बटन पर क्लिक करें और बोलना शुरू करें...'
        },
        'ta': {
            listening: 'கேட்கிறது... இப்போது பேசுங்கள்',
            clickToSpeak: 'பேச கிளிக் செய்யுங்கள்',
            voiceReady: 'குரல் அறிதல் தயார். பொத்தானை கிளிக் செய்து பேச தொடங்குங்கள்...'
        },
        'te': {
            listening: 'వింటోంది... ఇప్పుడు మాట్లాడండి',
            clickToSpeak: 'మాట్లాడటానికి క్లిక్ చేయండి',
            voiceReady: 'వాయిస్ రికగ్నిషన్ సిద్ధంగా ఉంది. బటన్ మీద క్లిక్ చేసి మాట్లాడటం ప్రారంభించండి...'
        }
    };
    
    const texts = languageTexts[languageCode] || languageTexts['en'];
    
    // Update voice button text
    const voiceText = document.querySelector('.voice-text');
    if (voiceText && !voiceManager.isListening) {
        voiceText.textContent = texts.clickToSpeak;
    }
    
    // Update voice feedback
    const voiceFeedback = document.getElementById('voice-feedback');
    if (voiceFeedback && voiceFeedback.innerHTML.includes('Voice recognition ready')) {
        voiceFeedback.innerHTML = `<p>${texts.voiceReady}</p>`;
    }
    
    // Dispatch language change event
    document.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: languageCode, texts }
    }));
}

// Invoice OCR with voice confirmation
function processInvoiceWithVoice(file) {
    if (!file) return;
    
    // Show processing message
    voiceManager.speak('Processing invoice. Please wait while I extract the information.');
    
    // Simulate OCR processing (replace with actual OCR API call)
    setTimeout(() => {
        // Mock OCR results
        const ocrResults = {
            medicines: [
                { name: 'Paracetamol 500mg', quantity: '10 tablets', price: '₹25.00' },
                { name: 'Amoxicillin 250mg', quantity: '6 capsules', price: '₹45.00' },
                { name: 'Vitamin D3', quantity: '30 tablets', price: '₹120.00' }
            ],
            totalAmount: '₹190.00',
            date: new Date().toLocaleDateString(),
            pharmacy: 'Apollo Pharmacy'
        };
        
        displayInvoiceResults(ocrResults);
        confirmInvoiceWithVoice(ocrResults);
    }, 2000);
}

function displayInvoiceResults(results) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = 'Invoice Processing Results';
    
    let content = `
        <div class="invoice-results">
            <div class="invoice-header">
                <h4>📄 ${results.pharmacy}</h4>
                <p>Date: ${results.date}</p>
            </div>
            <div class="medicine-list">
                <h4>💊 Medicines:</h4>
    `;
    
    results.medicines.forEach(medicine => {
        content += `
            <div class="medicine-item">
                <div class="medicine-details">
                    <strong>${medicine.name}</strong>
                    <span>Qty: ${medicine.quantity}</span>
                </div>
                <div class="medicine-price">${medicine.price}</div>
            </div>
        `;
    });
    
    content += `
            </div>
            <div class="invoice-total">
                <strong>Total Amount: ${results.totalAmount}</strong>
            </div>
            <div class="invoice-actions">
                <button class="btn btn-primary" onclick="confirmInvoiceData()">✅ Confirm & Save</button>
                <button class="btn btn-secondary" onclick="editInvoiceData()">✏️ Edit Details</button>
                <button class="btn btn-outline" onclick="voiceManager.speak(getInvoiceSummary())">🔊 Read Summary</button>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = content;
    modal.style.display = 'flex';
}

function confirmInvoiceWithVoice(results) {
    let summary = `Invoice processed successfully. Found ${results.medicines.length} medicines. `;
    
    results.medicines.forEach((medicine, index) => {
        summary += `${index + 1}. ${medicine.name}, quantity ${medicine.quantity}, price ${medicine.price}. `;
    });
    
    summary += `Total amount is ${results.totalAmount}. Would you like me to save this information to your health wallet?`;
    
    voiceManager.speak(summary, {
        onEnd: () => {
            // After reading, ask for confirmation
            setTimeout(() => {
                voiceManager.speak('Say "yes" to confirm or "no" to edit the details.');
                // Here you could start listening for yes/no response
            }, 1000);
        }
    });
}

function getInvoiceSummary() {
    // Get current invoice data from modal
    const medicineItems = document.querySelectorAll('.medicine-item');
    let summary = 'Invoice summary: ';
    
    medicineItems.forEach((item, index) => {
        const name = item.querySelector('.medicine-details strong')?.textContent;
        const qty = item.querySelector('.medicine-details span')?.textContent;
        const price = item.querySelector('.medicine-price')?.textContent;
        
        if (name) {
            summary += `${index + 1}. ${name}, ${qty}, ${price}. `;
        }
    });
    
    const total = document.querySelector('.invoice-total strong')?.textContent;
    if (total) {
        summary += total;
    }
    
    return summary;
}

function confirmInvoiceData() {
    voiceManager.speak('Invoice data confirmed and saved to your health wallet.');
    closeModal();
    
    // Here you would save the data to the backend
    console.log('Invoice data confirmed and saved');
}

function editInvoiceData() {
    voiceManager.speak('Opening edit mode. You can modify the details as needed.');
    // Here you would open an edit form
    console.log('Opening edit mode for invoice data');
}

// Voice command processing for global voice assistant
document.addEventListener('voiceResult', (event) => {
    const { transcript } = event.detail;
    
    if (voiceManager.isGlobalVoiceActive) {
        processVoiceCommand(transcript.toLowerCase());
    }
});

function processVoiceCommand(command) {
    console.log('Processing voice command:', command);
    
    // Navigation commands
    if (command.includes('go to') || command.includes('show') || command.includes('open')) {
        if (command.includes('patient') || command.includes('symptom')) {
            navigateTo('patient-dashboard');
            voiceManager.speak('Opening patient dashboard');
            return;
        }
        if (command.includes('doctor') || command.includes('portal')) {
            navigateTo('doctor-dashboard');
            voiceManager.speak('Opening doctor portal');
            return;
        }
        if (command.includes('admin') || command.includes('administration')) {
            navigateTo('admin-dashboard');
            voiceManager.speak('Opening admin dashboard');
            return;
        }
        if (command.includes('home') || command.includes('landing')) {
            navigateTo('landing-page');
            voiceManager.speak('Going to home page');
            return;
        }
    }
    function navigateTo(page) {
        const routes = {
            'landing-page': '/',
            'patient-dashboard': '/patient',
            'doctor-dashboard': '/doctor',
            'admin-dashboard': '/admin'
        };
    
        const path = routes[page] || '/';
        
        // Handle single page application navigation
        if (window.history && window.history.pushState) {
            window.history.pushState({}, page, path);
            // Trigger page change event
            const navEvent = new CustomEvent('pageChanged', { detail: { page } });
            document.dispatchEvent(navEvent);
            // Announce page change for accessibility
            announcePageChange(page);
        } else {
            // Fallback for older browsers
            window.location.href = path;
        }
    }
    
    // Symptom checker commands
    if (command.includes('check symptom') || command.includes('analyze symptom')) {
        const symptomsText = document.getElementById('symptom-text');
        if (symptomsText) {
            voiceManager.speak('Please describe your symptoms');
            setTimeout(() => {
                voiceManager.startListening(symptomsText);
            }, 2000);
        }
        return;
    }
    
    // Help commands
    if (command.includes('help') || command.includes('what can you do')) {
        const helpText = `I can help you navigate the application, check symptoms, book appointments, and read information aloud. 
                         Try saying: "go to patient dashboard", "check symptoms", "book appointment", or "read this aloud".`;
        voiceManager.speak(helpText);
        return;
    }
    
    // Booking commands
    if (command.includes('book appointment') || command.includes('schedule appointment')) {
        showAppointmentBooking();
        voiceManager.speak('Opening appointment booking');
        return;
    }
    
    // Reading commands
    if (command.includes('read this') || command.includes('read aloud') || command.includes('speak this')) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.textContent) {
            voiceManager.speak(activeElement.textContent);
        } else {
            voiceManager.speak('Please select some text first, then ask me to read it.');
        }
        return;
    }
    
    // Language commands
    if (command.includes('change language') || command.includes('switch language')) {
        if (command.includes('hindi') || command.includes('हिंदी')) {
            changeLanguage('hi');
            voiceManager.speak('भाषा हिंदी में बदल गई', { lang: 'hi-IN' });
        } else if (command.includes('tamil') || command.includes('தமிழ்')) {
            changeLanguage('ta');
            voiceManager.speak('மொழி தமிழுக்கு மாற்றப்பட்டது', { lang: 'ta-IN' });
        } else if (command.includes('telugu') || command.includes('తెలుగు')) {
            changeLanguage('te');
            voiceManager.speak('భాష తెలుగులోకి మార్చబడింది', { lang: 'te-IN' });
        } else {
            changeLanguage('en');
            voiceManager.speak('Language changed to English');
        }
        return;
    }
    
    // Default response for unrecognized commands
    voiceManager.speak('I did not understand that command. Try saying "help" to learn what I can do.');
}

// Keyboard shortcuts for voice features
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + Shift + V to toggle voice assistant
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        toggleGlobalVoice();
    }
    
    // Ctrl/Cmd + Shift + S to start symptom voice input
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        const symptomText = document.getElementById('symptom-text');
        if (symptomText) {
            toggleVoiceRecording();
        }
    }
    
    // Escape to stop voice recognition or speech
    if (event.key === 'Escape') {
        if (voiceManager.isListening) {
            voiceManager.stopListening();
        }
        voiceManager.stopSpeaking();
    }
});

// Enhanced voice feedback for UI interactions
function addVoiceFeedbackToButtons() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (voiceManager.isGlobalVoiceActive && button.textContent.trim()) {
                voiceManager.speak(`Clicked ${button.textContent.trim()}`);
            }
        });
    });
}

// Voice-guided form filling
function startVoiceGuidedForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const fields = form.querySelectorAll('input, textarea, select');
    let currentFieldIndex = 0;
    
    function guideNextField() {
        if (currentFieldIndex >= fields.length) {
            voiceManager.speak('Form completed. Please review your information.');
            return;
        }
        
        const field = fields[currentFieldIndex];
        const label = form.querySelector(`label[for="${field.id}"]`)?.textContent || 
                     field.getAttribute('placeholder') || 
                     'Next field';
        
        field.focus();
        voiceManager.speak(`Please provide ${label}`, {
            onEnd: () => {
                if (field.type !== 'select-one') {
                    voiceManager.startListening(field);
                }
            }
        });
    }
    
    // Start with first field
    guideNextField();
    
    // Move to next field when current is filled
    fields.forEach((field, index) => {
        field.addEventListener('input', () => {
            if (field.value.trim() && index === currentFieldIndex) {
                currentFieldIndex++;
                setTimeout(() => guideNextField(), 1000);
            }
        });
    });
}

// Voice accessibility features
function announcePageChange(pageName) {
    if (voiceManager.isGlobalVoiceActive) {
        const pageAnnouncements = {
            'landing-page': 'Welcome to Doc In The Box homepage',
            'patient-dashboard': 'Patient dashboard loaded. You can check symptoms, book appointments, or view your health wallet',
            'doctor-dashboard': 'Doctor portal loaded. View your appointments, patient dossiers, and practice analytics',
            'admin-dashboard': 'Admin dashboard loaded. Monitor system health, user management, and public health analytics'
        };
        
        const announcement = pageAnnouncements[pageName] || `${pageName} page loaded`;
        voiceManager.speak(announcement);
    }
}

// Initialize voice features when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add voice feedback to buttons
    addVoiceFeedbackToButtons();
    
    // Check for saved voice preferences
    const voicePrefs = localStorage.getItem('voicePreferences');
    if (voicePrefs) {
        const prefs = JSON.parse(voicePrefs);
        if (prefs.globalVoiceEnabled) {
            voiceManager.toggleGlobalVoice();
        }
        if (prefs.language) {
            changeLanguage(prefs.language);
        }
    }
    
    // Show voice capabilities notification
    if (voiceManager.isVoiceSupported()) {
        console.log('Voice features initialized successfully');
        
        // Optional: Show a brief intro about voice features
        setTimeout(() => {
            if (!sessionStorage.getItem('voiceIntroShown')) {
                const supportedLangs = voiceManager.getSupportedLanguages().map(l => l.name).join(', ');
                console.log(`Voice assistant supports: ${supportedLangs}`);
                sessionStorage.setItem('voiceIntroShown', 'true');
            }
        }, 2000);
    } else {
        console.warn('Voice features not available in this browser');
    }
});

function saveVoicePreferences() {
    const prefs = {
        globalVoiceEnabled: voiceManager.isGlobalVoiceActive,
        language: voiceManager.currentLanguage
    };
    localStorage.setItem('voicePreferences', JSON.stringify(prefs));
}

window.addEventListener('beforeunload', () => {
    voiceManager.stopListening();
    voiceManager.stopSpeaking();
    saveVoicePreferences();
});

window.voiceManager = voiceManager;