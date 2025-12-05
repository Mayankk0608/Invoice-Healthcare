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
        this.currentNotes = '';
        this.currentInvoiceData = null;
        this.initializePatientFeatures();
    }
    
    initializePatientFeatures() {
        this.setupSymptomChecker();
        this.loadHealthWallet();
        this.setupAppointmentBooking();
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
        
        if (!symptomText || !analysisResults) {
            console.error('Required elements not found');
            this.aiAnalysisInProgress = false;
            return;
        }
        
        const symptoms = symptomText.value.trim();
        if (!symptoms) {
            this.showError('Please describe your symptoms first.');
            this.aiAnalysisInProgress = false;
            return;
        }
        
        // Check and set flag in one operation to prevent race conditions
        if (this.aiAnalysisInProgress) {
            console.log('Analysis already in progress, skipping duplicate call');
            return;
        }
        
        this.aiAnalysisInProgress = true;
        console.log('Starting analysis, flag set to:', this.aiAnalysisInProgress);
        
        this.showAnalysisLoading();
        
        // Simulate AI analysis (replace with actual API call)
        this.performAIAnalysis(symptoms)
            .then(results => {
                console.log('Analysis results received:', results);
                this.displayAnalysisResults(results);
            })
            .catch(error => {
                console.error('AI Analysis error:', error);
                this.showError('Analysis failed. Please try again.');
            })
            .finally(() => {
                // Always reset the flag, whether success or error
                this.aiAnalysisInProgress = false;
                console.log('Analysis complete, flag reset to:', this.aiAnalysisInProgress);
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
        // Build the complete results HTML
        const resultsHTML = `
            <div class="results-header">
                <h3>AI Analysis Results</h3>
                <div class="urgency-indicator">
                    <span class="urgency-label">Urgency Level:</span>
                    <span class="urgency-badge ${results.urgency}">${results.urgency.charAt(0).toUpperCase() + results.urgency.slice(1)}</span>
                </div>
            </div>
            <div class="diagnosis-card">
                <h4>Possible Conditions:</h4>
                <div class="condition-list">
                    ${results.conditions.map(condition => `
                        <div class="condition-item">
                            <div class="condition-details">
                                <div class="condition-name">${condition.name}</div>
                                <div class="condition-description">${condition.description}</div>
                            </div>
                            <div class="condition-probability">${condition.probability}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="recommendations-card">
                <h4>Recommendations:</h4>
                <div class="recommendation-list">
                    ${results.recommendations.map(rec => `
                        <div class="recommendation-item">
                            <div class="recommendation-icon"></div>
                            <div class="recommendation-text">${rec}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="bookAppointment()">Book Doctor Appointment</button>
                <button class="btn btn-secondary" onclick="saveToHealthWallet()">Save to Health Wallet</button>
                <button class="voice-read-btn" onclick="readResultsAloud()">Read Results</button>
            </div>
        `;
        
        // Update the analysis results container
        analysisResults.innerHTML = resultsHTML;
        analysisResults.style.display = 'block';
        
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
                        <div class="item-actions">
                            <button class="btn btn-small btn-outline" onclick="patientManager.viewAnalysisDetails('${item.timestamp}')">
                                View Details
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="patientManager.saveNotes('analysis', '${item.timestamp}')">
                                Add Notes
                            </button>
                        </div>
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
                        <button class="btn btn-small btn-secondary" onclick="patientManager.saveNotes('appointment', '${item.timestamp}')">
                            Add Notes
                        </button>
                    </div>
                `).join('');
                
            case 'prescriptions':
                return data.map((item, index) => `
                    <div class="wallet-item">
                        <div class="item-header">
                            <h5>💊 Prescription #${index + 1}</h5>
                            <span class="item-date">${new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p><strong>Doctor:</strong> ${item.doctorName || 'Not specified'}</p>
                        <p><strong>Medicines:</strong> ${item.medicines?.join(', ') || 'Not specified'}</p>
                        <p><strong>Duration:</strong> ${item.duration || 'Not specified'}</p>
                        <button class="btn btn-small btn-secondary" onclick="patientManager.saveNotes('prescription', '${item.timestamp}')">
                            Add Notes
                        </button>
                    </div>
                `).join('');
                
            case 'invoices':
                return data.map(item => `
                    <div class="wallet-item">
                        <div class="item-header">
                            <h5>📄 Medical Invoice</h5>
                            <span class="item-date">${new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p><strong>Provider:</strong> ${item.provider || 'Not specified'}</p>
                        <p><strong>Amount:</strong> ₹${item.amount || '0'}</p>
                        <p><strong>Status:</strong> <span class="status-badge ${item.status || 'processed'}">${item.status || 'processed'}</span></p>
                        <div class="item-actions">
                            <button class="btn btn-small btn-outline" onclick="patientManager.viewInvoiceDetails('${item.timestamp}')">
                                View Details
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="patientManager.editInvoiceData('${item.timestamp}')">
                                Edit Data
                            </button>
                        </div>
                    </div>
                `).join('');
                
            default:
                return `<p>Tab content for ${tabName} not implemented yet</p>`;
        }
    }
    
    viewAnalysisDetails(timestamp) {
        const analysis = this.healthWalletData.analyses.find(item => item.timestamp === timestamp);
        if (!analysis) return;
        
        const content = `
            <div class="analysis-details">
                <div class="analysis-header">
                    <h3>🔍 Detailed Analysis Report</h3>
                    <p>Generated on ${new Date(analysis.timestamp).toLocaleString()}</p>
                </div>
                
                <div class="analysis-content">
                    <div class="symptoms-section">
                        <h4>Reported Symptoms</h4>
                        <p class="symptom-text">${analysis.symptoms}</p>
                    </div>
                    
                    <div class="urgency-section">
                        <h4>Urgency Assessment</h4>
                        <span class="urgency-badge ${analysis.urgency}">${analysis.urgency.toUpperCase()}</span>
                    </div>
                    
                    <div class="conditions-section">
                        <h4>Possible Conditions</h4>
                        <div class="condition-details">
                            ${analysis.analysis.conditions.map(condition => `
                                <div class="condition-card">
                                    <div class="condition-name">${condition.name}</div>
                                    <div class="condition-desc">${condition.description}</div>
                                    <div class="condition-prob">Probability: ${condition.probability}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="recommendations-section">
                        <h4>AI Recommendations</h4>
                        <div class="recommendations-list">
                            ${analysis.analysis.recommendations.map(rec => `
                                <div class="recommendation-item">
                                    <span class="rec-icon">💡</span>
                                    <span class="rec-text">${rec}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${analysis.notes ? `
                        <div class="notes-section">
                            <h4>Your Notes</h4>
                            <p class="analysis-notes">${analysis.notes}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="analysis-actions">
                    <button class="btn btn-primary" onclick="patientManager.saveNotes('analysis', '${analysis.timestamp}')">
                        Add/Edit Notes
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        `;
        
        showModal('Analysis Details', content);
    }
    
    // NEW FUNCTION: Save Notes functionality
    saveNotes(itemType, timestamp) {
        let item = null;
        let itemTitle = '';
        
        // Find the item based on type and timestamp
        switch(itemType) {
            case 'analysis':
                item = this.healthWalletData.analyses.find(i => i.timestamp === timestamp);
                itemTitle = 'Analysis Notes';
                break;
            case 'appointment':
                item = this.healthWalletData.appointments.find(i => i.timestamp === timestamp);
                itemTitle = 'Appointment Notes';
                break;
            case 'prescription':
                item = this.healthWalletData.prescriptions.find(i => i.timestamp === timestamp);
                itemTitle = 'Prescription Notes';
                break;
            case 'invoice':
                item = this.healthWalletData.invoices.find(i => i.timestamp === timestamp);
                itemTitle = 'Invoice Notes';
                break;
        }
        
        if (!item) {
            alert('Item not found');
            return;
        }
        
        const currentNotes = item.notes || '';
        
        const content = `
            <div class="notes-editor">
                <div class="notes-header">
                    <h3>📝 ${itemTitle}</h3>
                    <p>Add your personal notes and observations</p>
                </div>
                
                <div class="notes-form">
                    <div class="form-group">
                        <label class="form-label">Your Notes</label>
                        <textarea id="notes-textarea" class="form-input" rows="6" 
                                  placeholder="Add your notes, observations, or additional information...">${currentNotes}</textarea>
                    </div>
                    
                    <div class="notes-templates">
                        <h4>Quick Templates</h4>
                        <div class="template-buttons">
                            <button class="btn btn-outline btn-small" onclick="patientManager.insertNoteTemplate('symptoms')">
                                Symptoms Update
                            </button>
                            <button class="btn btn-outline btn-small" onclick="patientManager.insertNoteTemplate('followup')">
                                Follow-up Required
                            </button>
                            <button class="btn btn-outline btn-small" onclick="patientManager.insertNoteTemplate('medication')">
                                Medication Notes
                            </button>
                            <button class="btn btn-outline btn-small" onclick="patientManager.insertNoteTemplate('improvement')">
                                Improvement Log
                            </button>
                        </div>
                    </div>
                    
                    <div class="voice-notes-section">
                        <h4>Voice Notes</h4>
                        <button class="btn btn-secondary" id="voice-notes-btn" onclick="patientManager.startVoiceNotes()">
                            🎤 Record Voice Note
                        </button>
                        <div id="voice-notes-feedback" class="voice-feedback" style="display: none;">
                            <p>Recording... Speak clearly into your microphone</p>
                        </div>
                    </div>
                </div>
                
                <div class="notes-actions">
                    <button class="btn btn-primary" onclick="patientManager.confirmSaveNotes('${itemType}', '${timestamp}')">
                        Save Notes
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </div>
        `;
        
        showModal('Add Notes', content);
    }
    
    insertNoteTemplate(templateType) {
        const textarea = document.getElementById('notes-textarea');
        if (!textarea) return;
        
        const templates = {
            symptoms: '\n\n--- Symptoms Update ---\nDate: ' + new Date().toLocaleDateString() + '\nCurrent Status: \nChanges Observed: \nSeverity (1-10): ',
            followup: '\n\n--- Follow-up Required ---\nAction Needed: \nDeadline: \nReminder Set: \nContact: ',
            medication: '\n\n--- Medication Notes ---\nMedicine: \nDosage: \nTime Taken: \nSide Effects: \nEffectiveness: ',
            improvement: '\n\n--- Improvement Log ---\nDate: ' + new Date().toLocaleDateString() + '\nImprovement Noted: \nSymptom Relief: \nOverall Feeling: '
        };
        
        const template = templates[templateType] || '';
        textarea.value += template;
        textarea.focus();
        textarea.scrollTop = textarea.scrollHeight;
    }
    
    startVoiceNotes() {
        const voiceBtn = document.getElementById('voice-notes-btn');
        const voiceFeedback = document.getElementById('voice-notes-feedback');
        
        if (!voiceBtn || !voiceFeedback) return;
        
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            
            voiceBtn.textContent = '⏹️ Stop Recording';
            voiceBtn.style.background = '#dc3545';
            voiceFeedback.style.display = 'block';
            
            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (finalTranscript) {
                    const textarea = document.getElementById('notes-textarea');
                    if (textarea) {
                        const timestamp = new Date().toLocaleTimeString();
                        textarea.value += `\n\n--- Voice Note (${timestamp}) ---\n${finalTranscript}`;
                    }
                }
            };
            
            recognition.onerror = () => {
                voiceFeedback.innerHTML = '<p style="color: red;">Voice recognition error. Please try again.</p>';
            };
            
            recognition.onend = () => {
                voiceBtn.textContent = '🎤 Record Voice Note';
                voiceBtn.style.background = '';
                voiceFeedback.style.display = 'none';
            };
            
            recognition.start();
            
            voiceBtn.onclick = () => {
                recognition.stop();
            };
        } else {
            alert('Voice recognition not supported in this browser');
        }
    }
    
    confirmSaveNotes(itemType, timestamp) {
        const textarea = document.getElementById('notes-textarea');
        if (!textarea) return;
        
        const notes = textarea.value.trim();
        
        // Find and update the item
        let item = null;
        switch(itemType) {
            case 'analysis':
                item = this.healthWalletData.analyses.find(i => i.timestamp === timestamp);
                break;
            case 'appointment':
                item = this.healthWalletData.appointments.find(i => i.timestamp === timestamp);
                break;
            case 'prescription':
                item = this.healthWalletData.prescriptions.find(i => i.timestamp === timestamp);
                break;
            case 'invoice':
                item = this.healthWalletData.invoices.find(i => i.timestamp === timestamp);
                break;
        }
        
        if (item) {
            item.notes = notes;
            item.lastUpdated = new Date().toISOString();
            this.saveHealthWallet();
            
            if (window.voiceManager) {
                window.voiceManager.speak('Notes saved successfully');
            }
            
            alert('Notes saved successfully!');
            closeModal();
            
            // Refresh health wallet if it's open
            if (document.getElementById('wallet-content')) {
                this.switchWalletTab(itemType === 'analysis' ? 'analyses' : itemType + 's');
            }
        }
    }
    
    viewInvoiceDetails(timestamp) {
        const invoice = this.healthWalletData.invoices.find(item => item.timestamp === timestamp);
        if (!invoice) return;
        
        const content = `
            <div class="invoice-details">
                <div class="invoice-header">
                    <h3>📄 Invoice Details</h3>
                    <p>Processed on ${new Date(invoice.timestamp).toLocaleString()}</p>
                </div>
                
                <div class="invoice-content">
                    <div class="invoice-basic-info">
                        <div class="info-row">
                            <span class="info-label">Provider:</span>
                            <span class="info-value">${invoice.provider || 'Not specified'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Amount:</span>
                            <span class="info-value">₹${invoice.amount || '0'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date of Service:</span>
                            <span class="info-value">${invoice.serviceDate || 'Not specified'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Invoice Number:</span>
                            <span class="info-value">${invoice.invoiceNumber || 'Not specified'}</span>
                        </div>
                    </div>
                    
                    ${invoice.services ? `
                        <div class="services-section">
                            <h4>Services/Items</h4>
                            <div class="services-list">
                                ${invoice.services.map(service => `
                                    <div class="service-item">
                                        <span class="service-name">${service.name}</span>
                                        <span class="service-amount">₹${service.amount}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${invoice.extractedText ? `
                        <div class="ocr-section">
                            <h4>Extracted Text (OCR)</h4>
                            <div class="extracted-text">
                                ${invoice.extractedText}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${invoice.notes ? `
                        <div class="notes-section">
                            <h4>Your Notes</h4>
                            <p class="invoice-notes">${invoice.notes}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="invoice-actions">
                    <button class="btn btn-primary" onclick="patientManager.editInvoiceData('${invoice.timestamp}')">
                        Edit Details
                    </button>
                    <button class="btn btn-secondary" onclick="patientManager.saveNotes('invoice', '${invoice.timestamp}')">
                        Add Notes
                    </button>
                    <button class="btn btn-outline" onclick="closeModal()">Close</button>
                </div>
            </div>
        `;
        
        showModal('Invoice Details', content);
    }
    
    // NEW FUNCTION: Edit Invoice Data
    editInvoiceData(timestamp) {
        const invoice = this.healthWalletData.invoices.find(item => item.timestamp === timestamp);
        if (!invoice) return;
        
        const content = `
            <div class="invoice-editor">
                <div class="editor-header">
                    <h3>✏️ Edit Invoice Data</h3>
                    <p>Update and correct invoice information</p>
                </div>
                
                <div class="editor-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Healthcare Provider</label>
                            <input type="text" id="edit-provider" class="form-input" 
                                   value="${invoice.provider || ''}" placeholder="Hospital/Clinic name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Total Amount (₹)</label>
                            <input type="number" id="edit-amount" class="form-input" 
                                   value="${invoice.amount || ''}" placeholder="0.00" step="0.01">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Service Date</label>
                            <input type="date" id="edit-service-date" class="form-input" 
                                   value="${invoice.serviceDate || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Invoice Number</label>
                            <input type="text" id="edit-invoice-number" class="form-input" 
                                   value="${invoice.invoiceNumber || ''}" placeholder="INV-001">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Payment Status</label>
                        <select id="edit-status" class="form-select">
                            <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
                            <option value="pending" ${invoice.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="partially-paid" ${invoice.status === 'partially-paid' ? 'selected' : ''}>Partially Paid</option>
                            <option value="cancelled" ${invoice.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    
                    <div class="services-editor">
                        <h4>Services/Items</h4>
                        <div id="services-container">
                            ${invoice.services ? invoice.services.map((service, index) => `
                                <div class="service-row" data-index="${index}">
                                    <input type="text" class="form-input service-name" 
                                           value="${service.name}" placeholder="Service name">
                                    <input type="number" class="form-input service-amount" 
                                           value="${service.amount}" placeholder="Amount" step="0.01">
                                    <button class="btn btn-danger btn-small" onclick="patientManager.removeService(${index})">
                                        ❌ Remove
                                    </button>
                                </div>
                            `).join('') : ''}
                        </div>
                        <button class="btn btn-outline btn-small" onclick="patientManager.addServiceRow()">
                            ➕ Add Service
                        </button>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Additional Notes</label>
                        <textarea id="edit-description" class="form-input" rows="3" 
                                  placeholder="Any additional information about this invoice...">${invoice.description || ''}</textarea>
                    </div>
                </div>
                
                <div class="editor-actions">
                    <button class="btn btn-primary" onclick="patientManager.saveInvoiceEdits('${timestamp}')">
                        Save Changes
                    </button>
                    <button class="btn btn-secondary" onclick="patientManager.viewInvoiceDetails('${timestamp}')">
                        Cancel
                    </button>
                    <button class="btn btn-danger" onclick="patientManager.deleteInvoice('${timestamp}')">
                        Delete Invoice
                    </button>
                </div>
            </div>
        `;
        
        showModal('Edit Invoice', content);
    }
    
    addServiceRow() {
        const container = document.getElementById('services-container');
        if (!container) return;
        
        const index = container.children.length;
        const serviceRow = document.createElement('div');
        serviceRow.className = 'service-row';
        serviceRow.setAttribute('data-index', index);
        serviceRow.innerHTML = `
            <input type="text" class="form-input service-name" 
                   value="" placeholder="Service name">
            <input type="number" class="form-input service-amount" 
                   value="" placeholder="Amount" step="0.01">
            <button class="btn btn-danger btn-small" onclick="patientManager.removeService(${index})">
                ❌ Remove
            </button>
        `;
        
        container.appendChild(serviceRow);
    }
    
    removeService(index) {
        const serviceRow = document.querySelector(`[data-index="${index}"]`);
        if (serviceRow) {
            serviceRow.remove();
            // Re-index remaining rows
            const rows = document.querySelectorAll('.service-row');
            rows.forEach((row, newIndex) => {
                row.setAttribute('data-index', newIndex);
                const removeBtn = row.querySelector('.btn-danger');
                if (removeBtn) {
                    removeBtn.setAttribute('onclick', `patientManager.removeService(${newIndex})`);
                }
            });
        }
    }
    
    saveInvoiceEdits(timestamp) {
        const invoice = this.healthWalletData.invoices.find(item => item.timestamp === timestamp);
        if (!invoice) return;
        
        // Get form values
        const provider = document.getElementById('edit-provider')?.value || '';
        const amount = document.getElementById('edit-amount')?.value || '';
        const serviceDate = document.getElementById('edit-service-date')?.value || '';
        const invoiceNumber = document.getElementById('edit-invoice-number')?.value || '';
        const status = document.getElementById('edit-status')?.value || '';
        const description = document.getElementById('edit-description')?.value || '';
        
        // Get services
        const serviceRows = document.querySelectorAll('.service-row');
        const services = [];
        serviceRows.forEach(row => {
            const name = row.querySelector('.service-name')?.value;
            const serviceAmount = row.querySelector('.service-amount')?.value;
            if (name && serviceAmount) {
                services.push({ name, amount: parseFloat(serviceAmount) });
            }
        });
        
        // Update invoice
        invoice.provider = provider;
        invoice.amount = parseFloat(amount) || 0;
        invoice.serviceDate = serviceDate;
        invoice.invoiceNumber = invoiceNumber;
        invoice.status = status;
        invoice.description = description;
        invoice.services = services;
        invoice.lastEdited = new Date().toISOString();
        
        this.saveHealthWallet();
        
        if (window.voiceManager) {
            window.voiceManager.speak('Invoice data updated successfully');
        }
        
        alert('Invoice updated successfully!');
        this.viewInvoiceDetails(timestamp);
    }
    
    deleteInvoice(timestamp) {
        if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
            this.healthWalletData.invoices = this.healthWalletData.invoices.filter(
                item => item.timestamp !== timestamp
            );
            this.saveHealthWallet();
            
            if (window.voiceManager) {
                window.voiceManager.speak('Invoice deleted successfully');
            }
            
            alert('Invoice deleted successfully!');
            closeModal();
            
            // Refresh health wallet
            if (document.getElementById('wallet-content')) {
                this.switchWalletTab('invoices');
            }
        }
    }
    
    // NEW FUNCTION: Process Invoice with Voice
    processInvoiceWithVoice(file) {
        if (!file) return;
        
        const content = `
            <div class="invoice-processor">
                <div class="processor-header">
                    <h3>🔄 Processing Invoice</h3>
                    <p>Using OCR and voice confirmation to extract data</p>
                </div>
                
                <div class="processing-steps">
                    <div class="step active" id="step-upload">
                        <div class="step-icon">📄</div>
                        <div class="step-text">Uploading file...</div>
                    </div>
                    <div class="step" id="step-ocr">
                        <div class="step-icon">👁️</div>
                        <div class="step-text">OCR text extraction</div>
                    </div>
                    <div class="step" id="step-analysis">
                        <div class="step-icon">🧠</div>
                        <div class="step-text">AI data analysis</div>
                    </div>
                    <div class="step" id="step-voice">
                        <div class="step-icon">🎤</div>
                        <div class="step-text">Voice confirmation</div>
                    </div>
                </div>
                
                <div class="processing-content" id="processing-content">
                    <div class="file-info">
                        <p><strong>File:</strong> ${file.name}</p>
                        <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p><strong>Type:</strong> ${file.type}</p>
                    </div>
                    <div class="processing-animation">
                        <div class="spinner"></div>
                        <p>Analyzing invoice content...</p>
                    </div>
                </div>
                
                <div class="processor-actions" style="display: none;" id="processor-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </div>
        `;
        
        showModal('Process Invoice', content);
        
        // Start processing simulation
        this.simulateInvoiceProcessing(file);
    }
    
    simulateInvoiceProcessing(file) {
        // Step 1: Upload complete
        setTimeout(() => {
            document.getElementById('step-upload').classList.remove('active');
            document.getElementById('step-upload').classList.add('completed');
            document.getElementById('step-ocr').classList.add('active');
        }, 1000);
        
        // Step 2: OCR processing
        setTimeout(() => {
            document.getElementById('step-ocr').classList.remove('active');
            document.getElementById('step-ocr').classList.add('completed');
            document.getElementById('step-analysis').classList.add('active');
        }, 2500);
        
        // Step 3: AI Analysis
        setTimeout(() => {
            document.getElementById('step-analysis').classList.remove('active');
            document.getElementById('step-analysis').classList.add('completed');
            document.getElementById('step-voice').classList.add('active');
            
            // Generate mock extracted data
            const mockData = this.generateMockInvoiceData(file.name);
            this.showVoiceConfirmation(mockData);
        }, 4000);
    }
    
    generateMockInvoiceData(filename) {
        // Generate realistic mock data based on filename or random
        const providers = ['Apollo Hospital', 'Max Healthcare', 'Fortis Hospital', 'AIIMS', 'Manipal Hospital'];
        const services = [
            { name: 'Consultation Fee', amount: 500 },
            { name: 'Blood Test', amount: 800 },
            { name: 'X-Ray', amount: 300 },
            { name: 'Medicine', amount: 450 },
            { name: 'ECG', amount: 250 }
        ];
        
        const selectedServices = services.slice(0, Math.floor(Math.random() * 3) + 2);
        const totalAmount = selectedServices.reduce((sum, service) => sum + service.amount, 0);
        
        return {
            provider: providers[Math.floor(Math.random() * providers.length)],
            amount: totalAmount,
            serviceDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            invoiceNumber: 'INV-' + Math.floor(Math.random() * 10000),
            services: selectedServices,
            extractedText: `MEDICAL INVOICE
Provider: ${providers[Math.floor(Math.random() * providers.length)]}
Date: ${new Date().toLocaleDateString()}
Services: ${selectedServices.map(s => s.name).join(', ')}
Total: ₹${totalAmount}
Status: Paid`,
            status: 'paid'
        };
    }
    
    showVoiceConfirmation(extractedData) {
        const content = `
            <div class="voice-confirmation">
                <div class="confirmation-header">
                    <h3>🎤 Voice Confirmation</h3>
                    <p>Please confirm the extracted information</p>
                </div>
                
                <div class="extracted-data">
                    <div class="data-item">
                        <label>Provider:</label>
                        <span id="confirm-provider">${extractedData.provider}</span>
                        <button class="edit-btn" onclick="patientManager.editField('provider', '${extractedData.provider}')">✏️</button>
                    </div>
                    
                    <div class="data-item">
                        <label>Amount:</label>
                        <span id="confirm-amount">₹${extractedData.amount}</span>
                        <button class="edit-btn" onclick="patientManager.editField('amount', '${extractedData.amount}')">✏️</button>
                    </div>
                    
                    <div class="data-item">
                        <label>Date:</label>
                        <span id="confirm-date">${extractedData.serviceDate}</span>
                        <button class="edit-btn" onclick="patientManager.editField('serviceDate', '${extractedData.serviceDate}')">✏️</button>
                    </div>
                    
                    <div class="data-item">
                        <label>Invoice No:</label>
                        <span id="confirm-invoice-no">${extractedData.invoiceNumber}</span>
                        <button class="edit-btn" onclick="patientManager.editField('invoiceNumber', '${extractedData.invoiceNumber}')">✏️</button>
                    </div>
                </div>
                
                <div class="voice-commands">
                    <h4>Voice Commands</h4>
                    <div class="commands-list">
                        <div class="command-item">Say <strong>"Confirm all"</strong> - to accept all data</div>
                        <div class="command-item">Say <strong>"Change provider"</strong> - to edit provider name</div>
                        <div class="command-item">Say <strong>"Change amount"</strong> - to edit amount</div>
                        <div class="command-item">Say <strong>"Start over"</strong> - to re-process</div>
                    </div>
                </div>
                
                <div class="voice-controls">
                    <button class="btn btn-primary" id="voice-listen-btn" onclick="patientManager.startVoiceConfirmation(JSON.parse('${JSON.stringify(extractedData).replace(/'/g, "\\'")}'))">
                        🎤 Start Voice Confirmation
                    </button>
                    <div id="voice-status" class="voice-status" style="display: none;">
                        <p>Listening... Speak clearly</p>
                    </div>
                </div>
                
                <div class="manual-controls">
                    <button class="btn btn-success" onclick="patientManager.confirmInvoiceData(JSON.parse('${JSON.stringify(extractedData).replace(/'/g, "\\'")}'))">
                        ✅ Confirm & Save
                    </button>
                    <button class="btn btn-secondary" onclick="patientManager.editInvoiceManually(JSON.parse('${JSON.stringify(extractedData).replace(/'/g, "\\'")}'))">
                        ✏️ Edit Manually
                    </button>
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                </div>
            </div>
        `;
        
        document.getElementById('processing-content').innerHTML = content;
        
        // Voice announcement
        if (window.voiceManager) {
            setTimeout(() => {
                window.voiceManager.speak(`Invoice processed. Provider: ${extractedData.provider}, Amount: ${extractedData.amount} rupees. Say confirm all to save, or use voice commands to make changes.`);
            }, 500);
        }
    }
    
    startVoiceConfirmation(extractedData) {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice recognition not supported in this browser');
            return;
        }
        
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        const voiceBtn = document.getElementById('voice-listen-btn');
        const voiceStatus = document.getElementById('voice-status');
        
        voiceBtn.textContent = '⏹️ Stop Listening';
        voiceBtn.style.background = '#dc3545';
        voiceStatus.style.display = 'block';
        
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.processVoiceCommand(command, extractedData);
        };
        
        recognition.onerror = () => {
            voiceStatus.innerHTML = '<p style="color: red;">Voice recognition error. Please try again.</p>';
        };
        
        recognition.onend = () => {
            voiceBtn.textContent = '🎤 Start Voice Confirmation';
            voiceBtn.style.background = '';
            voiceStatus.style.display = 'none';
        };
        
        recognition.start();
        
        voiceBtn.onclick = () => {
            recognition.stop();
        };
    }
    
    processVoiceCommand(command, extractedData) {
        if (window.voiceManager) {
            if (command.includes('confirm all') || command.includes('confirm everything')) {
                window.voiceManager.speak('Confirming all data and saving to health wallet');
                this.confirmInvoiceData(extractedData);
            } else if (command.includes('change provider') || command.includes('edit provider')) {
                window.voiceManager.speak('What is the correct provider name?');
                this.voiceEditField('provider', extractedData);
            } else if (command.includes('change amount') || command.includes('edit amount')) {
                window.voiceManager.speak('What is the correct amount?');
                this.voiceEditField('amount', extractedData);
            } else if (command.includes('start over') || command.includes('reprocess')) {
                window.voiceManager.speak('Starting over with invoice processing');
                closeModal();
            } else {
                window.voiceManager.speak('Command not recognized. Please try again or use manual controls.');
            }
        }
    }
    
    voiceEditField(fieldName, extractedData) {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice recognition not supported');
            return;
        }
        
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
            const newValue = event.results[0][0].transcript;
            
            if (fieldName === 'amount') {
                // Try to extract numeric value from speech
                const numericValue = newValue.match(/\d+/g)?.join('') || newValue;
                extractedData[fieldName] = parseFloat(numericValue) || extractedData[fieldName];
                document.getElementById('confirm-amount').textContent = `₹${extractedData[fieldName]}`;
            } else {
                extractedData[fieldName] = newValue;
                document.getElementById(`confirm-${fieldName}`).textContent = newValue;
            }
            
            if (window.voiceManager) {
                window.voiceManager.speak(`Updated ${fieldName} to ${newValue}. Say confirm all to save.`);
            }
        };
        
        recognition.start();
    }
    
    editField(fieldName, currentValue) {
        const newValue = prompt(`Enter new ${fieldName}:`, currentValue);
        if (newValue !== null && newValue !== currentValue) {
            document.getElementById(`confirm-${fieldName}`).textContent = 
                fieldName === 'amount' ? `₹${newValue}` : newValue;
                
            // Update the data object (this would need to be handled properly in a real app)
            if (window.voiceManager) {
                window.voiceManager.speak(`Updated ${fieldName}`);
            }
        }
    }
    
    editInvoiceManually(extractedData) {
        // Close current modal and open edit form
        closeModal();
        
        // Create temporary invoice entry for editing
        const tempTimestamp = new Date().toISOString();
        const tempInvoice = {
            ...extractedData,
            timestamp: tempTimestamp,
            type: 'invoice'
        };
        
        // Add to wallet temporarily
        this.healthWalletData.invoices.unshift(tempInvoice);
        
        // Open edit form
        setTimeout(() => {
            this.editInvoiceData(tempTimestamp);
        }, 100);
    }
    
    confirmInvoiceData(extractedData) {
        // Create final invoice object
        const invoice = {
            type: 'invoice',
            timestamp: new Date().toISOString(),
            provider: extractedData.provider,
            amount: extractedData.amount,
            serviceDate: extractedData.serviceDate,
            invoiceNumber: extractedData.invoiceNumber,
            services: extractedData.services || [],
            extractedText: extractedData.extractedText,
            status: extractedData.status || 'processed',
            processingMethod: 'OCR + Voice Confirmation'
        };
        
        // Add to health wallet
        this.addToHealthWallet(invoice);
        
        // Show success message
        const successContent = `
            <div class="invoice-success">
                <div class="success-icon">✅</div>
                <h3>Invoice Saved Successfully!</h3>
                <div class="success-details">
                    <p><strong>Provider:</strong> ${invoice.provider}</p>
                    <p><strong>Amount:</strong> ₹${invoice.amount}</p>
                    <p><strong>Date:</strong> ${invoice.serviceDate}</p>
                    <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                </div>
                <div class="success-actions">
                    <button class="btn btn-primary" onclick="patientManager.showHealthWallet()">
                        View in Health Wallet
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        Done
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('processing-content').innerHTML = successContent;
        
        if (window.voiceManager) {
            window.voiceManager.speak(`Invoice saved successfully to your health wallet. Amount ${invoice.amount} rupees from ${invoice.provider}.`);
        }
    }
    
    handleInvoiceUpload(file) {
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
        
        // Close current modal and start processing
        closeModal();
        
        // Start invoice processing with voice
        setTimeout(() => {
            this.processInvoiceWithVoice(file);
        }, 100);
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
                    <div class="feature-icon">👁️</div>
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
            
            <div class="upload-instructions">
                <h4>How it works:</h4>
                <ol>
                    <li>Upload your medical invoice (image or PDF)</li>
                    <li>Our OCR system extracts text automatically</li>
                    <li>AI analyzes and structures the data</li>
                    <li>Confirm details using voice commands</li>
                    <li>Invoice is saved to your Health Wallet</li>
                </ol>
            </div>
        </div>
    `;
    
    showModal('Upload Invoice', content);
}

function readResultsAloud() {
    if (!window.voiceManager) {
        alert('Voice feature not available');
        return;
    }
    
    const analysisResults = document.getElementById('analysis-results');
    if (!analysisResults || analysisResults.style.display === 'none') {
        window.voiceManager.speak('No analysis results to read');
        return;
    }
    
    // Get analysis text content
    const urgencyBadge = document.getElementById('urgency-badge');
    const conditionList = document.getElementById('condition-list');
    const recommendationList = document.getElementById('recommendation-list');
    
    let textToRead = 'Analysis results: ';
    
    if (urgencyBadge) {
        textToRead += `Urgency level is ${urgencyBadge.textContent}. `;
    }
    
    if (conditionList) {
        const conditions = conditionList.querySelectorAll('.condition-name');
        if (conditions.length > 0) {
            textToRead += `Possible conditions include: `;
            conditions.forEach((condition, index) => {
                textToRead += condition.textContent;
                if (index < conditions.length - 1) textToRead += ', ';
            });
            textToRead += '. ';
        }
    }
    
    if (recommendationList) {
        const recommendations = recommendationList.querySelectorAll('.recommendation-text');
        if (recommendations.length > 0) {
            textToRead += 'Recommendations: ';
            recommendations.forEach((rec, index) => {
                textToRead += rec.textContent;
                if (index < recommendations.length - 1) textToRead += '. ';
            });
        }
    }
    
    window.voiceManager.speak(textToRead);
}

// Additional global functions for new features
function saveNotes(itemType, timestamp) {
    patientManager.saveNotes(itemType, timestamp);
}

function editInvoiceData(timestamp) {
    patientManager.editInvoiceData(timestamp);
}

function processInvoiceWithVoice(file) {
    patientManager.processInvoiceWithVoice(file);
}

// Helper functions for modal management
function showModal(title, content) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.style.display = 'flex';
    }
}
    
function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Language change handler
function changeLanguage(language) {
    patientManager.currentPatient.language = language;
    
    if (window.voiceManager) {
        const languages = {
            'en': 'Language changed to English',
            'hi': 'भाषा हिंदी में बदल गई',
            'ta': 'மொழி தமிழாக மாற்றப்பட்டது',
            'te': 'భాష తెలుగులోకి మార్చబడింది'
        };
        
        window.voiceManager.speak(languages[language] || languages['en']);
    }
    
    // Here you would typically update UI text based on selected language
    console.log('Language changed to:', language);
}

// Export patient manager for use in other modules
window.patientManager = patientManager;