/**
 * CTDHR Portal - GSAP scroll reveals & counter animations
 */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initScrollReveals() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        if (prefersReducedMotion) {
            gsap.set('.gsap-reveal, .gsap-stagger > *', { opacity: 1, y: 0 });
            return;
        }

        gsap.utils.toArray('.gsap-reveal').forEach(function (el) {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
                opacity: 0,
                y: 40,
                duration: 0.7,
                ease: 'power3.out',
            });
        });

        gsap.utils.toArray('.gsap-stagger').forEach(function (container) {
            var children = container.children;
            if (!children.length) return;

            gsap.from(children, {
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 0,
                y: 30,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
            });
        });
    }

    function initCounters() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            document.querySelectorAll('.gsap-counter').forEach(function (el) {
                var target = parseInt(el.getAttribute('data-count') || '0', 10);
                el.textContent = target.toLocaleString();
            });
            return;
        }

        gsap.utils.toArray('.gsap-counter').forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count') || '0', 10);
            var obj = { val: 0 };

            if (prefersReducedMotion) {
                el.textContent = target.toLocaleString();
                return;
            }

            gsap.to(obj, {
                val: target,
                duration: 2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                onUpdate: function () {
                    el.textContent = Math.round(obj.val).toLocaleString();
                },
            });
        });
    }

    function initHeroAnimations() {
        if (typeof gsap === 'undefined' || prefersReducedMotion) {
            return;
        }

        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (document.querySelector('.hero-title')) {
            tl.from('.hero-title', { opacity: 0, y: 30, duration: 0.6 }, 0);
        }
        if (document.querySelector('.hero-subtitle')) {
            tl.from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.6 }, 0.15);
        }
        if (document.querySelector('.hero-cta')) {
            tl.from('.hero-cta', { opacity: 0, y: 20, duration: 0.6 }, 0.3);
        }
    }

    function init() {
        initHeroAnimations();
        initScrollReveals();
        initCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.body.addEventListener('htmx:afterSwap', function () {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
        initScrollReveals();
    });
})();