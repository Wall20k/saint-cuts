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

  // Keep the hero/booking background videos playing. Mobile browsers will
  // sometimes pause autoplay video on their own (memory pressure, tab
  // backgrounding, a network stall) with no visible controls to resume it,
  // which left the empty video box showing through to whatever sits behind
  // it. Force a resume any time that happens instead of leaving it stopped.
  if (!reduceMotion) {
    var bgVideos = doc.querySelectorAll('.hero-video, .booking-media video');
    var resumeAll = function () {
      bgVideos.forEach(function (v) {
        if (v.paused) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      });
    };
    bgVideos.forEach(function (v) {
      v.addEventListener('pause', resumeAll);
      v.addEventListener('stalled', resumeAll);
      v.addEventListener('suspend', resumeAll);
    });
    doc.addEventListener('visibilitychange', function () {
      if (!doc.hidden) resumeAll();
    });
    window.addEventListener('pageshow', resumeAll);
  }
})();
