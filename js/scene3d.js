import * as THREE from './vendor/three.module.min.js';

/*
  Ambient 3D scene for the hero: a few slow-rotating wireframe forms
  (rings + faceted gem + a sparse particle field) layered over the
  hero video with screen blending. Purely decorative — no network
  calls, no data collection, no interaction required from the user.
*/
(function () {
  'use strict';

  var container = document.getElementById('scene3d');
  if (!container) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  if (reduceMotion || saveData) return;

  try {
    var testCanvas = document.createElement('canvas');
    var testCtx = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!testCtx) return;
  } catch (e) {
    return;
  }

  var canvas = document.createElement('canvas');
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(canvas);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  var group = new THREE.Group();
  scene.add(group);

  var champagne = 0xc6a873;
  var champagneLight = 0xefd9a9;
  var teal = 0x77bfc0;

  function wireMesh(geometry, color, opacity) {
    var mat = new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: opacity });
    return new THREE.Mesh(geometry, mat);
  }

  var ringA = wireMesh(new THREE.TorusGeometry(1.9, 0.012, 8, 90), teal, 0.32);
  ringA.rotation.x = Math.PI / 2.6;
  ringA.rotation.y = 0.3;
  group.add(ringA);

  var ringB = wireMesh(new THREE.TorusGeometry(1.4, 0.01, 8, 90), champagneLight, 0.26);
  ringB.rotation.x = Math.PI / 1.8;
  ringB.rotation.z = 0.4;
  group.add(ringB);

  var gem = wireMesh(new THREE.IcosahedronGeometry(0.62, 1), champagne, 0.5);
  gem.position.set(0, 0, 0.3);
  group.add(gem);

  var gemCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.58, 1),
    new THREE.MeshBasicMaterial({ color: champagne, transparent: true, opacity: 0.03 })
  );
  gemCore.position.copy(gem.position);
  group.add(gemCore);

  group.position.set(2.6, 1.1, 0);

  var particleCount = 70;
  var positions = new Float32Array(particleCount * 3);
  for (var i = 0; i < particleCount; i++) {
    var radius = 2.2 + Math.random() * 2.6;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = radius * Math.cos(phi) * 0.6;
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var particleMat = new THREE.PointsMaterial({ color: champagneLight, size: 0.028, transparent: true, opacity: 0.4 });
  var particles = new THREE.Points(particleGeo, particleMat);
  group.add(particles);

  var pointer = { x: 0, y: 0 };
  var targetRotX = 0, targetRotY = 0;

  function onPointerMove(e) {
    var rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetRotY = pointer.x * 0.18;
    targetRotX = pointer.y * -0.12;
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  function resize() {
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  var ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(resize);
    ro.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  var running = true;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    io.observe(container);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) running = false;
    else if (!('IntersectionObserver' in window)) running = true;
  });

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    var dt = Math.min(clock.getDelta(), 0.05);

    ringA.rotation.z += dt * 0.09;
    ringB.rotation.z -= dt * 0.07;
    gem.rotation.x += dt * 0.12;
    gem.rotation.y += dt * 0.16;
    gemCore.rotation.copy(gem.rotation);
    particles.rotation.y += dt * 0.02;

    group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
    group.rotation.y += (targetRotY - group.rotation.y) * 0.04;

    renderer.render(scene, camera);
  }
  animate();
})();
