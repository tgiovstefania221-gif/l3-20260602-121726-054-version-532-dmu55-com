(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (button && nav) {
      button.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }
      function play() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          show(i);
          play();
        });
      });
      if (slides.length > 1) {
        play();
      }
    }

    var input = document.querySelector("[data-filter-input]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var chosenYear = "all";

    if (input && query) {
      input.value = query;
    }

    function applyFilter() {
      var value = input ? input.value.trim().toLowerCase() : "";
      var category = categorySelect ? categorySelect.value : "all";
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var year = card.getAttribute("data-year") || "";
        var cat = card.getAttribute("data-category") || "";
        var passText = !value || haystack.indexOf(value) !== -1;
        var passYear = chosenYear === "all" || year.indexOf(chosenYear) !== -1;
        var passCategory = category === "all" || cat === category;
        card.classList.toggle("is-hidden", !(passText && passYear && passCategory));
      });
    }

    if (input || categorySelect || yearButtons.length) {
      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (categorySelect) {
        categorySelect.addEventListener("change", applyFilter);
      }
      yearButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          chosenYear = btn.getAttribute("data-filter-year") || "all";
          yearButtons.forEach(function (other) {
            other.classList.toggle("active", other === btn);
          });
          applyFilter();
        });
      });
      applyFilter();
    }
  });
})();
