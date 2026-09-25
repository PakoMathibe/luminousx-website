/**
 * ============================================================
 * Luminous X Technologies — Main JavaScript
 * Version: 5.0.0
 * Author: Luminous X Technologies
 * Description:
 *   Handles mobile navigation, scroll effects, reveal animations,
 *   animated counters, hero slider, testimonial slider, and
 *   full client-side form validation with character counter.
 *
 *   Written as a single IIFE to avoid polluting the global scope.
 *   All public API is idempotent — calling functions twice is safe.
 * ============================================================
 */
(function () {
    'use strict';

    /* ============================================================
       BOOTSTRAP — runs when DOM is ready
       ============================================================ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        try { initMobileNav(); } catch (e) { console.warn('initMobileNav failed', e); }
        try { initDropdownMobile(); } catch (e) { console.warn('initDropdownMobile failed', e); }
        try { initHeaderScroll(); } catch (e) { console.warn('initHeaderScroll failed', e); }
        try { initSmoothScroll(); } catch (e) { console.warn('initSmoothScroll failed', e); }
        try { initReveal(); } catch (e) { console.warn('initReveal failed', e); }
        try { initCounters(); } catch (e) { console.warn('initCounters failed', e); }
        try { initHeroSlider(); } catch (e) { console.warn('initHeroSlider failed', e); }
        try { initTestimonialSlider(); } catch (e) { console.warn('initTestimonialSlider failed', e); }
        try { initFormValidation(); } catch (e) { console.warn('initFormValidation failed', e); }
        try { initYear(); } catch (e) { console.warn('initYear failed', e); }
    }

    /* ============================================================
       MOBILE NAVIGATION
       Toggles the slide-in nav panel and manages body scroll lock.
       ============================================================ */
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

        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });

        // Close nav on link tap (mobile)
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

        // Close on resize to desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768) close();
            }, 150);
        });
    }

    /* ============================================================
       MOBILE DROPDOWN
       Taps on parent links toggle the dropdown rather than navigating.
       ============================================================ */
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

    /* ============================================================
       HEADER SCROLL EFFECT
       Adds .scrolled once the user scrolls past 20px.
       ============================================================ */
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

    /* ============================================================
       SMOOTH SCROLL FOR ANCHOR LINKS
       Uses native smooth scroll with header offset compensation.
       ============================================================ */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const id = anchor.getAttribute('href');
                if (!id || id === '#') return;

                let target;
                try {
                    target = document.querySelector(id);
                } catch (_) {
                    return; // Invalid selector, let browser handle
                }
                if (!target) return;

                e.preventDefault();
                const headerH = document.querySelector('.site-header')?.offsetHeight || 76;
                const top = target.getBoundingClientRect().top + window.scrollY - headerH - 20;

                window.scrollTo({ top, behavior: 'smooth' });

                // Update URL hash without triggering jump
                if (history.replaceState) {
                    history.replaceState(null, '', id);
                }
            });
        });
    }

    /* ============================================================
       SCROLL REVEAL
       Reveals elements with [data-reveal] when they enter the viewport.
       Uses IntersectionObserver for performance.
       ============================================================ */
    function initReveal() {
        const els = document.querySelectorAll('[data-reveal]');
        if (!els.length) return;

        // Respect reduced motion preferences
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

    /* ============================================================
       ANIMATED COUNTERS
       Animates elements with [data-count] using ease-out cubic.
       Optional: data-prefix and data-suffix for formatting.
       ============================================================ */
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        // Skip animation for reduced motion
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
                const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
                const val = target * eased;
                const formatted = Number.isInteger(target)
                    ? Math.round(val)
                    : val.toFixed(1);
                el.textContent = prefix + formatted + suffix;
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }
    }

    /* ============================================================
       HERO SLIDER (mini)
       Small auto-rotating slider in the hero card.
       ============================================================ */
    function initHeroSlider() {
        const track = document.querySelector('.hero-slider-track');
        const dots = document.querySelectorAll('.hero-slider-nav button');
        if (!track || !dots.length) return;

        const total = track.children.length;
        if (total < 2) return;

        let i = 0;
        let timer = null;

        const go = (idx) => {
            i = (idx + total) % total;
            track.style.transform = `translateX(-${i * 100}%)`;
            dots.forEach((d, k) => d.classList.toggle('active', k === i));
        };

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                go(idx);
                restart();
            });
        });

        const start = () => { timer = setInterval(() => go(i + 1), 4500); };
        const stop = () => { if (timer) clearInterval(timer); };
        const restart = () => { stop(); start(); };

        // Pause on hover
        track.parentElement.addEventListener('mouseenter', stop);
        track.parentElement.addEventListener('mouseleave', start);

        // Pause when tab is hidden (saves CPU)
        document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : start();
        });

        start();
    }

    /* ============================================================
       TESTIMONIAL SLIDER
       Full slider with prev/next, dots, auto-advance, keyboard nav.
       ============================================================ */
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

        // Build dots dynamically
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
            // Update aria-live region for screen readers
            const live = document.getElementById('testimonialLive');
            if (live) live.textContent = `Testimonial ${i + 1} of ${total}`;
        };

        prev?.addEventListener('click', () => { go(i - 1); restart(); });
        next?.addEventListener('click', () => { go(i + 1); restart(); });

        const start = () => { timer = setInterval(() => go(i + 1), 7000); };
        const stop = () => { if (timer) clearInterval(timer); };
        const restart = () => { stop(); start(); };

        // Pause on hover
        track.parentElement.addEventListener('mouseenter', stop);
        track.parentElement.addEventListener('mouseleave', start);

        // Keyboard navigation (only when slider is in viewport)
        let inView = false;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => { inView = entry.isIntersecting; });
        }, { threshold: 0.3 });
        io.observe(track);

        document.addEventListener('keydown', (e) => {
            if (!inView) return;
            if (e.key === 'ArrowLeft') { go(i - 1); restart(); }
            if (e.key === 'ArrowRight') { go(i + 1); restart(); }
        });

        // Pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : start();
        });

        start();
    }

    /* ============================================================
       FORM VALIDATION
       Handles real-time validation, submission, and error display.
       Includes character counter for the message field.
       ============================================================ */
    function initFormValidation() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        /* ---------- Field definitions ---------- */
        const fields = {
            name: {
                el: document.getElementById('name'),
                validate: v => {
                    if (!v.trim()) return 'Full name is required.';
                    if (v.trim().length < 2) return 'Name must be at least 2 characters.';
                    if (v.trim().length > 100) return 'Name is too long (max 100).';
                    if (!/^[\p{L}\s'\-.]+$/u.test(v.trim())) return 'Name contains invalid characters.';
                    return '';
                }
            },
            email: {
                el: document.getElementById('email'),
                validate: v => {
                    if (!v.trim()) return 'Email is required.';
                    if (v.trim().length > 254) return 'Email is too long.';
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Please enter a valid email address.';
                    return '';
                }
            },
            phone: {
                el: document.getElementById('phone'),
                validate: v => {
                    if (!v.trim()) return ''; // Optional field
                    if (v.trim().length > 20) return 'Phone number is too long.';
                    if (!/^[\d\s+\-()]{7,20}$/.test(v.trim())) return 'Enter a valid phone number.';
                    return '';
                }
            },
            company: {
                el: document.getElementById('company'),
                validate: v => {
                    if (v.trim().length > 150) return 'Company name is too long.';
                    return '';
                }
            },
            service: {
                el: document.getElementById('service'),
                validate: v => !v ? 'Please select a service.' : ''
            },
            message: {
                el: document.getElementById('message'),
                validate: v => {
                    if (!v.trim()) return 'Message is required.';
                    if (v.trim().length < 10) return 'Message must be at least 10 characters.';
                    if (v.trim().length > 5000) return 'Message must not exceed 5000 characters.';
                    return '';
                }
            }
        };

        /* ---------- Character counter ---------- */
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

        /* ---------- Real-time validation on blur/input ---------- */
        Object.values(fields).forEach(f => {
            if (!f.el) return;
            f.el.addEventListener('blur', () => validateField(f, f.el.value));
            f.el.addEventListener('input', () => {
                if (f.el.classList.contains('error')) validateField(f, f.el.value);
            });
        });

        /* ---------- Submit handler ---------- */
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

            // Honeypot — silently reject bots
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

        /* ---------- Per-field validation ---------- */
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

        /* ---------- Network submission ---------- */
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

        /* ---------- Alert display ---------- */
        function showAlert(msg, type) {
            const alert = document.getElementById('formAlert');
            if (!alert) return;
            alert.textContent = msg;
            alert.className = `alert alert-${type} visible`;
            alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => alert.classList.remove('visible'), 8000);
        }
    }

    /* ============================================================
       CURRENT YEAR
       Injects current year into #currentYear.
       ============================================================ */
    function initYear() {
        const el = document.getElementById('currentYear');
        if (el) el.textContent = new Date().getFullYear();
    }

})();