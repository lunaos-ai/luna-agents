// Pricing page JavaScript

// Billing toggle (Monthly/Annual)
const billingToggle = document.getElementById('billingToggle');
const monthlyPrices = document.querySelectorAll('.monthly-price');
const annualPrices = document.querySelectorAll('.annual-price');

if (billingToggle) {
    billingToggle.addEventListener('change', function() {
        if (this.checked) {
            // Show annual prices
            monthlyPrices.forEach(price => price.style.display = 'none');
            annualPrices.forEach(price => price.style.display = 'inline');
        } else {
            // Show monthly prices
            monthlyPrices.forEach(price => price.style.display = 'inline');
            annualPrices.forEach(price => price.style.display = 'none');
        }
    });
}

// LemonSqueezy integration
// Replace these with your actual LemonSqueezy product IDs
const LEMONSQUEEZY_CONFIG = {
    pro: {
        monthly: 'YOUR_PRO_MONTHLY_PRODUCT_ID',
        annual: 'YOUR_PRO_ANNUAL_PRODUCT_ID'
    }
};

// Handle LemonSqueezy button clicks
document.querySelectorAll('.lemonsqueezy-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const plan = this.dataset.plan;
        const isAnnual = billingToggle && billingToggle.checked;
        const productId = isAnnual ? 
            LEMONSQUEEZY_CONFIG[plan].annual : 
            LEMONSQUEEZY_CONFIG[plan].monthly;
        
        // Open LemonSqueezy checkout
        if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
            window.LemonSqueezy.Url.Open(productId);
        } else {
            // Fallback: redirect to pricing page
            window.location.href = `https://lunaagents.lemonsqueezy.com/checkout/buy/${productId}`;
        }
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active state to nav on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(10, 10, 15, 0.95)';
        nav.style.backdropFilter = 'blur(10px)';
    } else {
        nav.style.background = 'rgba(10, 10, 15, 0.8)';
    }
});
