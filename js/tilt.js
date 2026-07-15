(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (reduceMotion || !isFinePointer) return;

  /* ---- Card tilt (service cards, gallery cards) ---- */
  var tiltEls = document.querySelectorAll('.service-card, .gallery-card, .about-media, .map-card');
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

  /* ---- Hero video tilt ---- */
  var hero = document.getElementById('hero');
  var heroFrame = document.querySelector('.hero-media');
  if (hero && heroFrame) {
    var heroRaf = null;
    hero.addEventListener('mousemove', function (e) {
      if (heroRaf) return;
      heroRaf = requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 3.5;
        var ry = (px - 0.5) * 4.5;
        heroFrame.style.setProperty('--hero-rx', rx.toFixed(2) + 'deg');
        heroFrame.style.setProperty('--hero-ry', ry.toFixed(2) + 'deg');
        heroRaf = null;
      });
    });
    hero.addEventListener('mouseleave', function () {
      heroFrame.style.setProperty('--hero-rx', '0deg');
      heroFrame.style.setProperty('--hero-ry', '0deg');
    });
  }
})();
