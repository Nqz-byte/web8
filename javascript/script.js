
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.querySelector('#siteHeader');
    const menuToggle = document.querySelector('#menuToggle');
    const primaryNavigation = document.querySelector('#primaryNavigation');

    const heroSlides = document.querySelector('#heroSlides');
    const heroPrev = document.querySelector('#heroPrev');
    const heroNext = document.querySelector('#heroNext');
    const heroPause = document.querySelector('#heroPause');

    const applicationList = document.querySelector('#applicationList');
    const applicationImage = document.querySelector('#applicationImage');

    const enquiryForm = document.querySelector('#enquiryForm');
    const formFeedback = document.querySelector('#formFeedback');

    const backToTop = document.querySelector('#backToTop');

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    /* 01. MOBILE NAVIGATION */

    if (menuToggle && primaryNavigation) {
        menuToggle.addEventListener('click', () => {
            const isOpen = primaryNavigation.classList.toggle('is-open');

            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute(
                'aria-label',
                isOpen ? 'Close navigation menu' : 'Open navigation menu'
            );
        });

        primaryNavigation.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', () => {
                primaryNavigation.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Open navigation menu');
            });
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                primaryNavigation.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Open navigation menu');
            }
        });

        document.addEventListener('click', event => {
            if (
                primaryNavigation.classList.contains('is-open') &&
                !primaryNavigation.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                primaryNavigation.classList.remove('is-open');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Open navigation menu');
            }
        });
    }

    /* 02. STICKY HEADER */

    let ticking = false;

    function updateScrollState() {
        const scrollPosition = window.scrollY;

        if (siteHeader) {
            siteHeader.classList.toggle(
                'is-scrolled',
                scrollPosition > 40
            );
        }

        if (backToTop) {
            backToTop.classList.toggle(
                'is-visible',
                scrollPosition > 500
            );
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }, { passive: true });

    updateScrollState();

    /* 03 & 04. HERO AUTOMATIC SLIDESHOW + MANUAL CONTROLS */

    if (heroSlides) {
        const slides = Array.from(
            heroSlides.querySelectorAll('.hero-slide')
        );

        let currentSlide = Math.max(
            0,
            slides.findIndex(slide => slide.classList.contains('is-active'))
        );

        let slideInterval = null;
        let isPaused = reducedMotion.matches;
        const slideDelay = 6000;

        function showSlide(index) {
            if (!slides.length) return;

            currentSlide = (index + slides.length) % slides.length;

            slides.forEach((slide, i) => {
                const isActive = i === currentSlide;

                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', String(!isActive));
                slide.inert = !isActive;
            });

            const counter = document.querySelector('#heroCounter');

            if (counter) {
                counter.textContent =
                    `${String(currentSlide + 1).padStart(2, '0')} / ` +
                    `${String(slides.length).padStart(2, '0')}`;
            }
        }

        function stopSlideshow() {
            if (slideInterval !== null) {
                window.clearInterval(slideInterval);
                slideInterval = null;
            }
        }

        function startSlideshow() {
            stopSlideshow();

            if (slides.length < 2 || isPaused || document.hidden) {
                return;
            }

            slideInterval = window.setInterval(() => {
                showSlide(currentSlide + 1);
            }, slideDelay);
        }

        if (slides.length) {
            showSlide(currentSlide);
            startSlideshow();
        }

        if (heroPrev) {
            heroPrev.addEventListener('click', () => {
                showSlide(currentSlide - 1);
                startSlideshow();
            });
        }

        if (heroNext) {
            heroNext.addEventListener('click', () => {
                showSlide(currentSlide + 1);
                startSlideshow();
            });
        }

        if (heroPause) {
            function updatePauseButton() {
                heroPause.setAttribute('aria-pressed', String(isPaused));
                heroPause.setAttribute(
                    'aria-label',
                    isPaused ? 'Play slideshow' : 'Pause slideshow'
                );

                const label = heroPause.querySelector('[data-pause-label]');

                if (label) {
                    label.textContent = isPaused ? 'Play' : 'Pause';
                }
            }

            updatePauseButton();

            heroPause.addEventListener('click', () => {
                isPaused = !isPaused;
                updatePauseButton();

                if (isPaused) {
                    stopSlideshow();
                } else {
                    startSlideshow();
                }
            });
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopSlideshow();
            } else {
                startSlideshow();
            }
        });

        reducedMotion.addEventListener('change', event => {
            if (event.matches) {
                isPaused = true;
                stopSlideshow();
            }

            if (heroPause) {
                heroPause.setAttribute('aria-pressed', String(isPaused));
                heroPause.setAttribute(
                    'aria-label',
                    isPaused ? 'Play slideshow' : 'Pause slideshow'
                );
            }

            if (!event.matches && isPaused) {
                return;
            }

            startSlideshow();
        });

        const heroSection = heroSlides.closest('.hero');

        if (heroSection) {
            heroSection.addEventListener('mouseenter', stopSlideshow);
            heroSection.addEventListener('mouseleave', startSlideshow);

            heroSection.addEventListener('focusin', stopSlideshow);
            heroSection.addEventListener('focusout', event => {
                if (!heroSection.contains(event.relatedTarget)) {
                    startSlideshow();
                }
            });
        }
    }

    /* 05. SCROLL REVEAL ANIMATION */

    const revealElements = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window && !reducedMotion.matches) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add('is-revealed');
        });
    }

    
