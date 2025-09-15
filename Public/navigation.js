// navigation.js - Page Navigation and Routing

class NavigationManager {
    constructor() {
        this.currentPage = 'landing-page';
        this.history = ['landing-page'];
        this.pageData = {};
        this.initializeNavigation();
    }
    
    initializeNavigation() {
        // Set up browser history handling
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.showPage(event.state.page, false);
            }
        });
        
        // Initialize with current page
        this.updateBrowserHistory(this.currentPage, true);
    }
    
    navigateTo(pageId, addToHistory = true) {
        if (!this.pageExists(pageId)) {
            console.error(`Page ${pageId} does not exist`);
            return false;
        }
        
        if (pageId === this.currentPage) {
            return true;
        }
        
        // Hide current page with animation
        this.hidePage(this.currentPage);
        
        // Show new page after animation
        setTimeout(() => {
            this.showPage(pageId, addToHistory);
        }, 300);
        
        return true;
    }
    
    showPage(pageId, addToHistory = true) {
        // Hide all pages
        const allPages = document.querySelectorAll('.page');
        allPages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.classList.add('active');
            
            // Trigger page load animations
            this.animatePageEntry(targetPage);
            
            // Update navigation state
            const previousPage = this.currentPage;
            this.currentPage = pageId;
            
            if (addToHistory) {
                this.history.push(pageId);
                this.updateBrowserHistory(pageId);
            }
            
            // Trigger page-specific initialization
            this.initializePage(pageId, previousPage);
            
            // Announce page change for voice accessibility
            if (typeof announcePageChange === 'function') {
                announcePageChange(pageId);
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            return true;
        }
        
        return false;
    }
    
    hidePage(pageId) {
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('page-exit');
            setTimeout(() => {
                page.classList.remove('page-exit');
            }, 300);
        }
    }
    
    animatePageEntry(page) {
        // Add entrance animation class
        page.classList.add('page-enter');
        
        // Animate child elements with stagger
        const animatedElements = page.querySelectorAll('.dashboard-card, .action-card, .feature-card');
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // Remove entrance animation class after animation
        setTimeout(() => {
            page.classList.remove('page-enter');
        }, 500);
    }
    
    initializePage(pageId, previousPage) {
        console.log(`Initializing page: ${pageId}`);
        
        switch (pageId) {
            case 'landing-page':
                this.initializeLandingPage();
                break;
            case 'patient-dashboard':
                this.initializePatientDashboard();
                break;
            case 'doctor-dashboard':
                this.initializeDoctorDashboard();
                break;
            case 'admin-dashboard':
                this.initializeAdminDashboard();
                break;
        }
        
        // Update active navigation indicators
        this.updateNavigationIndicators(pageId);
        
        // Trigger custom page load event
        document.dispatchEvent(new CustomEvent('pageChanged', {
            detail: { currentPage: pageId, previousPage }
        }));
    }
    
    initializeLandingPage() {
        // Animate hero elements
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-buttons');
        
        if (heroTitle) {
            setTimeout(() => heroTitle.classList.add('animate-fadeInUp'), 200);
        }
        if (heroSubtitle) {
            setTimeout(() => heroSubtitle.classList.add('animate-fadeInUp'), 400);
        }
        if (heroButtons) {
            setTimeout(() => heroButtons.classList.add('animate-fadeInUp'), 600);
        }
        
        // Animate floating cards
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-float');
            }, 800 + (index * 200));
        });
    }
    
    initializePatientDashboard() {
        // Initialize symptom checker
        this.resetSymptomChecker();
        
        // Set up voice recording button
        const voiceBtn = document.getElementById('voice-record-btn');
        if (voiceBtn && !voiceBtn.hasEventListener) {
            voiceBtn.addEventListener('click', toggleVoiceRecording);
            voiceBtn.hasEventListener = true;
        }
        
        // Initialize language selector
        const langSelect = document.getElementById('language-select');
        if (langSelect && !langSelect.hasEventListener) {
            langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
            langSelect.hasEventListener = true;
        }
    }
    
    initializeDoctorDashboard() {
        // Load today's appointments
        this.loadTodaysAppointments();
        
        // Initialize practice stats
        this.updatePracticeStats();
        
        // Set up appointment action buttons
        this.setupAppointmentButtons();
    }
    
    initializeAdminDashboard() {
        // Load system analytics
        this.loadSystemAnalytics();
        
        // Initialize user management table
        this.loadUserManagement();
        
        // Set up real-time monitoring
        this.setupRealTimeMonitoring();
        
        // Initialize map placeholder
        this.initializeHealthMap();
    }
    
    resetSymptomChecker() {
        const symptomText = document.getElementById('symptom-text');
        const analysisResults = document.getElementById('analysis-results');
        const voiceFeedback = document.getElementById('voice-feedback');
        
        if (symptomText) symptomText.value = '';
        if (analysisResults) analysisResults.style.display = 'none';
        if (voiceFeedback) {
            voiceFeedback.innerHTML = '<p>Voice recognition ready. Click the button and start speaking...</p>';
        }
    }
    
    loadTodaysAppointments() {
        // Simulate loading appointments from API
        const appointments = [
            {
                id: 1,
                time: '09:00 AM',
                patient: 'Raj Sharma',
                condition: 'Fever, Headache',
                age: 34,
                status: 'active'
            },
            {
                id: 2,
                time: '10:30 AM',
                patient: 'Priya Patel',
                condition: 'Diabetes Follow-up',
                age: 45,
                status: 'upcoming'
            },
            {
                id: 3,
                time: '02:00 PM',
                patient: 'Ahmed Ali',
                condition: 'Chest Pain',
                age: 52,
                status: 'upcoming'
            }
        ];
        
        // Update appointment timeline in UI
        console.log('Loaded appointments:', appointments);
    }
    
    updatePracticeStats() {
        // Animate stat numbers
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach((stat, index) => {
            setTimeout(() => {
                stat.classList.add('animate-fadeIn');
                this.animateNumber(stat, stat.textContent);
            }, index * 200);
        });
    }
    
    animateNumber(element, finalValue) {
        const isNumber = !isNaN(parseInt(finalValue));
        if (!isNumber) return;
        
        const finalNum = parseInt(finalValue.replace(/[^\d]/g, ''));
        const prefixMatch = finalValue.match(/[^\d]*/);
        const prefix = prefixMatch ? prefixMatch[0] : '';
        const suffixMatch = finalValue.match(/[^\d]*$/);
        const suffix = suffixMatch ? suffixMatch[0] : '';
        
        let current = 0;
        const increment = finalNum / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= finalNum) {
                current = finalNum;
                clearInterval(timer);
            }
            element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }, 40);
    }
    
    setupAppointmentButtons() {
        const startButtons = document.querySelectorAll('[onclick*="startConsultation"]');
        const dossierButtons = document.querySelectorAll('[onclick*="viewPatientDossier"]');
        
        startButtons.forEach(btn => {
            if (!btn.hasClickListener) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const patientId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
                    this.startConsultation(patientId);
                });
                btn.hasClickListener = true;
            }
        });
        
        dossierButtons.forEach(btn => {
            if (!btn.hasClickListener) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const patientId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
                    this.viewPatientDossier(patientId);
                });
                btn.hasClickListener = true;
            }
        });
    }
    
    startConsultation(patientId) {
        console.log('Starting consultation for patient:', patientId);
        // Here you would integrate with video call service
        showModal('Video Consultation', `
            <div class="consultation-interface">
                <div class="video-container">
                    <div class="video-placeholder">
                        📹 Video call would start here<br>
                        <small>Integration with WebRTC service required</small>
                    </div>
                </div>
                <div class="consultation-controls">
                    <button class="btn btn-danger">End Call</button>
                    <button class="btn btn-secondary">Mute</button>
                    <button class="btn btn-outline">Share Screen</button>
                </div>
            </div>
        `);
    }
    
    viewPatientDossier(patientId) {
        console.log('Viewing dossier for patient:', patientId);
        // Mock patient data
        const patientData = {
            name: 'Raj Sharma',
            age: 34,
            symptoms: 'Fever, Headache',
            history: ['Hypertension', 'Diabetes Type 2'],
            aiTriage: 'Moderate urgency - possible viral infection'
        };
        
        showModal('Patient Dossier', `
            <div class="patient-dossier">
                <div class="patient-header">
                    <h4>👤 ${patientData.name}, ${patientData.age} years</h4>
                    <p><strong>Current Symptoms:</strong> ${patientData.symptoms}</p>
                </div>
                <div class="ai-triage-summary">
                    <h4>🧠 AI Triage Summary</h4>
                    <p>${patientData.aiTriage}</p>
                </div>
                <div class="medical-history">
                    <h4>📋 Medical History</h4>
                    <ul>
                        ${patientData.history.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="dossier-actions">
                    <button class="btn btn-primary">Start Consultation</button>
                    <button class="btn btn-outline">View Full History</button>
                </div>
            </div>
        `);
    }
    
    loadSystemAnalytics() {
        // Simulate loading analytics data
        const analyticsData = {
            dailyUsers: 12847,
            consultations: 1234,
            accuracy: 94.7,
            uptime: 99.9
        };
        
        // Update analytics cards with animation
        setTimeout(() => {
            const cards = document.querySelectorAll('.analytics-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate-fadeInUp');
                }, index * 150);
            });
        }, 500);
    }
    
    loadUserManagement() {
        // Initialize user management tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            if (!btn.hasClickListener) {
                btn.addEventListener('click', (e) => {
                    this.switchUserTab(e.target.textContent.toLowerCase());
                });
                btn.hasClickListener = true;
            }
        });
    }
    
    switchUserTab(tabName) {
        // Update active tab
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Load appropriate user data
        console.log('Switching to tab:', tabName);
        // Here you would fetch and display the appropriate user data
    }
    
    setupRealTimeMonitoring() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateHealthAlerts();
        }, 30000); // Update every 30 seconds
    }
    
    updateHealthAlerts() {
        // Simulate new health alerts
        const alertTypes = ['critical', 'warning', 'info'];
        const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        console.log('Simulating health alert update:', randomType);
    }
    
    initializeHealthMap() {
        // Initialize the health monitoring map
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            // Add interactive hover effects to hotspots
            const hotspots = mapContainer.querySelectorAll('.hotspot');
            hotspots.forEach(hotspot => {
                if (!hotspot.hasHoverEffect) {
                    hotspot.addEventListener('mouseenter', () => {
                        hotspot.style.transform = 'scale(1.05)';
                    });
                    hotspot.addEventListener('mouseleave', () => {
                        hotspot.style.transform = 'scale(1)';
                    });
                    hotspot.hasHoverEffect = true;
                }
            });
        }
    }
    
    updateNavigationIndicators(currentPage) {
        // Update any navigation breadcrumbs or indicators
        const navItems = document.querySelectorAll('[data-nav-item]');
        navItems.forEach(item => {
            const itemPage = item.getAttribute('data-nav-item');
            if (itemPage === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    updateBrowserHistory(pageId, replace = false) {
        const state = { page: pageId };
        const title = this.getPageTitle(pageId);
        const url = `#${pageId}`;
        
        if (replace) {
            history.replaceState(state, title, url);
        } else {
            history.pushState(state, title, url);
        }
        
        document.title = title;
    }
    
    getPageTitle(pageId) {
        const titles = {
            'landing-page': 'Doc-In-The-Box - AI Healthcare Platform',
            'patient-dashboard': 'Patient Dashboard - Doc-In-The-Box',
            'doctor-dashboard': 'Doctor Portal - Doc-In-The-Box',
            'admin-dashboard': 'Admin Dashboard - Doc-In-The-Box'
        };
        
        return titles[pageId] || 'Doc-In-The-Box';
    }
    
    pageExists(pageId) {
        return document.getElementById(pageId) !== null;
    }
    
    getCurrentPage() {
        return this.currentPage;
    }
    
    getNavigationHistory() {
        return [...this.history];
    }
    
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current page
            const previousPage = this.history[this.history.length - 1];
            this.navigateTo(previousPage, false);
            return true;
        }
        return false;
    }
    
    canGoBack() {
        return this.history.length > 1;
    }
}

// Initialize navigation manager
const navigationManager = new NavigationManager();

// Global navigation function
function navigateTo(pageId) {
    return navigationManager.navigateTo(pageId);
}

// FIXED: Modal management functions
function showModal(title, content) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.style.display = 'flex';
        
        // Add entrance animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('animate-fadeOut');
            modalContent.classList.add('animate-scaleIn');
        }
        
        // Focus management for accessibility
        setTimeout(() => {
            const firstInput = modal.querySelector('input, button, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('animate-scaleIn');
            modalContent.classList.add('animate-fadeOut');
            setTimeout(() => {
                modal.style.display = 'none';
                modalContent.classList.remove('animate-fadeOut');
            }, 300);
        } else {
            modal.style.display = 'none';
        }
    }
}

// Keyboard navigation support
document.addEventListener('keydown', (event) => {
    // ESC key to close modals or go back
    if (event.key === 'Escape') {
        const modal = document.getElementById('modal-overlay');
        if (modal && modal.style.display === 'flex') {
            closeModal();
        } else if (navigationManager.canGoBack()) {
            navigationManager.goBack();
        }
    }
    
    // Alt + number keys for quick navigation
    if (event.altKey && !isNaN(event.key)) {
        event.preventDefault();
        const pageMap = {
            '1': 'landing-page',
            '2': 'patient-dashboard',
            '3': 'doctor-dashboard',
            '4': 'admin-dashboard'
        };
        
        if (pageMap[event.key]) {
            navigateTo(pageMap[event.key]);
        }
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        navigationManager.showPage(event.state.page, false);
    }
});

// Initialize page based on URL hash
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    if (hash && navigationManager.pageExists(hash)) {
        navigationManager.navigateTo(hash, false);
    }
});

// Export navigation manager for use in other modules
window.navigationManager = navigationManager;