/**
 * Campus gallery lightbox slider (vanilla JS — works without Alpine scope issues).
 */
(function () {
    'use strict';

    var root = document.getElementById('campus-gallery');
    if (!root) {
        return;
    }

    var images = [];
    try {
        images = JSON.parse(root.getAttribute('data-images') || '[]');
    } catch (e) {
        return;
    }

    if (!images.length) {
        return;
    }

    var lightbox = document.getElementById('campus-gallery-lightbox');
    var lightboxImg = document.getElementById('campus-gallery-lightbox-img');
    var dotsWrap = document.getElementById('campus-gallery-dots');
    if (!lightbox || !lightboxImg) {
        return;
    }

    var index = 0;

    function renderDots() {
        if (!dotsWrap) {
            return;
        }

        dotsWrap.innerHTML = '';
        images.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'w-2 h-2 rounded-full transition-all ' + (i === index ? 'bg-secondary w-5' : 'bg-white/40');
            dot.setAttribute('aria-label', 'Image ' + (i + 1));
            dot.addEventListener('click', function () {
                index = i;
                updateImage();
            });
            dotsWrap.appendChild(dot);
        });
    }

    function updateImage() {
        lightboxImg.src = images[index];
        renderDots();
    }

    function openAt(i) {
        index = i;
        updateImage();
        lightbox.classList.remove('is-hidden');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lightbox.classList.add('is-hidden');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function next() {
        index = (index + 1) % images.length;
        updateImage();
    }

    function prev() {
        index = (index - 1 + images.length) % images.length;
        updateImage();
    }

    root.querySelectorAll('[data-gallery-index]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var i = parseInt(btn.getAttribute('data-gallery-index') || '0', 10);
            openAt(i);
        });
    });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            close();
        }
    });

    lightbox.querySelectorAll('[data-gallery-close]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.stopPropagation();
            close();
        });
    });

    var panel = lightbox.querySelector('.gallery-lightbox-panel');
    if (panel) {
        panel.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    var prevBtn = lightbox.querySelector('[data-gallery-prev]');
    var nextBtn = lightbox.querySelector('[data-gallery-next]');
    if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            prev();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            next();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (lightbox.classList.contains('is-hidden')) {
            return;
        }
        if (e.key === 'Escape') {
            close();
        } else if (e.key === 'ArrowRight') {
            next();
        } else if (e.key === 'ArrowLeft') {
            prev();
        }
    });
})();