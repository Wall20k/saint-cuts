(function () {
  'use strict';

  var root = document.getElementById('work-carousel');
  var track = document.getElementById('carousel-track');
  if (!root || !track) return;

  var slides = Array.prototype.slice.call(track.children);
  var dots = Array.prototype.slice.call(root.querySelectorAll('.carousel-dot'));
  var prevBtn = root.querySelector('.carousel-prev');
  var nextBtn = root.querySelector('.carousel-next');
  var viewport = root.querySelector('.carousel-viewport');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IMAGE_DURATION = 2000;
  var VIDEO_FALLBACK = 16000;
  var HOLD_THRESHOLD = 300;

  var index = 0;
  var timer = null;
  var inView = true;
  var held = false;
  var currentAdvance = null;

  function activeVideo() {
    var slide = slides[index];
    return slide.dataset.type === 'video' ? slide.querySelector('video') : null;
  }

  function pauseAllVideos() {
    slides.forEach(function (s) {
      var v = s.querySelector('video');
      if (v) v.pause();
    });
  }

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function render() {
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    dots.forEach(function (d, i) {
      var active = i === index;
      d.classList.toggle('active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function playVideo(video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function armFallback() {
    clearTimer();
    timer = window.setTimeout(function () {
      if (currentAdvance) currentAdvance();
    }, VIDEO_FALLBACK);
  }

  function armImageTimer() {
    clearTimer();
    timer = window.setTimeout(function () { goTo(index + 1); }, IMAGE_DURATION);
  }

  /* Called whenever a slide becomes newly active (fresh start, from goTo). */
  function activateSlide() {
    if (reduceMotion || !inView) { currentAdvance = null; return; }

    var video = activeVideo();
    if (video) {
      video.currentTime = 0;
      var advanced = false;
      currentAdvance = function () {
        if (advanced) return;
        advanced = true;
        goTo(index + 1);
      };
      video.addEventListener('ended', currentAdvance, { once: true });
      playVideo(video);
      armFallback();
    } else {
      currentAdvance = null;
      armImageTimer();
    }
  }

  /* Pause without losing playback position (hold gesture only). */
  function pauseForHold() {
    clearTimer();
    var video = activeVideo();
    if (video) video.pause();
  }

  /* Resume exactly where it left off after a hold ends. */
  function resumeFromHold() {
    if (reduceMotion || !inView) return;
    var video = activeVideo();
    if (video) {
      playVideo(video);
      armFallback();
    } else {
      armImageTimer();
    }
  }

  function goTo(i) {
    clearTimer();
    pauseAllVideos();
    index = (i + slides.length) % slides.length;
    render();
    activateSlide();
  }

  prevBtn.addEventListener('click', function () { goTo(index - 1); });
  nextBtn.addEventListener('click', function () { goTo(index + 1); });
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () { goTo(i); });
  });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { goTo(index - 1); }
    else if (e.key === 'ArrowRight') { goTo(index + 1); }
  });

  /* ---- Press-and-HOLD to pause (plain clicks/taps never pause) ---- */
  var holdTimer = null;

  function onPointerDown() {
    window.clearTimeout(holdTimer);
    holdTimer = window.setTimeout(function () {
      held = true;
      pauseForHold();
    }, HOLD_THRESHOLD);
  }

  function onPointerRelease() {
    window.clearTimeout(holdTimer);
    if (held) {
      held = false;
      resumeFromHold();
    }
  }

  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointerup', onPointerRelease);
  root.addEventListener('pointercancel', onPointerRelease);
  root.addEventListener('pointerleave', onPointerRelease);

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) {
        if (!held) activateSlide();
      } else {
        clearTimer();
        var v = activeVideo();
        if (v) v.pause();
      }
    }, { threshold: 0.4 });
    io.observe(root);
  }

  /* ---- Swipe navigation (does not itself pause anything) ---- */
  var startX = 0;
  var deltaX = 0;
  var dragging = false;

  viewport.addEventListener('touchstart', function (e) {
    dragging = true;
    startX = e.touches[0].clientX;
    deltaX = 0;
  }, { passive: true });

  viewport.addEventListener('touchmove', function (e) {
    if (!dragging) return;
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });

  viewport.addEventListener('touchend', function () {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(deltaX) > 40) {
      goTo(deltaX < 0 ? index + 1 : index - 1);
    }
    deltaX = 0;
  });

  render();
  activateSlide();
})();
