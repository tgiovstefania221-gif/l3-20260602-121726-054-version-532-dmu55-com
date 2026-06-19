(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    qsa('.filter-area').forEach(function (area) {
      var input = qs('[data-search-input]', area);
      var year = qs('[data-year-filter]', area);
      var type = qs('[data-type-filter]', area);
      var region = qs('[data-region-filter]', area);
      var cards = qsa('[data-card]', area);
      var empty = qs('[data-empty]', area);

      function selected(control) {
        return control ? String(control.value || '').trim().toLowerCase() : '';
      }

      function apply() {
        var query = selected(input);
        var yearValue = selected(year);
        var typeValue = selected(type);
        var regionValue = selected(region);
        var visible = 0;

        cards.forEach(function (card) {
          var text = String(card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
          var cardType = String(card.getAttribute('data-type') || '').toLowerCase();
          var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
          var match = true;

          if (query && text.indexOf(query) === -1) {
            match = false;
          }
          if (yearValue && cardYear !== yearValue) {
            match = false;
          }
          if (typeValue && cardType !== typeValue) {
            match = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            match = false;
          }

          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('[data-play-button]', shell);
      if (!video || !button) {
        return;
      }
      var url = video.getAttribute('data-hls');
      var ready = false;
      var hls = null;

      function load() {
        if (ready || !url) {
          return;
        }
        ready = true;
        shell.classList.add('loading');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.remove('loading');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
        } else {
          video.src = url;
          shell.classList.remove('loading');
        }
      }

      function play() {
        load();
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('playing', function () {
        shell.classList.add('playing');
        shell.classList.remove('loading');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('playing');
      });
      video.addEventListener('canplay', function () {
        shell.classList.remove('loading');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
