
---

# ✅ 2. Final `AGILE_CASE_STUDY.md`

Create at:  
`/docs/AGILE_CASE_STUDY.md`

---

```markdown
# LiveSurgery PoC — Agile Case Study

This document describes how Agile processes are applied to the LiveSurgery PoC — a prototyping initiative with a clear vision, iterative learning cycles, and demo-driven development.

---

# 1. Vision & Goals

LiveSurgery aims to become a **cloud-based surgical collaboration and education platform** enabling:

- multi-source OR livestreaming
- remote guidance & peer collaboration
- structured education (residents/students)
- compliant & vendor-friendly OR integrations

PoC goals:
- Validate UX and workflow.
- Confirm multi-tile OR layout feasibility.
- Build demo material for MedTech partners & accelerators.

---

# 2. User Stories

### Surgeons
- “I want to share multiple video feeds during surgery.”
- “I want remote experts to see exactly what I see.”

### Observers / Experts
- “I want a synchronized, clear OR layout to follow operations.”
- “I want chat & metadata to reference key events.”

### Residents / Students
- “I want structured replays and analytics for learning.”

### Hospital Admins
- “I want user access control and compliance.”

### OR Vendors
- “I want my OR cameras and devices to integrate easily.”

---

# 3. Backlog Structure

The backlog is grouped into functional themes:

- **Core UX & Layout**
- **Streaming & Devices**
- **Session Management**
- **Archive & Analytics**
- **Security & Compliance**
- **DevOps & Deployment**
- **Documentation & Roadmap**

Each item includes:
- Story  
- Acceptance criteria  
- Labels (`frontend`, `backend`, `UX`, `docs`)  
- Priority  

---

# 4. Sprint Workflow

### 1. Sprint Planning
- Define 1–2 sprint goals max  
- Move selected issues into “Sprint Planning”

### 2. Implementation
- Work lives in “In Progress”
- Regular commits & PRs

### 3. Review
- Code review + small interactive demo

### 4. Done
- Only after functionality is stable

### 5. Retrospective
- What worked  
- What didn’t  
- What to improve

Sprint docs live in `docs/SPRINTS/`.

---

# 5. Demo-Driven Development

At the end of each sprint:
- produce a UI demo or screen recording  
- capture screenshots in `/docs/SCREENSHOTS`  
- ensure the PoC can be run with `npm run dev` and `uvicorn`  

The PoC acts like an internal showcase.

---

# 6. Continuous Improvement

- Regular cleanup of repo & structure  
- Improving documentation as features grow  
- Refactoring React state into hooks/contexts  
- Increasing modularization of FastAPI services  

---

# 7. Summary

Agile in LiveSurgery PoC is pragmatic — focused on achieving clarity, speed of iteration, and demo value.  
The goal is to validate the concept efficiently and prepare for future hospital pilots, integrations with OR vendors, and accelerator submissions.
