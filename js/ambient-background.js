/**
 * Ambient Tech Constellation & Spotlight Background
 * - Dynamically mounts a fixed canvas at z-index: -1 (behind all content)
 * - Zero pointer interference (pointer-events: none)
 * - Subtle tech-cyan & soft-indigo neural nodes (#38bdf8 / #818cf8)
 * - Gentle mouse/touch radial spotlight illuminating the empty gutters
 * - Calm, sophisticated autonomous drift (GitHub / Vercel aesthetic)
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function initAmbientBackground() {
    // Prevent duplicate mounting
    if (document.getElementById('ambient-tech-canvas')) return;

    // 1. Create and mount canvas behind all page content
    const canvas = document.createElement('canvas');
    canvas.id = 'ambient-tech-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;display:block;';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId = null;

    // 2. Pointer tracking state with soft radial spotlight
    const pointer = {
      x: null,
      y: null,
      active: false,
      radius: 220,
      idleTimer: null
    };

    let particles = [];

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      // High-DPI retina sharpness
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    }

    function initParticles() {
      particles = [];
      // Balanced node count: clean gutter presence without visual crowding
      const count = width < 768 ? 32 : Math.min(75, Math.floor((width * height) / 24000));

      for (let i = 0; i < count; i++) {
        const isCyan = Math.random() > 0.45;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Gentle, calm drift speed
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.4 + 1.1,
          color: isCyan ? { r: 56, g: 189, b: 248 } : { r: 129, g: 140, b: 248 },
          baseAlpha: Math.random() * 0.16 + 0.2,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    }

    function onPointerMove(clientX, clientY) {
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.active = true;
      if (pointer.idleTimer) clearTimeout(pointer.idleTimer);
    }

    function onPointerLeave() {
      if (pointer.idleTimer) clearTimeout(pointer.idleTimer);
      pointer.idleTimer = setTimeout(() => {
        pointer.active = false;
        pointer.x = null;
        pointer.y = null;
      }, 1200);
    }

    // Window events (passive listeners for optimal scrolling performance)
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', onPointerLeave, { passive: true });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });

    resize();

    // 3. Render loop: calm constellation + gentle spotlight illumination
    function render(now) {
      ctx.clearRect(0, 0, width, height);

      const maxLineDist = width < 768 ? 90 : 120;
      const time = now * 0.0015;

      // A. Soft, subtle radial spotlight (illuminates empty gutters when cursor passes)
      if (pointer.active && pointer.x !== null && pointer.y !== null) {
        const gradient = ctx.createRadialGradient(
          pointer.x, pointer.y, 0,
          pointer.x, pointer.y, pointer.radius
        );
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.07)');
        gradient.addColorStop(0.5, 'rgba(129, 140, 248, 0.025)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, pointer.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // B. Update particles & draw nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around margins smoothly
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        // Subtle proximity brightening near cursor
        let proximityBonus = 0;
        if (pointer.active && pointer.x !== null) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < pointer.radius) {
            proximityBonus = (1 - dist / pointer.radius) * 0.3;
            // Micro-nudge for organic responsive movement
            const angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * (1 - dist / pointer.radius) * 0.35;
            p.y -= Math.sin(angle) * (1 - dist / pointer.radius) * 0.35;
          }
        }

        // Breathing alpha pulse
        const pulse = Math.sin(time + p.pulseOffset) * 0.05;
        const alpha = Math.min(0.6, Math.max(0.12, p.baseAlpha + pulse + proximityBonus));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
        ctx.fill();
      }

      // C. Fine connecting lines (0.8px width)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxLineDist) {
            let lineAlpha = (1 - dist / maxLineDist) * 0.12;

            if (pointer.active && pointer.x !== null) {
              const midX = (p1.x + p2.x) * 0.5;
              const midY = (p1.y + p2.y) * 0.5;
              const cursorDist = Math.hypot(pointer.x - midX, pointer.y - midY);
              if (cursorDist < pointer.radius) {
                lineAlpha += (1 - cursorDist / pointer.radius) * 0.14;
              }
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${Math.min(0.3, lineAlpha)})`;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    }

    animationId = requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmbientBackground);
  } else {
    initAmbientBackground();
  }
})();
