/* ============================================
   CÉSAR RAMÍREZ - PORTFOLIO JAVASCRIPT
   Animations, Interactions, and Effects
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============ NAVBAR ============
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ============ SMOOTH SCROLLING ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    function animateCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            };

            updateCounter();
        });
    }

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

    // Hero stats observer
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
            }
        });
    }, observerOptions);

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        heroObserver.observe(heroStats);
    }

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
    const particlesContainer = document.getElementById('particles');
    
    if (particlesContainer) {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
    }

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: var(--accent-primary);
            border-radius: 50%;
            left: ${x}%;
            top: ${y}%;
            opacity: ${Math.random() * 0.5 + 0.1};
            animation: float ${duration}s ${delay}s infinite ease-in-out;
            pointer-events: none;
        `;
        
        particlesContainer.appendChild(particle);
    }

    // Add float animation
    const floatStyle = document.createElement('style');
    floatStyle.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translate(0, 0) rotate(0deg);
            }
            25% {
                transform: translate(10px, -20px) rotate(90deg);
            }
            50% {
                transform: translate(-5px, -40px) rotate(180deg);
            }
            75% {
                transform: translate(-15px, -20px) rotate(270deg);
            }
        }
    `;
    document.head.appendChild(floatStyle);

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
    const cards = document.querySelectorAll('.project-card, .skill-category, .education-card, .timeline-content');

    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Add glow effect styles
    const glowStyle = document.createElement('style');
    glowStyle.textContent = `
        .project-card::before,
        .skill-category::before,
        .education-card::before,
        .timeline-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(
                600px circle at var(--mouse-x) var(--mouse-y),
                rgba(0, 240, 255, 0.06),
                transparent 40%
            );
            pointer-events: none;
            z-index: 1;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .project-card:hover::before,
        .skill-category:hover::before,
        .education-card:hover::before,
        .timeline-content:hover::before {
            opacity: 1;
        }
        
        .project-card,
        .skill-category,
        .education-card,
        .timeline-content {
            position: relative;
        }
    `;
    document.head.appendChild(glowStyle);

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
