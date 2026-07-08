/**
 * CTDHR Portal - HTMX configuration & global app utilities
 */
(function () {
    'use strict';

    function getCsrfToken() {
        var meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) {
            return meta.getAttribute('content');
        }

        var input = document.querySelector('input[name="_token"]');
        return input ? input.value : '';
    }

    function configureHtmx() {
        if (typeof htmx === 'undefined') {
            return;
        }

        document.body.addEventListener('htmx:configRequest', function (event) {
            var token = getCsrfToken();
            if (token) {
                event.detail.headers['X-CSRF-TOKEN'] = token;
            }
        });

        document.body.addEventListener('htmx:beforeRequest', function (event) {
            var target = event.detail.elt;
            if (target && target.id === 'course-results') {
                target.classList.add('opacity-60', 'pointer-events-none');
            }
        });

        document.body.addEventListener('htmx:afterRequest', function (event) {
            var target = document.getElementById('course-results');
            if (target) {
                target.classList.remove('opacity-60', 'pointer-events-none');
            }
        });

        document.body.addEventListener('htmx:responseError', function () {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Something went wrong. Please try again.',
                    confirmButtonColor: '#1E5AA8',
                });
            }
        });
    }

    function initBackToTop() {
        var btn = document.getElementById('footer-back-to-top');

        if (!btn) {
            return;
        }

        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var scrollThreshold = 320;

        function updateVisibility() {
            btn.classList.toggle('is-visible', window.scrollY > scrollThreshold);
        }

        window.addEventListener('scroll', updateVisibility, { passive: true });
        updateVisibility();

        btn.addEventListener('click', function () {
            if (reducedMotion) {
                window.scrollTo(0, 0);
                return;
            }

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        });
    }

    function initMobileNav() {
        document.querySelectorAll('.glass-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.Alpine && document.querySelector('[x-data]')) {
                    var nav = document.querySelector('.glass-nav');
                    if (nav && nav.__x) {
                        nav.__x.$data.mobileOpen = false;
                    }
                }
            });
        });
    }

    function init() {
        configureHtmx();
        initBackToTop();
        initMobileNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();