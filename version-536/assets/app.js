(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) return;
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var selected = slideIndex === active;
        slide.classList.toggle("is-active", selected);
        slide.setAttribute("aria-hidden", selected ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var input = document.getElementById("movieSearch");
    var typeFilter = document.getElementById("typeFilter");
    var yearFilter = document.getElementById("yearFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) return;

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (input && query) input.value = query;

    function matchYear(year, range) {
      var value = Number.parseInt(year, 10);
      if (!range || Number.isNaN(value)) return true;
      if (range === "2020+") return value >= 2020;
      if (range === "2010-2019") return value >= 2010 && value <= 2019;
      if (range === "before-2010") return value < 2010;
      return true;
    }

    function apply() {
      var text = input ? input.value.trim().toLowerCase() : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-text") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var ok = (!text || haystack.indexOf(text) !== -1) && (!type || cardType.indexOf(type) !== -1) && matchYear(cardYear, year);
        card.hidden = !ok;
        if (ok) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    [input, typeFilter, yearFilter].forEach(function (control) {
      if (control) control.addEventListener("input", apply);
      if (control) control.addEventListener("change", apply);
    });
    apply();
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell[data-stream]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".play-overlay");
      var stream = shell.getAttribute("data-stream");
      var attached = false;
      var hls = null;
      if (!video || !overlay || !stream) return;

      function attach() {
        return new Promise(function (resolve, reject) {
          if (attached) {
            resolve();
            return;
          }
          attached = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.addEventListener("loadedmetadata", resolve, { once: true });
            video.addEventListener("error", reject, { once: true });
            video.load();
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) return;
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                return;
              }
              if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                return;
              }
              reject();
            });
            return;
          }
          video.src = stream;
          video.addEventListener("loadedmetadata", resolve, { once: true });
          video.addEventListener("error", reject, { once: true });
          video.load();
        });
      }

      function play() {
        shell.classList.remove("has-error");
        overlay.classList.add("is-hidden");
        video.controls = true;
        attach().then(function () {
          return video.play();
        }).catch(function () {
          shell.classList.add("has-error");
          overlay.classList.remove("is-hidden");
        });
      }

      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!attached || video.paused) play();
      });
      window.addEventListener("pagehide", function () {
        if (hls) hls.destroy();
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
