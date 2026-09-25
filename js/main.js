/**
 * ============================================================
 * Luminous X Technologies — Main JavaScript
 * Version: 6.0.0
 * ============================================================
 *
 * Handles:
 *   - Mobile navigation (with swipe gesture support)
 *   - Desktop + mobile dropdown menus
 *   - Header scroll effect (throttled with rAF)
 *   - Smooth anchor scrolling (with header offset)
 *   - Scroll reveal animations (IntersectionObserver)
 *   - Animated number counters
 *   - Hero slider (with prev/next + dots + auto-advance)
 *   - Testimonial slider
 *   - Contact form validation (real-time + submit)
 *   - Scroll-to-top button visibility
 *   - Dynamic year injection
 *
 * All functions are idempotent — safe to call multiple times.
 * Wrapped in an IIFE to avoid polluting global scope.
 * ============================================================
 */
(function () {
    'use strict';

    /* ==========================================================
       BOOTSTRAP
       Fires on DOMContentLoaded (or immediately if already loaded).
       Each init function is wrapped in try/catch so one failure
       doesn't break the others.
       ========================================================== */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const fns = [
            initMobileNav,
            initDropdownMobile,
            initHeaderScroll,
            initSmoothScroll,
            initReveal,
            initCounters,
            initHeroSlider,
            initTestimonialSlider,
            initFormValidation,
            initScrollTop,
            initYear
        ];
        fns.forEach(fn => {
            try { fn(); } catch (e) { console.warn(`${fn.name} failed:`, e); }
        });
    }

    /* ==========================================================
       MOBILE NAVIGATION
       - Toggles .open on .nav
       - Locks body scroll while open
       - Closes on link tap, ESC, or resize to desktop
       - Supports horizontal swipe-right to close
       ========================================================== */
    function initMobileNav() {
        const toggle = document.querySelector('.mobile-toggle');
        const nav = document.querySelector('.nav');
        if (!toggle || !nav) return;

        const close = () => {
            nav.classList.remove('open');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };

        const open = () => {
            nav.classList.add('open');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };

        toggle.addEventListener('click', () => {
            nav.classList.contains('open') ? close() : open();
        });

        // Close on link tap
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) close();
            });
        });

        // Close on ESC
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                close();
                toggle.focus();
            }
        });

        // Swipe-right gesture to close
        let touchStartX = 0;
        let touchStartY = 0;
        let touching = false;

        nav.addEventListener('touchstart', e => {
            if (window.innerWidth > 768) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touching = true;
        }, { passive: true });

        nav.addEventListener('touchmove', e => {
            if (!touching || window.innerWidth > 768) return;
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;
            // Right swipe with more horizontal than vertical movement
            if (dx > 60 && Math.abs(dx) > Math.abs(dy)) {
                touching = false;
                close();
            }
        }, { passive: true });

        nav.addEventListener('touchend', () => { touching = false; });

        // Close on resize to desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && nav.classList.contains('open')) close();
            }, 150);
        });
    }

    /* ==========================================================
       MOBILE DROPDOWN
       Parent links with children toggle the dropdown on tap
       instead of navigating. On desktop, hover handles it.
       ========================================================== */
    function initDropdownMobile() {
        document.querySelectorAll('.nav-dropdown > a').forEach(link => {
            link.addEventListener('click', e => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    link.parentElement.classList.toggle('open');
                }
            });
        });
    }

    /* ==========================================================
       HEADER SCROLL EFFECT
       Adds .scrolled when user scrolls past 20px.
       Throttled with requestAnimationFrame.
       ========================================================== */
    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                header.classList.toggle('scrolled', window.scrollY > 20);
                ticking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ==========================================================
       SMOOTH SCROLL FOR ANCHOR LINKS
       Adjusts for fixed header height and updates URL hash
       without triggering a jump.
       ========================================================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const id = anchor.getAttribute('href');
                if (!id || id === '#') return;

                let target;
                try {
                    target = document.querySelector(id);
                } catch (_) {
                    return;
                }
                if (!target) return;

                e.preventDefault();
                const headerH = document.querySelector('.site-header')?.offsetHeight || 76;
                const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;

                window.scrollTo({ top, behavior: 'smooth' });

                if (history.replaceState) {
                    history.replaceState(null, '', id);
                }
            });
        });
    }

    /* ==========================================================
       SCROLL REVEAL
       Reveals [data-reveal] elements as they enter the viewport.
       Respects prefers-reduced-motion.
       ========================================================== */
    function initReveal() {
        const els = document.querySelectorAll('[data-reveal]');
        if (!els.length) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            els.forEach(el => el.classList.add('revealed'));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        els.forEach(el => io.observe(el));
    }

    /* ==========================================================
       ANIMATED COUNTERS
       Ease-out cubic animation triggered when the element
       scrolls into view. Supports data-prefix, data-suffix,
       and data-duration.
       ========================================================== */
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            counters.forEach(el => {
                const target = parseFloat(el.dataset.count) || 0;
                const suffix = el.dataset.suffix || '';
                const prefix = el.dataset.prefix || '';
                el.textContent = prefix + target + suffix;
            });
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                io.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        counters.forEach(el => io.observe(el));

        function animateCounter(el) {
            const target = parseFloat(el.dataset.count);
            if (isNaN(target)) return;

            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const duration = parseInt(el.dataset.duration, 10) || 1800;
            const start = performance.now();

            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                const val = target * eased;
                const formatted = Number.isInteger(target) ? Math.round(val) : val.toFixed(1);
                el.textContent = prefix + formatted + suffix;
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }
    }

    /* ==========================================================
       HERO SLIDER
       Modern slider with:
       - Auto-advance every 5 seconds
       - Prev/next buttons
       - Dots that reflect current slide
       - Pause on hover, resume on leave
       - Pause when tab is hidden
       - Touch swipe support
       ========================================================== */
    function initHeroSlider() {
        const slider = document.querySelector('.hero-slider');
        const track = document.querySelector('.hero-slider-track');
        const dots = document.querySelectorAll('.hero-slider-nav button');
        const prev = document.querySelector('[data-hero-prev]');
        const next = document.querySelector('[data-hero-next]');
        if (!slider || !track) return;

        const total = track.children.length;
        if (total < 2) return;

        let i = 0;
        let timer = null;
        const INTERVAL = 5000;

        const go = (idx) => {
            i = (idx + total) % total;
            track.style.transform = `translateX(-${i * 100}%)`;
            dots.forEach((d, k) => d.classList.toggle('active', k === i));
        };

        // Dot navigation
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => { go(idx); restart(); });
        });

        // Arrow navigation
        prev?.addEventListener('click', () => { go(i - 1); restart(); });
        next?.addEventListener('click', () => { go(i + 1); restart(); });

        const start = () => { timer = setInterval(() => go(i + 1), INTERVAL); };
        const stop = () => { if (timer) clearInterval(timer); };
        const restart = () => { stop(); start(); };

        // Pause on hover
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);

        // Pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : start();
        });

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        slider.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 40) {
                go(diff > 0 ? i + 1 : i - 1);
                restart();
            }
        }, { passive: true });

        start();
    }

    /* ==========================================================
       TESTIMONIAL SLIDER
       Full slider with prev/next, dynamic dots, auto-advance,
       keyboard navigation, and visibility pause.
       ========================================================== */
    function initTestimonialSlider() {
        const track = document.querySelector('.testimonial-track');
        const prev = document.querySelector('[data-testimonial-prev]');
        const next = document.querySelector('[data-testimonial-next]');
        const dotsContainer = document.querySelector('.testimonial-dots');
        if (!track) return;

        const total = track.children.length;
        if (total < 2) return;

        let i = 0;
        let timer = null;

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let k = 0; k < total; k++) {
                const dot = document.createElement('button');
                dot.setAttribute('aria-label', `Go to testimonial ${k + 1}`);
                dot.type = 'button';
                if (k === 0) dot.classList.add('active');
                dot.addEventListener('click', () => { go(k); restart(); });
                dotsContainer.appendChild(dot);
            }
        }
        const dots = dotsContainer ? dotsContainer.querySelectorAll('button') : [];

        const go = (idx) => {
            i = (idx + total) % total;
            track.style.transform = `translateX(-${i * 100}%)`;
            dots.forEach((d, k) => d.classList.toggle('active', k === i));
        };

        prev?.addEventListener('click', () => { go(i - 1); restart(); });
        next?.addEventListener('click', () => { go(i + 1); restart(); });

        const start = () => { timer = setInterval(() => go(i + 1), 7000); };
        const stop = () => { if (timer) clearInterval(timer); };
        const restart = () => { stop(); start(); };

        track.parentElement.addEventListener('mouseenter', stop);
        track.parentElement.addEventListener('mouseleave', start);

        document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : start();
        });

        start();
    }

    /* ==========================================================
       FORM VALIDATION
       Real-time + submit validation with character counter.
       Includes honeypot check for bot detection.
       ========================================================== */
    function initFormValidation() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const fields = {
            name: { el: document.getElementById('name'), validate: v => {
                if (!v.trim()) return 'Full name is required.';
                if (v.trim().length < 2) return 'Name must be at least 2 characters.';
                if (v.trim().length > 100) return 'Name is too long (max 100).';
                if (!/^[\p{L}\s'\-.]+$/u.test(v.trim())) return 'Name contains invalid characters.';
                return '';
            }},
            email: { el: document.getElementById('email'), validate: v => {
                if (!v.trim()) return 'Email is required.';
                if (v.trim().length > 254) return 'Email is too long.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Please enter a valid email address.';
                return '';
            }},
            phone: { el: document.getElementById('phone'), validate: v => {
                if (!v.trim()) return '';
                if (v.trim().length > 20) return 'Phone number is too long.';
                if (!/^[\d\s+\-()]{7,20}$/.test(v.trim())) return 'Enter a valid phone number.';
                return '';
            }},
            company: { el: document.getElementById('company'), validate: v => {
                if (v.trim().length > 150) return 'Company name is too long.';
                return '';
            }},
            service: { el: document.getElementById('service'), validate: v => !v ? 'Please select a service.' : '' },
            message: { el: document.getElementById('message'), validate: v => {
                if (!v.trim()) return 'Message is required.';
                if (v.trim().length < 10) return 'Message must be at least 10 characters.';
                if (v.trim().length > 5000) return 'Message must not exceed 5000 characters.';
                return '';
            }}
        };

        // Character counter
        const messageEl = fields.message.el;
        const charCounter = document.getElementById('charCounter');
        if (messageEl && charCounter) {
            const update = () => {
                const len = messageEl.value.length;
                const max = 5000;
                charCounter.textContent = `${len} / ${max}`;
                charCounter.classList.toggle('near-limit', len > max * 0.8 && len < max);
                charCounter.classList.toggle('at-limit', len >= max);
            };
            messageEl.addEventListener('input', update);
            update();
        }

        Object.values(fields).forEach(f => {
            if (!f.el) return;
            f.el.addEventListener('blur', () => validateField(f, f.el.value));
            f.el.addEventListener('input', () => {
                if (f.el.classList.contains('error')) validateField(f, f.el.value);
            });
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            let valid = true;
            let firstErr = null;

            Object.values(fields).forEach(f => {
                if (!f.el) return;
                if (validateField(f, f.el.value)) {
                    valid = false;
                    if (!firstErr) firstErr = f.el;
                }
            });

            const hp = document.getElementById('website');
            if (hp && hp.value) {
                console.warn('Honeypot triggered — submission blocked.');
                valid = false;
            }

            if (!valid) {
                if (firstErr) {
                    firstErr.focus();
                    firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            submitForm(form);
        });

        function validateField(field, value) {
            const err = field.validate(value);
            const errEl = field.el.parentElement.querySelector('.error-message');

            field.el.classList.toggle('error', !!err);
            field.el.setAttribute('aria-invalid', err ? 'true' : 'false');

            if (errEl) {
                errEl.textContent = err;
                errEl.classList.toggle('visible', !!err);
            }
            return err;
        }

        function submitForm(form) {
            const btn = form.querySelector('button[type="submit"]');
            if (!btn) return;

            const original = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending…';

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(r => {
                if (!r.ok) throw new Error('Network response was not ok');
                return r.json();
            })
            .then(data => {
                if (data.success) {
                    window.location.href = 'thank-you.html';
                } else {
                    showAlert(data.message || 'Something went wrong. Please try again.', 'error');
                    btn.disabled = false;
                    btn.innerHTML = original;
                }
            })
            .catch(err => {
                console.error('Form submission failed:', err);
                showAlert('Network error. Please check your connection and try again.', 'error');
                btn.disabled = false;
                btn.innerHTML = original;
            });
        }

        function showAlert(msg, type) {
            const alert = document.getElementById('formAlert');
            if (!alert) return;
            alert.textContent = msg;
            alert.className = `alert alert-${type} visible`;
            alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => alert.classList.remove('visible'), 8000);
        }
    }

    /* ==========================================================
       SCROLL TO TOP
       Shows the button after 600px of scrolling.
       Scrolls smoothly to top when clicked.
       ========================================================== */
    function initScrollTop() {
        const btn = document.querySelector('.scroll-top');
        if (!btn) return;

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                btn.classList.toggle('visible', window.scrollY > 600);
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ==========================================================
       CURRENT YEAR
       ========================================================== */
    function initYear() {
        const el = document.getElementById('currentYear');
        if (el) el.textContent = new Date().getFullYear();
    }

})();