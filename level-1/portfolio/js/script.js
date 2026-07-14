document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link, .btn-resume');

    // Toggle menu visibility
    const toggleMenu = () => {
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent scrolling of content background when mobile menu is open
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    };

    // Close menu
    const closeMenu = () => {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Toggle click binding
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }

    // Bind link clicks to close the drawer
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on click outside the navigation drawer
    document.addEventListener('click', (event) => {
        const isClickInsideNav = navMenu && navMenu.contains(event.target);
        const isClickOnHamburger = hamburgerBtn && hamburgerBtn.contains(event.target);
        
        if (navMenu && navMenu.classList.contains('active') && !isClickInsideNav && !isClickOnHamburger) {
            closeMenu();
        }
    });

    // --- Footer: dynamic copyright year ---
    const yearEl = document.getElementById('footer-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- Contact Form: client-side validation & success feedback ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const submitBtn = document.getElementById('contact-submit');
        const successMsg = document.getElementById('form-success');

        /**
         * Validate a single field and display/clear its error message.
         * Returns true when the field is valid.
         */
        const validateField = (field) => {
            const errorEl = field.closest('.form-group').querySelector('.form-error');
            let message = '';

            if (field.validity.valueMissing) {
                message = `${field.labels[0]?.textContent.replace('*', '').trim() || 'This field'} is required.`;
            } else if (field.validity.typeMismatch && field.type === 'email') {
                message = 'Please enter a valid email address.';
            } else if (field.validity.tooShort) {
                message = `Must be at least ${field.minLength} characters.`;
            }

            field.classList.toggle('is-invalid', !!message);
            if (errorEl) errorEl.textContent = message;
            return !message;
        };

        // Live validation on blur (after first interaction)
        contactForm.querySelectorAll('.form-control').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('is-invalid')) validateField(field);
            });
        });

        // Form submit handler
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fields = [...contactForm.querySelectorAll('.form-control')];
            const allValid = fields.map(validateField).every(Boolean);

            if (!allValid) return;

            // Simulate send (no backend)
            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').textContent = 'Sending…';

            setTimeout(() => {
                contactForm.reset();
                fields.forEach(f => {
                    f.classList.remove('is-invalid');
                    const errEl = f.closest('.form-group').querySelector('.form-error');
                    if (errEl) errEl.textContent = '';
                });

                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').textContent = 'Send Message';

                successMsg.removeAttribute('hidden');

                // Auto-hide success message after 6 seconds
                setTimeout(() => successMsg.setAttribute('hidden', ''), 6000);
            }, 1200);
        });
    }
});
