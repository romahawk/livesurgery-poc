document.addEventListener("DOMContentLoaded", () => {
  // Drag and drop logic
  document.querySelectorAll(".source").forEach(src => {
    src.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", src.dataset.src);
    });
  });

  document.querySelectorAll(".drop-zone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());

    zone.addEventListener("drop", e => {
      e.preventDefault();
      const file = e.dataTransfer.getData("text/plain");

      if (file.endsWith(".mp4")) {
        const wrapper = createRemovableMediaElement("video", "http://localhost:8000/videos/" + file);
        if (zone.id === "main-drop") {
          zone.innerHTML = "";
        }
        zone.appendChild(wrapper);
      }

      if (file.endsWith(".mp3")) {
        const wrapper = createRemovableMediaElement("audio", "http://localhost:8000/audio/" + file);
        zone.appendChild(wrapper);
      }
    });
  });

  function createRemovableMediaElement(type, src) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("media-wrapper");

    const media = document.createElement(type);
    media.src = src;
    media.controls = true;
    media.autoplay = true;

    if (type === "video") {
      media.loop = true;
      media.muted = true;
      media.classList.add("dropped-video");
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "🗑️";
    removeBtn.onclick = () => wrapper.remove();

    const overlay = document.createElement("div");
    overlay.className = "media-overlay";
    overlay.textContent = inferLabelFromSrc(src);

    wrapper.appendChild(removeBtn);
    wrapper.appendChild(overlay);
    wrapper.appendChild(media);

    return wrapper;
  }

  function inferLabelFromSrc(src) {
    if (src.includes("endoscope")) return "🔍 Endoscope";
    if (src.includes("microscope")) return "🔬 Microscope";
    if (src.includes("or_overview")) return "🎥 OR Camera";
    if (src.includes("vital_signs")) return "📊 Vitals Monitor";
    if (src.includes("audio_feed")) return "🎙 Mic Audio";
    return "🎞 Feed";
  }

  // Session logic
  const startBtn = document.getElementById("start-session");
  const pauseBtn = document.getElementById("pause-session");
  const stopBtn = document.getElementById("stop-session");

  const sessionSetup = document.getElementById("session-setup");
  const sessionDisplay = document.getElementById("session-display");

  const surgeonName = document.getElementById("surgeon-name");
  const procedureName = document.getElementById("procedure-name");

  const surgeonSelect = document.getElementById("surgeon-select");
  const procedureSelect = document.getElementById("procedure-select");

  const timerEl = document.getElementById("session-timer");

  let seconds = 0;
  let timerInterval = null;
  let isPaused = false;

  function formatTime(sec) {
    const min = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${min}:${s}`;
  }

  function startSession() {
    surgeonName.textContent = surgeonSelect.value;
    procedureName.textContent = procedureSelect.value;
    sessionSetup.style.display = "none";
    sessionDisplay.style.display = "block";
    seconds = 0;
    timerEl.textContent = "00:00";
    isPaused = false;
    pauseBtn.textContent = "⏸";

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isPaused) {
        seconds++;
        timerEl.textContent = formatTime(seconds);
      }
    }, 1000);
  }

  function pauseSession() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶️" : "⏸";
  }

  function stopSession() {
    clearInterval(timerInterval);
    timerInterval = null;
    seconds = 0;
    timerEl.textContent = "00:00";
    sessionDisplay.style.display = "none";
    sessionSetup.style.display = "flex";
  }

  startBtn.addEventListener("click", startSession);
  pauseBtn.addEventListener("click", pauseSession);
  stopBtn.addEventListener("click", stopSession);
});
