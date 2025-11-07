// Dashboard JavaScript

const AUTH_SERVICE_URL = 'https://auth.lunaos.ai';
let currentAPIKey = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardContent = document.getElementById('dashboard-content');
const authForm = document.getElementById('auth-form');
const apiKeyInput = document.getElementById('api-key-input');
const logoutBtn = document.getElementById('logout-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if API key is stored
    const storedKey = localStorage.getItem('luna_api_key');
    if (storedKey) {
        validateAndLoadDashboard(storedKey);
    }

    // Setup event listeners
    setupEventListeners();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Auth form
    authForm.addEventListener('submit', handleAuth);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Copy API key
    document.getElementById('copy-key-btn').addEventListener('click', copyAPIKey);

    // Toggle API key visibility
    document.getElementById('toggle-key-btn').addEventListener('click', toggleAPIKeyVisibility);

    // Copy config buttons
    document.querySelectorAll('.copy-config-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const config = e.target.dataset.config;
            copyConfiguration(config);
        });
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
}

/**
 * Handle authentication
 */
async function handleAuth(e) {
    e.preventDefault();
    
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey.startsWith('luna_')) {
        showError('Invalid API key format. Key should start with "luna_"');
        return;
    }

    await validateAndLoadDashboard(apiKey);
}

/**
 * Validate API key and load dashboard
 */
async function validateAndLoadDashboard(apiKey) {
    try {
        showLoading();

        // Validate API key
        const response = await fetch(`${AUTH_SERVICE_URL}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey }),
        });

        const data = await response.json();

        if (!data.valid) {
            showError(data.error || 'Invalid API key');
            hideLoading();
            return;
        }

        // Store API key
        currentAPIKey = apiKey;
        localStorage.setItem('luna_api_key', apiKey);

        // Load dashboard data
        await loadDashboard(data);

        // Show dashboard
        authSection.style.display = 'none';
        dashboardContent.style.display = 'block';
        hideLoading();

    } catch (error) {
        console.error('Auth error:', error);
        showError('Failed to connect to authentication service');
        hideLoading();
    }
}

/**
 * Load dashboard data
 */
async function loadDashboard(validationData) {
    // Update subscription info
    document.getElementById('plan-tier').textContent = validationData.tier.toUpperCase();
    document.getElementById('customer-id').textContent = validationData.customerId;
    document.getElementById('status-text').textContent = 'Active';
    
    // Update API key display
    updateAPIKeyDisplay(currentAPIKey);

    // Update features
    updateFeatures(validationData.features);

    // Load usage statistics
    await loadUsageStats();
}

/**
 * Load usage statistics
 */
async function loadUsageStats() {
    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/usage`, {
            headers: {
                'Authorization': `Bearer ${currentAPIKey}`,
            },
        });

        const data = await response.json();

        // Update queries
        updateUsageStat('queries', data.usage.queries, data.limits.queries);

        // Update files
        updateUsageStat('files', data.usage.filesIndexed, data.limits.filesIndexed);

        // Update screenshots
        updateUsageStat('screenshots', data.usage.screenshotsAnalyzed || 0, data.limits.screenshotsAnalyzed);

        // Update reset date
        const resetDate = new Date(data.resetDate);
        document.getElementById('reset-date').textContent = formatResetDate(resetDate);

    } catch (error) {
        console.error('Failed to load usage stats:', error);
    }
}

/**
 * Update usage statistic
 */
function updateUsageStat(type, used, limit) {
    const usedEl = document.getElementById(`${type}-used`);
    const limitEl = document.getElementById(`${type}-limit`);
    const progressEl = document.getElementById(`${type}-progress`);

    usedEl.textContent = used;
    limitEl.textContent = limit === -1 ? 'Unlimited' : limit;

    if (limit === -1) {
        progressEl.style.width = '0%';
    } else {
        const percentage = (used / limit) * 100;
        progressEl.style.width = `${Math.min(percentage, 100)}%`;
        
        // Color based on usage
        if (percentage > 90) {
            progressEl.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        } else if (percentage > 70) {
            progressEl.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        }
    }
}

/**
 * Update features display
 */
function updateFeatures(features) {
    const featureMap = {
        'feature-vision-rag': features.lunaVisionRAG,
        'feature-unlimited-indexing': features.unlimitedIndexing,
        'feature-unlimited-queries': features.unlimitedQueries,
        'feature-priority-support': features.prioritySupport,
    };

    Object.entries(featureMap).forEach(([id, enabled]) => {
        const el = document.getElementById(id);
        const icon = el.querySelector('.feature-icon');
        
        if (enabled) {
            icon.textContent = '✅';
            el.classList.add('enabled');
        } else {
            icon.textContent = '❌';
            el.classList.remove('enabled');
        }
    });
}

/**
 * Update API key display
 */
function updateAPIKeyDisplay(apiKey) {
    document.getElementById('api-key-display').textContent = maskAPIKey(apiKey);
    document.getElementById('claude-api-key').textContent = apiKey;
    document.getElementById('zed-api-key').textContent = apiKey;
}

/**
 * Mask API key
 */
function maskAPIKey(apiKey) {
    return apiKey.substring(0, 5) + '•'.repeat(apiKey.length - 5);
}

/**
 * Toggle API key visibility
 */
function toggleAPIKeyVisibility() {
    const display = document.getElementById('api-key-display');
    const btn = document.getElementById('toggle-key-btn');
    
    if (display.textContent.includes('•')) {
        display.textContent = currentAPIKey;
        btn.textContent = 'Hide';
    } else {
        display.textContent = maskAPIKey(currentAPIKey);
        btn.textContent = 'Show';
    }
}

/**
 * Copy API key
 */
function copyAPIKey() {
    navigator.clipboard.writeText(currentAPIKey);
    showSuccess('API key copied to clipboard!');
}

/**
 * Copy configuration
 */
function copyConfiguration(type) {
    const tabContent = document.getElementById(`${type}-tab`);
    const code = tabContent.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code);
    showSuccess('Configuration copied to clipboard!');
}

/**
 * Switch tab
 */
function switchTab(tab) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tab}-tab`);
    });
}

/**
 * Handle logout
 */
function handleLogout() {
    localStorage.removeItem('luna_api_key');
    currentAPIKey = null;
    
    authSection.style.display = 'block';
    dashboardContent.style.display = 'none';
    apiKeyInput.value = '';
}

/**
 * Format reset date
 */
function formatResetDate(date) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Show error message
 */
function showError(message) {
    // Simple alert for now - can be replaced with a nicer UI
    alert(message);
}

/**
 * Show success message
 */
function showSuccess(message) {
    // Simple alert for now - can be replaced with a nicer UI
    alert(message);
}

/**
 * Show loading state
 */
function showLoading() {
    const btn = authForm.querySelector('button[type="submit"]');
    btn.textContent = 'Loading...';
    btn.disabled = true;
}

/**
 * Hide loading state
 */
function hideLoading() {
    const btn = authForm.querySelector('button[type="submit"]');
    btn.textContent = 'Access Dashboard';
    btn.disabled = false;
}
