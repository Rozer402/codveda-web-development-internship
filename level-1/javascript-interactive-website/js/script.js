/**
 * Professional Interactive Website - Main Script
 * Contains modular ES6 functions for all interactive elements.
 * Initialized on DOMContentLoaded.
 */

// ==========================================================================
// 1. MOBILE NAVIGATION & 10. SMOOTH SCROLL NAVIGATION
// ==========================================================================
const initNavigation = () => {
    try {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        const navLinks = document.querySelectorAll('.nav__link');
        const header = document.getElementById('header');

        // Toggle Menu
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('show-menu');
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
            });
        }

        // Close Menu when clicking a link and handle active states
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Close menu
                if (navMenu && navMenu.classList.contains('show-menu')) {
                    navMenu.classList.remove('show-menu');
                    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
                }
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active-link'));
                link.classList.add('active-link');
            });
        });

        // Header shadow on scroll
        const scrollHeader = () => {
            if (window.scrollY >= 50) {
                header.classList.add('scroll-header');
            } else {
                header.classList.remove('scroll-header');
            }
        };
        window.addEventListener('scroll', scrollHeader, { passive: true });
    } catch (error) {
        console.error('Error initializing Navigation:', error);
    }
};

// ==========================================================================
// 2. THEME TOGGLE & 3. LOCALSTORAGE PERSISTENCE
// ==========================================================================
const initThemeToggle = () => {
    try {
        const themeButton = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        if (!themeButton || !themeIcon) return;

        const darkTheme = 'dark-theme';
        const iconTheme = 'fa-sun'; // Toggles from moon to sun

        // Previously selected theme (if user selected)
        const selectedTheme = localStorage.getItem('selected-theme');

        // Get current theme state
        const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
        
        // Validate and apply saved theme
        if (selectedTheme) {
            document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
            if (selectedTheme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }

        // Activate / deactivate the theme manually with the button
        themeButton.addEventListener('click', () => {
            document.body.classList.toggle(darkTheme);
            
            if (document.body.classList.contains(darkTheme)) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            
            // Save theme preference to local storage
            localStorage.setItem('selected-theme', getCurrentTheme());
        });
    } catch (error) {
        console.error('Error initializing Theme Toggle:', error);
    }
};

// ==========================================================================
// 4. IMAGE SLIDER (Gallery)
// ==========================================================================
const initImageSlider = () => {
    try {
        const track = document.getElementById('slider-track');
        if (!track) return;
        
        const slides = Array.from(track.children);
        const nextButton = document.getElementById('slider-next');
        const prevButton = document.getElementById('slider-prev');
        const dotsContainer = document.getElementById('slider-dots');
        
        if (!slides.length || !nextButton || !prevButton || !dotsContainer) return;

        let currentIndex = 0;

        // Create dots dynamically
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer.children);

        const updateSlider = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');
        };

        const goToSlide = (index) => {
            currentIndex = index;
            updateSlider();
        };

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        });

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        });
    } catch (error) {
        console.error('Error initializing Image Slider:', error);
    }
};

// ==========================================================================
// 5. TESTIMONIAL CAROUSEL
// ==========================================================================
const initTestimonialCarousel = () => {
    try {
        const track = document.getElementById('testimonials-track');
        if (!track) return;

        const slides = Array.from(track.children);
        const nextBtn = document.getElementById('carousel-next');
        const prevBtn = document.getElementById('carousel-prev');
        const indicators = document.getElementById('carousel-indicators');
        
        if (!slides.length || !nextBtn || !prevBtn || !indicators) return;

        let currentIndex = 0;

        // Setup indicators dynamically
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot'); // Reuse dot styling from slider
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(dot);
        });

        const dots = Array.from(indicators.children);

        const updateCarousel = () => {
            // Determine percentage based on items visible (css defines min-width for slides)
            const slideWidth = 100 / (window.innerWidth >= 1200 ? 3 : window.innerWidth >= 992 ? 2 : 1);
            
            // Adjust translation based on current index and slide width
            track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
            
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');
        };

        const goToSlide = (index) => {
            currentIndex = index;
            updateCarousel();
        };

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        });

        // Update layout on resize
        window.addEventListener('resize', updateCarousel, { passive: true });
    } catch (error) {
        console.error('Error initializing Testimonial Carousel:', error);
    }
};

