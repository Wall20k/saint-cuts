(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll state
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile nav toggle
  var toggle = doc.querySelector('.menu-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Services tab panel
  var tabs = doc.querySelectorAll('.service-card');
  var panel = doc.getElementById('service-panel');
  var img = doc.getElementById('service-image');
  var nameEl = doc.getElementById('service-name');
  var descEl = doc.getElementById('service-description');
  var timeEl = doc.getElementById('service-time');
  var priceEl = doc.getElementById('service-price');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (tab.classList.contains('active')) return;

      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      if (panel) panel.classList.add('changing');

      var applyContent = function () {
        if (nameEl) nameEl.textContent = tab.querySelector('strong').textContent;
        if (descEl) descEl.textContent = tab.dataset.desc || '';
        if (timeEl) timeEl.textContent = tab.dataset.time || '';
        if (priceEl) priceEl.textContent = tab.dataset.price || '';
        if (panel) panel.classList.remove('changing');
      };

      if (reduceMotion) {
        applyContent();
      } else {
        window.setTimeout(applyContent, 180);
      }
    });
  });

  // Scroll reveal
  var revealEls = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion && revealEls.length) {
    root.classList.add('animations-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Pause background video for reduced-motion users
  if (reduceMotion) {
    doc.querySelectorAll('video[autoplay]').forEach(function (v) {
      v.removeAttribute('autoplay');
      v.pause();
    });
  }
})();
