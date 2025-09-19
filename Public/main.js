// main.js - Main Application Controller

class DocInTheBoxApp {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.currentUser = null;
        
        this.apiEndpoint = 'https://invoice-healthcare-default-rtdb.firebaseio.com'; 
        this.authEndpoint = 'https://identitytoolkit.googleapis.com/v1/accounts'; 
        this.medicalEndpoint = 'https://disease.sh/v3/covid-19';
        this.ocrEndpoint = 'https://api.ocr.space/parse/image'; 
        
        this.apiKeys = {
            firebase: 'AIzaSyAPDsowr-Czz8wWeWZjy-PFUfd6GyAz20M', 
            ocr: 'helloworld'
        };
        
        this.initializeApp();
    }

    // Authentication with Firebase
    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch(`${this.authEndpoint}:signInWithPassword?key=${this.apiKeys.firebase}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            });
            
            const data = await response.json();
            
            if (data.idToken) {
                this.currentUser = {
                    id: data.localId,
                    email: data.email,
                    name: data.displayName || 'User'
                };
                
                localStorage.setItem('sessionToken', data.idToken);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                this.showSuccessNotification('Logged in successfully!');
                this.navigateAfterAuth();
            } else {
                this.showErrorNotification(data.error.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Fallback to demo mode for college project
            this.useDemoMode();
        }
    }

    // Medical data from Disease.sh
    async getDiseaseInfo(diseaseName) {
        try {
            const response = await fetch(`${this.medicalEndpoint}/${diseaseName}`);
            return await response.json();
        } catch (error) {
            console.error('Medical API error:', error);
            // Return mock data if API fails
            return this.getMockDiseaseData(diseaseName);
        }
    }

    // OCR functionality
    async processInvoice(imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('apikey', this.apiKeys.ocr);
        formData.append('language', 'eng');
        
        try {
            const response = await fetch(this.ocrEndpoint, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            return data.ParsedResults[0].ParsedText;
        } catch (error) {
            console.error('OCR API error:', error);
            return "Mock invoice data for demo purposes";
        }
    }

    // Mock data for demo/fallback
    getMockDiseaseData(diseaseName) {
        const mockData = {
            'covid': {
                name: 'COVID-19',
                symptoms: ['Fever', 'Cough', 'Shortness of breath'],
                recommendations: ['Isolate', 'Rest', 'Consult doctor'],
                urgency: 'High'
            },
            'flu': {
                name: 'Influenza',
                symptoms: ['Fever', 'Cough', 'Body aches'],
                recommendations: ['Rest', 'Hydrate', 'Over-the-counter medicine'],
                urgency: 'Medium'
            }
        };
        
        return mockData[diseaseName.toLowerCase()] || {
            name: diseaseName,
            symptoms: ['Symptom data not available'],
            recommendations: ['Consult a healthcare professional'],
            urgency: 'Unknown'
        };
    }
    
    initializeApp() {
        console.log(`Initializing Doc-In-The-Box v${this.version}`);
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }
    
    onDOMReady() {
        // Initialize all app components
        this.setupGlobalEventListeners();
        this.loadUserPreferences();
        this.initializeAuthentication();
        this.setupServiceWorker();
        this.checkBrowserCompatibility();
        this.initializeAnalytics();
        
        this.initialized = true;
        console.log('Doc-In-The-Box initialized successfully');
        
        // Trigger initialization complete event
        document.dispatchEvent(new CustomEvent('appInitialized', {
            detail: { version: this.version, timestamp: new Date().toISOString() }
        }));

        if (window.doctorManager) {
            console.log('Doctor manager initialized');
        }
    }

    // API Call Method
    async makeAPICall(endpoint, options = {}) {
        try {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                    ...options.headers
                }
            };
            
            const response = await fetch(endpoint, {
                ...defaultOptions,
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showErrorNotification('Service temporarily unavailable');
            throw error;
        }
    }

    // Updated Authentication Methods
    initializeAuthentication() {
        // Check for existing session
        const sessionToken = localStorage.getItem('sessionToken');
        if (sessionToken) {
            this.validateSession(sessionToken);
        }
        
        // Setup login/logout handlers
        this.setupAuthHandlers();
    }
    
    async validateSession(token) {
        try {
            const response = await this.makeAPICall(`${this.authEndpoint}/validate-session`, {
                method: 'POST',
                body: JSON.stringify({ token })
            });
            
            if (response.valid) {
                this.currentUser = response.user;
                console.log('Session validated for user:', this.currentUser.name);
            } else {
                localStorage.removeItem('sessionToken');
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            console.error('Session validation failed:', error);
        }
    }
    
    async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const loginData = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = event.target.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        try {
            // API call to authenticate
            const response = await this.makeAPICall(`${this.authEndpoint}/login`, {
                method: 'POST',
                body: JSON.stringify(loginData)
            });
            
            if (response.success) {
                this.currentUser = response.user;
                
                localStorage.setItem('sessionToken', response.token);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                closeModal();
                this.showSuccessNotification('Logged in successfully!');
                
                // Navigate based on user type
                this.navigateAfterAuth();
                
                // Track login event
                this.trackEvent('user_login', {
                    user_id: this.currentUser.id,
                    user_type: this.currentUser.type
                });
            } else {
                this.showErrorNotification(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showErrorNotification('Login failed. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async handleSignup(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const signupData = Object.fromEntries(formData);
        
        // Validate password strength
        if (!this.isPasswordStrong(signupData.password)) {
            this.showErrorNotification('Password must be at least 8 characters with letters and numbers');
            return;
        }
        
        // Show loading state
        const submitBtn = event.target.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        try {
            // API call to register
            const response = await this.makeAPICall(`${this.authEndpoint}/register`, {
                method: 'POST',
                body: JSON.stringify(signupData)
            });
            
            if (response.success) {
                this.currentUser = response.user;
                
                localStorage.setItem('sessionToken', response.token);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                closeModal();
                this.showSuccessNotification('Account created successfully!');
                
                // Show email verification notice
                this.showEmailVerificationNotice();
                
                // Track signup event
                this.trackEvent('user_signup', {
                    user_id: this.currentUser.id,
                    user_type: this.currentUser.type
                });
            } else {
                this.showErrorNotification(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showErrorNotification('Registration failed. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // Medical API Integration
    async analyzeSymptoms(symptoms, language = 'en') {
        try {
            this.trackEvent('symptom_analysis_started', {
                symptoms: symptoms.substring(0, 100), // Limit length for analytics
                language: language
            });
            
            const response = await this.makeAPICall(`${this.apiEndpoint}/symptoms/analyze`, {
                method: 'POST',
                body: JSON.stringify({
                    symptoms: symptoms,
                    language: language,
                    user_id: this.currentUser?.id
                })
            });
            
            if (response.success) {
                this.trackEvent('symptom_analysis_completed', {
                    conditions: response.conditions,
                    urgency: response.urgency
                });
                
                return response;
            } else {
                throw new Error(response.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Symptom analysis error:', error);
            this.trackEvent('symptom_analysis_failed', {
                error: error.message
            });
            throw error;
        }
    }
    
    // Speech API Integration
    async speechToText(audioBlob, language = 'en-US') {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('language', language);
            
            const response = await fetch(`${this.speechEndpoint}/recognize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Speech recognition failed');
            }
            
            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('Speech recognition error:', error);
            
            // Fallback to browser's speech recognition if available
            if (window.SpeechRecognition || window.webkitSpeechRecognition) {
                return this.fallbackSpeechRecognition(language);
            }
            
            throw error;
        }
    }
    
    async textToSpeech(text, language = 'en-US') {
        try {
            const response = await this.makeAPICall(`${this.speechEndpoint}/synthesize`, {
                method: 'POST',
                body: JSON.stringify({
                    text: text,
                    language: language
                })
            });
            
            if (response.success) {
                // Play the audio
                const audio = new Audio(response.audioUrl);
                audio.play();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Text to speech error:', error);
            
            // Fallback to browser's speech synthesis
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = language;
                window.speechSynthesis.speak(utterance);
                return true;
            }
            
            return false;
        }
    }
    
    // Health Data API (FHIR compatible)
    async saveHealthData(data, type = 'observation') {
        try {
            const response = await this.makeAPICall(`${this.fhirEndpoint}/${type}`, {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    patientId: this.currentUser?.id,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.success) {
                this.trackEvent('health_data_saved', {
                    data_type: type,
                    patient_id: this.currentUser?.id
                });
                
                return response;
            }
            throw new Error(response.message || 'Failed to save health data');
        } catch (error) {
            console.error('Health data save error:', error);
            throw error;
        }
    }
    
    async getHealthData(type = 'observation', limit = 10) {
        try {
            const response = await this.makeAPICall(
                `${this.fhirEndpoint}/${type}?patientId=${this.currentUser?.id}&limit=${limit}`
            );
            
            if (response.success) {
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch health data');
        } catch (error) {
            console.error('Health data fetch error:', error);
            throw error;
        }
    }
    
    // Notifications API
    async sendNotification(userId, title, message, data = {}) {
        try {
            const response = await this.makeAPICall(`${this.notificationEndpoint}/send`, {
                method: 'POST',
                body: JSON.stringify({
                    userId: userId,
                    title: title,
                    message: message,
                    data: data
                })
            });
            
            return response.success;
        } catch (error) {
            console.error('Notification error:', error);
            return false;
        }
    }
    
    // Analytics API
    async trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            sessionId: this.analytics?.sessionId,
            page: navigationManager?.getCurrentPage() || 'unknown',
            userId: this.currentUser?.id,
            userType: this.currentUser?.type,
            version: this.version
        };
        
        // Send to analytics service
        try {
            await fetch(`${this.analyticsEndpoint}/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.analytics}`
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
        
        // Keep local copy for debugging
        this.analytics?.events.push(event);
        
        // Keep only last 100 events in memory
        if (this.analytics && this.analytics.events.length > 100) {
            this.analytics.events = this.analytics.events.slice(-100);
        }
    }
    
    setupGlobalEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (event) => this.handleGlobalKeyboard(event));
        
        // Global click handling for analytics
        document.addEventListener('click', (event) => this.handleGlobalClick(event));
        
        // Network status monitoring
        window.addEventListener('online', () => this.handleNetworkStatus(true));
        window.addEventListener('offline', () => this.handleNetworkStatus(false));
        
        // Page visibility changes
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Unload handling
        window.addEventListener('beforeunload', (event) => this.handleBeforeUnload(event));
        
        // Error handling
        window.addEventListener('error', (event) => this.handleGlobalError(event));
        window.addEventListener('unhandledrejection', (event) => this.handleUnhandledPromiseRejection(event));
    }
    
    handleGlobalKeyboard(event) {
        // Ctrl/Cmd + K for global search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.openGlobalSearch();
        }
        
        // F1 for help
        if (event.key === 'F1') {
            event.preventDefault();
            this.showHelp();
        }
        
        // Alt + H for home
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            navigateTo('landing-page');
        }
    }
    
    handleGlobalClick(event) {
        // Track button clicks for analytics
        if (event.target.matches('button, .btn')) {
            this.trackEvent('button_click', {
                button_text: event.target.textContent.trim(),
                page: navigationManager.getCurrentPage(),
                timestamp: new Date().toISOString()
            });
        }
        
        // Track navigation clicks
        if (event.target.matches('[data-nav], [onclick*="navigateTo"]')) {
            this.trackEvent('navigation_click', {
                target: event.target.getAttribute('data-nav') || 'unknown',
                page: navigationManager.getCurrentPage()
            });
        }
    }
    
    handleNetworkStatus(isOnline) {
        const statusIndicator = this.getOrCreateNetworkIndicator();
        
        if (isOnline) {
            statusIndicator.textContent = '🟢 Online';
            statusIndicator.className = 'network-status online';
            
            // Sync any offline data
            this.syncOfflineData();
        } else {
            statusIndicator.textContent = '🔴 Offline';
            statusIndicator.className = 'network-status offline';
            
            // Enable offline mode
            this.enableOfflineMode();
        }
        
        // Auto-hide after 3 seconds if online
        if (isOnline) {
            setTimeout(() => {
                statusIndicator.style.display = 'none';
            }, 3000);
        }
    }
    
    getOrCreateNetworkIndicator() {
        let indicator = document.getElementById('network-status-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'network-status-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                z-index: 1001;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.style.display = 'block';
        return indicator;
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause non-critical operations
            this.pauseNonCriticalOperations();
        } else {
            // Page is visible - resume operations
            this.resumeOperations();
        }
    }
    
    handleBeforeUnload(event) {
        // Save any pending data
        this.saveAppState();
        
        // Cleanup voice resources
        if (window.voiceManager) {
            window.voiceManager.stopListening();
            window.voiceManager.stopSpeaking();
        }
        
        // If user has unsaved changes, show warning
        if (this.hasUnsavedChanges()) {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return event.returnValue;
        }
    }
    
    handleGlobalError(event) {
        console.error('Global error:', event.error);
        
        // Track error for analytics
        this.trackEvent('javascript_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            page: navigationManager.getCurrentPage()
        });
        
        // Show user-friendly error message
        this.showErrorNotification('Something went wrong. Please refresh the page if issues persist.');
    }
    
    handleUnhandledPromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        
        this.trackEvent('promise_rejection', {
            reason: event.reason?.message || event.reason,
            page: navigationManager.getCurrentPage()
        });
        
        // Prevent default browser behavior
        event.preventDefault();
    }
    
    loadUserPreferences() {
        const preferences = localStorage.getItem('userPreferences');
        if (preferences) {
            try {
                const prefs = JSON.parse(preferences);
                this.applyUserPreferences(prefs);
            } catch (error) {
                console.error('Error loading user preferences:', error);
            }
        }
    }
    
    applyUserPreferences(preferences) {
        // Apply theme
        if (preferences.theme) {
            document.body.setAttribute('data-theme', preferences.theme);
        }
        
        // Apply language
        if (preferences.language && window.voiceManager) {
            window.voiceManager.setLanguage(preferences.language);
        }
        
        // Apply accessibility settings
        if (preferences.accessibility) {
            this.applyAccessibilitySettings(preferences.accessibility);
        }
    }
    
    applyAccessibilitySettings(settings) {
        if (settings.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        if (settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        if (settings.largeText) {
            document.body.classList.add('large-text');
        }
    }
    
    initializeAuthentication() {
        // Check for existing session
        const sessionToken = localStorage.getItem('sessionToken');
        if (sessionToken) {
            this.validateSession(sessionToken);
        }
        
        // Setup login/logout handlers
        this.setupAuthHandlers();
    }
    
    setupAuthHandlers() {
        // Login button handlers
        const loginBtns = document.querySelectorAll('[onclick="showLogin()"]');
        loginBtns.forEach(btn => {
            if (!btn.hasAuthListener) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showLoginModal();
                });
                btn.hasAuthListener = true;
            }
        });
        
        // Signup button handlers
        const signupBtns = document.querySelectorAll('[onclick="showSignup()"]');
        signupBtns.forEach(btn => {
            if (!btn.hasAuthListener) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showSignupModal();
                });
                btn.hasAuthListener = true;
            }
        });
    }
    
    showLoginModal() {
        const content = `
            <form class="auth-form" onsubmit="app.handleLogin(event)">
                <div class="form-group">
                    <label class="form-label">Email or Phone</label>
                    <input type="text" class="form-input" name="username" required 
                           placeholder="Enter your email or phone number" />
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" name="password" required 
                           placeholder="Enter your password" />
                </div>
                
                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" name="remember" /> Remember me
                    </label>
                    <a href="#" onclick="app.showForgotPassword()" class="forgot-link">Forgot password?</a>
                </div>
                
                <button type="submit" class="btn btn-primary btn-large">Login</button>
                
                <div class="auth-divider">or</div>
                
                <button type="button" class="btn btn-secondary btn-large" onclick="app.showSignupModal()">
                    Create New Account
                </button>
            </form>
        `;
        
        showModal('Login to Doc-In-The-Box', content);
    }
    
    showSignupModal() {
        const content = `
            <form class="auth-form" onsubmit="app.handleSignup(event)">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-input" name="fullName" required 
                           placeholder="Enter your full name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" name="email" required 
                           placeholder="Enter your email address">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" class="form-input" name="phone" required 
                           placeholder="Enter your phone number">
                </div>
                
                <div class="form-group">
                    <label class="form-label">User Type</label>
                    <select class="form-select" name="userType" required>
                        <option value="">Select user type</option>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" name="password" required 
                           placeholder="Create a strong password" minlength="8">
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="terms" required> 
                        I agree to the <a href="#" onclick="app.showTerms()">Terms of Service</a> and <a href="#" onclick="app.showPrivacy()">Privacy Policy</a>
                    </label>
                </div>
                
                <button type="submit" class="btn btn-primary btn-large">Create Account</button>
                
                <div class="auth-divider">or</div>
                
                <button type="button" class="btn btn-secondary btn-large" onclick="app.showLoginModal()">
                    Already have an account? Login
                </button>
            </form>
        `;
        
        showModal('Create Your Account', content);
    }
    
    handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const loginData = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = event.target.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Simulate API call (replace with actual authentication)
        setTimeout(() => {
            // Mock successful login
            this.currentUser = {
                id: 'user_' + Date.now(),
                name: 'John Doe',
                email: loginData.username,
                type: 'patient',
                verified: true
            };
            
            localStorage.setItem('sessionToken', 'mock_token_' + Date.now());
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            closeModal();
            this.showSuccessNotification('Logged in successfully!');
            
            // Navigate based on user type
            this.navigateAfterAuth();
            
        }, 2000);
    }
    
    handleSignup(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const signupData = Object.fromEntries(formData);
        
        // Validate password strength
        if (!this.isPasswordStrong(signupData.password)) {
            this.showErrorNotification('Password must be at least 8 characters with letters and numbers');
            return;
        }
        
        // Show loading state
        const submitBtn = event.target.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            this.currentUser = {
                id: 'user_' + Date.now(),
                name: signupData.fullName,
                email: signupData.email,
                phone: signupData.phone,
                type: signupData.userType,
                verified: false
            };
            
            localStorage.setItem('sessionToken', 'mock_token_' + Date.now());
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            closeModal();
            this.showSuccessNotification('Account created successfully!');
            
            // Show email verification notice
            this.showEmailVerificationNotice();
            
        }, 2000);
    }
    
    navigateAfterAuth() {
        const userType = this.currentUser?.type;
        switch (userType) {
            case 'patient':
                navigateTo('patient-dashboard');
                break;
            case 'doctor':
                navigateTo('doctor-dashboard');
                break;
            case 'admin':
                navigateTo('admin-dashboard');
                break;
            default:
                navigateTo('patient-dashboard');
        }
    }
    
    isPasswordStrong(password) {
        return password.length >= 8 && 
               /[A-Za-z]/.test(password) && 
               /[0-9]/.test(password);
    }
    
    showEmailVerificationNotice() {
        const content = `
            <div class="verification-notice">
                <div class="notice-icon">📧</div>
                <h3>Verify Your Email</h3>
                <p>We've sent a verification link to <strong>${this.currentUser.email}</strong></p>
                <p>Please check your email and click the verification link to complete your registration.</p>
                <div class="notice-actions">
                    <button class="btn btn-primary" onclick="closeModal()">Got it</button>
                    <button class="btn btn-secondary" onclick="app.resendVerification()">Resend Email</button>
                </div>
            </div>
        `;
        
        showModal('Email Verification', content);
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }
    
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'Promise',
            'fetch',
            'localStorage',
            'sessionStorage'
        ];
        
        const missingFeatures = requiredFeatures.filter(feature => 
            !(feature in window) && !(feature in window.constructor.prototype)
        );
        
        if (missingFeatures.length > 0) {
            this.showBrowserCompatibilityWarning(missingFeatures);
        }
        
        // Check for voice features
        if (!window.speechSynthesis || !window.SpeechRecognition && !window.webkitSpeechRecognition) {
            console.warn('Voice features not fully supported in this browser');
        }
    }
    
    showBrowserCompatibilityWarning(missingFeatures) {
        const content = `
            <div class="compatibility-warning">
                <div class="warning-icon">⚠️</div>
                <h3>Browser Compatibility Notice</h3>
                <p>Your browser may not support all features of this application.</p>
                <p><strong>Missing features:</strong> ${missingFeatures.join(', ')}</p>
                <p>For the best experience, please update your browser or use a modern browser like Chrome, Firefox, or Safari.</p>
                <button class="btn btn-primary" onclick="closeModal()">Continue Anyway</button>
            </div>
        `;
        
        showModal('Browser Compatibility', content);
    }
    
    initializeAnalytics() {
        // Initialize analytics (replace with actual service)
        this.analytics = {
            sessionId: 'session_' + Date.now(),
            events: [],
            startTime: new Date().toISOString()
        };
        
        // Track page load
        this.trackEvent('app_loaded', {
            version: this.version,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
    }

     // Helper method for fallback speech recognition
    fallbackSpeechRecognition(language = 'en-US') {
        return new Promise((resolve, reject) => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                reject(new Error('Speech recognition not supported'));
                return;
            }
            
            const recognition = new SpeechRecognition();
            recognition.lang = language;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };
            
            recognition.onerror = (event) => {
                reject(new Error(event.error));
            };
            
            recognition.start();
        });
    }
    
    
    trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            sessionId: this.analytics?.sessionId,
            page: navigationManager?.getCurrentPage() || 'unknown'
        };
        
        this.analytics?.events.push(event);
        
        // In production, send to analytics service
        console.log('Analytics Event:', event);
        
        // Keep only last 100 events in memory
        if (this.analytics && this.analytics.events.length > 100) {
            this.analytics.events = this.analytics.events.slice(-100);
        }
    }
    
    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }
    
    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }
    
    showInfoNotification(message) {
        this.showNotification(message, 'info');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            padding: 15px;
            border-radius: 12px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--info)'};
            color: white;
            box-shadow: var(--shadow-large);
            z-index: 1002;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutNotification 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    openGlobalSearch() {
        const content = `
            <div class="global-search">
                <div class="search-header">
                    <h3>🔍 Search Doc-In-The-Box</h3>
                    <p>Search for features, doctors, symptoms, or help topics</p>
                </div>
                
                <div class="search-input-container">
                    <input type="text" class="form-input" id="global-search-input" 
                           placeholder="What are you looking for?" 
                           onkeyup="app.handleGlobalSearch(this.value)" autofocus>
                </div>
                
                <div class="search-results" id="global-search-results">
                    <div class="search-suggestions">
                        <h4>Popular searches:</h4>
                        <div class="suggestion-tags">
                            <button class="suggestion-tag" onclick="app.searchFor('book appointment')">Book Appointment</button>
                            <button class="suggestion-tag" onclick="app.searchFor('symptom checker')">Symptom Checker</button>
                            <button class="suggestion-tag" onclick="app.searchFor('emergency')">Emergency Services</button>
                            <button class="suggestion-tag" onclick="app.searchFor('health wallet')">Health Wallet</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Global Search', content);
        
        // Focus on search input
        setTimeout(() => {
            const searchInput = document.getElementById('global-search-input');
            if (searchInput) searchInput.focus();
        }, 100);
    }
    
    handleGlobalSearch(query) {
        if (query.length < 2) {
            document.getElementById('global-search-results').innerHTML = `
                <div class="search-suggestions">
                    <h4>Popular searches:</h4>
                    <div class="suggestion-tags">
                        <button class="suggestion-tag" onclick="app.searchFor('book appointment')">Book Appointment</button>
                        <button class="suggestion-tag" onclick="app.searchFor('symptom checker')">Symptom Checker</button>
                        <button class="suggestion-tag" onclick="app.searchFor('emergency')">Emergency Services</button>
                        <button class="suggestion-tag" onclick="app.searchFor('health wallet')">Health Wallet</button>
                    </div>
                </div>
            `;
            return;
        }
        
        const results = this.performGlobalSearch(query);
        this.displaySearchResults(results);
    }
    
    performGlobalSearch(query) {
        const searchIndex = [
            { title: 'Symptom Checker', description: 'AI-powered symptom analysis', action: () => navigateTo('patient-dashboard'), page: 'patient-dashboard' },
            { title: 'Book Appointment', description: 'Schedule consultation with doctors', action: () => showAppointmentBooking(), page: 'patient-dashboard' },
            { title: 'Emergency Services', description: 'Find nearby hospitals and emergency contacts', action: () => showEmergencyServices(), page: 'patient-dashboard' },
            { title: 'Health Wallet', description: 'View medical history and records', action: () => showHealthWallet(), page: 'patient-dashboard' },
            { title: 'Doctor Portal', description: 'Access doctor dashboard and tools', action: () => navigateTo('doctor-dashboard'), page: 'doctor-dashboard' },
            { title: 'Admin Dashboard', description: 'System administration and analytics', action: () => navigateTo('admin-dashboard'), page: 'admin-dashboard' },
            { title: 'Voice Assistant', description: 'Enable voice recognition and TTS', action: () => toggleGlobalVoice(), page: 'any' }
        ];
        
        const lowerQuery = query.toLowerCase();
        return searchIndex.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery)
        );
    }
    
    displaySearchResults(results) {
        const resultsContainer = document.getElementById('global-search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No results found. Try a different search term.</p>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="search-results-list">
                ${results.map(result => `
                    <div class="search-result-item" onclick="app.executeSearchAction('${result.title}')">
                        <h4>${result.title}</h4>
                        <p>${result.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    searchFor(query) {
        document.getElementById('global-search-input').value = query;
        this.handleGlobalSearch(query);
    }
    
    executeSearchAction(title) {
        const searchIndex = {
            'Symptom Checker': () => { closeModal(); navigateTo('patient-dashboard'); },
            'Book Appointment': () => { closeModal(); showAppointmentBooking(); },
            'Emergency Services': () => { closeModal(); showEmergencyServices(); },
            'Health Wallet': () => { closeModal(); showHealthWallet(); },
            'Doctor Portal': () => { closeModal(); navigateTo('doctor-dashboard'); },
            'Admin Dashboard': () => { closeModal(); navigateTo('admin-dashboard'); },
            'Voice Assistant': () => { closeModal(); toggleGlobalVoice(); }
        };
        
        const action = searchIndex[title];
        if (action) {
            this.trackEvent('search_action_executed', { title });
            action();
        }
    }
    
    showHelp() {
        const content = `
            <div class="help-content">
                <div class="help-header">
                    <h3>❓ Help & Support</h3>
                    <p>Get help with using Doc-In-The-Box</p>
                </div>
                
                <div class="help-sections">
                    <div class="help-section">
                        <h4>🎤 Voice Features</h4>
                        <ul>
                            <li>Click the microphone button to describe symptoms</li>
                            <li>Use "Ctrl+Shift+V" to toggle voice assistant</li>
                            <li>Say "help" to learn voice commands</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>⌨️ Keyboard Shortcuts</h4>
                        <ul>
                            <li><kbd>Ctrl+K</kbd> - Global search</li>
                            <li><kbd>Alt+1-4</kbd> - Navigate between pages</li>
                            <li><kbd>F1</kbd> - Show this help</li>
                            <li><kbd>Esc</kbd> - Close modals or go back</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>🏥 Getting Started</h4>
                        <ul>
                            <li><strong>Patients:</strong> Use symptom checker, book appointments, manage health records</li>
                            <li><strong>Doctors:</strong> Manage appointments, view patient dossiers, use AI assistant</li>
                            <li><strong>Admins:</strong> Monitor system health, manage users, view analytics</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>📞 Contact Support</h4>
                        <div class="contact-options">
                            <button class="btn btn-outline btn-small" onclick="app.openSupportChat()">💬 Live Chat</button>
                            <button class="btn btn-outline btn-small" onclick="window.open('mailto:support@docinthebox.com')">📧 Email</button>
                            <button class="btn btn-outline btn-small" onclick="window.open('tel:+911234567890')">📞 Call</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Help & Support', content);
    }
    
    openSupportChat() {
        const content = `
            <div class="support-chat">
                <div class="chat-header">
                    <h3>💬 Live Support Chat</h3>
                    <p>Chat with our support team</p>
                </div>
                
                <div class="chat-messages">
                    <div class="chat-message bot-message">
                        <div class="message-avatar">🤖</div>
                        <div class="message-content">
                            <p>Hello! I'm here to help you with Doc-In-The-Box. What can I assist you with today?</p>
                            <span class="message-time">Just now</span>
                        </div>
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <input type="text" class="form-input" placeholder="Type your message..." 
                           onkeypress="if(event.key==='Enter') app.sendChatMessage(this.value, this)">
                    <button class="btn btn-primary btn-small" onclick="app.sendChatMessage(this.previousElementSibling.value, this.previousElementSibling)">
                        Send
                    </button>
                </div>
                
                <div class="quick-actions">
                    <button class="quick-action-btn" onclick="app.sendQuickMessage('How do I use the symptom checker?')">❓ Symptom Checker Help</button>
                    <button class="quick-action-btn" onclick="app.sendQuickMessage('I need help booking an appointment')">📅 Appointment Help</button>
                    <button class="quick-action-btn" onclick="app.sendQuickMessage('Voice features not working')">🎤 Voice Issues</button>
                </div>
            </div>
        `;
        
        showModal('Support Chat', content);
    }
    
    sendChatMessage(message, inputElement) {
        if (!message.trim()) return;
        
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user-message';
        userMessage.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">Just now</span>
            </div>
            <div class="message-avatar">👤</div>
        `;
        messagesContainer.appendChild(userMessage);
        
        // Clear input
        inputElement.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const botResponse = this.generateBotResponse(message);
            const botMessage = document.createElement('div');
            botMessage.className = 'chat-message bot-message';
            botMessage.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>${botResponse}</p>
                    <span class="message-time">Just now</span>
                </div>
            `;
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    sendQuickMessage(message) {
        const input = document.querySelector('.chat-input-container input');
        if (input) {
            input.value = message;
            this.sendChatMessage(message, input);
        }
    }
    
    generateBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('symptom') || lowerMessage.includes('checker')) {
            return 'To use the symptom checker: 1) Go to Patient Dashboard, 2) Click the microphone or type your symptoms, 3) Our AI will analyze and provide recommendations. You can use voice input in multiple languages!';
        }
        
        if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
            return 'To book an appointment: 1) Click "Book Appointment" from any dashboard, 2) Search and select a doctor, 3) Choose your preferred date and time, 4) Confirm your booking. You\'ll receive confirmation details in your Health Wallet.';
        }
        
        if (lowerMessage.includes('voice') || lowerMessage.includes('microphone')) {
            return 'Voice features require microphone permission. Make sure: 1) Your browser allows microphone access, 2) You have a working microphone, 3) Try refreshing the page. You can also use Ctrl+Shift+V to toggle voice assistant.';
        }
        
        if (lowerMessage.includes('login') || lowerMessage.includes('account')) {
            return 'Having trouble with your account? You can: 1) Reset password using "Forgot Password" link, 2) Contact support if you can\'t access your email, 3) Create a new account if needed. We support Patient, Doctor, and Admin account types.';
        }
        
        return 'Thank you for your message! Our support team will help resolve your issue. For immediate assistance, you can also call us at +91-123-456-7890 or email support@docinthebox.com.';
    }
    
    pauseNonCriticalOperations() {
        // Pause animations, reduce polling frequency, etc.
        console.log('Pausing non-critical operations');
    }
    
    resumeOperations() {
        // Resume normal operations
        console.log('Resuming normal operations');
    }
    
    syncOfflineData() {
        // Sync any data that was stored while offline
        console.log('Syncing offline data');
    }
    
    enableOfflineMode() {
        // Enable offline functionality
        console.log('Offline mode enabled');
    }
    
    hasUnsavedChanges() {
        // Check if user has unsaved form data or pending operations
        return false; // Implement actual logic as needed
    }
    
    saveAppState() {
        // Save current application state
        const appState = {
            currentPage: navigationManager?.getCurrentPage(),
            timestamp: new Date().toISOString(),
            userPreferences: this.getUserPreferences()
        };
        
        localStorage.setItem('appState', JSON.stringify(appState));
    }
    
    getUserPreferences() {
        return {
            theme: document.body.getAttribute('data-theme') || 'default',
            language: window.voiceManager?.currentLanguage || 'en-US',
            voiceEnabled: window.voiceManager?.isGlobalVoiceActive || false
        };
    }
    
    restoreAppState() {
        const savedState = localStorage.getItem('appState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.userPreferences) {
                    this.applyUserPreferences(state.userPreferences);
                }
            } catch (error) {
                console.error('Error restoring app state:', error);
            }
        }
    }
    
    validateSession(token) {
        // Validate session token (implement actual API call)
        console.log('Validating session:', token);
        
        // Mock validation
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('Session restored for user:', this.currentUser.name);
            } catch (error) {
                console.error('Error restoring user session:', error);
                localStorage.removeItem('sessionToken');
                localStorage.removeItem('currentUser');
            }
        }
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');
        
        // Reset to landing page
        navigateTo('landing-page');
        
        this.showSuccessNotification('Logged out successfully');
    }
    
    // Public API methods
    getVersion() {
        return this.version;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isInitialized() {
        return this.initialized;
    }
    
    getAnalytics() {
        return { ...this.analytics };
    }
}

// Initialize the main application
const app = new DocInTheBoxApp();

// Global functions for backward compatibility
function showLogin() {
    app.showLoginModal();
}

function showSignup() {
    app.showSignupModal();
}

// Expose app instance globally
window.app = app;

// Add global styles for notifications and other UI elements
document.addEventListener('DOMContentLoaded', () => {
    const globalStyles = document.createElement('style');
    globalStyles.textContent = `
        .notification {
            font-family: 'Inter', sans-serif;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        }
        
        .auth-form {
            max-width: 400px;
            margin: 0 auto;
        }
        
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 1rem 0;
            font-size: 0.9rem;
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }
        
        .forgot-link {
            color: var(--diamond-blue-light);
            text-decoration: none;
        }
        
        .forgot-link:hover {
            text-decoration: underline;
        }
        
        .auth-divider {
            text-align: center;
            margin: 1.5rem 0;
            position: relative;
            opacity: 0.7;
        }
        
        .auth-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.2);
            z-index: -1;
        }
        
        .auth-divider {
            background: var(--gradient-primary);
            padding: 0 1rem;
        }
        
        .global-search {
            max-width: 500px;
        }
        
        .search-input-container {
            position: relative;
            margin-bottom: 2rem;
        }
        
        .search-suggestions h4 {
            margin-bottom: 1rem;
            opacity: 0.8;
        }
        
        .suggestion-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .suggestion-tag {
            padding: 0.4rem 0.8rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            color: white;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .suggestion-tag:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }
        
        .search-result-item {
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-result-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
        }
        
        .search-result-item h4 {
            margin-bottom: 0.25rem;
            color: var(--diamond-blue-light);
        }
        
        .search-result-item p {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .help-content {
            max-width: 600px;
        }
        
        .help-sections {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        
        .help-section h4 {
            margin-bottom: 1rem;
            color: var(--diamond-blue-light);
        }
        
        .help-section ul {
            list-style: none;
            padding: 0;
        }
        
        .help-section li {
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .help-section li:last-child {
            border-bottom: none;
        }
        
        kbd {
            background: rgba(255, 255, 255, 0.1);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.85rem;
        }
        
        .contact-options {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .support-chat {
            max-width: 500px;
            height: 600px;
            display: flex;
            flex-direction: column;
        }
        
        .chat-messages {
            flex: 1;
            max-height: 400px;
            overflow-y: auto;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .chat-message {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1rem;
            align-items: flex-start;
        }
        
        .user-message {
            flex-direction: row-reverse;
        }
        
        .message-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .message-content {
            max-width: 70%;
            padding: 0.75rem;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
        }
        
        .user-message .message-content {
            background: var(--diamond-blue-light);
        }
        
        .message-time {
            font-size: 0.75rem;
            opacity: 0.6;
            margin-top: 0.5rem;
            display: block;
        }
        
        .chat-input-container {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .chat-input-container input {
            flex: 1;
        }
        
        .quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .quick-action-btn {
            padding: 0.4rem 0.8rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            color: white;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .quick-action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .network-status.online {
            background: var(--success);
        }
        
        .network-status.offline {
            background: var(--danger);
        }
        
        @media (max-width: 768px) {
            .auth-form {
                padding: 1rem;
            }
            
            .support-chat {
                height: 500px;
            }
            
            .chat-messages {
                max-height: 300px;
            }
            
            .message-content {
                max-width: 85%;
            }
            
            .quick-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(globalStyles);
});

// Log initialization complete
console.log('Doc-In-The-Box application loaded successfully');