// ==========================================================================
// 6. FAQ ACCORDION
// ==========================================================================
const initFaqAccordion = () => {
    try {
        const accordionItems = document.querySelectorAll('.accordion__item');

        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion__header');
            const content = item.querySelector('.accordion__content');

            if (!header || !content) return;

            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                
                // Close all other items
                accordionItems.forEach(acc => {
                    acc.classList.remove('active');
                    const accContent = acc.querySelector('.accordion__content');
                    if (accContent) accContent.style.maxHeight = null;
                    const accHeader = acc.querySelector('.accordion__header');
                    if (accHeader) accHeader.setAttribute('aria-expanded', 'false');
                });

                if (!isOpen) {
                    item.classList.add('active');
                    header.setAttribute('aria-expanded', 'true');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
    } catch (error) {
        console.error('Error initializing FAQ Accordion:', error);
    }
};

// ==========================================================================
// 7. ANIMATED COUNTERS & 12. FADE-IN ON SCROLL (IntersectionObserver)
// ==========================================================================
const initScrollAnimations = () => {
    try {
        // --- 7. Animated Counters ---
        const counters = document.querySelectorAll('.stat__number');
        
        const animateCounter = (counter) => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // Total animation duration in ms
            const stepTime = Math.abs(Math.floor(duration / target));
            
            let current = 0;
            const timer = setInterval(() => {
                current += Math.ceil(target / 100) || 1; // Increment step
                if (current >= target) {
                    counter.innerText = target;
                    clearInterval(timer);
                } else {
                    counter.innerText = current;
                }
            }, stepTime);
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));

        // --- 12. Fade-in on Scroll ---
        const sections = document.querySelectorAll('.section');
        
        // Initial setup for fade animation
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        });

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => sectionObserver.observe(section));

    } catch (error) {
        console.error('Error initializing Scroll Animations:', error);
    }
};

// ==========================================================================
// 8. SCROLL PROGRESS BAR
// ==========================================================================
const initScrollProgress = () => {
    try {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        const updateProgress = () => {
            const scrollTotal = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTotal / height) * 100;
            progressBar.style.width = `${scrolled}%`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
    } catch (error) {
        console.error('Error initializing Scroll Progress Bar:', error);
    }
};

// ==========================================================================
// 9. BACK TO TOP BUTTON
// ==========================================================================
const initBackToTop = () => {
    try {
        const scrollUp = document.getElementById('scroll-up');
        if (!scrollUp) return;

        const toggleScrollUp = () => {
            if (window.scrollY >= 400) {
                scrollUp.classList.add('show-scroll');
            } else {
                scrollUp.classList.remove('show-scroll');
            }
        };

        window.addEventListener('scroll', toggleScrollUp, { passive: true });
        
        scrollUp.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } catch (error) {
        console.error('Error initializing Back To Top Button:', error);
    }
};

// ==========================================================================
// 11. CONTACT FORM VALIDATION
// ==========================================================================
const initFormValidation = () => {
    try {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const showError = (input, message) => {
            const errorElement = document.getElementById(`${input.id}-error`);
            if (errorElement) {
                errorElement.innerText = message;
                input.style.borderColor = '#ff5b5b'; // Highlight error field
            }
        };

        const clearError = (input) => {
            const errorElement = document.getElementById(`${input.id}-error`);
            if (errorElement) {
                errorElement.innerText = '';
                input.style.borderColor = ''; // Reverts to CSS default
            }
        };

        const isValidEmail = (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');

            // Name validation
            if (name.value.trim() === '') {
                showError(name, 'Name is required');
                isValid = false;
            } else {
                clearError(name);
            }

            // Email validation
            if (email.value.trim() === '') {
                showError(email, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email.value.trim())) {
                showError(email, 'Please enter a valid email');
                isValid = false;
            } else {
                clearError(email);
            }

            // Subject validation
            if (subject.value.trim() === '') {
                showError(subject, 'Subject is required');
                isValid = false;
            } else {
                clearError(subject);
            }

            // Message validation
            if (message.value.trim() === '') {
                showError(message, 'Message is required');
                isValid = false;
            } else {
                clearError(message);
            }

            // Simulate Form Submission if Valid
            if (isValid) {
                const btn = document.getElementById('submit-btn');
                const originalText = btn.innerHTML;
                
                // Show loading state
                btn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
                
                setTimeout(() => {
                    // Show success state
                    btn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-check"></i>';
                    btn.style.background = '#4CAF50';
                    form.reset();
                    
                    // Revert back to original state
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = ''; // Revert to CSS
                    }, 3000);
                }, 1500);
            }
        });

        // Clear error as user types
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => clearError(input));
        });

    } catch (error) {
        console.error('Error initializing Form Validation:', error);
    }
};

// ==========================================================================
// 13. LOADING ANIMATION
// ==========================================================================
const initLoadingAnimation = () => {
    try {
        // Simple loading simulation by initially hiding the body, 
        // then fading it in when fully loaded.
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.6s ease-in-out';
        
        window.addEventListener('load', () => {
            document.body.style.opacity = '1';
        });
    } catch (error) {
        console.error('Error initializing Loading Animation:', error);
    }
};

// ==========================================================================
// INITIALIZATION ON DOM LOAD
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initLoadingAnimation();
    initNavigation();
    initThemeToggle();
    initImageSlider();
    initTestimonialCarousel();
    initFaqAccordion();
    initScrollAnimations();
    initScrollProgress();
    initBackToTop();
    initFormValidation();
});
