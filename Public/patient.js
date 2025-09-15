// patient.js - Patient Dashboard Functionality

class PatientManager {
    constructor() {
        this.currentPatient = {
            id: 'patient_001',
            name: 'John Doe',
            age: 32,
            language: 'en',
            medicalHistory: [],
            appointments: [],
            prescriptions: []
        };
        
        this.aiAnalysisInProgress = false;
        this.healthWalletData = this.loadHealthWallet();
        this.initializePatientFeatures();
    }
    
    initializePatientFeatures() {
        // Initialize symptom checker
        this.setupSymptomChecker();
        
        // Load health wallet
        this.displayHealthWallet();
        
        // Setup appointment booking
        this.setupAppointmentBooking();
        
        // Initialize emergency services
        this.setupEmergencyServices();
    }
    
    setupSymptomChecker() {
        const analyzeBtn = document.querySelector('[onclick="analyzeSymptoms()"]');
        if (analyzeBtn && !analyzeBtn.hasPatientListener) {
            analyzeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.analyzeSymptoms();
            });
            analyzeBtn.hasPatientListener = true;
        }
    }
    
    analyzeSymptoms() {
        const symptomText = document.getElementById('symptom-text');
        const analysisResults = document.getElementById('analysis-results');
        
        if (!symptomText || !analysisResults) return;
        
        const symptoms = symptomText.value.trim();
        if (!symptoms) {
            this.showError('Please describe your symptoms first.');
            return;
        }
        
        if (this.aiAnalysisInProgress) {
            this.showError('Analysis already in progress. Please wait.');
            return;
        }
        
        this.aiAnalysisInProgress = true;
        this.showAnalysisLoading();
        
        // Simulate AI analysis (replace with actual API call)
        this.performAIAnalysis(symptoms)
            .then(results => {
                this.displayAnalysisResults(results);
                this.aiAnalysisInProgress = false;
            })
            .catch(error => {
                console.error('AI Analysis error:', error);
                this.showError('Analysis failed. Please try again.');
                this.aiAnalysisInProgress = false;
            });
    }
    
    performAIAnalysis(symptoms) {
        return new Promise((resolve) => {
            // Simulate API call delay
            setTimeout(() => {
                // Mock AI analysis results
                const mockResults = this.generateMockAnalysis(symptoms);
                resolve(mockResults);
            }, 3000);
        });
    }
    
    generateMockAnalysis(symptoms) {
        const lowerSymptoms = symptoms.toLowerCase();
        let conditions = [];
        let urgency = 'moderate';
        let recommendations = [];
        
        // Simple symptom matching logic (replace with actual AI)
        if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('temperature')) {
            conditions.push({ name: 'Viral Fever', probability: '78%', description: 'Common viral infection' });
            conditions.push({ name: 'Bacterial Infection', probability: '22%', description: 'Requires medical attention' });
            recommendations.push('Rest and stay hydrated');
            recommendations.push('Monitor temperature regularly');
            recommendations.push('Consult doctor if fever persists > 3 days');
        }
        
        if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('head pain')) {
            conditions.push({ name: 'Tension Headache', probability: '65%', description: 'Stress-related headache' });
            conditions.push({ name: 'Migraine', probability: '25%', description: 'Severe headache disorder' });
            conditions.push({ name: 'Sinusitis', probability: '10%', description: 'Sinus inflammation' });
            recommendations.push('Apply cold/warm compress');
            recommendations.push('Avoid bright lights and loud sounds');
            recommendations.push('Stay hydrated');
        }
        
        if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('heart')) {
            urgency = 'high';
            conditions.push({ name: 'Angina', probability: '45%', description: 'Heart-related chest pain' });
            conditions.push({ name: 'Muscle Strain', probability: '35%', description: 'Chest muscle injury' });
            conditions.push({ name: 'Acid Reflux', probability: '20%', description: 'Digestive issue' });
            recommendations.push('Seek immediate medical attention');
            recommendations.push('Do not ignore chest pain');
            recommendations.push('Call emergency services if severe');
        }
        
        if (lowerSymptoms.includes('cough') || lowerSymptoms.includes('cold')) {
            conditions.push({ name: 'Common Cold', probability: '70%', description: 'Upper respiratory infection' });
            conditions.push({ name: 'Bronchitis', probability: '20%', description: 'Lung inflammation' });
            conditions.push({ name: 'Allergic Reaction', probability: '10%', description: 'Environmental allergens' });
            recommendations.push('Rest and drink plenty of fluids');
            recommendations.push('Use humidifier or steam inhalation');
            recommendations.push('Avoid smoking and pollutants');
        }
        
        // Default case
        if (conditions.length === 0) {
            conditions.push({ name: 'General Malaise', probability: '60%', description: 'Non-specific symptoms' });
            recommendations.push('Monitor symptoms closely');
            recommendations.push('Consult healthcare provider if symptoms worsen');
            recommendations.push('Maintain good rest and nutrition');
        }
        
        return {
            symptoms,
            urgency,
            conditions,
            recommendations,
            timestamp: new Date().toISOString(),
            patientId: this.currentPatient.id
        };
    }
    
    showAnalysisLoading() {
        const analysisResults = document.getElementById('analysis-results');
        if (analysisResults) {
            analysisResults.style.display = 'block';
            analysisResults.innerHTML = `
                <div class="loading-analysis">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <h3>🧠 AI Analysis in Progress</h3>
                    <p>Analyzing your symptoms using advanced medical AI...</p>
                    <div class="analysis-steps">
                        <div class="step active">Processing symptoms</div>
                        <div class="step">Consulting medical database</div>
                        <div class="step">Generating recommendations</div>
                    </div>
                </div>
            `;
            
            // Animate loading steps
            setTimeout(() => {
                const steps = analysisResults.querySelectorAll('.step');
                steps[1].classList.add('active');
            }, 1000);
            
            setTimeout(() => {
                const steps = analysisResults.querySelectorAll('.step');
                steps[2].classList.add('active');
            }, 2000);
        }
    }
    
    displayAnalysisResults(results) {
        const analysisResults = document.getElementById('analysis-results');
        const urgencyBadge = document.getElementById('urgency-badge');
        const conditionList = document.getElementById('condition-list');
        const recommendationList = document.getElementById('recommendation-list');
        
        if (!analysisResults) return;
        
        // Update urgency badge
        if (urgencyBadge) {
            urgencyBadge.textContent = results.urgency.charAt(0).toUpperCase() + results.urgency.slice(1);
            urgencyBadge.className = `urgency-badge ${results.urgency}`;
        }
        
        // Display conditions
        if (conditionList) {
            conditionList.innerHTML = results.conditions.map(condition => `
                <div class="condition-item">
                    <div class="condition-details">
                        <div class="condition-name">${condition.name}</div>
                        <div class="condition-description">${condition.description}</div>
                    </div>
                    <div class="condition-probability">${condition.probability}</div>
                </div>
            `).join('');
        }
        
        // Display recommendations
        if (recommendationList) {
            recommendationList.innerHTML = results.recommendations.map(rec => `
                <div class="recommendation-item">
                    <div class="recommendation-icon">💡</div>
                    <div class="recommendation-text">${rec}</div>
                </div>
            `).join('');
        }
        
        // Show results with animation
        analysisResults.style.display = 'block';
        analysisResults.innerHTML = document.getElementById('analysis-results').innerHTML;
        
        // Add to health wallet
        this.addToHealthWallet({
            type: 'symptom_analysis',
            timestamp: results.timestamp,
            symptoms: results.symptoms,
            analysis: results,
            urgency: results.urgency
        });
        
        // Scroll to results
        analysisResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Voice announcement
        if (window.voiceManager && window.voiceManager.isGlobalVoiceActive) {
            const summary = `Analysis complete. Urgency level: ${results.urgency}. Found ${results.conditions.length} possible conditions.`;
            window.voiceManager.speak(summary);
        }
    }
    
    showError(message) {
        const analysisResults = document.getElementById('analysis-results');
        if (analysisResults) {
            analysisResults.style.display = 'block';
            analysisResults.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>Analysis Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-secondary" onclick="document.getElementById('analysis-results').style.display='none'">
                        Close
                    </button>
                </div>
            `;
        }
    }
    
    setupAppointmentBooking() {
        // Initialize appointment booking system
        this.availableDoctors = [
            { id: 'dr001', name: 'Dr. Sarah Johnson', specialization: 'General Medicine', rating: 4.9, fee: '₹500' },
            { id: 'dr002', name: 'Dr. Raj Kumar', specialization: 'Cardiology', rating: 4.7, fee: '₹800' },
            { id: 'dr003', name: 'Dr. Priya Patel', specialization: 'Pediatrics', rating: 4.8, fee: '₹600' },
            { id: 'dr004', name: 'Dr. Ahmed Ali', specialization: 'Dermatology', rating: 4.6, fee: '₹550' }
        ];
    }
    
    showAppointmentBooking() {
        const content = `
            <div class="appointment-booking">
                <div class="booking-header">
                    <h3>📅 Book Doctor Appointment</h3>
                    <p>Choose from our verified healthcare professionals</p>
                </div>
                
                <div class="doctor-search">
                    <input type="text" class="form-input" placeholder="Search by specialization or doctor name..." 
                           onkeyup="patientManager.filterDoctors(this.value)">
                </div>
                
                <div class="doctors-list" id="doctors-list">
                    ${this.availableDoctors.map(doctor => `
                        <div class="doctor-card" data-doctor-id="${doctor.id}">
                            <div class="doctor-info">
                                <img src="https://via.placeholder.com/60" alt="${doctor.name}" class="doctor-avatar">
                                <div class="doctor-details">
                                    <h4>${doctor.name}</h4>
                                    <p>${doctor.specialization}</p>
                                    <div class="doctor-rating">⭐ ${doctor.rating}</div>
                                </div>
                            </div>
                            <div class="doctor-booking">
                                <div class="consultation-fee">${doctor.fee}</div>
                                <button class="btn btn-primary btn-small" onclick="patientManager.selectDoctor('${doctor.id}')">
                                    Select Doctor
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        showModal('Book Appointment', content);
    }
    
    filterDoctors(searchTerm) {
        const doctorCards = document.querySelectorAll('.doctor-card');
        const term = searchTerm.toLowerCase();
        
        doctorCards.forEach(card => {
            const doctorText = card.textContent.toLowerCase();
            if (doctorText.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    selectDoctor(doctorId) {
        const doctor = this.availableDoctors.find(d => d.id === doctorId);
        if (!doctor) return;
        
        const content = `
            <div class="appointment-scheduling">
                <div class="selected-doctor">
                    <h3>📋 Appointment with ${doctor.name}</h3>
                    <p>${doctor.specialization} | ${doctor.fee} consultation</p>
                </div>
                
                <div class="scheduling-form">
                    <div class="form-group">
                        <label class="form-label">Preferred Date</label>
                        <input type="date" class="form-input" id="appointment-date" 
                               min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Preferred Time</label>
                        <select class="form-select" id="appointment-time">
                            <option value="09:00">09:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="15:00">03:00 PM</option>
                            <option value="16:00">04:00 PM</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Consultation Type</label>
                        <select class="form-select" id="consultation-type">
                            <option value="video">Video Call</option>
                            <option value="audio">Audio Call</option>
                            <option value="in-person">In-Person</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Brief Description of Issue</label>
                        <textarea class="form-input" rows="3" id="appointment-notes" 
                                  placeholder="Describe your symptoms or reason for consultation..."></textarea>
                    </div>
                    
                    <div class="appointment-actions">
                        <button class="btn btn-primary" onclick="patientManager.confirmAppointment('${doctorId}')">
                            Confirm Appointment
                        </button>
                        <button class="btn btn-secondary" onclick="patientManager.showAppointmentBooking()">
                            Back to Doctors
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.getElementById('modal-overlay');
        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
            modalBody.innerHTML = content;
        }
    }
    
    confirmAppointment(doctorId) {
        const doctor = this.availableDoctors.find(d => d.id === doctorId);
        const date = document.getElementById('appointment-date')?.value;
        const time = document.getElementById('appointment-time')?.value;
        const type = document.getElementById('consultation-type')?.value;
        const notes = document.getElementById('appointment-notes')?.value;
        
        if (!date || !time) {
            alert('Please select both date and time for your appointment.');
            return;
        }
        
        const appointment = {
            id: 'apt_' + Date.now(),
            doctorId,
            doctorName: doctor.name,
            date,
            time,
            type,
            notes,
            status: 'confirmed',
            fee: doctor.fee,
            timestamp: new Date().toISOString()
        };
        
        // Add to patient's appointments
        this.currentPatient.appointments.push(appointment);
        
        // Add to health wallet
        this.addToHealthWallet({
            type: 'appointment',
            timestamp: appointment.timestamp,
            appointment
        });
        
        // Show confirmation
        const content = `
            <div class="appointment-confirmation">
                <div class="confirmation-icon">✅</div>
                <h3>Appointment Confirmed!</h3>
                <div class="appointment-details">
                    <p><strong>Doctor:</strong> ${doctor.name}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${this.formatTime(time)}</p>
                    <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                    <p><strong>Fee:</strong> ${doctor.fee}</p>
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-primary" onclick="closeModal()">Done</button>
                    <button class="btn btn-secondary" onclick="patientManager.showHealthWallet()">View in Health Wallet</button>
                </div>
            </div>
        `;
        
        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
            modalBody.innerHTML = content;
        }
        
        // Voice confirmation
        if (window.voiceManager) {
            window.voiceManager.speak(`Appointment confirmed with ${doctor.name} on ${new Date(date).toLocaleDateString()} at ${this.formatTime(time)}`);
        }
    }
    
    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }
    
    setupEmergencyServices() {
        this.emergencyContacts = [
            { name: 'Ambulance', number: '108', icon: '🚑' },
            { name: 'Fire Department', number: '101', icon: '🚒' },
            { name: 'Police', number: '100', icon: '🚔' },
            { name: 'Women Helpline', number: '181', icon: '👮‍♀️' },
            { name: 'Poison Control', number: '1066', icon: '☣️' }
        ];
        
        this.nearbyHospitals = [
            { name: 'Apollo Hospital', distance: '2.3 km', phone: '+91-11-12345678' },
            { name: 'Max Healthcare', distance: '3.1 km', phone: '+91-11-87654321' },
            { name: 'Fortis Hospital', distance: '4.7 km', phone: '+91-11-11223344' }
        ];
    }
    
    showEmergencyServices() {
        const content = `
            <div class="emergency-services">
                <div class="emergency-header">
                    <h3>🚨 Emergency Services</h3>
                    <p class="emergency-warning">For immediate medical emergencies, call 108</p>
                </div>
                
                <div class="emergency-contacts">
                    <h4>Emergency Hotlines</h4>
                    <div class="contact-grid">
                        ${this.emergencyContacts.map(contact => `
                            <div class="emergency-contact">
                                <div class="contact-icon">${contact.icon}</div>
                                <div class="contact-info">
                                    <h5>${contact.name}</h5>
                                    <a href="tel:${contact.number}" class="emergency-number">${contact.number}</a>
                                </div>
                                <button class="btn btn-danger btn-small" onclick="window.open('tel:${contact.number}')">
                                    Call Now
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="nearby-hospitals">
                    <h4>🏥 Nearby Hospitals</h4>
                    <div class="hospital-list">
                        ${this.nearbyHospitals.map(hospital => `
                            <div class="hospital-item">
                                <div class="hospital-info">
                                    <h5>${hospital.name}</h5>
                                    <p>📍 ${hospital.distance} away</p>
                                </div>
                                <div class="hospital-actions">
                                    <button class="btn btn-outline btn-small" onclick="window.open('tel:${hospital.phone}')">
                                        📞 Call
                                    </button>
                                    <button class="btn btn-secondary btn-small" onclick="patientManager.getDirections('${hospital.name}')">
                                        🗺️ Directions
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        showModal('Emergency Services', content);
    }
    
    getDirections(hospitalName) {
        // Open maps with directions (replace with actual implementation)
        const query = encodeURIComponent(hospitalName + ' hospital near me');
        const mapsUrl = `https://www.google.com/maps/search/${query}`;
        window.open(mapsUrl, '_blank');
        
        if (window.voiceManager) {
            window.voiceManager.speak(`Opening directions to ${hospitalName}`);
        }
    }
    
    loadHealthWallet() {
        // Load from localStorage or return default structure
        const saved = localStorage.getItem('healthWallet_' + this.currentPatient.id);
        return saved ? JSON.parse(saved) : {
            analyses: [],
            appointments: [],
            prescriptions: [],
            invoices: [],
            vitals: []
        };
    }
    
    addToHealthWallet(data) {
        const category = data.type + 's';
        if (this.healthWalletData[category]) {
            this.healthWalletData[category].unshift(data);
            
            // Keep only last 50 entries per category
            if (this.healthWalletData[category].length > 50) {
                this.healthWalletData[category] = this.healthWalletData[category].slice(0, 50);
            }
        }
        
        this.saveHealthWallet();
    }
    
    saveHealthWallet() {
        localStorage.setItem('healthWallet_' + this.currentPatient.id, JSON.stringify(this.healthWalletData));
    }
    
    showHealthWallet() {
        const content = `
            <div class="health-wallet">
                <div class="wallet-header">
                    <h3>📋 Health Wallet</h3>
                    <p>Your complete medical history and records</p>
                </div>
                
                <div class="wallet-tabs">
                    <button class="tab-btn active" onclick="patientManager.switchWalletTab('analyses')">Symptom Analyses</button>
                    <button class="tab-btn" onclick="patientManager.switchWalletTab('appointments')">Appointments</button>
                    <button class="tab-btn" onclick="patientManager.switchWalletTab('prescriptions')">Prescriptions</button>
                    <button class="tab-btn" onclick="patientManager.switchWalletTab('invoices')">Invoices</button>
                </div>
                
                <div class="wallet-content" id="wallet-content">
                    ${this.renderWalletTab('analyses')}
                </div>
            </div>
        `;
        
        showModal('Health Wallet', content);
    }
    
    switchWalletTab(tabName) {
        // Update active tab
        const tabButtons = document.querySelectorAll('.wallet-tabs .tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tabName.slice(0, -1))) {
                btn.classList.add('active');
            }
        });
        
        // Update content
        const content = document.getElementById('wallet-content');
        if (content) {
            content.innerHTML = this.renderWalletTab(tabName);
        }
    }
    
    renderWalletTab(tabName) {
        const data = this.healthWalletData[tabName] || [];
        
        if (data.length === 0) {
            return `
                <div class="empty-wallet-tab">
                    <p>No ${tabName} records found</p>
                </div>
            `;
        }
        
        switch (tabName) {
            case 'analyses':
                return data.map(item => `
                    <div class="wallet-item">
                        <div class="item-header">
                            <h5>🔍 Symptom Analysis</h5>
                            <span class="item-date">${new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p><strong>Symptoms:</strong> ${item.symptoms}</p>
                        <p><strong>Urgency:</strong> <span class="urgency-badge ${item.urgency}">${item.urgency}</span></p>
                        <button class="btn btn-small btn-outline" onclick="patientManager.viewAnalysisDetails('${item.timestamp}')">
                            View Details
                        </button>
                    </div>
                `).join('');
                
            case 'appointments':
                return data.map(item => `
                    <div class="wallet-item">
                        <div class="item-header">
                            <h5>📅 ${item.appointment.doctorName}</h5>
                            <span class="item-date">${new Date(item.appointment.date).toLocaleDateString()}</span>
                        </div>
                        <p><strong>Time:</strong> ${this.formatTime(item.appointment.time)}</p>
                        <p><strong>Type:</strong> ${item.appointment.type}</p>
                        <p><strong>Status:</strong> <span class="status-badge ${item.appointment.status}">${item.appointment.status}</span></p>
                    </div>
                `).join('');
                
            default:
                return `<p>Tab content for ${tabName} not implemented yet</p>`;
        }
    }
    
    viewAnalysisDetails(timestamp) {
        const analysis = this.healthWalletData.analyses.find(item => item.timestamp === timestamp);
        if (!analysis) return;
        
        // Display detailed analysis results
        console.log('Viewing analysis details:', analysis);
        // Here you would show detailed analysis in a new modal or expand the current view
    }
}

