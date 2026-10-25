(function () {
    'use strict';

    var gallery = document.querySelector('.art-gallery');
    if (!gallery) return;
    var items = Array.prototype.slice.call(gallery.children);
    var layoutFrame;

    function layout() {
        cancelAnimationFrame(layoutFrame);
        layoutFrame = requestAnimationFrame(function () {
            var gap = parseFloat(getComputedStyle(gallery).columnGap) || 0;
            items.forEach(function (item) {
                var span = Math.ceil(item.getBoundingClientRect().height + gap);
                var value = 'span ' + Math.max(1, span);
                if (item.style.gridRowEnd !== value) item.style.gridRowEnd = value;
            });
            gallery.classList.add('art-gallery--masonry');
        });
    }

    if ('ResizeObserver' in window) {
        var sizes = new ResizeObserver(layout);
        sizes.observe(gallery);
        items.forEach(function (item) { sizes.observe(item); });
    }
    window.addEventListener('resize', layout);
    gallery.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('load', layout);
    });
    layout();

    var video = document.getElementById('artFeatureVideo');
    if (!video) return;
    var lightbox = document.getElementById('artLightbox');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var inView = true;
    var userPaused = false;
    var automaticPause = false;

    function pauseAutomatically() {
        if (!video.paused) {
            automaticPause = true;
            video.pause();
        }
    }

    function syncPlayback() {
        if (reducedMotion.matches || document.hidden || !inView || (lightbox && lightbox.open)) {
            pauseAutomatically();
            return;
        }
        if (!userPaused && video.paused) {
            var attempt = video.play();
            // Browser preferences and low-power modes can still block autoplay.
            // Keep the poster and native controls available for manual playback.
            if (attempt && attempt.catch) attempt.catch(function () {});
        }
    }

    video.addEventListener('pause', function () {
        if (automaticPause) {
            automaticPause = false;
        } else if (inView && !document.hidden && !reducedMotion.matches && !(lightbox && lightbox.open)) {
            userPaused = true;
        }
    });
    video.addEventListener('play', function () { userPaused = false; });
    video.addEventListener('loadedmetadata', layout);

    if (reducedMotion.matches) {
        video.autoplay = false;
        pauseAutomatically();
    }
    if ('IntersectionObserver' in window) {
        var visibility = new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
            syncPlayback();
        }, { threshold: [0, 0.15] });
        visibility.observe(video);
    }
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', function () {
        video.autoplay = !reducedMotion.matches;
        syncPlayback();
    });
    if (lightbox) {
        new MutationObserver(syncPlayback).observe(lightbox, { attributes: true, attributeFilter: ['open'] });
    }
    syncPlayback();
})();
