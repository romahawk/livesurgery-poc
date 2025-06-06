document.addEventListener("DOMContentLoaded", () => {
  // Tabs, drag/drop, remove logic stays here ✅

  // Drag sources
  const sources = document.querySelectorAll(".source");
  sources.forEach((src) => {
    src.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", src.dataset.src);
    });
  });

  // Tabs
  const buttons = document.querySelectorAll(".tab-button");
  const tabs = document.querySelectorAll(".tab-content");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      buttons.forEach((b) => b.classList.remove("bg-blue-600", "text-white"));
      btn.classList.add("bg-blue-600", "text-white");
      tabs.forEach((tab) => {
        tab.classList.add("hidden");
        if (tab.id === `tab-${target}`) tab.classList.remove("hidden");
      });
    });
  });

  // Drop zones
  const dropZones = document.querySelectorAll("#tab-live .drop-zone");
  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("border-blue-400", "bg-blue-50");
    });
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("border-blue-400", "bg-blue-50");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      const src = e.dataTransfer.getData("text/plain");
      zone.innerHTML = `
  <div class="relative w-full h-full">
    <video src="videos/${src}" autoplay loop muted controls class="w-full h-full object-cover rounded"></video>
    <button class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600" onclick="removeVideo(this)">
      ❌
    </button>
  </div>`;

      zone.classList.remove("border-blue-400", "bg-blue-50");
    });
  });

  window.removeVideo = (btn) => {
    const zone = btn.closest(".drop-zone");
    zone.innerHTML = "Drop Source Here";
  };

  // ✅ Dropdown
  const dropdownBtn = document.getElementById("dropdownButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden");
    });
  }

  // ✅ Drawer
  const openDrawer = document.getElementById("openDrawerBtn");
  const closeDrawer = document.getElementById("closeDrawerBtn");
  const drawer = document.getElementById("sideDrawer");
  if (openDrawer && closeDrawer && drawer) {
    openDrawer.addEventListener("click", () => {
      drawer.classList.remove("translate-x-full");
    });
    closeDrawer.addEventListener("click", () => {
      drawer.classList.add("translate-x-full");
    });
  }
});
