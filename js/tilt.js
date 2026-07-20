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
     scrolls the page normally; the tilt is just a side effect of contact.

     While actively tracking, the CSS transition on `transform` is switched
     off (see .tracking in styles.css). Browsers interpolate a combined
     rotateX+rotateY change as a single 3D matrix, not as two independent
     angles, so animating straight from one tilt to a very different one
     can swing through an unrelated-looking orientation mid-transition --
     it visibly twists sideways for a frame instead of tracking the
     pointer. Applying every live update instantly avoids that; the
     transition is only re-enabled for the final spring back to flat. */
  function bindTilt(target, apply, reset) {
    var raf = null;
    var update = function (clientX, clientY) {
      target.classList.add('tracking');
      if (raf) return;
      raf = requestAnimationFrame(function () {
        apply(clientX, clientY);
        raf = null;
      });
    };
    var release = function () {
      target.classList.remove('tracking');
      reset();
    };

    if (isFinePointer) {
      target.addEventListener('mousemove', function (e) { update(e.clientX, e.clientY); });
      target.addEventListener('mouseleave', release);
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
      target.addEventListener('touchend', release);
      target.addEventListener('touchcancel', release);
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
      /* Remove rather than zero out, so a resting-tilt CSS fallback (if any)
         takes back over once contact ends, instead of getting stuck flat. */
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    });
  }

  document.querySelectorAll('.map-card').forEach(function (el) { bindCardTilt(el, 10, 12); });
  document.querySelectorAll('.service-row').forEach(function (el) { bindCardTilt(el, 11, 9); });

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
      media.style.removeProperty('--tilt-rx');
      media.style.removeProperty('--tilt-ry');
    });
  }

  bindMediaTilt('hero', 'hero-media', 3.5, 4.5);
  bindMediaTilt('booking', 'booking-media', 2.5, 3.5);
})();
