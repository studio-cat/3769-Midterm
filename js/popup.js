// js/popup.js

const popupSequence = [
    'popups/popup1.html',
    'popups/popup2.html',
    'popups/popup3.html',
    'popups/popup4.html',
    'popups/popup5.html',
    'popups/popup6.html',
    'popups/popup7.html'
  ];
  
  let currentPopupIndex = 0; // start of sequence

  function showPopupByIndex(index) {
    if (index < 0 || index >= popupSequence.length) {
      document.getElementById('popup-overlay').style.display = 'none';
      return;
    }
  
    const file = popupSequence[index];
  
    fetch(file)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        return res.text();
      })
      .then(html => {
        document.getElementById('popup-content').innerHTML = html;
        document.getElementById('popup-overlay').style.display = 'flex';
        currentPopupIndex = index;
      })
      .catch(err => {
        document.getElementById('popup-content').innerHTML = `<p style="color:red;">${err.message}</p>`;
        document.getElementById('popup-overlay').style.display = 'flex';
      });
  }


  document.getElementById('fx-twinkles').addEventListener('click', (e) => {
    const star = e.target.closest('.fx-twinkle.big');
    if (!star) return;
  
    showPopupByIndex(currentPopupIndex);
  });

  document.addEventListener('click', (e) => {
    if (e.target.matches('.close-popup')) {
        showPopupByIndex(currentPopupIndex + 1);
      document.getElementById('popup-overlay').style.display = 'none';
      index++
    }
  });

const popupOverlay = document.getElementById('popup-overlay');
const popupClose = document.getElementById('popup-close');

if (popupClose) {
  popupClose.addEventListener('click', () => {
    popupOverlay.style.display = 'none';
    currentPopupIndex++
  });
}