/* APPLICATION INDEX: INTERACTIVE VISUAL */

if (applicationList && applicationImage) {
    const applicationButtons = Array.from(
        applicationList.querySelectorAll('.application-button')
    );

    const applicationThumbs = Array.from(
        document.querySelectorAll('.application-thumb')
    );

    const applicationImageTitle = document.querySelector(
        '#applicationImageTitle'
    );

    function activateApplication(index) {
        const button = applicationButtons.find(item =>
            Number(item.dataset.application) === index
        );

        const thumbnail = applicationThumbs.find(item =>
            Number(item.dataset.application) === index
        );

        if (!button || !thumbnail) return;

        // Update status aktif pada daftar aplikasi
        applicationButtons.forEach(item => {
            const active = item === button;

            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
        });

        // Update status aktif pada thumbnail
        applicationThumbs.forEach(item => {
            const active = item === thumbnail;

            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
        });

        // Ambil gambar dari thumbnail yang dipilih
        const thumbnailImage = thumbnail.querySelector('img');

        if (thumbnailImage) {
            const newImage = thumbnailImage.currentSrc ||
                thumbnailImage.src;

            if (applicationImage.src !== newImage) {
                applicationImage.src = newImage;
            }

            // Gunakan alt dari tombol thumbnail
            applicationImage.alt = thumbnail.getAttribute('aria-label') ||
                'Selected drone cleaning application';
        }

        // Perbarui judul gambar
        const applicationName = button.querySelector(
            '.application-name'
        );

        if (applicationImageTitle && applicationName) {
            applicationImageTitle.textContent =
                applicationName.textContent.trim();
        }
    }

    // Klik daftar aplikasi di sebelah kiri
    applicationButtons.forEach(button => {
        button.addEventListener('click', () => {
            activateApplication(Number(button.dataset.application));
        });
    });

    // Klik thumbnail di sebelah kanan
    applicationThumbs.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            activateApplication(Number(thumbnail.dataset.application));
        });
    });

    // Atur tampilan awal berdasarkan item aktif di HTML
    const activeButton = applicationButtons.find(button =>
        button.classList.contains('is-active')
    );

    activateApplication(
        activeButton
            ? Number(activeButton.dataset.application)
            : Number(applicationButtons[0]?.dataset.application ?? 0)
    );
}


    /* 06. ENQUIRY FORM */

    if (enquiryForm && formFeedback) {
        const nameField = document.querySelector('#enquiryName');
        const companyField = document.querySelector('#enquiryCompany');
        const emailField = document.querySelector('#enquiryEmail');
        const telephoneField = document.querySelector('#enquiryTelephone');
        const sitesField = document.querySelector('#enquirySites');

        const requiredFields = [
            nameField,
            companyField,
            emailField,
            sitesField
        ].filter(Boolean);

        function showFormFeedback(message, isError = false) {
            formFeedback.textContent = message;
            formFeedback.setAttribute('role', isError ? 'alert' : 'status');
            formFeedback.setAttribute('aria-live', 'polite');
            formFeedback.classList.toggle('is-error', isError);
        }

        requiredFields.forEach(field => {
            field.addEventListener('input', () => {
                field.removeAttribute('aria-invalid');
            });
        });

        enquiryForm.addEventListener('submit', event => {
            event.preventDefault();

            const invalidField = requiredFields.find(field => {
                return !field.value.trim() || !field.checkValidity();
            });

            if (invalidField) {
                invalidField.setAttribute('aria-invalid', 'true');

                showFormFeedback(
                    'Please complete all required fields with valid information.',
                    true
                );

                invalidField.focus();
                return;
            }

            if (!emailField || !emailField.checkValidity()) {
                if (emailField) {
                    emailField.setAttribute('aria-invalid', 'true');
                    emailField.focus();
                }

                showFormFeedback(
                    'Please enter a valid email address.',
                    true
                );

                return;
            }

            const name = nameField.value.trim();
            const company = companyField.value.trim();
            const email = emailField.value.trim();
            const telephone = telephoneField
                ? telephoneField.value.trim()
                : '';
            const sites = sitesField.value.trim();

            const subject = encodeURIComponent(
                `Drone cleaning enquiry - ${company}`
            );

            const body = encodeURIComponent(
                `Name: ${name}\n` +
                `Company: ${company}\n` +
                `Email: ${email}\n` +
                `Telephone: ${telephone || 'Not provided'}\n\n` +
                `Sites or work involved:\n${sites}`
            );

            showFormFeedback(
                'Your email application will open so you can review and send your enquiry.'
            );

            window.location.href =
                `mailto:info@thebioniceye.co.uk?subject=${subject}&body=${body}`;
        });
    }

    /* 07. BACK TO TOP + SMOOTH INTERACTION */

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion.matches ? 'auto' : 'smooth'
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
            const targetId = link.getAttribute('href');

            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: reducedMotion.matches ? 'auto' : 'smooth',
                block: 'start'
            });

            if (target.matches('section, main, footer')) {
                if (!target.hasAttribute('tabindex')) {
                    target.setAttribute('tabindex', '-1');
                }

                target.focus({ preventScroll: true });
            }
        });
    });
});
