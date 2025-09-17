// admin.js - Admin Dashboard Functionality

class AdminManager {
    constructor() {
        this.currentAdmin = {
            id: 'admin_001',
            name: 'System Administrator',
            role: 'Super Admin',
            permissions: ['user_management', 'system_monitoring', 'analytics', 'emergency_alerts']
        };
        
        this.systemMetrics = {};
        this.healthAlerts = [];
        this.userStats = {};
        this.realTimeData = {};
        
        this.initializeAdminFeatures();
        this.startRealTimeMonitoring();
    }
    
    initializeAdminFeatures() {
        // Initialize system monitoring
        this.setupSystemMonitoring();
        
        // Initialize user management
        this.setupUserManagement();
        
        // Initialize health analytics
        this.setupHealthAnalytics();
        
        // Initialize alert system
        this.setupAlertSystem();
        
        // Load initial data
        this.loadSystemData();
    }
    
    setupSystemMonitoring() {
        this.systemMetrics = {
            dailyActiveUsers: 12847,
            consultationsToday: 1234,
            aiAccuracyRate: 94.7,
            systemUptime: 99.9,
            averageResponseTime: 180, // ms
            databaseLoad: 67, // percentage
            serverCpuUsage: 43, // percentage
            serverMemoryUsage: 78, // percentage
            networkLatency: 23, // ms
            errorRate: 0.1 // percentage
        };
        
        this.updateSystemMetricsUI();
    }
    
    setupUserManagement() {
        this.users = {
            doctors: [
                {
                    id: 'dr_001',
                    name: 'Dr. Sarah Johnson',
                    specialization: 'General Medicine',
                    status: 'active',
                    patients: 127,
                    rating: 4.9,
                    joinDate: '2023-01-15',
                    lastLogin: '2024-01-20T10:30:00Z',
                    consultations: 456,
                    verified: true
                },
                {
                    id: 'dr_002',
                    name: 'Dr. Raj Kumar',
                    specialization: 'Cardiology',
                    status: 'active',
                    patients: 89,
                    rating: 4.7,
                    joinDate: '2023-03-20',
                    lastLogin: '2024-01-19T16:45:00Z',
                    consultations: 234,
                    verified: true
                },
                {
                    id: 'dr_003',
                    name: 'Dr. Priya Patel',
                    specialization: 'Pediatrics',
                    status: 'pending',
                    patients: 0,
                    rating: 0,
                    joinDate: '2024-01-18',
                    lastLogin: '2024-01-18T09:15:00Z',
                    consultations: 0,
                    verified: false
                }
            ],
            patients: [
                {
                    id: 'pt_001',
                    name: 'John Doe',
                    age: 34,
                    status: 'active',
                    joinDate: '2023-06-10',
                    lastLogin: '2024-01-20T14:20:00Z',
                    consultations: 12,
                    city: 'Delhi',
                    verified: true
                },
                {
                    id: 'pt_002',
                    name: 'Jane Smith',
                    age: 28,
                    status: 'active',
                    joinDate: '2023-08-15',
                    lastLogin: '2024-01-19T11:30:00Z',
                    consultations: 8,
                    city: 'Mumbai',
                    verified: true
                }
            ],
            pendingApprovals: [
                {
                    id: 'dr_003',
                    name: 'Dr. Priya Patel',
                    type: 'doctor',
                    specialization: 'Pediatrics',
                    submittedDate: '2024-01-18',
                    documents: ['license', 'degree', 'identity'],
                    status: 'under_review'
                }
            ]
        };
        
        this.updateUserManagementUI();
    }
    
