/**
 * Category card hover aurora — lightweight 2D canvas particles (no Three.js).
 */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function parseColor(hex) {
        var value = (hex || '#425aad').replace('#', '');
        if (value.length === 3) {
            value = value.split('').map(function (c) { return c + c; }).join('');
        }
        var num = parseInt(value, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255,
        };
    }

    function CategoryAurora(card) {
        this.card = card;
        this.canvas = card.querySelector('.category-card-aurora');
        var accent = card.classList.contains('category-card-empty')
            ? (getComputedStyle(card).getPropertyValue('--category-empty').trim() || '#c62828')
            : (card.style.getPropertyValue('--cat-color').trim() || '#425aad');
        this.color = parseColor(accent);
        this.particles = [];
        this.raf = null;
        this.running = false;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        if (!this.canvas || reducedMotion) {
            return;
        }

        this.resize();
        this.seedParticles();
        this.onEnter = this.onEnter.bind(this);
        this.onLeave = this.onLeave.bind(this);
        this.tick = this.tick.bind(this);

        card.addEventListener('mouseenter', this.onEnter);
        card.addEventListener('mouseleave', this.onLeave);
        card.addEventListener('focusin', this.onEnter);
        card.addEventListener('focusout', this.onLeave);
        window.addEventListener('resize', this.resize.bind(this));
    }

    CategoryAurora.prototype.resize = function () {
        if (!this.canvas) {
            return;
        }

        var rect = this.card.getBoundingClientRect();
        this.width = Math.max(1, Math.floor(rect.width));
        this.height = Math.max(1, Math.floor(rect.height));
        this.canvas.width = Math.floor(this.width * this.dpr);
        this.canvas.height = Math.floor(this.height * this.dpr);
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx = this.canvas.getContext('2d');
        if (this.ctx) {
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        }
    };

    CategoryAurora.prototype.seedParticles = function () {
        this.particles = [];
        var count = 22;

        for (var i = 0; i < count; i += 1) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                r: 2 + Math.random() * 5,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                hueShift: Math.random(),
                accent: Math.random() > 0.5 ? 'cyan' : 'gold',
            });
        }
    };

    CategoryAurora.prototype.onEnter = function () {
        if (!this.ctx || this.running) {
            return;
        }

        this.running = true;
        this.card.classList.add('is-aurora-active');
        this.raf = requestAnimationFrame(this.tick);
    };

    CategoryAurora.prototype.onLeave = function () {
        this.running = false;
        this.card.classList.remove('is-aurora-active');

        if (this.raf) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }

        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    };

    CategoryAurora.prototype.tick = function () {
        if (!this.running || !this.ctx) {
            return;
        }

        var ctx = this.ctx;
        var c = this.color;

        ctx.clearRect(0, 0, this.width, this.height);

        this.particles.forEach(function (p) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.width) {
                p.vx *= -1;
            }

            if (p.y < 0 || p.y > this.height) {
                p.vy *= -1;
            }

            var alpha = 0.28 + p.hueShift * 0.32;
            var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
            grad.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')');
            grad.addColorStop(
                0.4,
                p.accent === 'gold'
                    ? 'rgba(255, 213, 79, ' + (alpha * 0.7) + ')'
                    : 'rgba(0, 176, 255, ' + (alpha * 0.75) + ')'
            );
            grad.addColorStop(1, 'rgba(16, 110, 24, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
            ctx.fill();
        }, this);

        this.raf = requestAnimationFrame(this.tick);
    };

    function markCategoryMediaLoaded(card) {
        card.classList.add('is-media-loaded');
    }

    function bindCategoryMediaSkeleton(card) {
        var image = card.querySelector('.category-card-media-img');

        if (!image) {
            markCategoryMediaLoaded(card);
            return;
        }

        var onReady = function () {
            markCategoryMediaLoaded(card);
        };

        if (image.complete && image.naturalWidth > 0) {
            onReady();
            return;
        }

        image.addEventListener('load', onReady, { once: true });
        image.addEventListener('error', onReady, { once: true });
    }

    function initCategoryCardFx() {
        document.querySelectorAll('[data-category-card]').forEach(function (card) {
            bindCategoryMediaSkeleton(card);

            if (reducedMotion || card.getAttribute('data-aurora-bound') === '1') {
                return;
            }

            card.setAttribute('data-aurora-bound', '1');
            new CategoryAurora(card);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCategoryCardFx);
    } else {
        initCategoryCardFx();
    }

    document.body.addEventListener('htmx:afterSettle', initCategoryCardFx);
    window.CTDHRCategoryFx = { init: initCategoryCardFx };
})();