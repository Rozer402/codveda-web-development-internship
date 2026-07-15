document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation ---
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navMenu      = document.querySelector('.nav-menu');
    const navLinks     = document.querySelectorAll('.nav-link, .btn-resume');

    const toggleMenu = () => {
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', String(!isExpanded));
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    };

    const closeMenu = () => {
        if (!navMenu.classList.contains('active')) return; // guard: skip if already closed
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', toggleMenu);

        // Close when a nav link is clicked
        navLinks.forEach(link => link.addEventListener('click', closeMenu));

        // Close on outside click — only fires when menu is open (guarded in closeMenu)
        document.addEventListener('click', ({ target }) => {
            if (!navMenu.classList.contains('active')) return;
            if (!navMenu.contains(target) && !hamburgerBtn.contains(target)) {
                closeMenu();
            }
        });
    }

    // --- Footer: dynamic copyright year ---
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Contact Form: client-side validation & success feedback ---
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const submitBtn  = document.getElementById('contact-submit');
    const successMsg = document.getElementById('form-success');

    /**
     * Validate a single field and display/clear its inline error.
     * Returns true when the field is valid.
     */
    const validateField = (field) => {
        const errorEl = field.closest('.form-group')?.querySelector('.form-error');
        let message   = '';

        if (field.validity.valueMissing) {
            const labelText = field.labels[0]?.textContent.replace('*', '').trim() ?? 'This field';
            message = `${labelText} is required.`;
        } else if (field.validity.typeMismatch && field.type === 'email') {
            message = 'Please enter a valid email address.';
        } else if (field.validity.tooShort) {
            message = `Must be at least ${field.minLength} characters.`;
        }

        field.classList.toggle('is-invalid', !!message);
        if (errorEl) errorEl.textContent = message;
        return !message;
    };

    // Live validation: validate on blur; re-validate on input only if already invalid
    contactForm.querySelectorAll('.form-control').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.classList.contains('is-invalid')) validateField(field);
        });
    });

    // Submit handler
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fields   = [...contactForm.querySelectorAll('.form-control')];
        const allValid = fields.map(validateField).every(Boolean);
        if (!allValid) return;

        // Simulate send (no backend)
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = 'Sending…';

        setTimeout(() => {
            // Reset form state
            contactForm.reset();
            fields.forEach(f => {
                f.classList.remove('is-invalid');
                const errEl = f.closest('.form-group')?.querySelector('.form-error');
                if (errEl) errEl.textContent = '';
            });

            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'Send Message';

            successMsg.removeAttribute('hidden');
            setTimeout(() => successMsg.setAttribute('hidden', ''), 6000);
        }, 1200);
    });
});
