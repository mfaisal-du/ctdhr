/**
 * CTDHR Admin Premium UI — counters, progress rings, row stagger, toggles.
 * Complements motion.js (no GSAP required).
 */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function animateValue(el, end, duration, formatter) {
        var start = 0;
        var startTime = null;

        function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
            var val = Math.floor(start + (end - start) * easeOutCubic(p));
            el.textContent = formatter(val);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = formatter(end);
        }

        requestAnimationFrame(step);
    }

    function initKpiCounters(root) {
        root.querySelectorAll('[data-count]:not([data-count-done])').forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count') || '0', 10);
            var suffix = el.getAttribute('data-count-suffix') || '';

            if (reducedMotion) {
                el.textContent = target + suffix;
                el.setAttribute('data-count-done', '1');
                return;
            }

            el.setAttribute('data-count-done', '1');
            animateValue(el, target, 1400, function (v) { return v + suffix; });
        });
    }

    function initProgressBars(root) {
        root.querySelectorAll('[data-progress]:not([data-progress-done])').forEach(function (el) {
            var target = parseFloat(el.getAttribute('data-progress') || '0');
            var fill = el.querySelector('.premium-progress-fill');
            if (!fill) return;

            el.setAttribute('data-progress-done', '1');
            if (reducedMotion) {
                fill.style.width = target + '%';
                return;
            }

            fill.style.width = '0%';
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    fill.style.width = target + '%';
                });
            });
        });
    }

    function initProgressRings(root) {
        root.querySelectorAll('[data-ring]:not([data-ring-done])').forEach(function (el) {
            var value = parseFloat(el.getAttribute('data-ring') || '0');
            var circle = el.querySelector('.premium-ring-circle');
            if (!circle) return;

            var radius = parseFloat(circle.getAttribute('r') || '16');
            var circumference = 2 * Math.PI * radius;
            var offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

            circle.style.strokeDasharray = circumference + ' ' + circumference;
            el.setAttribute('data-ring-done', '1');

            if (reducedMotion) {
                circle.style.strokeDashoffset = offset;
                return;
            }

            circle.style.strokeDashoffset = circumference;
            requestAnimationFrame(function () {
                circle.style.strokeDashoffset = offset;
            });
        });
    }

    function initRowStagger(root) {
        if (reducedMotion) {
            root.querySelectorAll('[data-premium-row]').forEach(function (row) {
                row.classList.add('is-visible');
            });
            return;
        }

        var rows = root.querySelectorAll('[data-premium-row]:not(.is-visible)');
        if (!rows.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var row = entry.target;
                var idx = parseInt(row.getAttribute('data-premium-row') || '0', 10);
                window.setTimeout(function () {
                    row.classList.add('is-visible');
                }, idx * 55);
                observer.unobserve(row);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

        rows.forEach(function (row) { observer.observe(row); });
    }

    function initParticipantToggles(root) {
        root.querySelectorAll('.premium-toggle input[type="checkbox"]').forEach(function (cb) {
            cb.addEventListener('change', function () {
                var row = cb.closest('.premium-participant-row');
                if (row) row.classList.toggle('is-present', cb.checked);
            });
        });
    }

    function initLiveSessionStats(root) {
        var form = root.querySelector('#attendanceMarkForm');
        if (!form) return;

        var presentEl = root.querySelector('[data-live-present]');
        var absentEl = root.querySelector('[data-live-absent]');
        if (!presentEl || !absentEl) return;

        function refresh() {
            var boxes = form.querySelectorAll('.attendance-present-cb');
            var present = 0;
            boxes.forEach(function (b) { if (b.checked) present++; });
            presentEl.textContent = String(present);
            absentEl.textContent = String(Math.max(0, boxes.length - present));
        }

        form.addEventListener('change', refresh);
        refresh();
    }

    function boot(scope) {
        var root = scope || document.querySelector('.admin-premium-module') || document;
        initKpiCounters(root);
        initProgressBars(root);
        initProgressRings(root);
        initRowStagger(root);
        initParticipantToggles(root);
        initLiveSessionStats(root);

        if (window.CTDHRMotion && typeof window.CTDHRMotion.boot === 'function') {
            window.CTDHRMotion.boot();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { boot(); });
    } else {
        boot();
    }

    document.body.addEventListener('htmx:afterSettle', function () { boot(); });

    window.CTDHRAdminPremium = { boot: boot };
})();