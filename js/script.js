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



// --------

const lines = [
    "preface",
    "It is a miracle that I am alive today.",
    "3 years ago, I wrote in my journal:",
    "“There is no reason to live. But I should not act impulsively.“",
    "The next 3 years will be a test",
    "I will live to the best of my ability,",
    "to see if there is really anything",
    "worth living for. Then, I will decide.”",
    "For those hurting, lamenting, searching, wondering:",
    ">this is my testimony of how I am drowning",
    "in a deep, deep grace.",
  ];
  
  const headline = document.getElementById('subheadline');
  let index = 0;
  
  // Initialize first line
  headline.textContent = lines[index];
  
  setInterval(() => {
    index = (index + 1) % lines.length;
    headline.textContent = lines[index];
  }, 3500); // matches the CSS animation duration (4s)
  
  