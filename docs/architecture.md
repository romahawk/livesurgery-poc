# LiveSurgery PoC — System Architecture

LiveSurgery PoC is a proof-of-concept for a cloud-first surgical livestreaming and collaboration platform.  
Its purpose is to validate multi-video OR layout UX, drag-and-drop logic, onboarding flow, and initial backend communication.

The PoC is intentionally lightweight but structured to scale into a real MedTech product.

---

# 1. High-Level Overview

The system consists of two main layers:

## **Frontend (React + Vite + Tailwind)**
- Builds the OR interface: multi-panel video layout, role-based view, archive, analytics, onboarding.
- Contains simulated session data and basic UI logic.

## **Backend (FastAPI)**
- Provides healthcheck.
- Provides **simulated video stream endpoints** (placeholder for real OR cameras).
- Organizes models and services for future expansion.

```
+-----------------------+     HTTP/JSON     +-----------------------+
|     React Frontend    | <----------------> |     FastAPI Backend    |
| (OR UI, DnD, Tabs)    |                   | (Simulated Streaming)  |
+-----------------------+                   +-----------------------+
            |                                           |
            |       (future) WebRTC / HLS / RTSP        |
            v                                           v
+-----------------------+                +-----------------------------+
| Video Player Layer    |                | OR Cameras & Integrators    |
| (to be implemented)   |                | PTZ, Endoscope, Imaging     |
+-----------------------+                +-----------------------------+
```

---

# 2. Repository Structure

```
livesurgery-poc/
├── backend/
│   └── app/
│       ├── main.py
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend-react/
│   └── src/
│       ├── components/
│       ├── data/
│       ├── theme/
│       ├── hooks/ (planned)
│       └── context/ (planned)
└── docs/
```

Each part is modular and isolated — ideal for future scaling.

---

# 3. Backend Architecture (FastAPI)

## 3.1 Entry Point — `main.py`
- Initializes the FastAPI app  
- Includes routers (`video`)  
- Exposes root healthcheck.

## 3.2 Routes
### `/video/simulate`
Returns simulated RTSP/HLS URL.

## 3.3 Services
Logic for producing simulated stream URLs.
Future role: connection to edge node, OR devices.

## 3.4 Models
Pydantic models for future session metadata.

## 3.5 Utils
Helper utilities (IDs, timestamps, etc.)

---

# 4. Frontend Architecture (React)

## Structure

```
components/
  layout/
  session/
  tabs/
  common/
data/
theme/
hooks/
context/
```

## Core UI Modules

- **DisplayGrid** (multi-panel layout)
- **DnD source assignment** (`@dnd-kit`)
- **Archive & Analytics** tabs (mock data)
- **Onboarding modal**
- **Theme provider**
- **Role selector**

---

# 5. Data Flow

Current PoC:

```
React UI → mock data → UI state
```

Future:

```
React UI → Streaming Layer → Edge Node → OR Cameras
```

---

# 6. API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Healthcheck |
| GET | /video/simulate | Returns simulated stream URL |

Future:
- `/sessions`
- `/analytics`
- `/auth`
- `/events`

---

# 7. Security & Config

Current:
- No auth
- No PHI
- Mock data only

Planned:
- JWT auth
- RBAC (surgeon / observer / admin)
- Audit logs
- TLS everywhere

---

# 8. Limitations

- No real video streaming yet
- No persistence
- No backend-driven archive
- No streaming protocol (WebRTC/HLS)
- No OR hardware integration

---

# 9. Future Architecture Vision

```
Frontend → API Gateway → Microservices
                         ↘
                          Edge Node → OR Devices
```

Microservices:  
- Auth  
- Sessions  
- Streaming  
- Analytics  

Edge Node:  
- WebRTC/HLS translation  
- Camera routing  
- Secure OR connectivity  

---

# 10. Summary

LiveSurgery PoC provides:
- Clean modular architecture
- Scalable separation of concerns
- A strong UX foundation for OR workflows
- A realistic platform for MedTech demos & future pilots
