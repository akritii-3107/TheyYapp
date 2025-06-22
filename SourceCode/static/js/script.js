let selectedCharacter = null;
let selectedTopic = null;

let speechAudio =  new Audio();
let bgMusic = new Audio("/static/audio/bg-music.mp3");
let currenAudioUrl = null;

// Highlight selected character and store selection
function selectCharacter(imgElement) {
  document.querySelectorAll(".carousel-img").forEach(img => img.classList.remove("selected"));
  imgElement.classList.add("selected");
  selectedCharacter = imgElement.getAttribute("data-character");
  checkAndSendRequest();
}
function disableUI() {
  document.querySelectorAll(".carousel-img, .topic-btn").forEach(el => {
    el.classList.add("disabled");
  });
}

function enableUI() {
  document.querySelectorAll(".carousel-img, .topic-btn").forEach(el => {
    el.classList.remove("disabled");
  });
}

// Handle topic button selection
function selectTopic(topic) {
  selectedTopic = topic;

  document.querySelectorAll(".topic-btn").forEach(btn => btn.classList.remove("selected"));
  const button = [...document.querySelectorAll(".topic-btn")]
    .find(btn => btn.textContent.toLowerCase() === topic.toLowerCase());
  if (button) button.classList.add("selected");

  checkAndSendRequest();
}

// Send POST request if both character and topic are selected
function checkAndSendRequest() {
  if (selectedCharacter && selectedTopic) {

    if(!speechAudio.paused){
      speechAudio.pause();
      speechAudio.currentTime = 0;
      speechAudio.src = "";
      speechAudio.load();
    }
    if(!bgMusic.paused){
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
    fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character: selectedCharacter,
        topic: selectedTopic
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      // Show response text in main container
      const resultContainer = document.getElementById("result-container");
      resultContainer.style.display = "block";
      document.getElementById("response-heading").textContent = `${data.character_name} said:`;
      document.getElementById("response-text").textContent = data.response;
      document.getElementById("response-image").src = data.image_url;
      console.log("AUDIO URL:", data.audio_url);
      currenAudioUrl = data.audio_url;
      speechAudio = currenAudioUrl ? new Audio(currenAudioUrl) : new Audio();
      // Scroll to result container smoothly
      document.getElementById("result-container").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      speechAudio.crossOrigin = "anonymous"; // Ensure CORS is handled
      speechAudio.preload = "auto"; // Preload the audio for smoother playback
      disableUI();
      speechAudio.play().catch(error => console.error("Audio playback error:", error));      
      
      bgMusic.loop = true;
      bgMusic.volume = 0.3;
      bgMusic.play().catch(error => console.error("Background music playback error:", error)); 
      
      const fadeInINterval = setInterval(() =>
      {
        if (bgMusic.volume < 0.2) {
          bgMusic.volume = Math.min(bgMusic.volume + 0.01, 1);
        } else {
          clearInterval(fadeInINterval);
        }
      },200); 

      speechAudio.addEventListener("ended", () => {
        const fadeOutInterval = setInterval(() => {
          if (bgMusic.volume > 0.01) {
            bgMusic.volume -= 0.01;
          } 
          else {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            clearInterval(fadeOutInterval);
          }
        }, 100);

          // Clear selection
      enableUI();
      selectedCharacter = null;
      selectedTopic = null;
      document.querySelectorAll(".carousel-img").forEach(img => img.classList.remove("selected"));
      document.querySelectorAll(".topic-btn").forEach(btn => btn.classList.remove("selected"));
      document.getElementById("result-container").style.display = "none";
      document.getElementById("response-text").textContent = "";
      document.getElementById("response-image").src = "";
      
      console.log("Audio playback ended, cleaning up...");
      fetch("/cleanup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ filename: data.audio_url })
                })
              .then(res => res.json())
              .then(res => console.log("Cleanup:", res.message))
              .catch(err => console.error("Cleanup failed:", err));

      });  
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Oops! Something went wrong.");
    });
  }
}

function playAudioWithFadeIn(audioElement, duration = 3000) {
  
  
  audioElement.volume = 0;
  audioElement.play();

  let step = 0.05;
  let interval = duration / (1 / step);
  let fadeIn = setInterval(() => {
    if (audioElement.volume < 1) {
      audioElement.volume = Math.min(audioElement.volume + step, 1);
    } else {
      clearInterval(fadeIn);
    }
  }, interval);
}

