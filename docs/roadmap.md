# LiveSurgery Roadmap

This roadmap shows a realistic evolution path from **frontend-only PoC** to **MVP** and beyond, optimized for a solo developer.

---

## NOW (PoC) — Current state

### Done
- Vite + React + Tailwind SPA
- OR workspace layout (multi-panel)
- HTML5 video assets with source selection
- Drag/drop + resize layout interactions
- Simulated personas (Surgeon/Observer/Admin)
- Deployed on Vercel

### Known gaps (intentional)
- No backend, no auth, no persistence
- No WebRTC / real streaming
- No collaboration (single-user only)
- No audit logs / observability

---

## NEXT (MVP) — Target milestones

### Milestone 1 — Backend foundation (Sessions + Auth)
**Outcomes**
- API service scaffold
- Auth integration + RBAC enforcement
- Session CRUD + membership model
- Postgres schema migrations

**Deliverables**
- `/v1/sessions` endpoints
- `/participants:join` endpoint that returns WS + SFU access tokens
- RBAC checks + minimal audit events

---

### Milestone 2 — Realtime collaboration (non-media)
**Outcomes**
- WebSocket gateway (presence + shared state)
- Sync layout and source selections

**Design notes**
- Server-authoritative session state
- Conflict rule: last-write-wins per field, versioned layout snapshots

**Deliverables**
- Presence messages
- Layout update messages (+ version conflicts)
- “Observer read-only mode”

---

### Milestone 3 — WebRTC via SFU (live streaming)
**Outcomes**
- SFU integration (managed first recommended)
- Publish/subscribe flows implemented in frontend
- TURN planning for NAT traversal

**Deliverables**
- “Join room” + “Publish tracks”
- Observer subscription selection
- Join-to-first-frame instrumentation

---

### Milestone 4 — Recording + archive (MVP-lite)
**Outcomes**
- Record session streams
- Store outputs in object storage
- Archive list + playback UI

**Deliverables**
- `/v1/sessions/{id}/archives` endpoints
- Storage lifecycle defaults (`expires_at`)
- Playback (HLS or MP4)

---

### Milestone 5 — Hardening + portfolio polish
**Outcomes**
- Threat model review + security controls baseline
- Observability (logs, metrics, simple tracing)
- Demo scripts + contributor onboarding

**Deliverables**
- Error envelope standards
- SLO dashboards (starter)
- “Demo mode” seed data

---

## FUTURE (Production) — Themes (non-MVP)
- Multi-tenant orgs + SSO/SCIM
- Audit-grade event trails, retention governance
- More robust annotations and replay features
- Enterprise deployment (containers, multi-region)
- Device interoperability layer (ingest adapters, governance)

---

## Release readiness checklist (MVP)
- Auth + RBAC verified with tests
- Realtime state sync stable under reconnects
- TURN coverage tested across networks
- Recording pipeline verified end-to-end
- No sensitive data stored unintentionally
