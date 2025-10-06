(() => {
    // ======= CONFIG =======
    const CONFIG = {
      starCount: 900,         // total stars
      nearZ: 0.2,             // closest depth (normalized 0..1)
      farZ: 1.0,              // farthest depth
      baseSize: 1.1,          // base star size (px @ 1x DPR) before depth scaling
      sizeJitter: 0.9,        // randomize size a bit per star
      twinkleStrength: 0.35,  // 0..1 amplitude
      twinkleSpeed: 0.9,      // multiplier
      parallax: 55,           // how far stars offset with camera (px @ full deflection)
      ease: 0.07,             // camera easing toward pointer (lower = smoother)
      hueJitter: 0.08,        // chance for faint blue-ish/amber star tint
      followScroll: true,     // subtly drift with scroll
      scrollDrift: 0.0008,    // scroll -> z drift factor
    };
  
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0, height = 0, dpr = 1;
  
    // Camera target from pointer, and smoothed camera
    const pointer = { x: 0, y: 0 }; // -1..1 range
    const camera  = { x: 0, y: 0 };
  
    // For twinkle
    let time = 0;
  
    // Generate stars in normalized space; project each frame.
    /** star: { x, y, z, s, h, t } */
    let stars = [];
  
    function rand(a=0, b=1) { return a + Math.random() * (b - a); }
    function nrand() { return Math.random() * 2 - 1; } // -1..1
  
    function spawnStar() {
      const z = rand(CONFIG.nearZ, CONFIG.farZ);
      const s = Math.max(0.5, CONFIG.baseSize * (1 + (Math.random() - 0.5) * CONFIG.sizeJitter) * (1.6 - z));
      // small chance to color
      let color = '255,255,255';
      if (Math.random() < CONFIG.hueJitter) {
        const blueish = Math.random() < 0.5;
        color = blueish ? '180,200,255' : '255,220,180';
      }
      return {
        x: nrand(),           // normalized -1..1
        y: nrand(),
        z,
        s,                    // base size (pre-DPR)
        c: color,             // rgb string
        t: Math.random() * 1000 // phase for twinkle
      };
    }
  
    function createStars() {
      stars = new Array(CONFIG.starCount).fill(0).map(spawnStar);
    }
  
    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
      width = Math.round(rect.width * dpr);
      height = Math.round(rect.height * dpr);
      canvas.width = width;
      canvas.height = height;
      // Keep CSS size = viewport
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  
    // Pointer to normalized target (-1..1), with edges clamped
    function onPointerMove(clientX, clientY) {
      const cx = clientX / window.innerWidth;
      const cy = clientY / window.innerHeight;
      pointer.x = Math.min(1, Math.max(-1, (cx - 0.5) * 2));
      pointer.y = Math.min(1, Math.max(-1, (cy - 0.5) * 2));
    }
  
    // Touch support
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen' || e.pointerType === 'touch') {
        onPointerMove(e.clientX, e.clientY);
      }
    }, { passive: true });
  
    // Also update on enter so camera snaps to cursor quickly
    window.addEventListener('pointerenter', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
  
    // Reduced motion: if requested, pin camera to center & disable easing.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      CONFIG.ease = 1; // effectively no easing, camera == pointer (which we'll keep at 0,0)
    }
  
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      if (!CONFIG.followScroll) return;
      const delta = (window.scrollY - lastScrollY) * CONFIG.scrollDrift;
      lastScrollY = window.scrollY;
      // Nudge depth phases to give a sense of subtle drift on scroll
      for (let i = 0; i < stars.length; i++) {
        stars[i].t += delta * 120;
      }
    }, { passive: true });
  
    function clear() {
      // Fill with near-black, keep alpha for vignette edges
      ctx.fillStyle = '#02030a';
      ctx.fillRect(0, 0, width, height);
    }
  
    function project(nx, ny, z) {
      // Parallax: closer stars move more
      const parallax = CONFIG.parallax * (1.6 - z);
      const px = (nx * 0.5 + 0.5) * width + camera.x * parallax * dpr;
      const py = (ny * 0.5 + 0.5) * height + camera.y * parallax * dpr;
      return [px, py];
    }
  
    function drawStar(px, py, sizePx, alpha, rgb) {
      // Slight blur using shadow for a soft glow
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.shadowColor = `rgba(${rgb}, ${Math.min(0.35, alpha)})`;
      ctx.shadowBlur = sizePx * 1.5;
      // simple square is fastest; arc() looks nice but costs more. Use a small rect.
      ctx.fillRect(px, py, sizePx, sizePx);
      ctx.restore();
    }
  
    function animate(now) {
      requestAnimationFrame(animate);
      time = now * 0.001;
  
      // Ease camera toward pointer
      camera.x += (pointer.x - camera.x) * CONFIG.ease;
      camera.y += (pointer.y - camera.y) * CONFIG.ease;
  
      clear();
  
      // Draw back-to-front by depth for subtle overlap
      // (Not strictly necessary for points, but looks a bit nicer)
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        // twinkle: sin with per-star phase, weaker for far stars
        const tw = 0.75 + CONFIG.twinkleStrength * Math.sin((time * CONFIG.twinkleSpeed) + star.t);
        const alpha = Math.max(0.15, Math.min(1, tw * (1.2 - star.z)));
        const sizePx = Math.max(1, (star.s * dpr) * tw);
  
        const [px, py] = project(star.x, star.y, star.z);
  
        // Cull stars outside viewport plus margin
        if (px < -8 || py < -8 || px > width + 8 || py > height + 8) continue;
  
        drawStar(px, py, sizePx, alpha, star.c);
      }
    }
  
    // Init
    function init() {
      resize();
      createStars();
      requestAnimationFrame(animate);
    }
  
    window.addEventListener('resize', resize);
    init();
  })();


  const cursorLight = document.querySelector('.cursor-light');
  let mouseX = 0, mouseY = 0;
  let lightX = 0, lightY = 0;
  const speed = 0.15; // smaller = slower follow
  
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animate() {
    lightX += (mouseX - lightX) * speed;
    lightY += (mouseY - lightY) * speed;
    cursorLight.style.left = `${lightX}px`;
    cursorLight.style.top = `${lightY}px`;
    requestAnimationFrame(animate);
  }
  animate();