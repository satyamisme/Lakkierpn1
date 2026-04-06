# IMPLEMENTATION_PLAN.md – 300‑Feature Roadmap
## Lakki Phone ERP

> **Strategy:** Core‑Out – build security and database foundation first, then layer features.

---

## Phase 0: Infrastructure Base (Days 1–3)

- [x] **0.1** Project Initialization & Metadata
- [ ] **0.2** Database setup (Firebase recommended)
- [ ] **0.3** Permission context (`PermissionProvider`, `usePermissions`, `<Gate>`)
- [ ] **0.4** Full-stack Express + Vite setup

---

## Phase 1: Super Admin “God‑Mode” (Days 4–7)

- [ ] **1.1** Feature Toggle Board (ID 185) – table of all 300 features with checkboxes
- [ ] **1.2** User provisioning – “Copy Permissions” tool
- [ ] **1.3** IP whitelist (ID 186) and geofence (ID 187) logic in login route

---

## Phase 2: High‑Density POS & Revenue (Days 8–14)

- [ ] **2.1** Virtualised 4‑column product grid (ID 1) + elastic search (ID 3)
- [ ] **2.2** IMEI guard (IDs 5,6) – modal for 15‑digit validation and duplicate check
- [ ] **2.3** Split payments (ID 12) – payment matrix UI with real‑time balance
- [ ] **2.4** Product bundling (ID 7) – 1‑SKU deduction of multiple items

---

## Phase 3: Deep‑Tech Repair Hub (Days 15–21)

- [ ] **3.1** Intake engine (IDs 61,63) – visual damage mapper + photo upload
- [ ] **3.2** QC gate (ID 71) – mandatory 20‑point checklist before delivery
- [ ] **3.3** Status bot (ID 74) – WhatsApp API trigger on QC pass

---

## Phase 4: Inventory & Supply Chain (Days 22–28)

- [ ] **4.1** Multi‑store matrix view (ID 121) – global stock search
- [ ] **4.2** Inter‑store transfers (IDs 122–124) – request → ship → receive workflow
- [ ] **4.3** Landed cost engine (ID 128) – add customs/shipping to PO

---

## Phase 5: Governance & Intelligence (Days 29–35)

- [ ] **5.1** Master audit trail (ID 181) – security feed with red‑highlighted anomalies
- [ ] **5.2** Anomaly detector (ID 244) – flag suspicious sales (e.g., 1 KD phone)
- [ ] **5.3** Z‑Report PDF generator (ID 190) – daily close summary

---

## Phase 6: Omnichannel & IoT (Days 36–42)

- [ ] **6.1** Webhook listeners for Shopify/Woo (ID 243) – sync stock
- [ ] **6.2** Customer queue display (ID 247) – TV screen for repair status
- [ ] **6.3** Biometric login (ID 246) – WebAuthn fingerprint support

---

## Deployment & Testing

- Staging environment: test all 300 features in sandbox.
- Stress test: simulate 50 cashiers + 20 technicians concurrently.
- Zero‑downtime migration: script to add `permissions` array to existing users.
