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
  var IMAGE_DURATION = 4500;
  var VIDEO_FALLBACK = 16000;

  var index = 0;
  var timer = null;
  var inView = true;
  var hovering = false;

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

  function scheduleNext() {
    clearTimer();
    if (reduceMotion || !inView || hovering) return;

    var video = activeVideo();
    if (video) {
      video.currentTime = 0;
      var advanced = false;
      var advance = function () {
        if (advanced) return;
        advanced = true;
        goTo(index + 1);
      };
      video.addEventListener('ended', advance, { once: true });
      var playPromise = video.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
      timer = window.setTimeout(advance, VIDEO_FALLBACK);
    } else {
      timer = window.setTimeout(function () { goTo(index + 1); }, IMAGE_DURATION);
    }
  }

  function goTo(i) {
    clearTimer();
    pauseAllVideos();
    index = (i + slides.length) % slides.length;
    render();
    scheduleNext();
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

  root.addEventListener('mouseenter', function () {
    hovering = true;
    clearTimer();
    var v = activeVideo();
    if (v) v.pause();
  });
  root.addEventListener('mouseleave', function () {
    hovering = false;
    var v = activeVideo();
    if (v) {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    scheduleNext();
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) {
        scheduleNext();
      } else {
        clearTimer();
        var v = activeVideo();
        if (v) v.pause();
      }
    }, { threshold: 0.4 });
    io.observe(root);
  }

  var startX = 0;
  var deltaX = 0;
  var dragging = false;

  viewport.addEventListener('touchstart', function (e) {
    dragging = true;
    startX = e.touches[0].clientX;
    deltaX = 0;
    clearTimer();
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
    } else {
      scheduleNext();
    }
    deltaX = 0;
  });

  render();
  scheduleNext();
})();