// Initialize patient manager
const patientManager = new PatientManager();

// Global functions for patient dashboard
function analyzeSymptoms() {
    patientManager.analyzeSymptoms();
}

function bookAppointment() {
    patientManager.showAppointmentBooking();
}

function showAppointmentBooking() {
    patientManager.showAppointmentBooking();
}

function showHealthWallet() {
    patientManager.showHealthWallet();
}

function showEmergencyServices() {
    patientManager.showEmergencyServices();
}

function saveToHealthWallet() {
    const analysisResults = document.getElementById('analysis-results');
    if (analysisResults && analysisResults.style.display !== 'none') {
        // Analysis results are already saved automatically
        if (window.voiceManager) {
            window.voiceManager.speak('Analysis results have been saved to your health wallet');
        }
        alert('Analysis results saved to your Health Wallet!');
    }
}

function uploadInvoice() {
    const content = `
        <div class="invoice-upload">
            <div class="upload-area" onclick="document.getElementById('invoice-file').click()">
                <div class="upload-icon">📁</div>
                <p>Click to select invoice file</p>
                <small>Supports: JPG, PNG, PDF</small>
                <input type="file" id="invoice-file" accept=".jpg,.jpeg,.png,.pdf" 
                       onchange="patientManager.handleInvoiceUpload(this.files[0])" style="display: none;">
            </div>
            
            <div class="upload-features">
                <div class="feature-item">
                    <div class="feature-icon">🔍</div>
                    <span>OCR Text Extraction</span>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🎤</div>
                    <span>Voice Confirmation</span>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">💾</div>
                    <span>Auto-save to Wallet</span>
                </div>
            </div>
        </div>
    `;
    
    showModal('Upload Invoice', content);
}

// Add method to PatientManager class
PatientManager.prototype.handleInvoiceUpload = function(file) {
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG) or PDF document.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB.');
        return;
    }
    
    // Process the invoice with voice feedback
    if (typeof processInvoiceWithVoice === 'function') {
        processInvoiceWithVoice(file);
    }
    
    closeModal();
};

// Export patient manager for use in other modules
window.patientManager = patientManager;