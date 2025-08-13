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


document.addEventListener("DOMContentLoaded", () => {
  const roleSelector = document.getElementById("user-role");

  const updateRoleUI = () => {
    const sessionDropdown = document.getElementById("dropdownButton")?.parentElement;

    const role = roleSelector.value;
    const sessionControls = document.getElementById("live-session-controls");
    const sources = document.querySelector("aside");
    const panelBtn = document.getElementById("openDrawerBtn");

    if (role === "viewer") {
      sessionDropdown?.classList.add("hidden");
      sessionControls?.classList.add("hidden");
      sources?.classList.add("pointer-events-none", "opacity-50");
      panelBtn?.classList.remove("hidden");
    } else {
      sessionDropdown?.classList.remove("hidden");
      sessionControls?.classList.remove("hidden");
      sources?.classList.remove("pointer-events-none", "opacity-50");
      panelBtn?.classList.remove("hidden");
    }

    if (role === "admin") {
      console.log("🛠 Admin mode active");
    }
  };

  roleSelector?.addEventListener("change", updateRoleUI);
  updateRoleUI(); // initial run
});


  const tabs = document.querySelectorAll('nav a');
  tabs.forEach(tab => {
    const href = tab.getAttribute('href');
    if (role === "viewer" && (href.includes("Archive") || href.includes("Analytics"))) {
      tab.classList.add("hidden");
    } else {
      tab.classList.remove("hidden");
    }
  });


  const analyticsTab = [...tabs].find(tab => tab.textContent.trim() === "Analytics");
  if (role === "viewer" && analyticsTab) {
    analyticsTab.classList.add("hidden");
  }


function updateRoleUI() {
  const role = document.getElementById("user-role")?.value;

  const sessionControls = document.getElementById("live-session-controls");
  const sources = document.querySelector("aside");
  const sessionDropdown = document.getElementById("dropdownButton")?.parentElement;
  const archiveTabBtn = document.querySelector('button[data-tab="archive"]');
  const analyticsTabBtn = document.querySelector('button[data-tab="analytics"]');
  const drawerBtn = document.getElementById("openDrawerBtn");

  const readonlyInfo = document.getElementById("readonly-patient-info");
  const editableForm = document.getElementById("editable-patient-form");

  if (role === "viewer") {
    sessionControls?.classList.add("hidden");
    sources?.classList.add("pointer-events-none", "opacity-50");
    sessionDropdown?.classList.add("hidden");
    archiveTabBtn?.classList.add("hidden");
    analyticsTabBtn?.classList.add("hidden");
    drawerBtn?.classList.remove("hidden");

    readonlyInfo?.classList.remove("hidden");
    editableForm?.classList.add("hidden");
  } else {
    sessionControls?.classList.remove("hidden");
    sources?.classList.remove("pointer-events-none", "opacity-50");
    sessionDropdown?.classList.remove("hidden");
    archiveTabBtn?.classList.remove("hidden");
    analyticsTabBtn?.classList.remove("hidden");
    drawerBtn?.classList.remove("hidden");

    readonlyInfo?.classList.add("hidden");
    editableForm?.classList.remove("hidden");
  }
}

document.getElementById("user-role")?.addEventListener("change", updateRoleUI);
updateRoleUI();

// Handle patient form submission
document.getElementById("editable-patient-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("patient-name")?.value || "John Doe";
  const age = document.getElementById("patient-age")?.value || "57";
  const procedure = document.getElementById("patient-procedure")?.value || "Endoscopic Sinus Surgery";

  document.getElementById("patient-name-display").textContent = name;
  document.getElementById("patient-age-display").textContent = age;
  document.getElementById("patient-procedure-display").textContent = procedure;

  // Optionally switch back to read-only after save
});
