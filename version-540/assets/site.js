(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.js-menu-button');
        var mobileNav = document.querySelector('.js-mobile-nav');

        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        initHeroSlider();
        initFilters();
        applyQuerySearch();
    });

    function initHeroSlider() {
        var root = document.querySelector('.js-hero-slider');

        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        var prev = root.querySelector('.hero-prev');
        var next = root.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-slide') || 0);
                show(index);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var containers = Array.prototype.slice.call(document.querySelectorAll('.js-card-container'));

        containers.forEach(function (container) {
            var scope = container.closest('.filter-section') || document;
            var input = scope.querySelector('.js-filter-input');
            var category = scope.querySelector('.js-filter-category');
            var year = scope.querySelector('.js-filter-year');
            var sort = scope.querySelector('.js-sort-select');
            var empty = scope.querySelector('.js-empty-state');
            var cards = Array.prototype.slice.call(container.querySelectorAll('.filter-card'));
            var original = cards.slice();

            function match(card) {
                var query = normalize(input && input.value);
                var selectedCategory = category ? category.value : 'all';
                var selectedYear = year ? year.value : 'all';
                var text = normalize(card.getAttribute('data-search'));
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var queryOk = !query || text.indexOf(query) !== -1;
                var categoryOk = selectedCategory === 'all' || cardCategory === selectedCategory;
                var yearOk = selectedYear === 'all' || cardYear === selectedYear;

                return queryOk && categoryOk && yearOk;
            }

            function sortCards() {
                var mode = sort ? sort.value : 'default';
                var nextCards = original.slice();

                if (mode === 'year-desc') {
                    nextCards.sort(function (a, b) {
                        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                    });
                }

                if (mode === 'title-asc') {
                    nextCards.sort(function (a, b) {
                        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
                    });
                }

                nextCards.forEach(function (card) {
                    container.appendChild(card);
                });
            }

            function update() {
                var visible = 0;
                sortCards();

                original.forEach(function (card) {
                    var ok = match(card);
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, category, year, sort].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', update);
                    control.addEventListener('change', update);
                }
            });

            update();
        });
    }

    function applyQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        var input = document.querySelector('.js-filter-input');

        if (query && input) {
            input.value = query;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    window.createMoviePlayer = function (streamUrl) {
        var shell = document.querySelector('.js-player-shell');
        var video = document.querySelector('.js-movie-video');
        var triggers = Array.prototype.slice.call(document.querySelectorAll('.js-play-trigger'));
        var attached = false;
        var hls = null;

        if (!shell || !video || !streamUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            attached = true;
        }

        function play() {
            attach();
            shell.classList.add('is-playing');
            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', play);
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
