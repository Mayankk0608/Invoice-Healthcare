
class DoctorManager {
    constructor() {
        this.currentDoctor = {
            id: 'dr_001',
            name: 'Dr. Sarah Johnson',
            specialization: 'General Medicine',
            license: 'MED12345',
            rating: 4.9,
            consultationFee: 500,
            languages: ['English', 'Hindi'],
            experience: 12
        };
        
        this.appointments = [];
        this.patients = new Map();
        this.aiAssistantActive = false;
        this.consultationInProgress = false;
        
        this.initializeDoctorFeatures();
        this.loadDoctorData();
    }
    
    initializeDoctorFeatures() {
        this.setupAppointmentManagement();
        
        this.setupAIAssistant();
        
        this.loadPracticeAnalytics();
        
        this.setupConsultationTools();
    }
    
    // Replace the constructor with API call
    async loadDoctorProfile(doctorId) {
        try {
            const token = localStorage.getItem('sessionToken');
            const response = await fetch(`${app.apiEndpoint}/doctors/${doctorId}.json?auth=${token}`);
            if (response.ok) {
                this.currentDoctor = await response.json();
            } else {
                // Fallback to mock data
                console.warn('Using mock doctor data');
            }
        } catch (error) {
            console.error('Failed to load doctor profile:', error);
        }
    }

