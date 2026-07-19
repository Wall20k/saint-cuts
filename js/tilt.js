(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var isFinePointer = window.matchMedia('(pointer: fine)').matches;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isFinePointer && !isTouch) return;

  /* A mouse can hover and move freely, so tilt tracks the cursor live. A
     finger has no hover -- the closest equivalent is tracking the touch
     point itself while it's down on the element, then springing back to
     flat on release. Touch listeners are passive so a vertical swipe still
     scrolls the page normally; the tilt is just a side effect of contact. */
  function bindTilt(target, apply, reset) {
    var raf = null;
    var update = function (clientX, clientY) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        apply(clientX, clientY);
        raf = null;
      });
    };

    if (isFinePointer) {
      target.addEventListener('mousemove', function (e) { update(e.clientX, e.clientY); });
      target.addEventListener('mouseleave', reset);
    }
    if (isTouch) {
      target.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        if (t) update(t.clientX, t.clientY);
      }, { passive: true });
      target.addEventListener('touchmove', function (e) {
        var t = e.touches[0];
        if (t) update(t.clientX, t.clientY);
      }, { passive: true });
      target.addEventListener('touchend', reset);
      target.addEventListener('touchcancel', reset);
    }
  }

  /* ---- Card tilt (map card, service rows) ---- */
  function bindCardTilt(el, strengthX, strengthY) {
    el.classList.add('tilt');
    bindTilt(el, function (clientX, clientY) {
      var rect = el.getBoundingClientRect();
      var px = (clientX - rect.left) / rect.width;
      var py = (clientY - rect.top) / rect.height;
      var rx = (0.5 - py) * strengthX;
      var ry = (px - 0.5) * strengthY;
      el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      el.style.setProperty('--shine-x', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--shine-y', (py * 100).toFixed(1) + '%');
    }, function () {
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
    bindTilt(section, function (clientX, clientY) {
      var rect = section.getBoundingClientRect();
      var px = (clientX - rect.left) / rect.width;
      var py = (clientY - rect.top) / rect.height;
      var rx = (0.5 - py) * strengthX;
      var ry = (px - 0.5) * strengthY;
      media.style.setProperty('--tilt-rx', rx.toFixed(2) + 'deg');
      media.style.setProperty('--tilt-ry', ry.toFixed(2) + 'deg');
    }, function () {
      media.style.setProperty('--tilt-rx', '0deg');
      media.style.setProperty('--tilt-ry', '0deg');
    });
  }

  bindMediaTilt('hero', 'hero-media', 3.5, 4.5);
  bindMediaTilt('booking', 'booking-media', 2.5, 3.5);
})();
