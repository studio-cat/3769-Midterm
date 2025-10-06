function setupAudioPlayback(audioId, buttonId, startTime = 0, fadeDuration = 0) {
    const audio = document.getElementById(audioId);
    const btn = document.getElementById(buttonId);
  
    if (!audio || !btn) {
      console.warn(`Audio or button not found: #${audioId}, #${buttonId}`);
      return;
    }
  
    btn.addEventListener('click', async () => {
      try {
        // Wait until metadata is loaded
        if (isNaN(audio.duration)) {
          await new Promise(res => audio.addEventListener('loadedmetadata', res, { once: true }));
        }
  
        audio.currentTime = startTime;
        if (fadeDuration > 0) {
          audio.volume = 0;         // start silent
        }
  
        await audio.play();         // must be in user gesture
  
        if (fadeDuration > 0) {
          const targetVolume = 1.0;
          const steps = 30; // smoother fade
          const stepTime = (fadeDuration * 1000) / steps;
          let currentStep = 0;
  
          const fadeInterval = setInterval(() => {
            currentStep++;
            const newVol = Math.min(targetVolume, (currentStep / steps) * targetVolume);
            audio.volume = newVol;
            if (currentStep >= steps) {
              clearInterval(fadeInterval);
            }
          }, stepTime);
        } else {
          audio.volume = 1;
        }
      } catch (err) {
        console.error(`Playback failed for #${audioId}:`, err);
      }

      
    });
  }