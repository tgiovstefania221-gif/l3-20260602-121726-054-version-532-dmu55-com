(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function handleScroll() {
    if (!header) {
      return;
    }

    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  function setupFilters(scope) {
    var searchInput = scope.querySelector('[data-search-input]');
    var categoryFilter = scope.querySelector('[data-category-filter]');
    var yearFilter = scope.querySelector('[data-year-filter]');
    var typeFilter = scope.querySelector('[data-type-filter]');
    var note = document.querySelector('[data-result-note]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');
    if (queryFromUrl && searchInput) {
      searchInput.value = queryFromUrl;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(searchInput && searchInput.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var typeMatched = !type || cardType.indexOf(type) !== -1;
        var matched = (!query || text.indexOf(query) !== -1)
          && (!category || cardCategory === category)
          && (!year || cardYear === year)
          && typeMatched;

        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (note) {
        note.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(setupFilters);

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var startButton = player.querySelector('[data-player-start]');
    var source = player.getAttribute('data-video-src');
    var hlsInstance = null;
    var hasLoaded = false;

    function loadSource() {
      if (!video || !source || hasLoaded) {
        return;
      }

      hasLoaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      loadSource();
      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          if (startButton) {
            startButton.classList.remove('is-hidden');
          }
        });
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });

  document.querySelectorAll('[data-fullscreen]').forEach(function (button) {
    button.addEventListener('click', function () {
      var player = button.closest('.player-section');
      var video = player && player.querySelector('video');
      var target = video || player;

      if (!target) {
        return;
      }

      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
      }
    });
  });
})();
