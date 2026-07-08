/**
 * Floating particle field for auth pages (login / register / verify).
 */
(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    var canvas = document.getElementById('auth-particles');
    if (!canvas) {
        return;
    }

    var ctx = canvas.getContext('2d');
    var particles = [];
    var animId = null;
    var colors = ['rgba(157, 248, 145, 0.7)', 'rgba(0, 176, 255, 0.6)', 'rgba(255, 255, 255, 0.5)', 'rgba(216, 27, 96, 0.45)', 'rgba(255, 214, 0, 0.45)'];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles(count) {
        particles = [];
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2.2 + 0.6,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulse: Math.random() * Math.PI * 2,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.02;

            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.y > canvas.height + 10) p.y = -10;

            var alpha = 0.35 + Math.sin(p.pulse) * 0.25;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(/[\d.]+\)$/, alpha + ')');
            ctx.fill();
        }

        for (var a = 0; a < particles.length; a++) {
            for (var b = a + 1; b < particles.length; b++) {
                var dx = particles[a].x - particles[b].x;
                var dy = particles[a].y - particles[b].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.08 * (1 - dist / 100)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animId = requestAnimationFrame(draw);
    }

    function init() {
        resize();
        var count = Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));
        createParticles(Math.max(35, count));
        if (animId) cancelAnimationFrame(animId);
        draw();
    }

    window.addEventListener('resize', function () {
        resize();
        init();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();