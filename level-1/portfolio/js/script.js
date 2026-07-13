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
});
