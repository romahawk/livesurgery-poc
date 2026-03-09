# LiveSurgery PRD (PoC → MVP)

## 1) Product overview
LiveSurgery is a web-based “OR workspace” experience.

- **NOW (PoC):** demonstrates interaction design using HTML5 video assets and simulated roles.
- **NEXT (MVP):** adds real-time streaming, collaboration, authentication, and persistence while keeping scope small enough for a solo developer.

> Non-goal: clinical usage or handling patient data.

---

## 2) Users & roles

### Roles (MVP)
| Role | Description | Key permissions |
|---|---|---|
| Surgeon | Session owner / presenter | Create/start/end session, publish streams, edit layout |
| Observer | Viewer | Join session, subscribe streams, limited controls |
| Admin | Platform/session admin | Manage users, roles, retention defaults, moderation |

### NOW (PoC)
- Roles are **simulated personas** (UI toggle), not authenticated.

---

## 3) Problems to solve (MVP)
- Make the “workspace” multi-user and synchronized
- Provide low-latency live video to multiple observers
- Ensure safe access control (auth + RBAC)
- Persist key artifacts (sessions, participants, layouts, archives)

---

## 4) Requirements (MoSCoW)

### Must (MVP)
- Authenticated users can **create and join sessions**
- Enforce **RBAC** on all session actions
- Live video streaming using **WebRTC + SFU**
- Realtime collaboration for:
  - layout updates
  - source/stream selection per panel
  - presence (who is connected)
- Persistence:
  - sessions
  - participants
  - layout versions
  - stream metadata references
- Basic archive workflow:
  - trigger recording/finalization
  - list archives and play back

### Should
- Invitation links + lobby/landing screen
- Layout presets + restore last layout
- Admin user management (minimal UI)
- Basic “pointer” annotations (ephemeral)

### Could
- Chat
- Session notes/export report
- Analytics dashboard (very light)

### Won’t (for MVP)
- Clinical workflows, patient data ingestion, device certification
- Advanced annotation toolset (drawing layers, measurements)
- Multi-tenant enterprise governance (Production phase)

---

## 5) Core user journeys (MVP)

### Surgeon
1. Login
2. Create session
3. Start session
4. Publish stream(s)
5. Adjust layout and assign streams to panels
6. End session; optionally generate archive

### Observer
1. Login
2. Join via link/session list
3. Subscribe streams
4. Follow layout changes

### Admin
1. Login
2. Assign roles / manage access
3. Review audit-ish activity (MVP-lite)
4. Configure retention defaults

---

## 6) UX expectations

### PoC consistency
- Keep the multi-panel workspace and interaction model intact
- Preserve “source selector sidebar” mental model

### MVP additions
- Session lobby with:
  - connection checks (camera/mic permissions)
  - role display and “read-only” indicators
- Join-to-first-frame goal:
  - **p95 < 3s** under typical conditions (starter SLO)

---

## 7) Success metrics (MVP)
| Metric | Target |
|---|---|
| Join success rate | ≥ 99% |
| Join-to-first-frame | p95 < 3s |
| Session state sync reliability | No persistent divergence in layout state |
| Recording completion success | ≥ 99% |

---

## 8) Scope boundary & compliance posture
- **PoC and MVP are not for clinical use**
- Do not store patient data
- Adopt security fundamentals:
  - short-lived tokens
  - least privilege RBAC
  - encryption in transit/at rest
  - basic audit logging
