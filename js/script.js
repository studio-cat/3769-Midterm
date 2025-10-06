// CONSTANTS ---------------------------------------------------

const el = document.getElementById('random-text');
const fonts = [
    "'Inter', sans-serif",
    "'Playfair Display', serif",
    // "'Pacifico', cursive",
    // "'Caveat', cursive",
    // "'Shadows Into Light', cursive",
    // "'Rock Salt', cursive",
    // "'Gloria Hallelujah', cursive",
  ];

// FUNCTIONS ---------------------------------------------------

// landing page font randomizer
function changeFont() {
  const random = Math.floor(Math.random() * fonts.length);
  el.style.fontFamily = fonts[random];
}

setInterval(changeFont, 250);




const canvas = document.getElementById('grain');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function drawGrain() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const buffer = new Uint32Array(imageData.data.buffer);
  const len = buffer.length;
  for (let i = 0; i < len; i++) {
    const val = Math.random() * 255 | 0;
    buffer[i] = (255 << 24) | (val << 16) | (val << 8) | val;
  }
  ctx.putImageData(imageData, 0, 0);
}

function loop() {
  drawGrain();
  requestAnimationFrame(loop);
}

loop();