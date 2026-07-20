/**
 * perf.js — Rendimiento del portafolio.
 *
 * Dos causas de que la web se sintiera pesada:
 *  1) Las animaciones del hero (partículas con shadowBlur + brazo KUKA con chispas)
 *     corrían a 60fps SIEMPRE, incluso con el hero fuera de pantalla.
 *  2) Todos los videos de los carruseles se reproducían a la vez, aunque no
 *     estuvieran visibles ni fueran el slide activo.
 *
 * Este módulo:
 *  - Publica window.__heroVisible (lo usan effects.js y kuka.js para bajar a ~3fps
 *    cuando el hero no se ve, sin matar el bucle para que pueda reanudarse).
 *  - Reproduce SOLO los videos visibles y que además son el slide activo del carrusel.
 */
(function () {
    'use strict';

    // ---------- 1) Visibilidad del hero ----------
    window.__heroVisible = true;
    const hero = document.querySelector('#kuka-hero-wrapper') ||
                 document.querySelector('.hero') ||
                 document.querySelector('#hero-content');

    if (hero && 'IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            entries.forEach((e) => { window.__heroVisible = e.isIntersecting; });
        }, { threshold: 0.01 }).observe(hero);
    }
    // Pestaña oculta -> tratar como no visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) window.__heroVisible = false;
        else if (hero) {
            const r = hero.getBoundingClientRect();
            window.__heroVisible = r.bottom > 0 && r.top < window.innerHeight;
        }
    });

    // ---------- 2) Videos: solo el visible y activo ----------
    const videos = Array.from(document.querySelectorAll('video'));
    if (!videos.length) return;

    const visible = new WeakSet();

    function esActivo(v) {
        // Si está dentro de un carrusel, solo suena el slide .active
        const item = v.closest('.canvas-item');
        if (item) return item.classList.contains('active');
        return true;
    }

    function actualizar() {
        videos.forEach((v) => {
            const debeSonar = visible.has(v) && esActivo(v) && !document.hidden;
            if (debeSonar) {
                if (v.paused) v.play().catch(() => {});
            } else if (!v.paused) {
                v.pause();
            }
        });
    }

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) visible.add(e.target);
                else visible.delete(e.target);
            });
            actualizar();
        }, { threshold: 0.15 });
        videos.forEach((v) => io.observe(v));
    } else {
        videos.forEach((v) => visible.add(v));
    }

    // Reaccionar a los cambios de slide del carrusel
    if ('MutationObserver' in window) {
        const mo = new MutationObserver(actualizar);
        document.querySelectorAll('.canvas-item').forEach((it) => {
            mo.observe(it, { attributes: true, attributeFilter: ['class'] });
        });
    }

    document.addEventListener('visibilitychange', actualizar);
    window.addEventListener('load', actualizar);
    actualizar();
})();
