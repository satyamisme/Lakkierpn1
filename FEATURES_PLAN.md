# FEATURES_PLAN.md – 300+ Feature Matrix
## Lakki Phone ERP

> **Purpose:** Every feature has a unique ID. Super admin toggles them individually.
> **Last updated:** April 2026

---

## Domain 1: POS & Unified Sales Terminal (IDs 1–60)

| ID | Feature | Description |
|----|---------|-------------|
| 1 | High‑Density Product Grid | 4‑column layout for Desktop/Tablet |
| 2 | Category Quick‑Tabs | Instant switching (Phones, Repairs, Accessories) |
| 3 | Elastic Search Bar | Instant results by SKU, Name, IMEI |
| 4 | Hardware Scanner Sync | Native HID/USB Barcode & Camera integration |
| 5 | Forced IMEI/Serial Validation | Blocks cart if 15‑digit serial missing for phones |
| 6 | Duplicate IMEI Prevention | Real‑time DB check to prevent double‑selling a serial |
| 7 | Dynamic Product Bundling | 1‑click “Kits” with auto‑deduction |
| 8 | Wholesale vs. Retail Toggle | Instant price‑book switch for B2B |
| 9 | Flash Sale Scheduler | Pre‑programmed start/end times for discounts |
| 10 | Store Credit Wallet | Digital balance for returns |
| 11 | Partial/Deposit Payments | Track deposits for “On‑Hold” items |
| 12 | Multi‑Payment Split | Combine Cash + K‑Net + Credit Card |
| 13 | Line‑Item Discounts | Percentage or fixed KD per product |
| 14 | Global Cart Discounts | Applied to final subtotal |
| 15 | Tax‑Inclusive/Exclusive Toggle | Switch VAT/GST display |
| 16 | Hold/Resume Cart | Multiple active customer sessions |
| 17 | Quick Customer Add | Create profile via mobile number (5 seconds) |
| 18 | Loyalty Accrual Logic | Automated points based on KD spent |
| 19 | Loyalty Redemption | Use points as payment method |
| 20 | Gift Card Ledger | Issue and track alphanumeric gift codes |
| 21 | Bilingual Receipts | EN/AR layout for thermal printers |
| 22 | QR Code Generation | For tax invoice validation |
| 23 | Receipt Reprint History | Access last 10,000 receipts |
| 24 | WhatsApp Receipt Share | Generate wa.me link with PDF invoice |
| 25 | A4 Invoice PDF | Professional layout for B2B |
| 26 | Sales Agent Tagging | Attribute sales to staff for commission |
| 27 | Price Overrides | Manager PIN required |
| 28 | Item Deletion Audit | Log every item removed from cart |
| 29 | Voided Sale Record | Archive cancelled sales with reason codes |
| 30 | Cash Drawer Kick | Hardware trigger to open drawer |
| 31 | Offline‑First Mode | Local transaction queue for internet outages |
| 32 | Auto‑Sync Engine | Upload offline sales when online |
| 33 | Customer‑Facing Display | Sync cart data to secondary monitor |
| 34 | Promotional Coupons | Validate alphanumeric discount codes |
| 35 | Refund Period Validator | Block returns after X‑day limit |
| 36 | Custom Service Fees | Manual labour entry |
| 37 | BOGO Logic | Buy‑one‑get‑one discount detection |
| 38 | Gift Wrapping Logic | Add packaging service fees |
| 39 | Sales Tax Auto‑Calc | Real‑time tax by region |
| 40 | Multi‑Currency Display | Show total in INR/USD for tourists |
| 41 | Daily Sales Goal Tracker | Progress bar in POS |
| 42 | Inventory Reserve | Hold item for 24 hours |
| 43 | Employee Purchase Price | Auto‑apply staff discount |
| 44 | Quick‑Change Calculator | Suggest cash denominations |
| 45 | Rounding Logic | Automated rounding for cash |
| 46 | Customer Debt Notification | Alert if customer owes money |
| 47 | IMEI History Lookup | See last sale of a serial |
| 48 | Thermal Printer Selection | Toggle 58mm / 80mm width |
| 49 | Manual Receipt Entry | Migrate legacy paper sales |
| 50 | Sales Return to Wallet | Refund to store credit only |
| 51 | POS Session Lock | Lock screen without logout |
| 52 | Recent Customers Tab | Quick access to last 5 shoppers |
| 53 | Category Image View | Toggle list/thumbnail grid |
| 54 | Barcode Label Print | Print labels directly from POS |
| 55 | Price Check Mode | Scan item to see price (no add to cart) |
| 56 | Staff Message Board | Internal notices in POS sidebar |
| 57 | VAT/GST Summary View | Real‑time tax breakdown |
| 58 | Internal Requisition | Staff taking items for shop use |
| 59 | Commission Split | Divide commission between two staff |
| 60 | Signature Capture | For high‑value card payments |

