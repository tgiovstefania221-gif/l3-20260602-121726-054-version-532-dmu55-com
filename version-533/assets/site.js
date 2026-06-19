document.addEventListener('DOMContentLoaded', function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;
    var heroTimer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            setHero(activeIndex + 1);
        }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            if (heroTimer) {
                window.clearInterval(heroTimer);
            }
            setHero(dotIndex);
            startHero();
        });
    });

    setHero(0);
    startHero();

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-search-input]');
        var regionSelect = filterPanel.querySelector('[data-region-filter]');
        var typeSelect = filterPanel.querySelector('[data-type-filter]');
        var yearSelect = filterPanel.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');

        function normalized(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalized(searchInput && searchInput.value);
            var region = normalized(regionSelect && regionSelect.value);
            var type = normalized(typeSelect && typeSelect.value);
            var year = normalized(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalized(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
                var ok = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }

                if (region && normalized(card.getAttribute('data-region')) !== region) {
                    ok = false;
                }

                if (type && normalized(card.getAttribute('data-type')) !== type) {
                    ok = false;
                }

                if (year && normalized(card.getAttribute('data-year')) !== year) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilters);
                field.addEventListener('change', applyFilters);
            }
        });
    }

    var player = document.querySelector('[data-stream]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-player-button]');
        var streamUrl = player.getAttribute('data-stream');
        var hlsInstance = null;
        var started = false;

        function attachStream() {
            if (!video || !streamUrl || started) {
                return;
            }

            started = true;
            player.classList.add('is-playing');
            video.setAttribute('controls', 'controls');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
            }
        }

        if (button) {
            button.addEventListener('click', attachStream);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    attachStream();
                } else if (video.paused) {
                    video.play().catch(function () {});
                }
            });

            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    }
});
