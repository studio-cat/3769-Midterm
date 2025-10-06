// Descriptions to go through
const descriptions = [
  "fearfully and wonderfully made",
  "created in the image of God",
  "loved",
  "worthy",
  "made for a higher calling",
  "called to be set apart",
];


// DOM refs
const track   = document.querySelector('.rotator-track');
const snapper = document.getElementById('snapper');

// 1) Build the rotating words
descriptions.forEach(text => {
  const w = document.createElement('span');
  w.className = 'word';
  w.textContent = text;
  track.appendChild(w);
});

// 2) Build the snap steps (one per word)
descriptions.forEach(() => {
  const s = document.createElement('div');
  s.className = 'step';
  snapper.appendChild(s);
});

// Cache
const words = Array.from(track.children);
let lineH = 0;
let currentIndex = -1;

function measure() {
  // Use actual rendered height so it works with clamp()/responsive sizes
  lineH = words[0]?.getBoundingClientRect().height || 0;
}
measure();
window.addEventListener('resize', measure, { passive: true });

// 3) Observe which step is active and snap the word
const observer = new IntersectionObserver((entries) => {
  // Find the most visible step
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  const idx = Array.from(snapper.children).indexOf(visible.target);
  if (idx !== currentIndex && lineH > 0) {
    currentIndex = idx;
    track.style.transform = `translateY(${-(idx * lineH)}px)`;
  }
}, {
  root: snapper,
  threshold: [0.6] // change when a step is ~60% in view (after snap)
});

// Start observing each step
Array.from(snapper.children).forEach(step => observer.observe(step));

// Initialize position
window.addEventListener('load', () => {
  measure();
  // Force transform to first word
  currentIndex = 0;
  track.style.transform = `translateY(0px)`;
});