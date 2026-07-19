(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (reduceMotion || !isFinePointer) return;

  /* ---- Card tilt (about portrait, map card, service rows) ---- */
  var tiltEls = document.querySelectorAll('.about-media, .map-card, .service-row');
  tiltEls.forEach(function (el) {
    el.classList.add('tilt');
    var raf = null;

    el.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 10;
        var ry = (px - 0.5) * 12;
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
  });

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