    setupHealthAnalytics() {
        this.healthData = {
            symptomHotspots: [
                {
                    location: 'Delhi NCR',
                    coordinates: { lat: 28.6139, lng: 77.2090 },
                    symptoms: 'Fever Cases',
                    increase: 23,
                    alertLevel: 'high',
                    totalCases: 156,
                    timeframe: '24h'
                },
                {
                    location: 'Mumbai',
                    coordinates: { lat: 19.0760, lng: 72.8777 },
                    symptoms: 'Respiratory Issues',
                    increase: 12,
                    alertLevel: 'medium',
                    totalCases: 89,
                    timeframe: '24h'
                },
                {
                    location: 'Bangalore',
                    coordinates: { lat: 12.9716, lng: 77.5946 },
                    symptoms: 'Headache Reports',
                    increase: 8,
                    alertLevel: 'low',
                    totalCases: 45,
                    timeframe: '24h'
                }
            ],
            
            diseaseOutbreaks: [
                {
                    id: 'outbreak_001',
                    disease: 'Viral Fever',
                    location: 'East Delhi',
                    casesReported: 43,
                    timeframe: '24h',
                    riskLevel: 'high',
                    trend: 'increasing',
                    lastUpdated: new Date().toISOString()
                }
            ],
            
            publicHealthTrends: {
                commonSymptoms: [
                    { symptom: 'Fever', percentage: 34 },
                    { symptom: 'Headache', percentage: 28 },
                    { symptom: 'Cough', percentage: 22 },
                    { symptom: 'Body Ache', percentage: 18 },
                    { symptom: 'Fatigue', percentage: 15 }
                ],
                ageGroupDistribution: [
                    { ageGroup: '0-18', percentage: 22 },
                    { ageGroup: '19-35', percentage: 38 },
                    { ageGroup: '36-55', percentage: 28 },
                    { ageGroup: '55+', percentage: 12 }
                ]
            }
        };
        
        this.updateHealthAnalyticsUI();
    }
    
    setupAlertSystem() {
        this.alerts = [
            {
                id: 'alert_001',
                type: 'critical',
                title: 'Potential Outbreak Alert',
                message: 'Unusual spike in fever cases in East Delhi (43 cases in 24h)',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                location: 'East Delhi',
                action_required: true
            },
            {
                id: 'alert_002',
                type: 'warning',
                title: 'Seasonal Pattern Detected',
                message: 'Increased respiratory complaints correlating with air quality index',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                status: 'acknowledged',
                location: 'Mumbai',
                action_required: false
            },
            {
                id: 'alert_003',
                type: 'info',
                title: 'System Update',
                message: 'AI model accuracy improved by 3.2% after latest training',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                status: 'resolved',
                location: 'System-wide',
                action_required: false
            }
        ];
        
        this.updateAlertsUI();
    }
    
    loadSystemData() {
        // Load or generate system analytics data
        this.platformAnalytics = {
            totalUsers: 15678,
            totalDoctors: 234,
            totalPatients: 15444,
            totalConsultations: 45678,
            averageSessionDuration: '12:34',
            bounceRate: 23.5,
            userGrowthRate: 15.2,
            revenueGrowth: 28.7
        };
        
        this.updatePlatformAnalyticsUI();
    }
    
    startRealTimeMonitoring() {
        // Start real-time data updates
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000); // Update every 30 seconds
        
        // Simulate new alerts
        setInterval(() => {
            this.simulateNewAlert();
        }, 5 * 60 * 1000); // New alert every 5 minutes
        
