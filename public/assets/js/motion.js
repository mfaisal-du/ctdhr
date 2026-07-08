/**
 * CTDHR Motion System
 * Framer-inspired scroll reveals, counters, 3D hero tilt, and micro-interactions.
 * Works with PHP + Alpine + HTMX (no React required).
 */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function animateCounter(el, end, duration, suffix) {
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) {
                startTime = timestamp;
            }

            var progress = Math.min((timestamp - startTime) / duration, 1);
            var value = Math.floor(start + (end - start) * easeOutCubic(progress));
            el.textContent = value + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = end + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    function initReveal() {
        var elements = document.querySelectorAll('[data-reveal]:not(.is-revealed)');

        if (!elements.length) {
            return;
        }

        if (reducedMotion) {
            elements.forEach(function (el) {
                el.classList.add('is-revealed');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                var el = entry.target;
                var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);

                window.setTimeout(function () {
                    el.classList.add('is-revealed');
                }, delay);

                observer.unobserve(el);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -48px 0px',
        });

        elements.forEach(function (el) {
            observer.observe(el);
        });
    }

    function initCounters() {
        var counters = document.querySelectorAll('[data-counter]:not([data-counter-done])');

        if (!counters.length) {
            return;
        }

        if (reducedMotion) {
            counters.forEach(function (el) {
                var target = parseInt(el.getAttribute('data-counter') || '0', 10);
                var suffix = el.getAttribute('data-counter-suffix') || '';
                el.textContent = target + suffix;
                el.setAttribute('data-counter-done', '1');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                var el = entry.target;
                var target = parseInt(el.getAttribute('data-counter') || '0', 10);
                var duration = parseInt(el.getAttribute('data-counter-duration') || '1600', 10);
                var suffix = el.getAttribute('data-counter-suffix') || '';

                el.setAttribute('data-counter-done', '1');
                animateCounter(el, target, duration, suffix);
                observer.unobserve(el);
            });
        }, { threshold: 0.4 });

        counters.forEach(function (el) {
            observer.observe(el);
        });
    }

    function initHeroTilt() {
        if (reducedMotion) {
            return;
        }

        document.querySelectorAll('[data-hero-tilt]').forEach(function (wrapper) {
            var inner = wrapper.querySelector('[data-hero-tilt-inner]');

            if (!inner) {
                return;
            }

            var raf = null;

            wrapper.addEventListener('mousemove', function (event) {
                if (raf) {
                    cancelAnimationFrame(raf);
                }

                raf = requestAnimationFrame(function () {
                    var rect = wrapper.getBoundingClientRect();
                    var x = (event.clientX - rect.left) / rect.width - 0.5;
                    var y = (event.clientY - rect.top) / rect.height - 0.5;

                    inner.style.transform =
                        'perspective(1200px) rotateY(' + (x * 10).toFixed(2) + 'deg) ' +
                        'rotateX(' + (-y * 8).toFixed(2) + 'deg) ' +
                        'scale3d(1.03, 1.03, 1.03)';
                });
            });

            wrapper.addEventListener('mouseleave', function () {
                inner.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    function initStagger() {
        document.querySelectorAll('[data-stagger]').forEach(function (parent) {
            var delay = parseInt(parent.getAttribute('data-stagger') || '80', 10);
            var items = parent.querySelectorAll('[data-stagger-item]');

            items.forEach(function (item, index) {
                if (!item.hasAttribute('data-reveal')) {
                    item.setAttribute('data-reveal', '');
                    item.setAttribute('data-reveal-delay', String(index * delay));
                    item.classList.add('reveal-fade-up');
                }
            });
        });
    }

    function initNavScroll() {
        var header = document.querySelector('[data-nav-scroll]');

        if (!header) {
            return;
        }

        var onScroll = function () {
            if (window.scrollY > 8) {
                header.classList.add('nav-scrolled');
            } else {
                header.classList.remove('nav-scrolled');
            }
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function initMagneticButtons() {
        if (reducedMotion || window.matchMedia('(max-width: 768px)').matches) {
            return;
        }

        document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
            btn.addEventListener('mousemove', function (event) {
                var rect = btn.getBoundingClientRect();
                var x = event.clientX - rect.left - rect.width / 2;
                var y = event.clientY - rect.top - rect.height / 2;

                btn.style.transform = 'translate(' + (x * 0.15).toFixed(1) + 'px, ' + (y * 0.2).toFixed(1) + 'px)';
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
            });
        });
    }

    function initParallaxOrbs() {
        if (reducedMotion) {
            return;
        }

        var orbs = document.querySelectorAll('[data-parallax-orb]:not([data-parallax-bound])');

        if (!orbs.length) {
            return;
        }

        orbs.forEach(function (orb) {
            orb.setAttribute('data-parallax-bound', '1');
        });

        var ticking = false;

        function updateOrbs() {
            var scrollY = window.scrollY;

            orbs.forEach(function (orb) {
                var speed = parseFloat(orb.getAttribute('data-parallax-orb') || '0.2');
                orb.style.transform = 'translate3d(0, ' + (scrollY * speed).toFixed(1) + 'px, 0)';
            });

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updateOrbs);
                ticking = true;
            }
        }, { passive: true });

        updateOrbs();
    }

    function initParallaxBackground() {
        if (reducedMotion) {
            return;
        }

        var sections = document.querySelectorAll('[data-parallax-section]:not([data-parallax-section-bound])');

        if (!sections.length) {
            return;
        }

        var items = [];

        sections.forEach(function (section) {
            section.setAttribute('data-parallax-section-bound', '1');

            var bg = section.querySelector('[data-parallax-bg]');

            if (!bg) {
                return;
            }

            items.push({
                section: section,
                bg: bg,
                speed: parseFloat(bg.getAttribute('data-parallax-bg') || '0.35'),
            });
        });

        if (!items.length) {
            return;
        }

        var ticking = false;

        function updateBackgrounds() {
            var windowH = window.innerHeight;

            items.forEach(function (item) {
                var rect = item.section.getBoundingClientRect();

                if (rect.bottom < 0 || rect.top > windowH) {
                    return;
                }

                var progress = (windowH - rect.top) / (windowH + rect.height);
                var offset = (progress - 0.5) * rect.height * item.speed;

                item.bg.style.transform =
                    'translate3d(0, ' + offset.toFixed(1) + 'px, 0) scale(1.1)';
            });

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updateBackgrounds);
                ticking = true;
            }
        }, { passive: true });

        updateBackgrounds();
    }

    function initCategoryCarousel() {
        document.querySelectorAll('[data-category-carousel]:not([data-carousel-bound])').forEach(function (root) {
            root.setAttribute('data-carousel-bound', '1');

            var viewport = root.querySelector('[data-carousel-viewport]');
            var track = root.querySelector('[data-carousel-track]');
            var prevBtn = root.closest('section') ?
                root.closest('section').querySelector('[data-carousel-prev]') :
                document.querySelector('[data-carousel-prev]');
            var nextBtn = root.closest('section') ?
                root.closest('section').querySelector('[data-carousel-next]') :
                document.querySelector('[data-carousel-next]');
            var dotsWrap = root.querySelector('[data-carousel-dots]');
            var counterEl = root.querySelector('[data-carousel-counter]');

            if (!viewport || !track) {
                return;
            }

            var slides = Array.prototype.slice.call(track.querySelectorAll('.category-carousel-slide'));

            if (!slides.length) {
                return;
            }

            var scrollTicking = false;

            function getGap() {
                var styles = window.getComputedStyle(track);
                return parseFloat(styles.columnGap || styles.gap || '0') || 0;
            }

            function getSlideStride() {
                if (!slides[0]) {
                    return viewport.clientWidth;
                }

                return slides[0].getBoundingClientRect().width + getGap();
            }

            function getMaxScroll() {
                return Math.max(0, track.scrollWidth - viewport.clientWidth);
            }

            function getPageCount() {
                var stride = getSlideStride();

                if (!stride) {
                    return 1;
                }

                return Math.max(1, Math.ceil((getMaxScroll() + stride * 0.5) / stride) + 1);
            }

            function getCurrentIndex() {
                var stride = getSlideStride();

                if (!stride) {
                    return 0;
                }

                var scrollPos = Math.abs(viewport.scrollLeft);
                return Math.min(slides.length - 1, Math.round(scrollPos / stride));
            }

            function scrollToIndex(index) {
                var slide = slides[Math.min(slides.length - 1, Math.max(0, index))];

                if (!slide) {
                    return;
                }

                slide.scrollIntoView({
                    behavior: reducedMotion ? 'auto' : 'smooth',
                    inline: 'start',
                    block: 'nearest',
                });
            }

            function updateControls() {
                var maxScroll = getMaxScroll();
                var scrollPos = Math.abs(viewport.scrollLeft);
                var atStart = scrollPos <= 4;
                var atEnd = scrollPos >= maxScroll - 4;
                var index = getCurrentIndex();
                var pages = getPageCount();

                if (prevBtn) {
                    prevBtn.disabled = atStart;
                }

                if (nextBtn) {
                    nextBtn.disabled = atEnd;
                }

                if (counterEl) {
                    counterEl.textContent = (index + 1) + ' / ' + slides.length;
                }

                if (dotsWrap) {
                    var activePage = getCurrentIndex();
                    dotsWrap.innerHTML = '';

                    for (var i = 0; i < pages; i += 1) {
                        var dot = document.createElement('button');
                        var isActive = i === activePage;
                        dot.type = 'button';
                        dot.className = 'category-carousel-dot' + (isActive ? ' is-active' : '');
                        dot.setAttribute('role', 'tab');
                        dot.setAttribute('aria-label', 'Page ' + (i + 1));
                        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');

                        (function (pageIndex) {
                            dot.addEventListener('click', function () {
                                scrollToIndex(pageIndex);
                            });
                        })(i);

                        dotsWrap.appendChild(dot);
                    }
                }

                root.classList.toggle('is-at-start', atStart);
                root.classList.toggle('is-at-end', atEnd);
            }

            function onScroll() {
                if (!scrollTicking) {
                    scrollTicking = true;
                    requestAnimationFrame(function () {
                        updateControls();
                        scrollTicking = false;
                    });
                }
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', function () {
                    var stride = getSlideStride();
                    var scrollPos = Math.abs(viewport.scrollLeft);
                    scrollToIndex(Math.max(0, Math.round(scrollPos / stride) - 1));
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    var stride = getSlideStride();
                    var scrollPos = Math.abs(viewport.scrollLeft);
                    scrollToIndex(Math.round(scrollPos / stride) + 1);
                });
            }

            viewport.addEventListener('scroll', onScroll, { passive: true });

            viewport.addEventListener('keydown', function (event) {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    if (prevBtn && !prevBtn.disabled) {
                        prevBtn.click();
                    }
                }

                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    if (nextBtn && !nextBtn.disabled) {
                        nextBtn.click();
                    }
                }
            });

            var touchStartX = 0;
            var touchStartY = 0;

            viewport.addEventListener('touchstart', function (event) {
                if (!event.touches.length) {
                    return;
                }

                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            }, { passive: true });

            viewport.addEventListener('touchend', function (event) {
                if (!event.changedTouches.length) {
                    return;
                }

                var deltaX = event.changedTouches[0].clientX - touchStartX;
                var deltaY = event.changedTouches[0].clientY - touchStartY;

                if (Math.abs(deltaX) < 40 || Math.abs(deltaY) > Math.abs(deltaX)) {
                    return;
                }

                if (deltaX < 0 && nextBtn && !nextBtn.disabled) {
                    nextBtn.click();
                } else if (deltaX > 0 && prevBtn && !prevBtn.disabled) {
                    prevBtn.click();
                }
            }, { passive: true });

            var resizeTimer;

            window.addEventListener('resize', function () {
                window.clearTimeout(resizeTimer);
                resizeTimer = window.setTimeout(updateControls, 120);
            });

            updateControls();
        });
    }

    function boot() {
        initStagger();
        initReveal();
        initCounters();
        initHeroTilt();
        initNavScroll();
        initMagneticButtons();
        initParallaxOrbs();
        initParallaxBackground();
        initCategoryCarousel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    document.body.addEventListener('htmx:afterSwap', boot);
    document.body.addEventListener('htmx:afterSettle', boot);

    window.CTDHRMotion = { boot: boot };
})();