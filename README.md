# LiveSurgery PoC  
Cloud-First Surgical Livestreaming & Collaboration Platform (Proof of Concept)

This repository contains the **LiveSurgery Proof of Concept** — a prototype of a cloud-based platform for real-time surgical collaboration, multi-source OR video viewing, remote guidance, and medical education.

The PoC demonstrates UX, layout logic, and architectural foundations for integrating real OR cameras, edge nodes, and streaming pipelines.

---

## 🚀 Overview

LiveSurgery aims to modernize surgical collaboration by enabling:

- Multi-source OR livestreaming (endoscope, PTZ, room camera, imaging)
- Real-time remote participation (experts, residents, students)
- Structured education (CME, replay, analytics)
- Vendor-neutral OR integration 

This PoC focuses on:
- UX validation  
- Role-based OR layout  
- Drag-and-drop video source assignment  
- Archive & analytics mock modules  
- Backend stream simulation  

It serves as the **foundation for accelerator applications, investor demos, and hospital discussions.**

---

## ✨ Features (PoC)

### OR Interface  
- 2×2 Multi-display OR layout  
- Drag-and-drop assignment of video sources (`@dnd-kit`)  
- Role-based layouts (Surgeon / Observer)  
- Expandable Patient Info and Live Chat panels  

### System Components  
- Onboarding modal with localStorage tracking  
- Light/Dark theme toggle  
- Archive tab (mock session data)  
- Analytics tab (Recharts-based mock metrics)  

### Backend  
- FastAPI backend with:  
  - Healthcheck  
  - Simulated video stream endpoint (`/video/simulate`)  
- Clean service/model structure ready for expansion  

### Documentation  
- Full architecture documentation  
- Agile case study  
- Sprints 1–4  
- Roadmap  
- Screenshots directory  

---

## 📁 Project Structure

```
livesurgery-poc/
├── backend/
│   └── app/
│       ├── main.py
│       ├── routes/
│       ├── services/
│       ├── models/
│       └── utils/
├── frontend-react/
│   └── src/
│       ├── components/
│       ├── data/
│       ├── theme/
│       ├── hooks/ (planned)
│       └── context/ (planned)
└── docs/
    ├── ARCHITECTURE.md
    ├── AGILE_CASE_STUDY.md
    ├── ROADMAP.md
    ├── SPRINTS/
    └── SCREENSHOTS/
```

---

## 🧱 Tech Stack

### **Frontend**
- React (Vite)
- Tailwind CSS
- @dnd-kit (drag & drop)
- Recharts
- Lucide Icons

### **Backend**
- FastAPI
- Python 3
- Uvicorn
- Pydantic

---

## ⚙️ Local Development

### 1. Clone Repo
```bash
git clone https://github.com/romahawk/livesurgery-poc.git
cd livesurgery-poc
```

---

## Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

Backend runs at:  
➡️ http://localhost:8000

---

## Frontend Setup (React)

```bash
cd frontend-react
npm install
npm run dev
```

Frontend runs at:  
➡️ http://localhost:5173

---

## 🔐 Environment Variables

### Backend — `/backend/.env.example`
```env
VIDEO_STREAM_URL=rtsp://localhost:8554/simulated_feed
```

### Frontend — `/frontend-react/.env.example`
```env
VITE_API_BASE_URL=http://localhost:8000
```

Rename both files to `.env` and adjust as needed.

---

## 🧭 Documentation

All project documentation is inside `/docs`:

- **ARCHITECTURE.md** — system design, diagrams, backend/frontend breakdown  
- **AGILE_CASE_STUDY.md** — vision, user stories, workflow, retrospectives  
- **ROADMAP.md** — short-, medium-, long-term strategy  
- **SPRINTS/** — Sprint 1–4 reports  
- **SCREENSHOTS/** — screenshots for portfolio & presentation  

---

## 🛣 Roadmap (Summary)

### Short-Term
- Clean repo, finalize PoC UI
- Improve OR layout, DnD, onboarding
- Polished investor/accelerator demo

### Medium-Term
- Sessions API  
- Real archive & analytics  
- WebRTC/HLS gateway  
- Postgres persistence  
- Role-based authentication  

### Long-Term
- Multi-tenant hospital mode  
- Edge node for OR hardware  
- Education modules & CME  
- AI-driven analytics  

Complete roadmap: `/docs/ROADMAP.md`

---

## 🧩 Architecture Diagram

See `/docs/ARCHITECTURE.md` for full details.

```
Frontend → FastAPI → (future) Streaming Gateway → Edge Node → OR Devices
```

---

## 🎯 Purpose of the PoC

This PoC is built to:

- Validate the concept with OR staff  
- Demonstrate workflows to MedTech vendors  
- Support accelerator applications  
- Prepare foundation for MVP & pilots  

---

## 👤 About the Author

**Roman Mazuryk**  
MedTech entrepreneur → Full-Stack Developer  
Specializing in OR Integration, Surgical Video, and Cloud Solutions.

GitHub: **@romahawk**  
Portfolio: https://roman-mazuryk.vercel.app/#projects/livesurgery

---

## 📄 License

MIT License (see `/LICENSE`)
