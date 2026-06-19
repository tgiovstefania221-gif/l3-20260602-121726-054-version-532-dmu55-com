function initVideoPlayer(streamUrl) {
  var box = document.querySelector("[data-player]");
  if (!box) {
    return;
  }
  var video = box.querySelector("video");
  var cover = box.querySelector(".player-cover");
  var attached = false;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      box.hlsPlayer = hls;
      return;
    }
    video.src = streamUrl;
  }

  function start() {
    attach();
    box.classList.add("is-active");
    var run = video.play();
    if (run && typeof run.catch === "function") {
      run.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
