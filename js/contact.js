/**
 * ============================================================
 * Luminous X Technologies — Contact Form Module
 * Version: 1.0.0
 * ============================================================
 *
 * Handles the entire contact form lifecycle:
 *   - Real-time field validation (on blur + on input after first error)
 *   - Debounced live validation as the user types
 *   - Character counter with near-limit / at-limit states
 *   - Consent checkbox validation
 *   - Client-side rate limiting (30 seconds between submissions)
 *   - Honeypot + timestamp bot detection
 *   - Loading state on submit button
 *   - Success modal with accessible focus management
 *   - Robust error handling (network errors, timeouts, JSON parse errors)
 *   - Auto-scroll to first invalid field
 *   - Form reset after success
 *
 * Idempotent — safe to call multiple times.
 * ============================================================
 */
(function () {
    'use strict';

    // -----------------------------------------------------------
    // BOOTSTRAP
    // -----------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactForm);
    } else {
        initContactForm();
    }

    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // -----------------------------------------------------------
        // ELEMENT REFERENCES
        // -----------------------------------------------------------
        const elements = {
            form,
            submitBtn: document.getElementById('submitBtn'),
            formAlert: document.getElementById('formAlert'),
            charCounter: document.getElementById('charCounter'),
            successModal: document.getElementById('successModal'),
            successEmail: document.getElementById('successEmail'),
            fields: {
                name: document.getElementById('name'),
                email: document.getElementById('email'),
                phone: document.getElementById('phone'),
                company: document.getElementById('company'),
                service: document.getElementById('service'),
                message: document.getElementById('message'),
                consent: document.getElementById('consent'),
                website: document.getElementById('website'),
                csrfToken: document.getElementById('csrfToken'),
                formTimestamp: document.getElementById('formTimestamp')
            }
        };

        // -----------------------------------------------------------
        // VALIDATION RULES
        // -----------------------------------------------------------
        const validators = {
            name: (value) => {
                const v = (value || '').trim();
                if (!v) return 'Full name is required.';
                if (v.length < 2) return 'Name must be at least 2 characters.';
                if (v.length > 100) return 'Name must not exceed 100 characters.';
                // Unicode-friendly: letters, spaces, hyphens, apostrophes, periods
                if (!/^[\p{L}\s'\-\.]+$/u.test(v)) return 'Name contains invalid characters.';
                return '';
            },

            email: (value) => {
                const v = (value || '').trim();
                if (!v) return 'Email address is required.';
                if (v.length > 254) return 'Email address is too long.';
                // RFC-compliant-ish check
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email address.';
                return '';
            },

            phone: (value) => {
                const v = (value || '').trim();
                if (!v) return ''; // Optional
                if (v.length > 20) return 'Phone number is too long.';
                // Allow digits, spaces, +, -, (, )
                if (!/^[\d\s+\-()]{7,20}$/.test(v)) return 'Please enter a valid phone number.';
                return '';
            },

            company: (value) => {
                const v = (value || '').trim();
                if (v.length > 150) return 'Company name must not exceed 150 characters.';
                return '';
            },

            service: (value) => {
                if (!value) return 'Please select a service.';
                return '';
            },

            message: (value) => {
                const v = (value || '').trim();
                if (!v) return 'Message is required.';
                if (v.length < 10) return 'Please provide at least 10 characters.';
                if (v.length > 5000) return 'Message must not exceed 5000 characters.';
                return '';
            },

            consent: (checked) => {
                if (!checked) return 'You must accept the privacy policy to continue.';
                return '';
            }
        };

        // -----------------------------------------------------------
        // STATE
        // -----------------------------------------------------------
        const state = {
            touched: new Set(),        // Fields that have been blurred once
            submitting: false,
            lastSubmitTime: 0,
            SUBMIT_COOLDOWN: 30000     // 30 seconds
        };

        // -----------------------------------------------------------
        // VALIDATE A SINGLE FIELD
        // -----------------------------------------------------------
        function validateField(fieldName) {
            const el = elements.fields[fieldName];
            if (!el) return true;

            const value = fieldName === 'consent' ? el.checked : el.value;
            const errorMsg = validators[fieldName] ? validators[fieldName](value) : '';
            const errorEl = el.closest('.form-group')?.querySelector('.error-message');

            // Update visual state
            if (errorMsg) {
                el.classList.add('error');
                el.setAttribute('aria-invalid', 'true');
                if (errorEl) {
                    errorEl.textContent = errorMsg;
                    errorEl.classList.add('visible');
                }
                return false;
            } else {
                el.classList.remove('error');
                el.setAttribute('aria-invalid', 'false');
                if (errorEl) {
                    errorEl.textContent = '';
                    errorEl.classList.remove('visible');
                }
                return true;
            }
        }

        // -----------------------------------------------------------
        // VALIDATE ALL FIELDS
        // -----------------------------------------------------------
        function validateAll() {
            const fieldsToCheck = ['name', 'email', 'phone', 'company', 'service', 'message', 'consent'];
            let allValid = true;
            let firstInvalid = null;

            fieldsToCheck.forEach((fieldName) => {
                const isValid = validateField(fieldName);
                if (!isValid) {
                    allValid = false;
                    if (!firstInvalid) firstInvalid = elements.fields[fieldName];
                }
            });

            // Focus + scroll to first invalid field
            if (firstInvalid) {
                firstInvalid.focus({ preventScroll: true });
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            return allValid;
        }

        // -----------------------------------------------------------
        // FIELD EVENT LISTENERS
        // -----------------------------------------------------------
        Object.keys(elements.fields).forEach((fieldName) => {
            const el = elements.fields[fieldName];
            if (!el || ['website', 'csrfToken', 'formTimestamp'].includes(fieldName)) return;

            // Blur: mark as touched and validate
            el.addEventListener('blur', () => {
                state.touched.add(fieldName);
                validateField(fieldName);
            });

            // Live validation after first touch
            const eventType = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
            el.addEventListener(eventType, () => {
                if (state.touched.has(fieldName)) {
                    validateField(fieldName);
                }
                if (fieldName === 'message') updateCharCounter();
            });
        });

        // -----------------------------------------------------------
        // CHARACTER COUNTER
        // -----------------------------------------------------------
        function updateCharCounter() {
            const messageEl = elements.fields.message;
            const counter = elements.charCounter;
            if (!messageEl || !counter) return;

            const len = messageEl.value.length;
            const max = 5000;

            counter.textContent = `${len} / ${max}`;
            counter.classList.toggle('near-limit', len > max * 0.8 && len < max);
            counter.classList.toggle('at-limit', len >= max);
        }
        updateCharCounter();

        // -----------------------------------------------------------
        // BOT DETECTION
        // -----------------------------------------------------------
        function detectBot() {
            // 1. Honeypot
            if (elements.fields.website && elements.fields.website.value) {
                console.warn('Honeypot triggered — submission blocked.');
                return true;
            }

            // 2. Too-fast submission (bot submits in < 3 seconds)
            const ts = parseInt(elements.fields.formTimestamp?.value || '0', 10);
            if (ts && Date.now() - ts < 3000) {
                console.warn('Form submitted too quickly — likely a bot.');
                return true;
            }

            return false;
        }

        // -----------------------------------------------------------
        // ALERT DISPLAY
        // -----------------------------------------------------------
        function showAlert(message, type = 'error') {
            if (!elements.formAlert) return;
            elements.formAlert.textContent = message;
            elements.formAlert.className = `alert alert-${type} visible`;
            elements.formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                elements.formAlert.classList.remove('visible');
            }, 10000);
        }

        // -----------------------------------------------------------
        // LOADING STATE
        // -----------------------------------------------------------
        function setLoading(isLoading) {
            if (!elements.submitBtn) return;
            const btn = elements.submitBtn;

            if (isLoading) {
                btn.disabled = true;
                btn.classList.add('loading');
                btn.setAttribute('aria-busy', 'true');
                // Update visually via CSS :disabled and .loading state
            } else {
                btn.disabled = false;
                btn.classList.remove('loading');
                btn.setAttribute('aria-busy', 'false');
            }
        }

        // -----------------------------------------------------------
        // SUCCESS MODAL
        // -----------------------------------------------------------
        function showSuccessModal(userEmail) {
            const modal = elements.successModal;
            if (!modal) return;

            // Populate email
            if (elements.successEmail) {
                elements.successEmail.textContent = userEmail || 'your email';
            }

            // Show
            modal.classList.add('visible');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Focus the close button for accessibility
            setTimeout(() => {
                const closeBtn = modal.querySelector('.success-modal-close');
                if (closeBtn) closeBtn.focus();
            }, 100);

            // Wire up close handlers
            modal.querySelectorAll('[data-close-modal]').forEach((el) => {
                el.addEventListener('click', closeSuccessModal, { once: false });
            });

            // ESC to close
            const onEsc = (e) => {
                if (e.key === 'Escape') closeSuccessModal();
            };
            document.addEventListener('keydown', onEsc);

            function closeSuccessModal() {
                modal.classList.remove('visible');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                document.removeEventListener('keydown', onEsc);
            }
        }

        // -----------------------------------------------------------
        // SUBMIT HANDLER
        // -----------------------------------------------------------
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Guard: already submitting
            if (state.submitting) return;

            // Rate limiting
            const now = Date.now();
            if (now - state.lastSubmitTime < state.SUBMIT_COOLDOWN) {
                const remaining = Math.ceil((state.SUBMIT_COOLDOWN - (now - state.lastSubmitTime)) / 1000);
                showAlert(`Please wait ${remaining} seconds before submitting again.`, 'error');
                return;
            }

            // Clear previous alerts
            if (elements.formAlert) {
                elements.formAlert.classList.remove('visible');
            }

            // Bot detection
            if (detectBot()) {
                showAlert('Submission blocked. Please refresh and try again.', 'error');
                return;
            }

            // Validate all fields
            if (!validateAll()) {
                showAlert('Please correct the highlighted fields and try again.', 'error');
                return;
            }

            // Begin submission
            state.submitting = true;
            setLoading(true);

            // Build payload
            const formData = new FormData(form);
            const userEmail = (formData.get('email') || '').trim();

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    },
                    credentials: 'same-origin',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Try to parse JSON; fall back to text
                let data;
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    data = { success: false, message: text || 'Unexpected server response.' };
                }

                if (!response.ok) {
                    // HTTP error (422 validation, 429 rate limit, 500 server error)
                    throw new Error(data.message || `Server error (${response.status}). Please try again.`);
                }

                if (!data.success) {
                    throw new Error(data.message || 'Submission failed. Please try again.');
                }

                // ✅ SUCCESS
                state.lastSubmitTime = Date.now();

                // Reset form
                form.reset();
                state.touched.clear();

                // Reset visual states
                Object.keys(elements.fields).forEach((fieldName) => {
                    const el = elements.fields[fieldName];
                    if (!el) return;
                    el.classList.remove('error');
                    el.setAttribute('aria-invalid', 'false');
                    const errorEl = el.closest('.form-group')?.querySelector('.error-message');
                    if (errorEl) {
                        errorEl.textContent = '';
                        errorEl.classList.remove('visible');
                    }
                });
                updateCharCounter();

                // Refresh CSRF token for next submission
                try {
                    const tokenResp = await fetch('php/csrf-token.php', { credentials: 'same-origin' });
                    const tokenData = await tokenResp.json();
                    if (tokenData.token && elements.fields.csrfToken) {
                        elements.fields.csrfToken.value = tokenData.token;
                    }
                } catch (err) {
                    console.warn('Token refresh failed:', err);
                }

                // Reset timestamp
                if (elements.fields.formTimestamp) {
                    elements.fields.formTimestamp.value = Date.now();
                }

                // Show success modal
                showSuccessModal(userEmail);

            } catch (err) {
                console.error('Contact form submission error:', err);

                let message = 'Something went wrong. Please try again.';

                if (err.name === 'AbortError') {
                    message = 'Request timed out. Please check your connection and try again.';
                } else if (err.message) {
                    message = err.message;
                } else if (!navigator.onLine) {
                    message = 'No internet connection. Please check your network and try again.';
                }

                showAlert(message, 'error');

            } finally {
                state.submitting = false;
                setLoading(false);
            }
        });

        // -----------------------------------------------------------
        // CLEANUP: Warn user if they navigate away mid-submission
        // -----------------------------------------------------------
        window.addEventListener('beforeunload', (e) => {
            if (state.submitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
})();