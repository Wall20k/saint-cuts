(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (reduceMotion || !isFinePointer) return;

  /* ---- Card tilt (map card, service rows) ---- */
  function bindCardTilt(el, strengthX, strengthY) {
    el.classList.add('tilt');
    var raf = null;

    el.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * strengthX;
        var ry = (px - 0.5) * strengthY;
        el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        el.style.setProperty('--shine-x', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--shine-y', (py * 100).toFixed(1) + '%');
        raf = null;
      });
    });

    el.addEventListener('mouseleave', function () {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  }

  document.querySelectorAll('.map-card').forEach(function (el) { bindCardTilt(el, 10, 12); });
  /* Service rows are short and wide, so the same subtle angles used for a
     roughly-square card barely register -- push both axes harder so the
     tilt is actually visible on a shallow rectangle. */
  document.querySelectorAll('.service-row').forEach(function (el) { bindCardTilt(el, 22, 8); });

  /* ---- Full-bleed video tilt (hero + booking CTA panes) ---- */
  function bindMediaTilt(sectionId, mediaId, strengthX, strengthY) {
    var section = document.getElementById(sectionId);
    var media = document.getElementById(mediaId);
    if (!section || !media) return;
    var raf = null;

    section.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var rect = section.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * strengthX;
        var ry = (px - 0.5) * strengthY;
        media.style.setProperty('--tilt-rx', rx.toFixed(2) + 'deg');
        media.style.setProperty('--tilt-ry', ry.toFixed(2) + 'deg');
        raf = null;
      });
    });
    section.addEventListener('mouseleave', function () {
      media.style.setProperty('--tilt-rx', '0deg');
      media.style.setProperty('--tilt-ry', '0deg');
    });
  }

  bindMediaTilt('hero', 'hero-media', 3.5, 4.5);
  bindMediaTilt('booking', 'booking-media', 2.5, 3.5);
})();
