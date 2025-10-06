// CONSTANTS ---------------------------------------------------

const el = document.getElementById('random-text');
const fonts = [
    "'Inter', sans-serif",
    "'Playfair Display', serif",
    "'Pacifico', cursive",
  ];

// FUNCTIONS ---------------------------------------------------

// landing page font randomizer
function changeFont() {
  const random = Math.floor(Math.random() * fonts.length);
  el.style.fontFamily = fonts[random];
}

setInterval(changeFont, 250);