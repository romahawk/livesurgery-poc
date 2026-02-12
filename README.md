# LiveSurgery

A **simulated Operating Room (OR) workspace** web experience built as a **frontend-only Proof of Concept (PoC)** today, designed to evolve into an **MVP with real-time streaming, collaboration, authentication, and persistence**, and later a production-grade MedTech-adjacent system.

> **Disclaimer:** The PoC is **not for clinical use**. The MVP/Production sections are targets (architecture intent), not claims of implemented functionality.

---

## Quick links (placeholders)
## 🔗 Quick Links

- [README](https://github.com/romahawk/livesurgery-poc/blob/main/README.md)
- [Architecture](https://github.com/romahawk/livesurgery-poc/blob/main/docs/architecture.md)
- [PRD](https://github.com/romahawk/livesurgery-poc/blob/main/docs/prd.md)
- [Roadmap](https://github.com/romahawk/livesurgery-poc/blob/main/docs/roadmap.md)

---

## What exists today

### NOW (PoC)
- **Frontend-only** React + Tailwind (Vite) app deployed on **Vercel**
- Multi-panel “OR workspace” UI
- **HTML5 video assets** (not streaming)
- Source selector sidebar
- Drag-and-drop / resize / layout controls (client-only)
- Simulated roles/personas (Surgeon / Observer / Admin) for storytelling
- **No backend**, no auth, no persistence, no WebRTC

### NEXT (MVP target)
- Auth + RBAC (Surgeon/Observer/Admin)
- Multi-user sessions with real-time collaboration
- Real-time streaming via **WebRTC SFU**
- Persistence of sessions, participants, layouts
- Recording → archive + replay

### FUTURE (Production target)
- Compliance hardening (audit-grade trails, policies, tenancy)
- Enterprise deployment options (self-host, multi-region)
- Device interoperability layer (ingest, hospital IT integration)

---

## Run locally (PoC)

```bash
npm install
npm run dev
```

Build/preview:
```bash
npm run build
npm run preview
```

---

## Demo
- Live demo: https://livesurgery.vercel.app/

---

## Repo structure (suggested)

```txt
/
  src/
    app/                 # shell, routing, providers
    components/          # reusable UI components
    features/
      workspace/         # multi-panel OR workspace (PoC core)
      video/             # video asset + source selection
      roles/             # simulated personas and UI gating
    assets/              # video files, thumbnails (PoC)
  docs/
    architecture.md
    prd.md
    roadmap.md
  public/
```

---

## Roadmap snapshot

| Phase | Outcome | Notes |
|---|---|---|
| NOW (PoC) | UI-only simulated OR workspace | Portfolio-ready interaction demo |
| NEXT (MVP) | Real-time sessions + auth + persistence | Managed services, incremental migration |
| FUTURE | Compliance & enterprise readiness | Stronger security, audit, interoperability |
