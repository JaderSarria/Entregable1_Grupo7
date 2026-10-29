'use strict';

// A quiet, locally drawn contour texture. It stops drawing when settled.
(() => {
  const dateLabel = document.querySelector('#today-label');
  if (dateLabel) dateLabel.textContent = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const canvas = document.querySelector('#welcome-canvas');
  const surface = document.querySelector('.welcome-copy');
  if (!canvas || !surface) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, raf = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0, deadline = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width * 1.06 + x * 9, height * .43 + y * 8);
    ctx.rotate(-.36);
    ctx.lineWidth = 1;
    // Open organic contours live near the edge, leaving text legible.
    for (let ring = 0; ring < 12; ring++) {
      const radius = 45 + ring * 15;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const angle = i / 100 * Math.PI * 2;
        const ripple = Math.sin(angle * 3 + ring * .12) * 7;
        const px = Math.cos(angle) * (radius + ripple) * .73;
        const py = Math.sin(angle) * (radius + ripple) * 1.33;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(137, 151, 101, ${.18 - ring * .008})`;
      ctx.stroke();
    }
    ctx.restore();
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function frame(time) {
    raf = 0;
    if (document.hidden || preference.matches) return;
    x += (targetX - x) * .12;
    y += (targetY - y) * .12;
    draw();
    if (time < deadline && (Math.abs(targetX - x) > .002 || Math.abs(targetY - y) > .002)) raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (preference.matches || document.hidden) return;
    deadline = performance.now() + 900;
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function resize() {
    const bounds = surface.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  surface.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || preference.matches) return;
    const bounds = surface.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    targetY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    schedule();
  });
  surface.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; schedule(); });
  preference.addEventListener?.('change', () => { stop(); x = y = targetX = targetY = 0; draw(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else draw(); });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(surface);
  else window.addEventListener('resize', resize);
  resize();
})();
