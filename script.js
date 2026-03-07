/* ============================================
   CÉSAR RAMÍREZ - PORTFOLIO JAVASCRIPT
   Animations, Interactions, and Effects
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ============ NAVBAR ============
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ============ SMOOTH SCROLLING ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============ ANIMATED COUNTERS ============
    // (Handled by effects.js terminal-style counters)


    // ============ SKILL BARS ANIMATION ============
    const skillBars = document.querySelectorAll('.skill-progress');
    let skillsAnimated = false;

    function animateSkillBars() {
        skillBars.forEach(bar => {
            const level = bar.getAttribute('data-level');
            bar.style.width = level + '%';
        });
    }

    // ============ INTERSECTION OBSERVER ============
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };



    // Skills section observer
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !skillsAnimated) {
                skillsAnimated = true;
                setTimeout(animateSkillBars, 300);
            }
        });
    }, observerOptions);

    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }

    // ============ SCROLL REVEAL ANIMATION ============
    const revealElements = document.querySelectorAll(
        '.timeline-item, .project-card, .skill-category, .education-card, .contact-card'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });

    // Add revealed class styles
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // ============ PARTICLES EFFECT ============
    // (Handled by effects.js network canvas)


    // ============ ACTIVE NAV LINK ON SCROLL ============
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // Add active link styles
    const activeStyle = document.createElement('style');
    activeStyle.textContent = `
        .nav-link.active {
            color: var(--accent-primary);
        }
        .nav-link.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(activeStyle);

    // ============ TYPING EFFECT FOR TAGLINE ============
    const tagline = document.querySelector('.hero-tagline');

    if (tagline) {
        const originalText = tagline.textContent;
        tagline.textContent = '';
        tagline.style.opacity = '1';

        let charIndex = 0;

        function typeWriter() {
            if (charIndex < originalText.length) {
                tagline.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 50);
            }
        }

        // Start typing after hero animations
        setTimeout(typeWriter, 1500);
    }

    // ============ GLOW EFFECT ON MOUSE MOVE ============
    // (Handled by effects.js 3D card tilt)


    // ============ CONSOLE EASTER EGG ============
    console.log(`
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║   🤖 CÉSAR JAVIER RAMÍREZ HORMAZA                       ║
    ║   Ingeniero Mecatrónico | Robótica & Automatización      ║
    ║                                                          ║
    ║   ¿Interesado en colaborar?                              ║
    ║   📧 Ramirezcesarj46@gmail.com                           ║
    ║   💬 WhatsApp: +57 321 9121216                           ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    `);

});