---

## Domain 2: Deep‑Tech Repair Hub (IDs 61–120)

| ID | Feature | Description |
|----|---------|-------------|
| 61 | Job Card Intake | Capture IMEI, Color, Passcode |
| 62 | Fault Diagnostic Tree | Pre‑defined issues list |
| 63 | Visual Damage Mapping | Draw cracks/scratches on device UI |
| 64 | Pre‑Repair Video/Photo | Attach visual proof to job card |
| 65 | Technician Bench Assignment | Map job to specific staff ID |
| 66 | SLA Countdown Timer | 1‑hour express repair monitor |
| 67 | Status Pipeline | Diagnosing → Parts Ordered → Fixing → QC |
| 68 | Internal Bench Notes | Private technical logs |
| 69 | Spare Parts Auto‑Deduction | Trigger inventory drop on completion |
| 70 | Parts Request Flow | Tech → Inventory notification |
| 71 | 20‑Point QC Checklist | FaceID, Mic, Camera, etc. |
| 72 | Digital Signature | Customer sign on tablet |
| 73 | Warranty Sticker Gen | Print unique date‑coded stickers |
| 74 | WhatsApp Status Bot | Auto‑alert “Ready for Pickup” |
| 75 | Used Device Buy‑Back | Identity scanning, automated grading (A/B/C) |
| 76 | IC‑Level Inventory | Track chips, screws, components |
| 77 | Loaner Device Tracker | Manage phones lent to customers |
| 78 | Estimated Pickup Calculation | AI‑lite time‑to‑fix |
| 79 | Repair Ticket QR | Customer scans for live progress |
| 80 | Mandoob Dispatch | Assign driver for home pickup/delivery |
| 81 | Technician Productivity | Jobs completed vs. returns |
| 82 | Repair Warranty Expiry | Auto‑alert when warranty ends |
| 83 | Motherboard Repair Logs | Track board‑level soldering |
| 84 | Software Flash Log | Record OS versions and flashing |
| 85 | Battery Health Record | Log % before/after replacement |
| 86 | Parts Cannibalization | Track parts taken from “dead” units |
| 87 | Refurbishment Costing | (Buy Price + Parts) = new asset value |
| 88 | Water Damage Diagnostic | Specific checklist for liquid |
| 89 | Outsourced Lab Log | Track jobs sent to external specialists |
| 90 | Job Card PDF | Printable document for bench |
| 91 | Internal Technical Wiki | Searchable “How‑to” guides |
| 92 | Tech‑Load Balancer | Auto‑suggest tech with least workload |
| 93 | Parts Margin Analyzer | Profit on parts vs. labour |
| 94 | Warranty Claim Link | Tie rework to original invoice |
| 95 | Pre‑Repair Pattern Lock | UI to record customer patterns |
| 96 | Tool Calibration Log | Track maintenance of shop tools |
| 97 | Job Status History | Log every status change (date/user) |
| 98 | SMS Readiness Alert | One‑click SMS to customer |
| 99 | Repair Bundle Discount | Discount for 2+ devices |
| 100 | Diagnostic Fee Engine | Charge fee even if repair rejected |
| 101 | Technician Login via NFC | Tap card to access bench |
| 102 | Parts Backorder List | Alert when requested part arrives |
| 103 | IMEI Verification API | Check blacklist during intake |
| 104 | Internal Spare Parts Request | Approval flow for expensive screens |
| 105 | Labour Commission Engine | Calculate % of labour for tech |
| 106 | Service Area Manager | Group repairs by branch/department |
| 107 | Job Priority Toggle | Mark as “VIP” or “Urgent” |
| 108 | Post‑Repair Survey | Auto‑send “How was your repair?” |
| 109 | Digital Repair Agreement | Mandatory T&Cs check |
| 110 | Device Archive | Move old repair data to cold storage |
| 111 | Repair Category Manager | Custom categories (Display, Audio, Power) |
| 112 | Status Color Mapping | Custom UI colours per status |
| 113 | Auto‑Assign Rules | e.g., all Samsung repairs to Technician A |
| 114 | Customer Device Gallery | Cloud storage for device photos |
| 115 | Repair Cost Estimator | Quick‑quote tool for phone queries |
| 116 | Job Expiry Alert | Notify manager if not picked up in 30 days |
| 117 | Bench Queue TV | Dashboard for techs to see upcoming jobs |
| 118 | Component Serial Tracking | Log serial of new screen |
| 119 | Repair Cancellation Flow | Restock parts if job cancelled |
| 120 | Job Card Barcode | Scan job card to open dashboard |

