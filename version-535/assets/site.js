(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var nav = qs('[data-site-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  var heroIndex = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setHero(i);
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setHero(heroIndex + 1);
      }, 5200);
    });
  });

  if (slides.length > 1) {
    timer = window.setInterval(function () {
      setHero(heroIndex + 1);
    }, 5200);
  }

  var searchInput = qs('[data-search-input]');
  var yearSelect = qs('[data-year-filter]');
  var regionSelect = qs('[data-region-filter]');
  var emptyBox = qs('[data-filter-empty]');

  function matchValue(source, target) {
    return !target || String(source || '').indexOf(target) !== -1;
  }

  function filterCards() {
    var cards = qsa('[data-movie-card]');
    if (!cards.length) {
      return;
    }
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.category, card.dataset.year].join(' ').toLowerCase();
      var ok = matchValue(haystack, keyword) && matchValue(card.dataset.year, year) && matchValue(card.dataset.region, region);
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (emptyBox) {
      emptyBox.style.display = visible ? 'none' : 'block';
    }
  }

  [searchInput, yearSelect, regionSelect].forEach(function (el) {
    if (el) {
      el.addEventListener('input', filterCards);
      el.addEventListener('change', filterCards);
    }
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = qs('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.setAttribute('data-hls-loader', '1');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  var video = qs('[data-player]');
  var overlay = qs('[data-player-overlay]');
  var playButton = qs('[data-play-button]');
  var playerStatus = qs('[data-player-status]');
  var playerStarted = false;

  function setStatus(text) {
    if (playerStatus) {
      playerStatus.textContent = text;
    }
  }

  function playVideo() {
    if (!video || playerStarted) {
      if (video) {
        video.play().catch(function () {});
      }
      return;
    }
    var url = video.getAttribute('data-src');
    if (!url) {
      setStatus('播放源加载失败');
      return;
    }
    playerStarted = true;
    setStatus('正在加载播放');
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          setStatus('点击视频继续播放');
        });
      }, { once: true });
      return;
    }
    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(function () {
            setStatus('');
          }).catch(function () {
            setStatus('点击视频继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setStatus('播放连接正在重试');
        });
      } else {
        setStatus('当前设备暂不支持播放');
      }
    });
  }

  if (playButton) {
    playButton.addEventListener('click', playVideo);
  }
  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }
  if (video) {
    video.addEventListener('click', playVideo);
  }
})();
