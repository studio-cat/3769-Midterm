// --- replace your step() with this smoother version ---
(() => {
  const root   = document.getElementById('fx-root');
  const canvas = document.getElementById('fx-canvas');
  const cursor = document.getElementById('fx-cursor');
  const ctx = canvas.getContext('2d');

  const resize = () => {
    const dpr = Math.max(1, devicePixelRatio || 1);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  addEventListener('resize', resize);
  resize();

  const pts = [];
  const MAX_AGE = 100; // ms history window (shorter = snappier)
  let tx = innerWidth/2, ty = innerHeight/2;
  let x = tx, y = ty;

  addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.style.left = tx + 'px';
    cursor.style.top  = ty + 'px';
  });

  // Catmull–Rom spline to Bézier control points (tension = 0.5)
  function catmullRomToBezier(p0, p1, p2, p3) {
    const t = 0.5;
    const c1 = {
      x: p1.x + (p2.x - p0.x) * t / 3,
      y: p1.y + (p2.y - p0.y) * t / 3
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) * t / 3,
      y: p2.y - (p3.y - p1.y) * t / 3
    };
    return [c1, c2];
  }

  function drawSpline(points, widthCore) {
    if (points.length < 2) return;

    // GLASSY GLOW (fat, low alpha, additive)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 24;
    ctx.shadowColor = 'rgba(180,210,255,0.8)';
    ctx.strokeStyle = 'rgba(223,240,255,0.18)';
    ctx.lineWidth = widthCore * 1;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1] || points[i];
      const p3 = points[i + 2] || p2;
      const [c1, c2] = catmullRomToBezier(p0, p1, p2, p3);
      ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
    }
    ctx.stroke();
    ctx.restore();

    // BRIGHT CORE
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = widthCore;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1] || points[i];
      const p3 = points[i + 2] || p2;
      const [c1, c2] = catmullRomToBezier(p0, p1, p2, p3);
      ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  let lastTime = 0;
  function step(now) {
    // ease cursor
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;

    // keep recent points (timestamped)
    pts.push({ x, y, t: now });
    while (pts.length && now - pts[0].t > MAX_AGE) pts.shift();

    // FADE the canvas slightly instead of hard clear (eliminates banding)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; // increase to 0.12 for quicker fade
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    // derive width from speed (smooth)
    const dt = Math.max(1, now - lastTime);
    const vx = (tx - x) / dt, vy = (ty - y) / dt;
    const spd = Math.min(1, Math.hypot(vx, vy) * 35); // tune scalar
    const widthCore = 4 + spd * 8; // 4..12px

    drawSpline(pts, widthCore);

    lastTime = now;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // optional: tiny parallax of overlay
  addEventListener('mousemove', e => {
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    root.style.transform = `translate(${(-nx)*10}px, ${(-ny)*10}px)`;
  });
})();






// --- Twinkles ---
(() => {
  const twinkles = document.getElementById('fx-twinkles');

  function spawnTwinkle() {
    const el = document.createElement('div');
    const isBig = Math.random() < 0.08; // 8% chance for a big star
    el.className = 'fx-twinkle' + (isBig ? ' big' : '');
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = Math.random() * 100 + 'vh';
    el.style.setProperty('--dur', (isBig ? 1800 : 1200) + Math.random()*1200 + 'ms');

    const dx = (Math.random() - 0.5) * 22;
    const dy = (Math.random() - 0.5) * 22;
    el.style.setProperty('--dx', dx + 'px');
    el.style.setProperty('--dy', dy + 'px');

    if (isBig) {
      el.addEventListener('click', () => {
        const ping = document.createElement('div');
        Object.assign(ping.style, {
          position:'fixed', left: el.style.left, top: el.style.top,
          width:'2px', height:'2px', borderRadius:'999px',
          pointerEvents:'none', boxShadow:'0 0 0 0 #fff', zIndex: 9999
        });
        document.body.appendChild(ping);
        ping.animate(
          [{ boxShadow:'0 0 0 0 #fff' }, { boxShadow:'0 0 140px 46px #fff0' }],
          { duration: 650, easing:'ease-out' }
        ).onfinish = () => ping.remove();
      }, { once:true });
    }

    el.addEventListener('animationend', () => el.remove());
    twinkles.appendChild(el);
  }

  // spawn interval (lower = more twinkles)
  const interval = setInterval(spawnTwinkle, 360);
  for (let i = 0; i < 10; i++) spawnTwinkle();

  addEventListener('beforeunload', () => clearInterval(interval));
})();




// -----------

const lines = [
  "the journey of faith often felt like searching in the dark for me. ",
  "so many clashing opinions, such a noisy world,",
  "but time to time, I would receive revelation and breakthrough.",
  "I know it is only a small glimpse of God, and just a taste of His goodness",
  "just like seeing one star at a time in the entire universe",
  "But it is so worth it.",
  "click on the flickering stars"
];

const headline = document.getElementById('headline');
let index = 0;

// Initialize first line
headline.textContent = lines[index];

setInterval(() => {
  index = (index + 1) % lines.length;
  headline.textContent = lines[index];
}, 3500); // matches the CSS animation duration (4s)