---

## Domain 3: Inventory & Supply Chain (IDs 121–180)

| ID | Feature | Description |
|----|---------|-------------|
| 121 | Multi‑Store Matrix View | Real‑time stock across all branches |
| 122 | Inter‑Store Transfer Request | Formal request flow between managers |
| 123 | In‑Transit Tracking | Status of moving stock |
| 124 | Transfer Approval Workflow | Request → Ship → Receive chain |
| 125 | Low Stock Dashboard | Visual triggers for critical items |
| 126 | Predictive Re‑order Alerts | Suggestions based on 30‑day sales velocity |
| 127 | Purchase Order (PO) Drafting | Professional orders to vendors |
| 128 | Landed Cost Calculator | Add Customs/Shipping/Mandoob fees |
| 129 | Supplier RMA Tracking | Defective parts sent back for credit |
| 130 | “Blind” Stock Counting | Staff count without system totals |
| 131 | Full IMEI Lifecycle | Chronological log from PO to sale |
| 132 | Manual Stock Adjustment | Correct breakage with “Reason Logs” |
| 133 | Product Variants | Parent‑Child for Colour/Storage/Region |
| 134 | Nested Categories | Phones > Apple > Used |
| 135 | Barcode Generator | Create unique tags for accessories |
| 136 | Shelf/Bin Mapping | Know exactly where the part is |
| 137 | Bulk CSV Import | Mass‑upload 1,000+ items |
| 138 | Bulk Price Updater | Mass price change by % or brand |
| 139 | Mass Label Print | Print stickers from a PO scan |
| 140 | Ghost Stock Reserve | Hold stock for online/pre‑orders |
| 141 | Inventory Valuation | FIFO‑based asset value reporting |
| 142 | Supplier Debt Ledger | Track what you owe vendors |
| 143 | Ageing Report | Identify stock older than 120 days |
| 144 | Consignment Tracker | Manage vendor‑owned inventory |
| 145 | Negative Stock Block | Prevent sales of missing items |
| 146 | Category Tax Override | Different VAT for repairs vs phones |
| 147 | Supplier Credit Notes | Manage money owed back to you |
| 148 | Batch/Lot Tracking | For batteries with expiry dates |
| 149 | Internal Consumption | Log parts used for shop demos |
| 150 | Warehouse Heat‑Map | Identify fast‑moving bins |
| 151 | Multi‑Currency Buying | Buy in USD/INR, sell in KD |
| 152 | QR Code Shelf Tags | Customer scans shelf for reviews |
| 153 | Re‑order Intelligence | Auto‑adjust stock triggers |
| 154 | Shipping Manifests | Documents for store transfers |
| 155 | Weight‑Based Shipping | Delivery fee calculation |
| 156 | Hazardous Material Tag | Label batteries for safety |
| 157 | Supplier Lead‑Time | Measure vendor shipping speed |
| 158 | Asset Depreciation | Track value drop of demo units |
| 159 | Auto‑SKU Generation | Brand/Model/Color logic |
| 160 | Inventory Reservation | Hold stock for 24‑hour quote |
| 161 | Stock Turn Ratio | Analytics on inventory speed |
| 162 | Warehouse Pick‑List | Optimised route for gathering |
| 163 | Cycle Counting | Daily mini‑audits for high‑value items |
| 164 | Incoming QC | Mandatory inspection of new shipments |
| 165 | Supplier Portal | Restricted view for vendors |
| 166 | Dead Stock Alert | Notification for zero‑sales items |
| 167 | Serialized Accessories | Track serials for chargers/watches |
| 168 | Stock In/Out History | Granular log of every movement |
| 169 | Pre‑Order Management | Track stock not yet in warehouse |
| 170 | Supplier Category Map | Which vendor sells which brands |
| 171 | Bulk Transfer Approval | Accept 50 items with one click |
| 172 | Stock Valuation by Store | Compare branch asset values |
| 173 | Unit of Measure (UOM) | Pieces vs Boxes vs Meters |
| 174 | Supplier Bank Details | Stored for wire transfers |
| 175 | Defective Return Pool | Bucket for parts removed from repairs |
| 176 | In‑Transit Insurance Tag | Mark high‑value transfers |
| 177 | Shelf Life Tracker | For glues and chemicals |
| 178 | Auto‑Replenish | Auto‑PO when stock hits zero |
| 179 | Transfer Manifest QR | Driver scans to mark “Arrived” |
| 180 | Inventory Snapshot | Export stock levels for accounting |

