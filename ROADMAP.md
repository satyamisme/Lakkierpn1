# Lakki Terminal OS - Development Roadmap (v2.6 Obsidian)

This roadmap outlines the path to implementing all 367 features across 100 atomic pages, following the "Obsidian Shell" redesign.

## Phase 1: Core Infrastructure & Foundation (Weeks 1-3)
*Focus: Stabilizing the shell, auth, and basic operational flows.*

- [x] **Obsidian UI Shell**: Sidebar, TopBar, Command Center, Command Palette.
- [x] **Atomic Navigation**: Mapping 100 pages in `ModuleRenderer`.
- [ ] **Auth Hardening**:
    - Implement 2FA TOTP enrollment (Page 2).
    - IP Whitelist & Geofencing logic (Pages 3-4).
    - Password Policy engine (Page 5).
- [ ] **Data Layer Stabilization**:
    - Migrate from mock API calls to real Mongoose/Express endpoints for all 100 pages.
    - Implement unified search backend for `CommandPalette`.

## Phase 2: Operational Excellence (Weeks 4-8)
*Focus: Completing the POS and Repair Hub ecosystems.*

- [ ] **POS Terminal Expansion**:
    - Product Bundling & Partial Returns (Page 18).
    - Advanced Split Payments Matrix (Page 22).
    - Layaway Plans & Deposit Management (Page 27).
    - Offline Sync Engine refinement (Page 28).
- [ ] **Repair Hub Deep-Dive**:
    - 20-Point QC Gate with failure reasons (Page 34).
    - Technician Assignment & Queue Rules (Page 37).
    - Parts Usage & Backorder Management (Page 36, 44).
    - GSMA IMEI Blacklist Integration (Page 45).

## Phase 3: Supply Chain & Logistics (Weeks 9-12)
*Focus: Multi-store inventory and vendor management.*

- [ ] **Inventory Matrix**:
    - Inter-Store Transfers & Temporary Loans (Pages 48-49).
    - Purchase Order Workflow with Auto-Replenish (Page 51).
    - Landed Cost & Customs Calculation (Page 53).
    - Cycle Count (Blind & Double-Blind) (Page 62).
- [ ] **Warehouse Ops**:
    - Batch Intake Buffer & Scan-to-Bucket (Page 59).
    - ZPL Label Spooler (Page 61).

## Phase 4: Governance & Enterprise (Weeks 13-16)
*Focus: Security, Audit, and Financial reporting.*

- [ ] **Governance Suite**:
    - Tamper-proof Audit Trail Viewer (Page 65).
    - Fraud Detection & Anomaly Rules (Page 66).
    - Z-Report & X-Report Engine (Page 68).
    - Payroll & Commission Engine (Page 71).
- [ ] **System Resilience**:
    - Database Health Monitor & Self-Heal Dashboard (Page 74, 77).
    - PITR (Point-in-Time Recovery) Slider (Page 76).
    - API Circuit Breaker Panel (Page 78).

## Phase 5: Omnichannel & CRM (Weeks 17-20)
*Focus: Customer experience and external integrations.*

- [ ] **CRM 360**:
    - Customer Tiering & CLV Analytics (Page 81).
    - WhatsApp/SMS Notification Bot (Page 84-85).
    - Self-Service Repair Portal (Page 87).
- [ ] **Omnichannel Sync**:
    - BOPIS (Buy Online, Pick Up In Store) (Page 92).
    - IoT Device Integration (Scales, RFID, Door Sensors) (Page 90).
    - Mandoob (Driver) Tracker & Maps (Page 91).

---

## Technical Standards
1. **Atomic Design**: Every page must be independent and self-contained.
2. **Glassmorphism**: Strictly adhere to the Obsidian theme (`backdrop-blur`, `border-white/10`).
3. **High Density**: Maximize information display without clutter.
4. **Virtualization**: All tables/grids MUST use `react-window`.
5. **Real-time**: Use `Socket.io` for status updates (Repairs, Stock, Health).