        // Update system metrics
        setInterval(() => {
            this.updateSystemMetrics();
        }, 10000); // Update every 10 seconds
    }
    
    updateRealTimeData() {
        // Simulate real-time data updates
        this.systemMetrics.dailyActiveUsers += Math.floor(Math.random() * 5);
        this.systemMetrics.consultationsToday += Math.floor(Math.random() * 3);
        this.systemMetrics.serverCpuUsage = Math.max(20, Math.min(90, 
            this.systemMetrics.serverCpuUsage + (Math.random() - 0.5) * 10));
        
        this.updateSystemMetricsUI();
    }
    
    simulateNewAlert() {
        const alertTypes = ['info', 'warning', 'critical'];
        const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];
        const symptoms = ['Fever', 'Cough', 'Headache', 'Respiratory Issues'];
        
        const newAlert = {
            id: 'alert_' + Date.now(),
            type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            title: 'System Alert',
            message: `New ${symptoms[Math.floor(Math.random() * symptoms.length)]} cases reported in ${locations[Math.floor(Math.random() * locations.length)]}`,
            timestamp: new Date().toISOString(),
            status: 'active',
            location: locations[Math.floor(Math.random() * locations.length)],
            action_required: Math.random() > 0.7
        };
        
        this.alerts.unshift(newAlert);
        
        if (this.alerts.length > 10) {
            this.alerts = this.alerts.slice(0, 10);
        }
        
        this.updateAlertsUI();
        
        if (newAlert.type === 'critical') {
            this.showCriticalAlertNotification(newAlert);
        }
    }
    
    showCriticalAlertNotification(alert) {
        const notification = document.createElement('div');
        notification.className = 'critical-alert-notification';
        notification.innerHTML = `
            <div class="alert-notification-content">
                <div class="alert-icon">🚨</div>
                <div class="alert-details">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                    <small>${alert.location} • ${new Date(alert.timestamp).toLocaleTimeString()}</small>
                </div>
                <div class="alert-actions">
                    <button class="btn btn-danger btn-small" onclick="adminManager.viewAlert('${alert.id}')">View Details</button>
                    <button class="notification-close" onclick="this.closest('.critical-alert-notification').remove()">×</button>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
            z-index: 1002;
            animation: slideInRight 0.3s ease, pulse 2s infinite;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
        
        if (window.voiceManager) {
            window.voiceManager.speak(`Critical health alert: ${alert.message}`);
        }
    }
    
    updateSystemMetricsUI() {
        const metricsCards = document.querySelectorAll('.analytics-card');
        if (metricsCards.length >= 4) {
            const metrics = [
                { value: this.systemMetrics.dailyActiveUsers, label: 'Daily Active Users' },
                { value: this.systemMetrics.consultationsToday, label: 'Consultations Today' },
                { value: this.systemMetrics.aiAccuracyRate + '%', label: 'AI Accuracy Rate' },
                { value: this.systemMetrics.systemUptime + '%', label: 'System Uptime' }
            ];
            
            metricsCards.forEach((card, index) => {
                if (metrics[index]) {
                    const valueElement = card.querySelector('.metric-value');
                    if (valueElement) {
                        this.animateMetricValue(valueElement, metrics[index].value);
                    }
                }
            });
        }
    }
    
    animateMetricValue(element, finalValue) {
        const numericValue = parseFloat(String(finalValue).replace(/[^\d.]/g, ''));
        if (isNaN(numericValue)) {
            element.textContent = finalValue;
            return;
        }
        
        let current = parseFloat(element.textContent.replace(/[^\d.]/g, '')) || 0;
        const difference = numericValue - current;
        const increment = difference / 20;
        const suffix = String(finalValue).match(/[^\d.]*$/) || [''];
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= numericValue) || (increment < 0 && current <= numericValue)) {
                current = numericValue;
                clearInterval(timer);
            }
            
            element.textContent = Math.round(current * 10) / 10 + suffix[0];
        }, 50);
    }
    
    updateUserManagementUI() {
        console.log('User management UI updated');
    }
    
    updateHealthAnalyticsUI() {
        const hotspotContainer = document.querySelector('.hotspot-indicators');
        if (hotspotContainer) {
            hotspotContainer.innerHTML = this.healthData.symptomHotspots.map(hotspot => `
                <div class="hotspot ${hotspot.alertLevel}-alert" onclick="adminManager.viewHotspotDetails('${hotspot.location}')">
                    <span class="location">${hotspot.location}</span>
                    <span class="symptom">${hotspot.symptoms}: +${hotspot.increase}%</span>
                    <div class="hotspot-meta">
                        <small>${hotspot.totalCases} cases in ${hotspot.timeframe}</small>
                    </div>
                </div>
            `).join('');
        }
    }
    
    updateAlertsUI() {
        const alertsList = document.querySelector('.alert-list');
        if (alertsList) {
            alertsList.innerHTML = this.alerts.map(alert => `
                <div class="alert-item ${alert.type}" onclick="adminManager.viewAlert('${alert.id}')">
                    <div class="alert-icon">
                        ${alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : '🔵'}
                    </div>
                    <div class="alert-content">
                        <h4>${alert.title}</h4>
                        <p>${alert.message}</p>
                        <span class="alert-time">${this.getTimeAgo(alert.timestamp)}</span>
                        <div class="alert-meta">
                            <span class="alert-location">📍 ${alert.location}</span>
                            <span class="alert-status ${alert.status}">${alert.status}</span>
                        </div>
                    </div>
                    ${alert.action_required ? '<div class="action-required-indicator">⚠️</div>' : ''}
                </div>
            `).join('');
        }
    }
    
    updatePlatformAnalyticsUI() {
        console.log('Platform analytics updated:', this.platformAnalytics);
    }
    
    getTimeAgo(timestamp) {
        const now = new Date();
        const alertTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    }
    
    // Alert Management Methods
    viewAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;
        
        const content = `
            <div class="alert-details-view">
                <div class="alert-header ${alert.type}">
                    <div class="alert-type-icon">
                        ${alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </div>
                    <div class="alert-info">
                        <h3>${alert.title}</h3>
                        <p class="alert-meta-info">
                            ${alert.location} • ${new Date(alert.timestamp).toLocaleString()}
                        </p>
                    </div>
                    <div class="alert-status-badge ${alert.status}">${alert.status}</div>
                </div>
                
                <div class="alert-body">
                    <div class="alert-description">
                        <h4>Description</h4>
                        <p>${alert.message}</p>
                    </div>
                    
                    ${alert.type === 'critical' ? `
                        <div class="alert-recommendations">
                            <h4>Recommended Actions</h4>
                            <ul>
                                <li>Immediately notify relevant health authorities</li>
                                <li>Issue public health advisory for affected area</li>
                                <li>Increase monitoring frequency in surrounding areas</li>
                                <li>Deploy additional medical resources if necessary</li>
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="alert-timeline">
                        <h4>Alert Timeline</h4>
                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <strong>Alert Generated</strong>
                                    <p>${new Date(alert.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            ${alert.status !== 'active' ? `
                                <div class="timeline-item">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <strong>Status: ${alert.status}</strong>
                                        <p>${new Date().toLocaleString()}</p>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="alert-actions">
                    ${alert.status === 'active' ? `
                        <button class="btn btn-warning" onclick="adminManager.acknowledgeAlert('${alert.id}')">Acknowledge</button>
                        <button class="btn btn-success" onclick="adminManager.resolveAlert('${alert.id}')">Resolve</button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="adminManager.exportAlertReport('${alert.id}')">Export Report</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        `;
        
        showModal('Alert Details', content);
    }
    
    acknowledgeAlert(alertId) {
        const alertIndex = this.alerts.findIndex(a => a.id === alertId);
        if (alertIndex > -1) {
            this.alerts[alertIndex].status = 'acknowledged';
            this.alerts[alertIndex].acknowledgedAt = new Date().toISOString();
            this.updateAlertsUI();
            
            if (window.voiceManager) {
                window.voiceManager.speak('Alert acknowledged');
            }
            
            closeModal();
            this.showSuccessNotification('Alert has been acknowledged');
        }
    }
    
    resolveAlert(alertId) {
        const alertIndex = this.alerts.findIndex(a => a.id === alertId);
        if (alertIndex > -1) {
            this.alerts[alertIndex].status = 'resolved';
            this.alerts[alertIndex].resolvedAt = new Date().toISOString();
            this.updateAlertsUI();
            
            if (window.voiceManager) {
                window.voiceManager.speak('Alert resolved');
            }
            
            closeModal();
            this.showSuccessNotification('Alert has been resolved');
        }
    }
    
    exportAlertReport(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;
        
        const reportContent = `
ALERT REPORT
============
ID: ${alert.id}
Type: ${alert.type.toUpperCase()}
Title: ${alert.title}
Location: ${alert.location}
Timestamp: ${new Date(alert.timestamp).toLocaleString()}
Status: ${alert.status}
Message: ${alert.message}

Generated: ${new Date().toLocaleString()}
By: ${this.currentAdmin.name}
        `.trim();
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alert-report-${alert.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showSuccessNotification('Alert report exported successfully');
    }
    
    switchUserTab(tabName) {
        const tabButtons = document.querySelectorAll('.management-tabs .tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });
        
        const tableContainer = document.querySelector('.user-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = this.generateUserTable(tabName);
        }
    }
    
    generateUserTable(tabName) {
        let userData, columns, actions;
        
        switch (tabName) {
            case 'doctors':
                userData = this.users.doctors;
                columns = ['Name', 'Specialization', 'Status', 'Patients', 'Rating', 'Actions'];
                break;
            case 'patients':
                userData = this.users.patients;
                columns = ['Name', 'Age', 'Status', 'Consultations', 'City', 'Actions'];
                break;
            case 'pending':
                userData = this.users.pendingApprovals;
                columns = ['Name', 'Type', 'Specialization', 'Submitted', 'Status', 'Actions'];
                break;
            default:
                userData = this.users.doctors;
                columns = ['Name', 'Specialization', 'Status', 'Patients', 'Rating', 'Actions'];
        }
        
        return `
            <table class="user-table">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${userData.map(user => `
                        <tr>
                            ${this.generateTableRow(user, tabName)}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    generateTableRow(user, tabName) {
        switch (tabName) {
            case 'doctors':
                return `
                    <td>${user.name}</td>
                    <td>${user.specialization}</td>
                    <td><span class="status-badge ${user.status}">${user.status}</span></td>
                    <td>${user.patients}</td>
                    <td>${user.rating} ⭐</td>
                    <td>
                        <button class="btn btn-small btn-outline" onclick="adminManager.viewUserDetails('${user.id}')">View</button>
                        <button class="btn btn-small btn-secondary" onclick="adminManager.messageUser('${user.id}')">Message</button>
                    </td>
                `;
            case 'patients':
                return `
                    <td>${user.name}</td>
                    <td>${user.age}</td>
                    <td><span class="status-badge ${user.status}">${user.status}</span></td>
                    <td>${user.consultations}</td>
                    <td>${user.city}</td>
                    <td>
                        <button class="btn btn-small btn-outline" onclick="adminManager.viewUserDetails('${user.id}')">View</button>
                        <button class="btn btn-small btn-secondary" onclick="adminManager.messageUser('${user.id}')">Message</button>
                    </td>
                `;
            case 'pending':
                return `
                    <td>${user.name}</td>
                    <td>${user.type}</td>
                    <td>${user.specialization || 'N/A'}</td>
                    <td>${new Date(user.submittedDate).toLocaleDateString()}</td>
                    <td><span class="status-badge ${user.status.replace('_', '-')}">${user.status}</span></td>
                    <td>
                        <button class="btn btn-small btn-success" onclick="adminManager.approveUser('${user.id}')">Approve</button>
                        <button class="btn btn-small btn-danger" onclick="adminManager.rejectUser('${user.id}')">Reject</button>
                    </td>
                `;
            default:
                return '<td colspan="6">No data available</td>';
        }
    }
    
    viewUserDetails(userId) {
        // Find user in all categories
        let user = this.users.doctors.find(u => u.id === userId) ||
                  this.users.patients.find(u => u.id === userId) ||
                  this.users.pendingApprovals.find(u => u.id === userId);
        
        if (!user) return;
        
        const content = `
            <div class="user-details">
                <div class="user-header">
                    <h3>👤 ${user.name}</h3>
                    <span class="status-badge ${user.status}">${user.status}</span>
                </div>
                
                <div class="user-info-grid">
                    <div class="info-section">
                        <h4>Basic Information</h4>
                        <div class="info-item">
                            <strong>ID:</strong> ${user.id}
                        </div>
                        <div class="info-item">
                            <strong>Join Date:</strong> ${new Date(user.joinDate).toLocaleDateString()}
                        </div>
                        <div class="info-item">
                            <strong>Last Login:</strong> ${new Date(user.lastLogin).toLocaleString()}
                        </div>
                        ${user.specialization ? `
                            <div class="info-item">
                                <strong>Specialization:</strong> ${user.specialization}
                            </div>
                        ` : ''}
                        ${user.age ? `
                            <div class="info-item">
                                <strong>Age:</strong> ${user.age}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="info-section">
                        <h4>Activity Statistics</h4>
                        ${user.consultations !== undefined ? `
                            <div class="info-item">
                                <strong>Total Consultations:</strong> ${user.consultations}
                            </div>
                        ` : ''}
                        ${user.patients !== undefined ? `
                            <div class="info-item">
                                <strong>Total Patients:</strong> ${user.patients}
                            </div>
                        ` : ''}
                        ${user.rating ? `
                            <div class="info-item">
                                <strong>Rating:</strong> ${user.rating} ⭐
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="user-actions">
                    <button class="btn btn-primary" onclick="adminManager.editUser('${user.id}')">Edit User</button>
                    <button class="btn btn-secondary" onclick="adminManager.messageUser('${user.id}')">Send Message</button>
                    <button class="btn btn-outline" onclick="adminManager.exportUserData('${user.id}')">Export Data</button>
                    ${user.status === 'active' ? 
                        `<button class="btn btn-warning" onclick="adminManager.suspendUser('${user.id}')">Suspend</button>` :
                        `<button class="btn btn-success" onclick="adminManager.activateUser('${user.id}')">Activate</button>`
                    }
                </div>
            </div>
        `;
        
        showModal('User Details', content);
    }
    
    approveUser(userId) {
        const userIndex = this.users.pendingApprovals.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const user = this.users.pendingApprovals[userIndex];
            
            if (user.type === 'doctor') {
                this.users.doctors.push({
                    ...user,
                    status: 'active',
                    patients: 0,
                    rating: 0,
                    consultations: 0,
                    verified: true
                });
            }
            
            this.users.pendingApprovals.splice(userIndex, 1);
            
            this.updateUserManagementUI();
            this.switchUserTab('pending'); 
            
            this.showSuccessNotification(`${user.name} has been approved successfully`);
            
            if (window.voiceManager) {
                window.voiceManager.speak(`User ${user.name} approved successfully`);
            }
        }
    }
    
    rejectUser(userId) {
        const userIndex = this.users.pendingApprovals.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const user = this.users.pendingApprovals[userIndex];
            
            const content = `
                <div class="rejection-form">
                    <h3>Reject User Application</h3>
                    <p>User: <strong>${user.name}</strong></p>
                    
                    <div class="form-group">
                        <label class="form-label">Reason for Rejection</label>
                        <select class="form-select" id="rejection-reason">
                            <option value="incomplete_documents">Incomplete Documents</option>
                            <option value="invalid_credentials">Invalid Credentials</option>
                            <option value="duplicate_application">Duplicate Application</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Additional Comments</label>
                        <textarea class="form-input" id="rejection-comments" rows="4" 
                                  placeholder="Provide additional details about the rejection..."></textarea>
                    </div>
                    
                    <div class="rejection-actions">
                        <button class="btn btn-danger" onclick="adminManager.confirmRejection('${userId}')">Confirm Rejection</button>
                        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    </div>
                </div>
            `;
            
            showModal('Reject User Application', content);
        }
    }
    
    confirmRejection(userId) {
        const reason = document.getElementById('rejection-reason')?.value;
        const comments = document.getElementById('rejection-comments')?.value;
        
        const userIndex = this.users.pendingApprovals.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const user = this.users.pendingApprovals[userIndex];
            
            console.log('User rejected:', {
                userId,
                name: user.name,
                reason,
                comments,
                rejectedAt: new Date().toISOString()
            });
            
            this.users.pendingApprovals.splice(userIndex, 1);
            
            this.switchUserTab('pending');
            
            closeModal();
            this.showSuccessNotification(`Application for ${user.name} has been rejected`);
        }
    }
    
    viewHotspotDetails(location) {
        const hotspot = this.healthData.symptomHotspots.find(h => h.location === location);
        if (!hotspot) return;
        
        const content = `
            <div class="hotspot-details">
                <div class="hotspot-header">
                    <h3>📍 ${hotspot.location} Health Hotspot</h3>
                    <span class="alert-level-badge ${hotspot.alertLevel}">${hotspot.alertLevel} Alert</span>
                </div>
                
                <div class="hotspot-metrics">
                    <div class="metric-card">
                        <div class="metric-value">${hotspot.totalCases}</div>
                        <div class="metric-label">Total Cases</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">+${hotspot.increase}%</div>
                        <div class="metric-label">Increase Rate</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${hotspot.timeframe}</div>
                        <div class="metric-label">Time Frame</div>
                    </div>
                </div>
                
                <div class="hotspot-analysis">
                    <h4>Analysis</h4>
                    <p><strong>Primary Symptoms:</strong> ${hotspot.symptoms}</p>
                    <p><strong>Alert Level:</strong> ${hotspot.alertLevel.toUpperCase()}</p>
                    <p><strong>Trend:</strong> Increasing cases over the last ${hotspot.timeframe}</p>
                </div>
                
                <div class="recommended-actions">
                    <h4>Recommended Actions</h4>
                    <ul>
                        ${hotspot.alertLevel === 'high' ? `
                            <li>Deploy additional medical resources to the area</li>
                            <li>Issue public health advisory</li>
                            <li>Increase monitoring frequency</li>
                        ` : hotspot.alertLevel === 'medium' ? `
                            <li>Monitor closely for escalation</li>
                            <li>Prepare medical resources for deployment</li>
                        ` : `
                            <li>Continue routine monitoring</li>
                            <li>Document trends for analysis</li>
                        `}
                    </ul>
                </div>
                
                <div class="hotspot-actions">
                    <button class="btn btn-primary" onclick="adminManager.generateHotspotReport('${location}')">Generate Report</button>
                    <button class="btn btn-warning" onclick="adminManager.escalateHotspot('${location}')">Escalate Alert</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        `;
        
        showModal('Health Hotspot Details', content);
    }
    
    generateHotspotReport(location) {
        const hotspot = this.healthData.symptomHotspots.find(h => h.location === location);
        if (!hotspot) return;
        
        const reportContent = `
HEALTH HOTSPOT REPORT
====================
Location: ${hotspot.location}
Alert Level: ${hotspot.alertLevel.toUpperCase()}
Primary Symptoms: ${hotspot.symptoms}
Total Cases: ${hotspot.totalCases}
Increase Rate: +${hotspot.increase}%
Time Frame: ${hotspot.timeframe}
Coordinates: ${hotspot.coordinates.lat}, ${hotspot.coordinates.lng}

Report Generated: ${new Date().toLocaleString()}
Generated By: ${this.currentAdmin.name}
        `.trim();
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hotspot-report-${location.replace(/\s+/g, '-').toLowerCase()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showSuccessNotification('Hotspot report generated successfully');
    }
    
    escalateHotspot(location) {
        const hotspot = this.healthData.symptomHotspots.find(h => h.location === location);
        if (!hotspot) return;
        
        const escalationAlert = {
            id: 'alert_escalation_' + Date.now(),
            type: 'critical',
            title: 'Hotspot Escalated',
            message: `Health hotspot in ${location} has been manually escalated to critical status`,
            timestamp: new Date().toISOString(),
            status: 'active',
            location: location,
            action_required: true
        };
        
        this.alerts.unshift(escalationAlert);
        this.updateAlertsUI();
        
        hotspot.alertLevel = 'high';
        this.updateHealthAnalyticsUI();
        
        closeModal();
        this.showSuccessNotification(`Hotspot in ${location} has been escalated to critical status`);
        
        if (window.voiceManager) {
            window.voiceManager.speak(`Health hotspot in ${location} escalated to critical status`);
        }
    }
    
    showSuccessNotification(message) {
        if (window.app && window.app.showSuccessNotification) {
            window.app.showSuccessNotification(message);
        } else {
            console.log('Success:', message);
        }
    }
    
    updateSystemMetrics() {
        this.systemMetrics.serverCpuUsage = Math.max(10, Math.min(95, 
            this.systemMetrics.serverCpuUsage + (Math.random() - 0.5) * 8));
        this.systemMetrics.serverMemoryUsage = Math.max(30, Math.min(90, 
            this.systemMetrics.serverMemoryUsage + (Math.random() - 0.5) * 5));
        this.systemMetrics.networkLatency = Math.max(5, Math.min(100, 
            this.systemMetrics.networkLatency + (Math.random() - 0.5) * 10));
    }
    
    messageUser(userId) { console.log('Messaging user:', userId); }
    editUser(userId) { console.log('Editing user:', userId); }
    exportUserData(userId) { console.log('Exporting user data:', userId); }
    suspendUser(userId) { console.log('Suspending user:', userId); }
    activateUser(userId) { console.log('Activating user:', userId); }
}

const adminManager = new AdminManager();

function showUserTab(tabName) {
    adminManager.switchUserTab(tabName);
}

window.adminManager = adminManager;