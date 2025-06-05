// Drag and drop video/audio sources into zones

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

  wrapper.appendChild(removeBtn);
  wrapper.appendChild(media);

  return wrapper;
}