---

## Domain 4: Governance, Security & HR (IDs 181–240)

| ID | Feature | Description |
|----|---------|-------------|
| 181 | Master Audit Trail | Chronological log of every click/edit |
| 182 | Price Edit History | Track who changed a price and why |
| 183 | Void/Delete Audit | Detailed report on cancelled transactions |
| 184 | Role‑Based Sidebar Filtering | Dynamically hide features by permission |
| 185 | Feature Toggle Board | Super Admin switches for all 300 features |
| 186 | IP Whitelisting | Restrict admin access to shop Wi‑Fi |
| 187 | Geofencing Login | Staff only log in while at GPS location |
| 188 | Staff Attendance | Clock‑in/out with location verification |
| 189 | Automated Commission Math | Sales + Repair bonuses per employee |
| 190 | Daily Z‑Report | Final financial end‑of‑day summary |
| 191 | Mid‑Shift X‑Report | Snapshot without closing |
| 192 | Profit & Loss Dashboard | Daily/Monthly gross margin view |
| 193 | Expense Tracker | Log Rent/Tea/Utilities/Mandoob fees |
| 194 | VAT/Tax Export | Government‑ready CSV for filing |
| 195 | Role Template Creator | Presets for “Cashier”, “Manager”, etc. |
| 196 | Staff Permission Override | Give one specific user extra power |
| 197 | Payroll Engine | Base + commission – penalties |
| 198 | Employee Performance Score | Combined sales/repair metrics |
| 199 | Store Profile Manager | Logos, addresses, branch links |
| 200 | Database Health Monitor | Real‑time latency and uptime view |
| 201 | Auto‑Backups | Daily cloud snapshots of entire DB |
| 202 | Remote Session Logout | Admin kill any suspicious session |
| 203 | Multi‑Store Comparison | Benchmark Store A vs. Store B |
| 204 | Aged Debt Report | Identify customers who owe credit |
| 205 | Fraud Detection Logic | Flag same IMEI sold twice |
| 206 | Discount Capping | Hard‑block any discount > X% |
| 207 | Expense Receipt Upload | Photo attachments for petty cash |
| 208 | User Activity Timeline | Visual feed of staff actions |
| 209 | Security Policy Enforcer | Password expiry and complexity rules |
| 210 | Custom Field Builder | Add extra data fields to items/users |
| 211 | System Event Notifications | Email/SMS for big sales or stockouts |
| 212 | Multi‑User Concurrency | Handle 5 people editing one job |
| 213 | God‑Mode Parity | Co‑owner role with full power |
| 214 | Regional Scoping | Managers see only their shops |
| 215 | Audit Log Encryption | Make logs non‑editable even for Admins |
| 216 | Staff Feedback Loop | Internal “Suggest a Feature” tool |
| 217 | Access Logs | Track every login attempt and IP |
| 218 | Global Search Palette | Ctrl+K to jump to any feature |
| 219 | Dark/Light Mode Theme | Global UI styling engine |
| 220 | Print Layout Builder | Drag‑and‑drop receipt customizer |
| 221 | Voucher Validation | Scan physical flyers for coupons |
| 222 | Customer Merging | Clean duplicate profiles |
| 223 | Global Heatmap | Map of where customers live |
| 224 | Tax Compliance Check | Auto‑check for missing tax info |
| 225 | User Profile Image | Identify staff by photo in logs |
| 226 | Shift Handover Note | Digital report for next manager |
| 227 | Training Mode | Sandbox for new hires (no real data) |
| 228 | Feature Adoption Score | Show which staff use which tools |
| 229 | Legal Agreement Manager | Terms & Conditions versioning |
| 230 | Currency Exchange Rate | Auto‑update USD/INR to KD |
| 231 | GDPR/Privacy Tools | Export/Delete customer data |
| 232 | System Health Check | One‑click check of all API endpoints |
| 233 | Bulk User Invite | Onboard 50 staff via CSV |
| 234 | Department Hierarchy | Manage sub‑teams (Sales, Tech, HR) |
| 235 | Maintenance Mode Toggle | Lock app for updates |
| 236 | API Key Management | For external integrations |
| 237 | Payment Terminal Setup | Configure card machine links |
| 238 | Webhook Manager | Send data to external URLs |
| 239 | Report Scheduler | Email Z‑report at 11 PM daily |
| 240 | Dashboard Widget Customizer | Staff pin favourite tools |

