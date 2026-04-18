# IMPLEMENTATION_PLAN.md – 300‑Feature Roadmap
## Lakki Phone ERP

> **Strategy:** Core‑Out – build security and database foundation first, then layer features.

---

## Phase 0: Infrastructure Base (Days 1–3)

- [x] **0.1** Project Initialization & Metadata
- [x] **0.2** Database setup (MongoDB / Mongoose)
- [x] **0.3** Permission context (`PermissionProvider`, `usePermissions`, `<Gate>`)
- [x] **0.4** Full-stack Express + Vite setup

---

## Phase 1: Super Admin “God‑Mode” (Days 4–7)

- [x] **1.1** Feature Toggle Board (ID 185) – `AdminDashboard.tsx`
- [x] **1.2** User provisioning – `RoleSwitcher` & Permission Matrix
- [x] **1.3** Security Hardening (ID 187) – Geofencing & Audit Logic

---

## Phase 2: High‑Density POS & Revenue (Days 8–14)

- [x] **2.1** Virtualised 4‑column product grid (ID 1) + Hyper-Density View (ID 55)
- [x] **2.2** IMEI/Asset Guard (IDs 5,6) – Deep Search & Validation
- [x] **2.3** Split payments (ID 12) – Basic multi-method support
- [x] **2.4** Product bundling (ID 7) – Configurable variants

---

## Phase 3: Deep‑Tech Repair Hub (Days 15–21)

- [x] **3.1** Intake engine (IDs 61,63) – `RepairIntake.tsx`
- [x] **3.2** QC gate (ID 71) – `QCTerminal.tsx`
- [x] **3.3** Status bot (ID 74) – WhatsApp API integration logic

---

## Phase 4: Inventory & Supply Chain (Days 22–28)

- [x] **4.1** Multi‑store matrix view (ID 121) – `InventoryDashboard.tsx`
- [x] **4.2** Inter‑store transfers (IDs 122–124) – Approval workflow
- [x] **4.3** Landed cost engine (ID 128) – PO management

---

## Phase 5: Governance & Intelligence (Days 29–35)

- [x] **5.1** Master audit trail (ID 181) – Comprehensive Obsidian Audit View
- [x] **5.2** Anomaly detector (ID 244) – Suspicious sale flagging
- [x] **5.3** Z‑Report matrix (ID 190) – PDF generator

---

## Phase 6: Omnichannel & IoT (Days 36–42)

- [x] **6.1** Webhook listeners (ID 243) – Shopify/WooCommerce sync
- [x] **6.2** Customer display console (ID 247) – IoT Controller
- [x] **6.3** Biometric logic (ID 246) – WebAuthn skeletal support
- [x] **6.4** Customer 360 Profile (ID 256) – Deep relationship mapping

---

---

## Phase 7: Deep Intelligence & Customer Affinity (COMPLETE)

- [x] **7.1** High-Density POS UX Refinement – The Refractive Architect aesthetic applied.
- [x] **7.2** Mandatory Asset Tracking – Finalize-stage IMEI/Serial validation gate.
- [x] **7.3** Customer 360 Lifecycle Timeline – Visual vector of relationship history. (COMPLETE)
- [ ] **7.4** AI Store Pulse – Predictive sales velocity based on real matrix data. (MISSING)
- [/] **7.5** Omnichannel Registry Sync – Unified inventory across all digital nodes. (IN-PROCESS)
- [ ] **7.6** Biometric Node Access – HW-bound identity validation (WebAuthn). (PLANNED)
