/**
 * Professional Interactive Website - Main Script
 * Contains modular ES6 functions for all interactive elements.
 * Initialized on DOMContentLoaded.
 */

// ==========================================================================
// 1. MOBILE NAVIGATION & SMOOTH SCROLL NAVIGATION
// ==========================================================================
const initNavigation = () => {
    try {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        const navLinks = document.querySelectorAll('.nav__link');
        const header = document.getElementById('header');

        const closeMenu = () => {
            if (navMenu && navMenu.classList.contains('show-menu')) {
                navMenu.classList.remove('show-menu');
                if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        };

        const openMenu = () => {
            if (navMenu) {
                navMenu.classList.add('show-menu');
                if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        };

        // Toggle Menu
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (navMenu.classList.contains('show-menu')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });
        }

        // Close Menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navMenu.classList.contains('show-menu') && navToggle) {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    closeMenu();
                }
            }
        });

        // Close Menu when clicking a link and handle active states
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active-link'));
                link.classList.add('active-link');
            });
        });

        // Header shadow on scroll (Throttled with requestAnimationFrame for performance)
        let ticking = false;
        const scrollHeader = () => {
            if (window.scrollY >= 50) {
                header.classList.add('scroll-header');
            } else {
                header.classList.remove('scroll-header');
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(scrollHeader);
                ticking = true;
            }
        }, { passive: true });
    } catch (error) {
        console.error('Error initializing Navigation:', error);
    }
};

// ==========================================================================
// 2. THEME TOGGLE & LOCALSTORAGE PERSISTENCE
// ==========================================================================
const initThemeToggle = () => {
    try {
        const themeButton = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        if (!themeButton || !themeIcon) return;

        const darkTheme = 'dark-theme';
        
        const selectedTheme = localStorage.getItem('selected-theme');
        const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
        
        if (selectedTheme) {
            document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
            if (selectedTheme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }

        themeButton.addEventListener('click', () => {
            document.body.classList.toggle(darkTheme);
            
            if (document.body.classList.contains(darkTheme)) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            
            localStorage.setItem('selected-theme', getCurrentTheme());
        });
    } catch (error) {
        console.error('Error initializing Theme Toggle:', error);
    }
};

// ==========================================================================
// 3. IMAGE SLIDER (Gallery)
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

        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
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
// 4. TESTIMONIAL CAROUSEL
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

        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(dot);
        });

        const dots = Array.from(indicators.children);

        const updateCarousel = () => {
            const slideWidth = 100 / (window.innerWidth >= 1200 ? 3 : window.innerWidth >= 992 ? 2 : 1);
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

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateCarousel, 100);
        }, { passive: true });
    } catch (error) {
        console.error('Error initializing Testimonial Carousel:', error);
    }
};

// ==========================================================================
// 5. FAQ ACCORDION
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
// 6. ANIMATED COUNTERS & FADE-IN ON SCROLL
// ==========================================================================
const initScrollAnimations = () => {
    try {
        const counters = document.querySelectorAll('.stat__number');
        
        const animateCounter = (counter) => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000;
            const stepTime = Math.abs(Math.floor(duration / target)) || 10;
            
            let current = 0;
            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime)) || 1;
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

        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            section.style.willChange = 'opacity, transform';
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
// 7. SCROLL PROGRESS BAR
// ==========================================================================
const initScrollProgress = () => {
    try {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;
        
        let ticking = false;

        const updateProgress = () => {
            const scrollTotal = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTotal / height) * 100;
            progressBar.style.width = `${scrolled}%`;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });
    } catch (error) {
        console.error('Error initializing Scroll Progress Bar:', error);
    }
};

// ==========================================================================
// 8. BACK TO TOP BUTTON
// ==========================================================================
const initBackToTop = () => {
    try {
        const scrollUp = document.getElementById('scroll-up');
        if (!scrollUp) return;

        let ticking = false;

        const toggleScrollUp = () => {
            if (window.scrollY >= 400) {
                scrollUp.classList.add('show-scroll');
            } else {
                scrollUp.classList.remove('show-scroll');
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(toggleScrollUp);
                ticking = true;
            }
        }, { passive: true });
        
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
// 9. CONTACT FORM VALIDATION
// ==========================================================================
const initFormValidation = () => {
    try {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const showError = (input, message) => {
            const errorElement = document.getElementById(`${input.id}-error`);
            if (errorElement) {
                errorElement.innerText = message;
                input.style.borderColor = '#ff5b5b';
                input.setAttribute('aria-invalid', 'true');
            }
        };

        const clearError = (input) => {
            const errorElement = document.getElementById(`${input.id}-error`);
            if (errorElement) {
                errorElement.innerText = '';
                input.style.borderColor = ''; 
                input.removeAttribute('aria-invalid');
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

            if (name.value.trim() === '') {
                showError(name, 'Name is required');
                isValid = false;
            } else {
                clearError(name);
            }

            if (email.value.trim() === '') {
                showError(email, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email.value.trim())) {
                showError(email, 'Please enter a valid email');
                isValid = false;
            } else {
                clearError(email);
            }

            if (subject.value.trim() === '') {
                showError(subject, 'Subject is required');
                isValid = false;
            } else {
                clearError(subject);
            }

            if (message.value.trim() === '') {
                showError(message, 'Message is required');
                isValid = false;
            } else {
                clearError(message);
            }

            if (isValid) {
                const btn = document.getElementById('submit-btn');
                const originalText = btn.innerHTML;
                
                btn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-check"></i>';
                    btn.style.background = '#4CAF50';
                    form.reset();
                    
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                }, 1500);
            }
        });

        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => clearError(input));
        });

    } catch (error) {
        console.error('Error initializing Form Validation:', error);
    }
};

// ==========================================================================
// 10. DYNAMIC FOOTER YEAR
// ==========================================================================
const initFooterYear = () => {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
};

// ==========================================================================
// INITIALIZATION ON DOM LOAD
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initImageSlider();
    initTestimonialCarousel();
    initFaqAccordion();
    initScrollAnimations();
    initScrollProgress();
    initBackToTop();
    initFormValidation();
    initFooterYear();
});
