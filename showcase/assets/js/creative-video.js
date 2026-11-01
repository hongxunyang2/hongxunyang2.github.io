(function () {
    'use strict';

    // Keep the native player usable when scroll observation is unavailable.
    if (!('IntersectionObserver' in window)) return;

    document.querySelectorAll('#creative-video, [data-scroll-video]').forEach(function (video) {
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        var inView = false;
        var userPaused = false;
        var automaticPause = false;
        var playPending = false;
        video.muted = true;

        function canAutoplay() {
            return inView && !document.hidden && !reducedMotion.matches;
        }

        function pauseAutomatically() {
            if (!video.paused) {
                automaticPause = true;
                video.pause();
            }
        }

        function syncPlayback() {
            if (!canAutoplay()) {
                pauseAutomatically();
                return;
            }
            if (!video.paused || video.ended || userPaused || playPending) return;
            playPending = true;
            var attempt = video.play();
            if (attempt && attempt.then) {
                attempt.then(function () {
                    playPending = false;
                    if (!canAutoplay()) pauseAutomatically();
                }, function () {
                    // Browser settings can block autoplay. Leave the poster and controls available.
                    playPending = false;
                });
            } else {
                playPending = false;
            }
        }

        video.addEventListener('pause', function () {
            if (automaticPause) {
                automaticPause = false;
            } else if (canAutoplay() && !video.ended) {
                userPaused = true;
            }
        });
        video.addEventListener('play', function () { userPaused = false; });

        var observer = new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
            syncPlayback();
        }, { threshold: [0, 0.25] });
        observer.observe(video);
        document.addEventListener('visibilitychange', syncPlayback);
        reducedMotion.addEventListener('change', syncPlayback);
    });
})();
