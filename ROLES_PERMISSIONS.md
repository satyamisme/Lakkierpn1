# ROLES_PERMISSIONS.md – Strategic Access Control
## Lakki Phone ERP

> **Core principle:** Every feature has a unique ID (1–300).  
> User permissions stored as `permissions: [Number]` array in database.  
> UI uses `<Gate id={ID}>` to show/hide components.

---

## 1. Default Role Templates

| Role | ID Range / Key IDs | Description |
|------|--------------------|-------------|
| **Super Admin** | All IDs 1–300 | Full control, can toggle any feature |
| **Store Manager** | 1–30, 61–100, 121–150, 181–210 | Operations + approvals + reports |
| **Cashier** | 1–25, 40–55 | POS only, no cost prices, no deletes |
| **Technician** | 61–99, 115–120 | Repair hub only, consumes parts |
| **Inventory Staff** | 121–150, 151–170 | Stock management, transfers, POs |
| **Security Auditor** | 181,182,183,205,208,215 | Read‑only logs and anomaly detection |

---

## 2. Permission Guard Implementation

### Frontend (React)
```tsx
// usePermissions hook
const { hasPermission } = usePermissions();
{hasPermission(13) && <DiscountInput />}

// Gate component
<Gate id={27}>
  <PriceOverrideButton />
</Gate>
```