---

## Domain 5: Omnichannel, CRM & IoT (IDs 241–300)

| ID | Feature | Description |
|----|---------|-------------|
| 241 | BOPIS Dashboard | Buy Online, Pick Up In‑Store fulfillment |
| 242 | Inventory Ghosting | Reserve stock exclusively for web |
| 243 | Price Syncing Engine | Sync POS prices with Shopify/Woo |
| 244 | Anomaly Detection | Flag suspicious deletions or edits |
| 245 | WhatsApp Support Bot | Auto‑answer repair status queries |
| 246 | Biometric Staff Login | WebAuthn/Fingerprint integration |
| 247 | Customer Queue Display | TV integration for repair waitlists |
| 248 | Remote Diagnostic Hook | Tools for software‑based remote repair |
| 249 | Loyalty Multiplier Events | “Double Points” weekend logic |
| 250 | Global Analytics Heatmap | Map showing customer density |
| 251 | WhatsApp API Config | Set up templates for receipts |
| 252 | Customer Tiering | Auto‑label (Silver, Gold, VIP) |
| 253 | Birthday Coupon Bot | Automated SMS/WhatsApp for birthdays |
| 254 | Review Solicitor | SMS link for Google Review after delivery |
| 255 | Mandoob Tracker | Real‑time driver location for delivery |
| 256 | Customer 360 Profile | Full history, spend, repair logs |
| 257 | Blacklist Manager | Flag problematic customers |
| 258 | Self‑Service Portal | Online status check via Ticket ID |
| 259 | Omnichannel Search | Find online orders in POS |
| 260 | Click‑to‑Call | Integrated dialing from CRM |
| 261 | Social Media Linkage | Attach Instagram/TikTok handles |
| 262 | Waitlist Logic | Notify when a part arrives |
| 263 | Pre‑order Management | Deposits for unreleased phones |
| 264 | Family Account Linking | Share points across family members |
| 265 | Geo‑Fencing Alerts | Notify shop when driver is near |
| 266 | Integrated Map | Show addresses for delivery routing |
| 267 | Customer CLV | Predict long‑term profit per user |
| 268 | Chat History Archive | Save all WhatsApp conversations |
| 269 | Store Feedback Screen | “Rate us” tablet at exit |
| 270 | Incident Log | Record customer complaints or accidents |
| 271 | Voucher Validation | Scan physical flyers |
| 272 | Excel/CSV Export | Turn any list into spreadsheet |
| 273 | Security Policy | Enforce password changes every 90 days |
| 274 | Staff Messenger | Internal chat for team coordination |
| 275 | IoT Scale Sync | For weighing parts or devices |
| 276 | Smart Display Screen | Customer monitor via WebSockets |
| 277 | RFID Tag Reader | Identify devices on bench pad |
| 278 | IoT Printer Status | Alert POS if paper is low |
| 279 | Cash Drawer Log | Record every physical opening |
| 280 | Kiosk Mode | Self‑service UI for accessory sales |
| 281 | Audio Announcements | “Job Assigned to Ahmed” over speakers |
| 282 | Digital Signage Sync | Display promos on store TVs |
| 283 | Payment Terminal Handshake | Direct tap‑to‑POS integration |
| 284 | Door Sensor Log | Track shop foot traffic |
| 285 | Inventory Pick‑List QR | Scan to confirm item is picked |
| 286 | Batch IMEI Registration | Add 500 serials via CSV |
| 287 | Web‑to‑Store Fulfill | Push web orders to nearest shop |
| 288 | Automatic Stock Reconciliation | Suggest fixes for counts |
| 289 | Supplier Order Reminder | Automated emails for late POs |
| 290 | Duplicate Customer Merge | One‑click cleanup of same mobiles |
| 291 | Failed Payment Retry | System re‑queue for card errors |
| 292 | Auto‑Assign Tech | Lightest workload logic |
| 293 | Executive Summary Email | Daily digest for owner |
| 294 | Product Affinity Analysis | “People who bought X also bought Y” |
| 295 | Return Rate by SKU | Identify bad batches of phones |
| 296 | Sales Funnel Analytics | View → Cart → Pay tracking |
| 297 | Zero‑Stock Impact | Report lost sales due to stockouts |
| 298 | Privacy Anonymization | Clean data for audit exports |
| 299 | Tamper‑Proof Audit | Append‑only log files |
| 300 | Global Search Palette | Ctrl+K rapid navigation engine |