    // Replace loadDoctorData method
    async loadDoctorData() {
        try {
            const token = localStorage.getItem('sessionToken');
            const response = await fetch(`${app.apiEndpoint}/doctors/${this.currentDoctor.id}/appointments.json?auth=${token}`);
            
            if (response.ok) {
                const data = await response.json();
                this.appointments = data ? Object.values(data) : this.generateMockAppointments();
            } else {
                this.appointments = this.generateMockAppointments();
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.appointments = this.generateMockAppointments();
        }
        
        this.refreshAppointmentTimeline();
    }

    // Add method to save appointments to Firebase
    async saveAppointments() {
        try {
            const token = localStorage.getItem('sessionToken');
            const response = await fetch(
                `${app.apiEndpoint}/doctors/${this.currentDoctor.id}/appointments.json?auth=${token}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(this.appointments)
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to save appointments');
            }
        } catch (error) {
            console.error('Error saving appointments:', error);
            // Fallback to localStorage
            localStorage.setItem('doctor_appointments_' + this.currentDoctor.id, JSON.stringify(this.appointments));
        }
    }
    
    generateMockAppointments() {
        const today = new Date();
        const appointments = [];
        
        for (let i = 0; i < 5; i++) {
            const appointmentDate = new Date(today);
            appointmentDate.setDate(today.getDate() + Math.floor(i / 3));
            
            appointments.push({
                id: 'apt_' + Date.now() + '_' + i,
                patientId: 'patient_' + (i + 1),
                patientName: ['Raj Sharma', 'Priya Patel', 'Ahmed Ali', 'Sunita Singh', 'Kumar Patel'][i],
                patientAge: [34, 45, 52, 28, 38][i],
                date: appointmentDate.toISOString().split('T')[0],
                time: ['09:00', '10:30', '14:00', '15:30', '16:00'][i],
                duration: 30,
                type: ['video', 'audio', 'in-person', 'video', 'audio'][i],
                symptoms: ['Fever, Headache', 'Diabetes Follow-up', 'Chest Pain', 'Skin Rash', 'Back Pain'][i],
                status: i === 0 ? 'active' : 'upcoming',
                priority: ['normal', 'high', 'urgent', 'normal', 'normal'][i],
                notes: 'Patient reports symptoms started 3 days ago',
                aiTriage: this.generateAITriage(['Fever, Headache', 'Diabetes Follow-up', 'Chest Pain', 'Skin Rash', 'Back Pain'][i])
            });
        }
        
        return appointments;
    }
    
    generateAITriage(symptoms) {
        const triageData = {
            'Fever, Headache': {
                urgency: 'moderate',
                possibleConditions: ['Viral Fever', 'Bacterial Infection', 'Migraine'],
                recommendations: ['Monitor temperature', 'Adequate rest', 'Hydration'],
                redFlags: ['High fever >102°F', 'Severe headache', 'Neck stiffness']
            },
            'Diabetes Follow-up': {
                urgency: 'routine',
                possibleConditions: ['Type 2 Diabetes', 'Metabolic Syndrome'],
                recommendations: ['HbA1c test', 'Blood pressure check', 'Foot examination'],
                redFlags: ['Uncontrolled glucose', 'Ketones in urine']
            },
            'Chest Pain': {
                urgency: 'high',
                possibleConditions: ['Angina', 'Muscle Strain', 'Acid Reflux'],
                recommendations: ['ECG', 'Cardiac enzymes', 'Immediate assessment'],
                redFlags: ['Radiating pain', 'Shortness of breath', 'Sweating']
            },
            'Skin Rash': {
                urgency: 'normal',
                possibleConditions: ['Allergic Reaction', 'Eczema', 'Contact Dermatitis'],
                recommendations: ['Avoid triggers', 'Topical treatment', 'Antihistamines'],
                redFlags: ['Difficulty breathing', 'Swelling', 'Fever with rash']
            },
            'Back Pain': {
                urgency: 'normal',
                possibleConditions: ['Muscle Strain', 'Disc Problem', 'Postural Issues'],
                recommendations: ['Rest', 'Anti-inflammatory', 'Physical therapy'],
                redFlags: ['Neurological symptoms', 'Bowel/bladder issues', 'Severe pain']
            }
        };
        
        return triageData[symptoms] || {
            urgency: 'normal',
            possibleConditions: ['General Assessment Needed'],
            recommendations: ['Comprehensive examination'],
            redFlags: ['Severe symptoms']
        };
    }
    
    setupAppointmentManagement() {
        this.refreshAppointmentTimeline();
        
        setInterval(() => {
            this.refreshAppointmentTimeline();
        }, 5 * 60 * 1000);
    }
    
    refreshAppointmentTimeline() {
        const timeline = document.querySelector('.appointment-timeline');
        if (!timeline) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.appointments.filter(apt => apt.date === today);
        
        timeline.innerHTML = todayAppointments.map(appointment => `
            <div class="appointment-slot ${appointment.status}" data-appointment-id="${appointment.id}">
                <div class="time-label ${appointment.priority}">${this.formatTime(appointment.time)}</div>
                <div class="appointment-card">
                    <div class="patient-info">
                        <h4>${appointment.patientName}</h4>
                        <p>${appointment.symptoms} | Age: ${appointment.patientAge}</p>
                        <div class="appointment-meta">
                            <span class="appointment-type">${appointment.type}</span>
                            <span class="urgency-indicator ${appointment.aiTriage.urgency}">${appointment.aiTriage.urgency}</span>
                        </div>
                    </div>
                    <div class="appointment-actions">
                        ${appointment.status === 'active' ? 
                            `<button class="btn btn-small btn-primary" onclick="doctorManager.startConsultation('${appointment.id}')">Start Call</button>` :
                            `<button class="btn btn-small btn-outline" disabled>Scheduled</button>`
                        }
                        <button class="btn btn-small btn-outline" onclick="doctorManager.viewPatientDossier('${appointment.patientId}')">View Dossier</button>
                        <button class="btn btn-small btn-secondary" onclick="doctorManager.showAppointmentDetails('${appointment.id}')">Details</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.enhanceAppointmentCards();
    }
    
    enhanceAppointmentCards() {
        const appointmentCards = document.querySelectorAll('.appointment-card');
        appointmentCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateX(5px)';
                card.style.boxShadow = '0 8px 25px rgba(30, 58, 138, 0.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateX(0)';
                card.style.boxShadow = 'none';
            });
        });
    }
    
    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }
    
    startConsultation(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return;
        
        this.consultationInProgress = true;
        this.currentConsultation = appointment;
        
        appointment.status = 'in-progress';
        appointment.startTime = new Date().toISOString();
        
        const content = `
            <div class="consultation-interface">
                <div class="consultation-header">
                    <div class="patient-info">
                        <h3>📹 Consultation: ${appointment.patientName}</h3>
                        <p>${appointment.symptoms} | ${appointment.type} call | ${this.formatTime(appointment.time)}</p>
                    </div>
                    <div class="consultation-timer" id="consultation-timer">00:00</div>
                </div>
                
                <div class="consultation-body">
                    <div class="video-section">
                        <div class="main-video">
                            <div class="video-placeholder patient-video">
                                <div class="video-avatar">👤</div>
                                <p>${appointment.patientName}</p>
                                <div class="connection-status">🟢 Connected</div>
                            </div>
                        </div>
                        
                        <div class="doctor-video">
                            <div class="video-placeholder">
                                <div class="video-avatar">👨‍⚕️</div>
                                <p>You</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="consultation-sidebar">
                        <div class="ai-assistant-panel ${this.aiAssistantActive ? 'active' : ''}">
                            <div class="panel-header">
                                <h4>🧠 AI Assistant</h4>
                                <button class="toggle-btn" onclick="doctorManager.toggleAIAssistant()">
                                    ${this.aiAssistantActive ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                            
                            <div class="ai-suggestions" id="ai-suggestions">
                                <div class="suggestion-card">
                                    <h5>🔍 Suggested Questions</h5>
                                    <ul>
                                        ${appointment.aiTriage.recommendations.map(rec => 
                                            `<li>Ask about: ${rec}</li>`
                                        ).join('')}
                                    </ul>
                                </div>
                                
                                <div class="suggestion-card warning">
                                    <h5>⚠️ Red Flags to Monitor</h5>
                                    <ul>
                                        ${appointment.aiTriage.redFlags.map(flag => 
                                            `<li>${flag}</li>`
                                        ).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="consultation-notes">
                            <h4>📝 Consultation Notes</h4>
                            <textarea id="consultation-notes" placeholder="Type your notes here..." rows="8"></textarea>
                            <button class="btn btn-outline btn-small" onclick="doctorManager.saveNotes()">Save Notes</button>
                        </div>
                    </div>
                </div>
                
                <div class="consultation-controls">
                    <button class="control-btn mute-btn" onclick="doctorManager.toggleMute()">
                        🎤 Mute
                    </button>
                    <button class="control-btn video-btn" onclick="doctorManager.toggleVideo()">
                        📹 Video
                    </button>
                    <button class="control-btn screen-btn" onclick="doctorManager.shareScreen()">
                        📺 Share Screen
                    </button>
                    <button class="control-btn prescription-btn" onclick="doctorManager.showPrescriptionPad()">
                        💊 Prescribe
                    </button>
                    <button class="control-btn end-btn" onclick="doctorManager.endConsultation()">
                        📞 End Call
                    </button>
                </div>
            </div>
        `;
        
        showModal('Video Consultation', content);
        
        this.startConsultationTimer();
        
        if (window.voiceManager) {
            window.voiceManager.speak(`Starting consultation with ${appointment.patientName}`);
        }
    }
    
    startConsultationTimer() {
        let seconds = 0;
        this.consultationTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const timerElement = document.getElementById('consultation-timer');
            if (timerElement) {
                timerElement.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    toggleAIAssistant() {
        this.aiAssistantActive = !this.aiAssistantActive;
        
        const panel = document.querySelector('.ai-assistant-panel');
        const toggleBtn = document.querySelector('.ai-assistant-panel .toggle-btn');
        
        if (panel) {
            panel.classList.toggle('active');
        }
        
        if (toggleBtn) {
            toggleBtn.textContent = this.aiAssistantActive ? 'Disable' : 'Enable';
        }
        
        if (this.aiAssistantActive && window.voiceManager) {
            window.voiceManager.speak('AI assistant activated. I will provide real-time suggestions during the consultation.');
        }
    }
    
    toggleMute() {
        const muteBtn = document.querySelector('.mute-btn');
        if (muteBtn) {
            muteBtn.classList.toggle('active');
            muteBtn.innerHTML = muteBtn.classList.contains('active') ? '🔇 Unmute' : '🎤 Mute';
        }
    }
    
    toggleVideo() {
        const videoBtn = document.querySelector('.video-btn');
        if (videoBtn) {
            videoBtn.classList.toggle('active');
            videoBtn.innerHTML = videoBtn.classList.contains('active') ? '📹 Enable Video' : '🚫 Disable Video';
        }
    }
    
    shareScreen() {
        if (window.voiceManager) {
            window.voiceManager.speak('Screen sharing initiated');
        }
        console.log('Screen sharing started');
    }
    
    showPrescriptionPad() {
        const content = `
            <div class="prescription-pad">
                <div class="prescription-header">
                    <h3>💊 Digital Prescription</h3>
                    <div class="doctor-details">
                        <p><strong>Dr. ${this.currentDoctor.name}</strong></p>
                        <p>${this.currentDoctor.specialization} | License: ${this.currentDoctor.license}</p>
                    </div>
                </div>
                
                <div class="patient-details">
                    <p><strong>Patient:</strong> ${this.currentConsultation.patientName}</p>
                    <p><strong>Age:</strong> ${this.currentConsultation.patientAge}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="prescription-body">
                    <div class="medication-section">
                        <h4>Medications</h4>
                        <div id="medications-list">
                            <!-- Medications will be added here -->
                        </div>
                        <button class="btn btn-outline btn-small" onclick="doctorManager.addMedication()">+ Add Medication</button>
                    </div>
                    
                    <div class="instructions-section">
                        <h4>Instructions</h4>
                        <textarea id="prescription-instructions" rows="4" placeholder="Additional instructions for the patient..."></textarea>
                    </div>
                    
                    <div class="follow-up-section">
                        <h4>Follow-up</h4>
                        <select id="follow-up-period" class="form-select">
                            <option value="">Select follow-up period</option>
                            <option value="1 week">1 Week</option>
                            <option value="2 weeks">2 Weeks</option>
                            <option value="1 month">1 Month</option>
                            <option value="3 months">3 Months</option>
                        </select>
                    </div>
                </div>
                
                <div class="prescription-actions">
                    <button class="btn btn-primary" onclick="doctorManager.savePrescription()">Save Prescription</button>
                    <button class="btn btn-secondary" onclick="doctorManager.sendPrescription()">Send to Patient</button>
                </div>
            </div>
        `;
        
        const prescriptionModal = document.createElement('div');
        prescriptionModal.className = 'modal-overlay prescription-modal';
        prescriptionModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Digital Prescription</h3>
                    <button class="modal-close" onclick="this.closest('.prescription-modal').remove()">×</button>
                </div>
                <div class="modal-body">${content}</div>
            </div>
        `;
        
        document.body.appendChild(prescriptionModal);
        prescriptionModal.style.display = 'flex';
        prescriptionModal.style.zIndex = '2001';
    }
    
    addMedication() {
        const medicationsList = document.getElementById('medications-list');
        if (!medicationsList) return;
        
        const medicationCount = medicationsList.children.length + 1;
        const medicationHTML = `
            <div class="medication-item">
                <div class="medication-row">
                    <input type="text" class="form-input" placeholder="Medication name" style="flex: 2;">
                    <input type="text" class="form-input" placeholder="Dosage" style="flex: 1;">
                    <input type="text" class="form-input" placeholder="Frequency" style="flex: 1;">
                    <button class="btn btn-danger btn-small" onclick="this.parentElement.parentElement.remove()">Remove</button>
                </div>
                <input type="text" class="form-input" placeholder="Instructions for this medication" style="margin-top: 0.5rem;">
            </div>
        `;
        
        medicationsList.insertAdjacentHTML('beforeend', medicationHTML);
    }
    
    savePrescription() {
        const medications = [];
        document.querySelectorAll('.medication-item').forEach(item => {
            const inputs = item.querySelectorAll('input');
            if (inputs[0].value) {
                medications.push({
                    name: inputs[0].value,
                    dosage: inputs[1].value,
                    frequency: inputs[2].value,
                    instructions: inputs[3].value
                });
            }
        });
        
        const prescription = {
            id: 'rx_' + Date.now(),
            patientId: this.currentConsultation.patientId,
            patientName: this.currentConsultation.patientName,
            doctorId: this.currentDoctor.id,
            doctorName: this.currentDoctor.name,
            medications,
            instructions: document.getElementById('prescription-instructions')?.value || '',
            followUp: document.getElementById('follow-up-period')?.value || '',
            date: new Date().toISOString(),
            consultationId: this.currentConsultation.id
        };
        
        this.savePrescriptionToStorage(prescription);
        
        document.querySelector('.prescription-modal')?.remove();
        
        if (window.voiceManager) {
            window.voiceManager.speak('Prescription saved successfully');
        }
        
        this.showSuccessMessage('Prescription saved successfully!');
    }
    
    sendPrescription() {
        this.savePrescription();
        
        if (window.voiceManager) {
            window.voiceManager.speak('Prescription sent to patient');
        }
        
        this.showSuccessMessage('Prescription sent to patient!');
    }
    
    // Enhanced savePrescriptionToStorage method
    async savePrescriptionToStorage(prescription) {
        try {
            const token = localStorage.getItem('sessionToken');
            const response = await fetch(
                `${app.apiEndpoint}/prescriptions.json?auth=${token}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(prescription)
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to save prescription');
            }
            
            const data = await response.json();
            prescription.id = data.name; // Firebase returns the key as "name"
            
        } catch (error) {
            console.error('Error saving prescription:', error);
            // Fallback to localStorage
            const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
            prescriptions.push(prescription);
            localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
        }
    }
    
    saveNotes() {
        const notes = document.getElementById('consultation-notes')?.value;
        if (!notes) return;
        
        if (this.currentConsultation) {
            this.currentConsultation.notes = notes;
            this.currentConsultation.notesTimestamp = new Date().toISOString();
            
            localStorage.setItem('doctor_appointments_' + this.currentDoctor.id, JSON.stringify(this.appointments));
        }
        
        this.showSuccessMessage('Notes saved successfully!');
    }
    
    endConsultation() {
        if (this.consultationTimer) {
            clearInterval(this.consultationTimer);
        }
        
        if (this.currentConsultation) {
            this.currentConsultation.status = 'completed';
            this.currentConsultation.endTime = new Date().toISOString();
            
            const startTime = new Date(this.currentConsultation.startTime);
            const endTime = new Date();
            const duration = Math.round((endTime - startTime) / 60000); 
            this.currentConsultation.actualDuration = duration;
        }
        
        this.consultationInProgress = false;
        
        this.showConsultationSummary();
        
        closeModal();
        
        this.refreshAppointmentTimeline();
        
        if (window.voiceManager) {
            window.voiceManager.speak('Consultation ended successfully');
        }
    }
    
    showConsultationSummary() {
        const consultation = this.currentConsultation;
        const duration = consultation.actualDuration || 30;
        
        const content = `
            <div class="consultation-summary">
                <div class="summary-header">
                    <h3>📋 Consultation Summary</h3>
                    <p>Session completed successfully</p>
                </div>
                
                <div class="summary-details">
                    <div class="detail-item">
                        <strong>Patient:</strong> ${consultation.patientName}
                    </div>
                    <div class="detail-item">
                        <strong>Duration:</strong> ${duration} minutes
                    </div>
                    <div class="detail-item">
                        <strong>Type:</strong> ${consultation.type} consultation
                    </div>
                    <div class="detail-item">
                        <strong>Symptoms:</strong> ${consultation.symptoms}
                    </div>
                </div>
                
                <div class="summary-actions">
                    <button class="btn btn-primary" onclick="doctorManager.scheduleFollowUp()">Schedule Follow-up</button>
                    <button class="btn btn-secondary" onclick="doctorManager.sendSummaryToPatient()">Send Summary</button>
                    <button class="btn btn-outline" onclick="closeModal()">Close</button>
                </div>
            </div>
        `;
        
        showModal('Consultation Summary', content);
    }
    
    viewPatientDossier(patientId) {
        const patientData = {
            id: patientId,
            name: this.appointments.find(apt => apt.patientId === patientId)?.patientName || 'Unknown Patient',
            age: this.appointments.find(apt => apt.patientId === patientId)?.patientAge || 0,
            gender: 'Male',
            bloodGroup: 'O+',
            allergies: ['Penicillin', 'Peanuts'],
            currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
            medicalHistory: ['Diabetes Type 2', 'Hypertension', 'Hyperlipidemia'],
            recentConsultations: [
                { date: '2024-01-15', diagnosis: 'Routine Check-up', doctor: 'Dr. Smith' },
                { date: '2024-01-01', diagnosis: 'Diabetes Follow-up', doctor: 'Dr. Johnson' }
            ],
            vitals: {
                bloodPressure: '140/90',
                heartRate: '78 bpm',
                temperature: '98.6°F',
                weight: '75 kg',
                height: '170 cm'
            },
            aiTriage: this.appointments.find(apt => apt.patientId === patientId)?.aiTriage
        };
        
        const content = `
            <div class="patient-dossier">
                <div class="dossier-header">
                    <div class="patient-basic-info">
                        <h3>👤 ${patientData.name}</h3>
                        <p>${patientData.age} years • ${patientData.gender} • Blood Group: ${patientData.bloodGroup}</p>
                    </div>
                    <div class="dossier-actions">
                        <button class="btn btn-outline btn-small" onclick="doctorManager.exportDossier('${patientId}')">📄 Export</button>
                        <button class="btn btn-secondary btn-small" onclick="doctorManager.addToDossier('${patientId}')">➕ Add Entry</button>
                    </div>
                </div>
                
                <div class="dossier-tabs">
                    <button class="tab-btn active" onclick="doctorManager.switchDossierTab('overview')">Overview</button>
                    <button class="tab-btn" onclick="doctorManager.switchDossierTab('history')">History</button>
                    <button class="tab-btn" onclick="doctorManager.switchDossierTab('medications')">Medications</button>
                    <button class="tab-btn" onclick="doctorManager.switchDossierTab('ai-insights')">AI Insights</button>
                </div>
                
                <div class="dossier-content" id="dossier-content">
                    <div class="overview-section">
                        <div class="vitals-card">
                            <h4>📊 Recent Vitals</h4>
                            <div class="vitals-grid">
                                <div class="vital-item">
                                    <span class="vital-label">Blood Pressure</span>
                                    <span class="vital-value">${patientData.vitals.bloodPressure}</span>
                                </div>
                                <div class="vital-item">
                                    <span class="vital-label">Heart Rate</span>
                                    <span class="vital-value">${patientData.vitals.heartRate}</span>
                                </div>
                                <div class="vital-item">
                                    <span class="vital-label">Temperature</span>
                                    <span class="vital-value">${patientData.vitals.temperature}</span>
                                </div>
                                <div class="vital-item">
                                    <span class="vital-label">Weight</span>
                                    <span class="vital-value">${patientData.vitals.weight}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="allergies-card">
                            <h4>⚠️ Allergies & Alerts</h4>
                            <div class="allergies-list">
                                ${patientData.allergies.map(allergy => `
                                    <span class="allergy-tag">${allergy}</span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="current-medications-card">
                            <h4>💊 Current Medications</h4>
                            <ul class="medications-list">
                                ${patientData.currentMedications.map(med => `
                                    <li>${med}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Patient Dossier', content);
    }
    
    switchDossierTab(tabName) {
        const tabButtons = document.querySelectorAll('.dossier-tabs .tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
                btn.classList.add('active');
            }
        });
        
        const content = document.getElementById('dossier-content');
        if (content) {
            switch (tabName) {
                case 'overview':
                    break;
                case 'history':
                    content.innerHTML = this.renderHistoryTab();
                    break;
                case 'medications':
                    content.innerHTML = this.renderMedicationsTab();
                    break;
                case 'ai-insights':
                    content.innerHTML = this.renderAIInsightsTab();
                    break;
            }
        }
    }
    
    renderHistoryTab() {
        return `
            <div class="history-section">
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h5>Routine Check-up</h5>
                            <p>January 15, 2024 • Dr. Smith</p>
                            <p>Patient reported feeling well. Vitals stable. Continue current medications.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h5>Diabetes Follow-up</h5>
                            <p>January 1, 2024 • Dr. Johnson</p>
                            <p>HbA1c: 7.2%. Blood sugar control improving. Adjusted Metformin dosage.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h5>Hypertension Diagnosis</h5>
                            <p>December 10, 2023 • Dr. Johnson</p>
                            <p>Blood pressure consistently elevated. Started on Lisinopril 10mg daily.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderMedicationsTab() {
        return `
            <div class="medications-section">
                <div class="current-meds">
                    <h4>Current Medications</h4>
                    <div class="med-list">
                        <div class="med-item">
                            <div class="med-info">
                                <h5>Metformin 500mg</h5>
                                <p>Twice daily with meals</p>
                            </div>
                            <div class="med-actions">
                                <span class="med-status active">Active</span>
                                <button class="btn btn-outline btn-small">Edit</button>
                            </div>
                        </div>
                        <div class="med-item">
                            <div class="med-info">
                                <h5>Lisinopril 10mg</h5>
                                <p>Once daily in morning</p>
                            </div>
                            <div class="med-actions">
                                <span class="med-status active">Active</span>
                                <button class="btn btn-outline btn-small">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="medication-history">
                    <h4>Medication History</h4>
                    <div class="med-history-list">
                        <div class="history-item">
                            <span class="med-name">Atorvastatin 20mg</span>
                            <span class="med-period">Dec 2023 - Jan 2024</span>
                            <span class="med-reason">Discontinued due to muscle pain</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAIInsightsTab() {
        return `
            <div class="ai-insights-section">
                <div class="insight-card">
                    <h4>🧠 AI Risk Assessment</h4>
                    <div class="risk-indicators">
                        <div class="risk-item high">
                            <span class="risk-label">Cardiovascular Risk</span>
                            <span class="risk-value">High</span>
                        </div>
                        <div class="risk-item medium">
                            <span class="risk-label">Diabetes Complications</span>
                            <span class="risk-value">Medium</span>
                        </div>
                        <div class="risk-item low">
                            <span class="risk-label">Medication Adherence</span>
                            <span class="risk-value">Good</span>
                        </div>
                    </div>
                </div>
                
                <div class="insight-card">
                    <h4>💡 AI Recommendations</h4>
                    <ul class="recommendation-list">
                        <li>Consider adding statin therapy for cardiovascular protection</li>
                        <li>Recommend regular HbA1c monitoring every 3 months</li>
                        <li>Lifestyle counseling for diet and exercise</li>
                        <li>Eye examination due for diabetic retinopathy screening</li>
                    </ul>
                </div>
                
                <div class="insight-card">
                    <h4>📈 Trend Analysis</h4>
                    <div class="trend-item">
                        <span class="trend-label">Blood Pressure</span>
                        <span class="trend-direction improving">Improving ↓</span>
                    </div>
                    <div class="trend-item">
                        <span class="trend-label">HbA1c</span>
                        <span class="trend-direction stable">Stable →</span>
                    </div>
                    <div class="trend-item">
                        <span class="trend-label">Weight</span>
                        <span class="trend-direction worsening">Increasing ↑</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    showAppointmentDetails(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return;
        
        const content = `
            <div class="appointment-details">
                <div class="detail-header">
                    <h3>📅 Appointment Details</h3>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Patient:</strong> ${appointment.patientName}
                    </div>
                    <div class="detail-item">
                        <strong>Date & Time:</strong> ${new Date(appointment.date).toLocaleDateString()} at ${this.formatTime(appointment.time)}
                    </div>
                    <div class="detail-item">
                        <strong>Type:</strong> ${appointment.type} consultation
                    </div>
                    <div class="detail-item">
                        <strong>Duration:</strong> ${appointment.duration} minutes
                    </div>
                    <div class="detail-item">
                        <strong>Symptoms:</strong> ${appointment.symptoms}
                    </div>
                    <div class="detail-item">
                        <strong>Priority:</strong> <span class="priority-badge ${appointment.priority}">${appointment.priority}</span>
                    </div>
                </div>
                
                <div class="ai-triage-preview">
                    <h4>🧠 AI Triage Summary</h4>
                    <p><strong>Urgency:</strong> <span class="urgency-badge ${appointment.aiTriage.urgency}">${appointment.aiTriage.urgency}</span></p>
                    <p><strong>Possible Conditions:</strong> ${appointment.aiTriage.possibleConditions.join(', ')}</p>
                </div>
                
                <div class="appointment-actions">
                    <button class="btn btn-primary" onclick="doctorManager.startConsultation('${appointment.id}')">Start Consultation</button>
                    <button class="btn btn-secondary" onclick="doctorManager.rescheduleAppointment('${appointment.id}')">Reschedule</button>
                    <button class="btn btn-outline" onclick="doctorManager.cancelAppointment('${appointment.id}')">Cancel</button>
                </div>
            </div>
        `;
        
        showModal('Appointment Details', content);
    }
    
    setupAIAssistant() {
        this.aiAssistantActive = false;
        
        this.drugDatabase = this.loadDrugDatabase();
        
        this.setupRealTimeSuggestions();
    }
    
    loadDrugDatabase() {
        return {
            'metformin': {
                interactions: ['alcohol', 'iodinated contrast'],
                warnings: ['Kidney disease', 'Heart failure'],
                sideEffects: ['Nausea', 'Diarrhea', 'Lactic acidosis (rare)']
            },
            'lisinopril': {
                interactions: ['potassium supplements', 'nsaids'],
                warnings: ['Pregnancy', 'Kidney disease', 'Angioedema history'],
                sideEffects: ['Dry cough', 'Hyperkalemia', 'Angioedema']
            },
            'atorvastatin': {
                interactions: ['grapefruit juice', 'clarithromycin', 'gemfibrozil'],
                warnings: ['Liver disease', 'Muscle disorders'],
                sideEffects: ['Muscle pain', 'Liver enzyme elevation', 'Memory problems']
            }
        };
    }
    
    checkDrugInteractions(medications) {
        const interactions = [];
        const warnings = [];
        
        medications.forEach(med => {
            const drugName = med.toLowerCase();
            if (this.drugDatabase[drugName]) {
                const drug = this.drugDatabase[drugName];
                
                medications.forEach(otherMed => {
                    if (otherMed !== med && drug.interactions.some(interaction => 
                        otherMed.toLowerCase().includes(interaction))) {
                        interactions.push(`${med} interacts with ${otherMed}`);
                    }
                });
                
                warnings.push(...drug.warnings.map(warning => `${med}: ${warning}`));
            }
        });
        
        return { interactions, warnings };
    }
    
    setupRealTimeSuggestions() {
        this.suggestionEngine = {
            symptomSuggestions: {
                'chest pain': [
                    'Ask about radiation of pain',
                    'Check for shortness of breath',
                    'Assess cardiovascular risk factors',
                    'Consider ECG if appropriate'
                ],
                'headache': [
                    'Assess headache characteristics (location, quality, timing)',
                    'Check for neurological symptoms',
                    'Evaluate for red flag symptoms',
                    'Consider imaging if indicated'
                ],
                'fever': [
                    'Determine fever pattern and duration',
                    'Check for associated symptoms',
                    'Assess for signs of serious infection',
                    'Consider blood work if indicated'
                ]
            },
            
            diagnosisSupport: {
                'diabetes': [
                    'Check HbA1c and fasting glucose',
                    'Assess for complications (eyes, kidneys, feet)',
                    'Review medication adherence',
                    'Lifestyle counseling'
                ],
                'hypertension': [
                    'Confirm with multiple readings',
                    'Assess target organ damage',
                    'Check for secondary causes',
                    'Cardiovascular risk stratification'
                ]
            }
        };
    }
    
    loadPracticeAnalytics() {
        this.practiceStats = {
            monthlyPatients: 127,
            monthlyEarnings: 45680,
            averageRating: 4.9,
            averageConsultationTime: 23,
            completedConsultations: 1234,
            cancelledAppointments: 12,
            patientSatisfactionScore: 96,
            responseTime: '2 minutes'
        };
        
        this.updatePracticeStatsUI();
    }
    
    updatePracticeStatsUI() {
        const statsCards = document.querySelectorAll('.stat-card');
        if (statsCards.length > 0) {
            const stats = [
                { value: this.practiceStats.monthlyPatients, change: '+12%' },
                { value: `₹${this.practiceStats.monthlyEarnings.toLocaleString()}`, change: '+8%' },
                { value: this.practiceStats.averageRating, change: '→' },
                { value: `${this.practiceStats.averageConsultationTime} min`, change: '-2 min' }
            ];
            
            statsCards.forEach((card, index) => {
                if (stats[index]) {
                    const numberElement = card.querySelector('.stat-number');
                    const changeElement = card.querySelector('.stat-change');
                    
                    if (numberElement) {
                        this.animateNumber(numberElement, stats[index].value);
                    }
                    if (changeElement) {
                        changeElement.textContent = stats[index].change;
                    }
                }
            });
        }
    }
    
    animateNumber(element, finalValue) {
        const numericValue = parseInt(String(finalValue).replace(/[^\d]/g, ''));
        if (isNaN(numericValue)) return;
        
        let current = 0;
        const increment = numericValue / 50;
        const prefix = String(finalValue).match(/^[^\d]*/) || [''];
        const suffix = String(finalValue).match(/[^\d]*$/) || [''];
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            
            let displayValue = Math.floor(current).toLocaleString();
            element.textContent = prefix[0] + displayValue + suffix[0];
        }, 50);
    }
    
    setupConsultationTools() {
        this.consultationTools = {
            templates: this.loadConsultationTemplates(),
            shortcuts: this.setupKeyboardShortcuts(),
            voiceCommands: this.setupVoiceCommands()
        };
    }
    
    loadConsultationTemplates() {
        return {
            'routine_checkup': {
                name: 'Routine Check-up',
                template: `
CHIEF COMPLAINT: 
HISTORY OF PRESENT ILLNESS:
REVIEW OF SYSTEMS:
PHYSICAL EXAMINATION:
ASSESSMENT:
PLAN:
                `.trim()
            },
            'follow_up': {
                name: 'Follow-up Visit',
                template: `
INTERVAL HISTORY:
CURRENT MEDICATIONS:
COMPLIANCE:
PHYSICAL EXAMINATION:
ASSESSMENT:
PLAN:
                `.trim()
            },
            'new_patient': {
                name: 'New Patient',
                template: `
CHIEF COMPLAINT:
HISTORY OF PRESENT ILLNESS:
PAST MEDICAL HISTORY:
MEDICATIONS:
ALLERGIES:
SOCIAL HISTORY:
FAMILY HISTORY:
REVIEW OF SYSTEMS:
PHYSICAL EXAMINATION:
ASSESSMENT AND PLAN:
                `.trim()
            }
        };
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (!this.consultationInProgress) return;
            
            if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
                event.preventDefault();
                this.toggleMute();
            }
            
            if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
                event.preventDefault();
                this.toggleVideo();
            }
            
            if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                event.preventDefault();
                this.showPrescriptionPad();
            }
            
            if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
                event.preventDefault();
                const notesField = document.getElementById('consultation-notes');
                if (notesField) notesField.focus();
            }
        });
    }
    
    setupVoiceCommands() {
        document.addEventListener('voiceResult', (event) => {
            const { transcript } = event.detail;
            
            if (this.consultationInProgress) {
                this.processConsultationVoiceCommand(transcript.toLowerCase());
            }
        });
    }
    
    processConsultationVoiceCommand(command) {
        if (command.includes('save notes')) {
            this.saveNotes();
        } else if (command.includes('prescribe') || command.includes('prescription')) {
            this.showPrescriptionPad();
        } else if (command.includes('end consultation') || command.includes('end call')) {
            this.endConsultation();
        } else if (command.includes('mute')) {
            this.toggleMute();
        } else if (command.includes('ai assistant')) {
            this.toggleAIAssistant();
        }
    }
    
    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    scheduleFollowUp() {
        console.log('Scheduling follow-up appointment');
        closeModal();
    }
    
    sendSummaryToPatient() {
        console.log('Sending consultation summary to patient');
        this.showSuccessMessage('Summary sent to patient successfully!');
    }
    
    rescheduleAppointment(appointmentId) {
        console.log('Rescheduling appointment:', appointmentId);
        closeModal();
    }
    
    cancelAppointment(appointmentId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
            if (appointmentIndex > -1) {
                this.appointments[appointmentIndex].status = 'cancelled';
                this.refreshAppointmentTimeline();
                this.showSuccessMessage('Appointment cancelled successfully');
                closeModal();
            }
        }
    }
    
    exportDossier(patientId) {
        console.log('Exporting patient dossier:', patientId);
        this.showSuccessMessage('Patient dossier exported successfully!');
    }
    
    addToDossier(patientId) {
        console.log('Adding entry to patient dossier:', patientId);
    }
}

const doctorManager = new DoctorManager();

function startConsultation(appointmentId) {
    doctorManager.startConsultation(appointmentId);
}

function viewPatientDossier(patientId) {
    doctorManager.viewPatientDossier(patientId);
}

function showAppointmentDetails(appointmentId) {
    doctorManager.showAppointmentDetails(appointmentId);
}

window.doctorManager = doctorManager;