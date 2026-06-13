# DIGI-PHARMed — Pharmacy Council of India · Admin Portal

> **Branch:** `feature/admin-portal-Abhishek`
> **Base:** `main` (boilerplate from Atlantis PrimeReact template)
> **Tech stack:** Next.js 14 (App Router) · React 18 · PrimeReact · TypeScript · Tailwind (utility classes via PrimeFlex)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What Changed From the Original Branch](#2-what-changed-from-the-original-branch)
3. [New Files Added](#3-new-files-added)
4. [Modified Files](#4-modified-files)
5. [Component Workflow — How the Layout Renders](#5-component-workflow--how-the-layout-renders)
6. [Admin Module — Page Map](#6-admin-module--page-map)
7. [Config JSON Files — Mock Data Reference](#7-config-json-files--mock-data-reference)
8. [Best Practices for Using Mock Data](#8-best-practices-for-using-mock-data)
9. [Replacing Mock Data with Real APIs](#9-replacing-mock-data-with-real-apis)
10. [Running the Project](#10-running-the-project)

---

## 1. Project Overview

DIGI-PHARMed is the **Digital Regulatory Platform** for the Pharmacy Council of India (PCI). This branch (`feature/admin-portal-Abhishek`) builds the **Admin Portal** — a protected internal interface used by PCI staff to manage:

- Employee records and designations
- Pharmacy college infrastructure (labs, classrooms, facilities)
- Examining authorities across Indian states
- Inspection workflows and deficiency lists
- Finance, library, hospital data, and reports

The frontend is built on the [Atlantis PrimeReact template](https://www.primefaces.org/atlantis-react/) and extended with PCI-specific branding, routing, and data.

---

## 2. What Changed From the Original Branch

The original `main` branch was a clean Atlantis boilerplate with:
- Generic Atlantis logo and branding
- Empty navigation with placeholder pages
- No domain-specific data or components
- Standard topbar with notification bell, settings cog, search bar, and message icons
- The `AppConfig` floating cog widget visible on every page
- Breadcrumb rendered twice (once inside `AppTopbar`, once again in `layout.tsx`)

### Changes made in this branch:

| Area | Original | Changed To |
|------|----------|------------|
| **Branding** | Atlantis logo + "Atlantis" text | PCI emblem (`pci-logo.png`) + "DIGI-PHARMed" |
| **Header** | None (just topbar) | Full branded `AppPCIHeader` with PCI emblem, Hindi name, and subtitle |
| **Header colour** | Hardcoded navy `#1a3a6b` | `var(--primary-color)` — follows active PrimeReact theme |
| **Topbar icons** | Bell, cog, search, message, bookmark | Removed all; kept hamburger + breadcrumb + profile/logout only |
| **Settings cog widget** | `<AppConfig />` floating on every page | Removed from `layout.tsx` entirely |
| **Breadcrumb** | Rendered twice | Rendered once inside `AppTopbar` only |
| **Navigation** | Empty/generic items | Full admin menu tree with 36 routes across 15 sections |
| **Employee page** | Hardcoded dummy rows | Driven by `config/employeeData.json`; designations and departments follow PCI/MQT regulations |
| **Labs page** | Generic `${program} Lab` names | Named per PCI regulations (8 labs B.Pharm, 4 labs D.Pharm, etc.) |
| **Examining Authority page** | Empty list | Populated from `examinationAuthorityData.json`; invalid entries filtered at runtime |
| **Deficiency List page** | 2 hardcoded rows | Driven by `deficiencyListData.json` with real inspection data |
| **Equipment page** | 3 placeholder items | 20 real items from D.Pharm Sheet E and B.Pharm requirements |
| **Config JSON files** | None | 12 JSON files in `config/` (see §7) |
| **Employee form** | Generic HR fields | Pharmacy-specific designations and departments per MQT 2014 |

---

## 3. New Files Added

### `layout/AppPCIHeader.tsx`

The shared branded header rendered at the top of **every page** across all modules.

```
┌─────────────────────────────────────────────────────────────────┐
│  [PCI Logo]   भारतीय भेषजी परिषद                              │
│               PHARMACY COUNCIL OF INDIA                         │
│               DIGI-PHARMed · Digital Regulatory Platform        │
└─────────────────────────────────────────────────────────────────┘
```

- Background: `var(--primary-color)` — automatically changes with the selected PrimeReact theme
- Bottom border: `var(--primary-200)` — golden accent line
- Logo: `public/layout/images/logo/pci-logo.png` — the official PCI emblem
- Uses Next.js `<Image>` for optimised delivery

### `app/(main)/pci/admin/` — 36 admin pages

All pages under this directory are new. They are organised as:

```
app/(main)/pci/admin/
├── employee/
│   ├── page.tsx              ← Employee list with DataTable
│   └── form/page.tsx         ← Add/Edit employee form
├── decision/page.tsx
├── subjects/page.tsx
├── equipments/page.tsx
├── examining-authority/
│   ├── summary/page.tsx
│   ├── dashboard/page.tsx
│   ├── appeal/page.tsx
│   ├── appeal-list/page.tsx
│   └── deficiency-list/page.tsx
├── finance/
│   ├── budget/page.tsx
│   └── income-expenditure/page.tsx
├── general/
│   ├── program/page.tsx
│   └── examining-authority/page.tsx
├── hospitals/
│   ├── hospital/page.tsx
│   └── ancillary-staff/page.tsx
├── infrastructure/
│   ├── labs/page.tsx
│   ├── common-facilities/page.tsx
│   ├── computer-facilities/page.tsx
│   └── classrooms/page.tsx
├── inspection/
│   ├── list/page.tsx
│   ├── status/page.tsx
│   ├── reports/page.tsx
│   ├── deficiency-list/page.tsx
│   ├── institute-deficiency/page.tsx
│   └── observer-assignment/page.tsx
├── inspector-applicant/page.tsx
├── issue-tracker/
│   ├── tracker/page.tsx
│   └── grievance/page.tsx
├── library/
│   ├── books/page.tsx
│   ├── courses/page.tsx
│   └── subjects/page.tsx
├── masters/page.tsx
├── office-notes/page.tsx
├── scrutinizer/page.tsx
└── verifier/page.tsx
```

### `config/` — 12 JSON mock data files

| File | Purpose | Records |
|------|---------|---------|
| `employeeData.json` | PCI staff roster | 45 |
| `examinationAuthorityData.json` | Examining authorities across India | 441 |
| `labsData.json` | Lab requirements per program | 17 |
| `courseData.json` | Pharmacy course catalogue | 207 |
| `programData.json` | Pharmacy programs offered | 5 |
| `deficiencyListData.json` | Inspection deficiency records | ~50 |
| `commonFacilitiesData.json` | Infrastructure norms | 19 |
| `computerFacilities.json` | Computer lab requirements | 5 |
| `amenitiesData.json` | College amenities list | 11 |
| `ancillaryStaff.json` | Hospital ancillary staff types | 27 |
| `budgetData.json` | Budget line items | 20 |
| `stateWiseCount.json` | State codes and names | ~35 |

---

## 4. Modified Files

### `layout/layout.tsx`

**Three changes:**

1. Added `<AppPCIHeader />` above the main content wrapper — places the branded header at the top of the page for all routes.
2. Removed the second `<AppBreadCrumb />` instance that was inside a `<div className="content-breadcrumb">` — it was causing the path to appear twice.
3. Removed `<AppConfig />` — this was the floating gear/cog icon appearing on the right side of every page.

```tsx
// Before
<AppConfig />                           // ← removed (floating cog)
<div className="layout-content-wrapper">
    <AppTopbar ... />
    <div className="content-breadcrumb">
        <AppBreadCrumb />               // ← removed (duplicate)
    </div>
    <div className="layout-content">{props.children}</div>
</div>

// After
<AppPCIHeader />                        // ← new branded header
<div className="layout-content-wrapper">
    <AppTopbar ... />
    <div className="layout-content">{props.children}</div>
</div>
```

### `layout/AppTopbar.tsx`

Removed all non-essential icons from the topbar. Only three areas remain:

- **Left:** Hamburger menu toggle button (controls sidebar expand/collapse)
- **Center:** `<AppBreadCrumb />` — shows current route path once
- **Right:** Profile dropdown with Logout link only

Removed icons: search input, notification bell (`pi-bell`), message/comment (`pi-comment`), settings (`pi-cog`), bookmark.

### `layout/AppSidebar.tsx`

Replaced Atlantis logo block with PCI branding:

```tsx
// Before: Atlantis logo-dark.png / logo-light.png + appname-dark.png

// After:
<img src="/layout/images/logo/pci-logo.png" style={{ height: '2rem' }} />
<span style={{ fontWeight: 700, fontSize: '0.75rem' }}>DIGI-PHARMed</span>
```

### `app/(main)/pci/admin/employee/page.tsx`

- Imports `employeeData.json` and maps each record to an internal `Employee` shape
- Added `DEPT_BY_DESIGNATION` — maps a staff member's designation to their department per MQT Regulations 2014:

```typescript
const DEPT_BY_DESIGNATION: Record<string, string> = {
    'Director/Principal': 'PCI',
    'Professor': 'Pharmaceutics',
    'Associate Professor': 'Pharmaceutical Chemistry',
    'Assistant Professor': 'Pharmacology',
    'Lecturer': 'Pharmacognosy',
    'Manager': 'PCI',
    'Analyst': 'Pharmacy Practice',
    'Accountant': 'PCI',
    'Teacher': 'Pharmacy Practice',
};
```

- Added `WORKLOAD_MAP` — maps designation to weekly teaching hours per MQT 2014

### `app/(main)/pci/admin/employee/form/page.tsx`

Replaced generic HR dropdowns with pharmacy-domain fields:

- **Departments:** Pharmaceutics, Pharmaceutical Chemistry, Pharmacology, Pharmacognosy, Pharmacy Practice, Administration/PCI
- **Designations:** Director/Principal/HOI, Professor, Associate Professor, Assistant Professor, Lecturer, Manager, Analyst, Accountant, Teacher

### `app/(main)/pci/admin/infrastructure/labs/page.tsx`

- Added `PROGRAM_LAB_NAMES` constant that maps each program to its required, properly-named labs per PCI regulations
- Changed data generation from `.map()` to `.flatMap()` so each program entry expands into multiple named lab rows
- B.Pharm: 8 named labs | D.Pharm: 4 named labs | M.Pharm/Pharm.D: specialisation-based

### `app/(main)/pci/admin/general/examining-authority/page.tsx`

- Imports `examinationAuthorityData.json` (441 real authority names)
- Imports `stateWiseCount.json` to build a complete Indian state dropdown
- Added `isValidEAName()` runtime filter to reject garbage entries that slipped through data cleaning

### `app/(main)/pci/admin/examining-authority/deficiency-list/page.tsx`

- Imports `deficiencyListData.json` — real inspection deficiency records
- Added `mapInspectionStatus()` to normalise `inspection_status` values → `'OPEN' | 'RESOLVED' | 'PENDING'`

### Config JSON files — data cleaning

All 12 JSON files in `config/` were cleaned:

- Removed internal Frappe/ERPNext system fields: `name` (hash), `owner` (hash), `modified`, `modified_by`, `idx`
- Removed test/garbage records from `employeeData.json` (26 removed: Helpdesk1–8, Scrutinizer1–2, Verifier1–2, IT Dept, faizan, mohd, etc.)
- Removed 59 invalid entries from `examinationAuthorityData.json` (asdf, RAVI KUMAR, THE, na, BMS, BMSCE, bteup, RPAT, etc.) and deduplicated
- Fixed name spacing (`"Mr. Bheem  Singh"` → `"Mr. Bheem Singh"`)
- Fixed null designations in `employeeData.json` — all set to `"Manager"` as default
- Initialised `programData.json` (was 0 bytes / corrupt) with 5 standard pharmacy programs

---

## 5. Component Workflow — How the Layout Renders

Every page in the app goes through this rendering chain:

```
Browser Request
      │
      ▼
app/layout.tsx  (root — sets <html>, loads global CSS, wraps PrimeReact providers)
      │
      ▼
app/(main)/layout.tsx  (authenticated shell — renders <Layout>)
      │
      ▼
layout/layout.tsx  ◄── THE CORE SHELL
      │
      ├── <AppPCIHeader />          [TOP]  Branded PCI header — always visible
      │       └── PCI logo + title block + subtitle
      │
      └── <div className="layout-content-wrapper">
              │
              ├── <AppTopbar />     [TOPBAR]
              │       ├── Hamburger button → calls onMenuToggle() from LayoutContext
              │       ├── <AppBreadCrumb />  → reads pathname, builds crumb trail
              │       └── <AppSidebar />     → the collapsible left nav
              │               └── <AppMenu />
              │                       └── <AppSubMenu />
              │                               └── <AppMenuitem />  (each nav link)
              │
              ├── <div className="layout-content">
              │       └── {props.children}   ← the actual page (e.g. employee/page.tsx)
              │
              └── <AppProfileMenu />    [OVERLAY] profile slide-out panel
```

### LayoutContext — the state backbone

`layout/context/layoutcontext.tsx` holds shared UI state consumed by all layout components:

| State | What it controls |
|-------|-----------------|
| `layoutConfig.colorScheme` | `'light'` or `'dark'` — applied as `data-theme` on root div |
| `layoutConfig.menuMode` | `'static'`, `'overlay'`, `'slim'`, `'horizontal'`, etc. |
| `layoutConfig.theme` | Active PrimeReact theme name (e.g. `'magenta'`) |
| `layoutState.overlayMenuActive` | Whether sidebar overlay is open on mobile |
| `layoutState.staticMenuDesktopInactive` | Whether sidebar is collapsed on desktop |
| `layoutState.sidebarActive` | Whether sidebar is in hover-expanded state (slim mode) |
| `layoutState.anchored` | Whether slim sidebar is pinned open |

### MenuContext — tracks which sub-menu is open

`layout/context/menucontext.tsx` tracks `activeMenu` — the ID of the currently expanded sidebar group. `AppMenuitem` reads and writes this so only one group is expanded at a time.

### Sidebar expand/collapse flow

```
User clicks hamburger
    → onMenuToggle() (LayoutContext)
        → toggles staticMenuDesktopInactive (desktop) or staticMenuMobileActive (mobile)
            → layout-wrapper CSS class changes
                → sidebar CSS transition slides in/out
```

### Slim mode hover flow

```
User hovers sidebar (slim mode)
    → AppSidebar.onMouseEnter()
        → sets sidebarActive: true
            → sidebar expands to show labels
    → onMouseLeave() with 300ms debounce
        → sets sidebarActive: false
            → sidebar collapses back to icons
```

---

## 6. Admin Module — Page Map

The `AppMenu.tsx` defines the full navigation tree. Every `to:` value is a Next.js route.

```
Admin
├── Dashboard
│   ├── Employee               /pci/admin/employee
│   ├── Scrutinizer            /pci/admin/scrutinizer
│   └── Verifier               /pci/admin/verifier
├── Decision                   /pci/admin/decision
├── Subjects                   /pci/admin/subjects
├── Equipments                 /pci/admin/equipments
├── Examining Authority
│   ├── Summary                /pci/admin/examining-authority/summary
│   ├── EA Dashboard           /pci/admin/examining-authority/dashboard
│   ├── Appeal                 /pci/admin/examining-authority/appeal
│   ├── Deficiency List        /pci/admin/examining-authority/deficiency-list
│   └── Appeal List            /pci/admin/examining-authority/appeal-list
├── Finance
│   ├── Income & Expenditure   /pci/admin/finance/income-expenditure
│   └── Budget                 /pci/admin/finance/budget
├── General
│   ├── Program                /pci/admin/general/program
│   └── Examining Authority    /pci/admin/general/examining-authority
├── Hospitals
│   ├── Ancillary Staff        /pci/admin/hospitals/ancillary-staff
│   └── Hospital               /pci/admin/hospitals/hospital
├── Infrastructure
│   ├── Labs Required          /pci/admin/infrastructure/labs
│   ├── Common Facilities      /pci/admin/infrastructure/common-facilities
│   ├── Computer Facilities    /pci/admin/infrastructure/computer-facilities
│   └── Classrooms             /pci/admin/infrastructure/classrooms
├── Inspection
│   ├── Deficiency List        /pci/admin/inspection/deficiency-list
│   ├── Institute Deficiency   /pci/admin/inspection/institute-deficiency
│   ├── Inspection List        /pci/admin/inspection/list
│   ├── Inspection Status      /pci/admin/inspection/status
│   ├── Inspection Reports     /pci/admin/inspection/reports
│   └── Observer Assignment    /pci/admin/inspection/observer-assignment
├── Inspector Applicant        /pci/admin/inspector-applicant
├── Issue Tracker
│   ├── Issue Tracker          /pci/admin/issue-tracker/tracker
│   └── Grievance Report       /pci/admin/issue-tracker/grievance
├── Library
│   ├── Books                  /pci/admin/library/books
│   ├── Courses                /pci/admin/library/courses
│   └── Subjects               /pci/admin/library/subjects
├── Masters List               /pci/admin/masters
└── Office Notes               /pci/admin/office-notes
```

---

## 7. Config JSON Files — Mock Data Reference

All JSON files live in `config/` at the project root. They are imported directly into page components using Next.js static imports (no API call needed).

### File Schemas

#### `employeeData.json`
```json
{
  "data": [
    {
      "employee_number": "PCI-Emp-101",
      "employee_name": "Mr. Bijendar Kumar",
      "designation": "Manager",
      "status": "Active",
      "company": "Pharmacy Council of India",
      "creation": "2025-01-23T11:01:29",
      "docstatus": 0
    }
  ],
  "totalRecord": 45
}
```

#### `examinationAuthorityData.json`
```json
{
  "data": [
    {
      "examiningauthority_name": "Andaman and Nicobar island Examining Authority",
      "creation": "2026-01-16T06:24:50.334437",
      "docstatus": 0
    }
  ],
  "totalRecord": 441
}
```

#### `labsData.json`
```json
{
  "data": [
    {
      "program": "B.Pharm",
      "total_no_labs_reqd": 8,
      "unit": "Nos",
      "description": "As per B.Pharm Regulations 2014 Appendix-A Cl.5",
      "creation": "...",
      "docstatus": 0
    }
  ],
  "totalRecord": 17
}
```

#### `programData.json`
```json
{
  "data": [
    { "program_name": "B.Pharm", "full_name": "Bachelor of Pharmacy", "duration": "4 Years", "docstatus": 0 },
    { "program_name": "D.Pharm", "full_name": "Diploma in Pharmacy",  "duration": "2 Years", "docstatus": 0 },
    { "program_name": "M.Pharm", "full_name": "Master of Pharmacy",   "duration": "2 Years", "docstatus": 0 },
    { "program_name": "Pharm.D", "full_name": "Doctor of Pharmacy",   "duration": "6 Years", "docstatus": 0 },
    { "program_name": "Pharm.D (PB)", "full_name": "Doctor of Pharmacy (Post Baccalaureate)", "duration": "3 Years", "docstatus": 0 }
  ],
  "totalRecord": 5
}
```

#### `deficiencyListData.json`
```json
{
  "data": [
    {
      "institution_name": "...",
      "deficiency_type": "...",
      "inspection_status": "Open",
      "creation": "...",
      "docstatus": 0
    }
  ]
}
```

#### `commonFacilitiesData.json`
```json
{
  "data": [
    {
      "requirement_as_per_norms": "Principal Room",
      "infrastructure_details": "...",
      "creation": "...",
      "docstatus": 0
    }
  ],
  "totalRecord": 19
}
```

---

## 8. Best Practices for Using Mock Data

### How pages currently import data

```typescript
// Static import — bundled at build time, zero latency
import employeeData from '@/config/employeeData.json';

// Map raw JSON shape to the page's internal interface
const SAMPLE: Employee[] = (employeeData.data as any[]).map((e, i) => ({
    id: i + 1,
    empNo: e.employee_number,
    fullName: e.employee_name,
    designation: e.designation || 'Manager',
    department: DEPT_BY_DESIGNATION[e.designation] || 'PCI',
    status: e.status?.toUpperCase() || 'ACTIVE',
    dateOfJoining: e.creation?.split('T')[0] ?? '',
    gender: 'N/A',
}));
```

### The two-layer pattern

Every page uses a two-layer data pattern:

```
JSON file (source of truth for mock)
       ↓  imported and mapped at module level (const SAMPLE = ...)
       ↓
useState<T[]>(SAMPLE)     ← local React state
       ↓
DataTable rows            ← rendered UI
       ↓
Dialog (add/edit/delete)  ← mutates local state only
```

State is **local only** — changes don't persist on refresh. This is intentional for mock mode.

### Rules to follow while the project uses mock data

1. **Never mutate the imported JSON directly.** Always copy into `useState`. The import is read-only at the module level.

2. **Keep the mapping function (`SAMPLE = data.map(...)`) outside the component.** It runs once at module load, not on every render.

3. **Use `docstatus === 0` as the "active" flag.** This mirrors the Frappe/ERPNext convention in the source data. `docstatus: 1` = submitted, `docstatus: 2` = cancelled.

4. **Always apply a runtime filter for data quality.** Even after cleaning the JSON files, guard against null/empty values at the mapping layer:
   ```typescript
   designation: e.designation || 'Manager',
   status: e.status?.toUpperCase() || 'ACTIVE',
   ```

5. **Keep domain constants in the page file, not in the JSON.** Lookup maps like `DEPT_BY_DESIGNATION` and `WORKLOAD_MAP` encode PCI regulatory rules — they belong as TypeScript constants next to the component that uses them, not in the JSON.

6. **Validate dropdown options against the JSON fields they filter.** If `examinationAuthorityData.json` has a `docstatus` field, the status dropdown values (`ACTIVE`/`INACTIVE`) must map from it:
   ```typescript
   status: e.docstatus === 0 ? 'ACTIVE' : 'INACTIVE'
   ```

7. **Never put PII or real credentials in JSON files.** The config files contain real institution names from PCI records — do not add real phone numbers, emails, or ID numbers to the mock data.

---

## 9. Replacing Mock Data with Real APIs

When the backend (Frappe/ERPNext or a REST API) is ready, swap out the static import with a data-fetching hook. The page internals stay the same because the mapping layer is already isolated.

### Step 1 — Replace the static import

```typescript
// Before (mock)
import employeeData from '@/config/employeeData.json';
const SAMPLE = employeeData.data.map(mapEmployee);

// After (real API)
// Remove the import and SAMPLE constant entirely
```

### Step 2 — Add a fetch call inside the component

```typescript
const [data, setData] = useState<Employee[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    fetch('/api/employees')           // or your Frappe API endpoint
        .then(r => r.json())
        .then(json => {
            setData((json.data as any[]).map(mapEmployee));
        })
        .finally(() => setLoading(false));
}, []);
```

### Step 3 — Pass `loading` to the DataTable

```tsx
<DataTable value={data} loading={loading} ...>
```

The `mapEmployee` function (the shape mapping) doesn't change at all. The UI, dialogs, filters, and columns are unaffected.

### Expected Frappe API endpoints

| Page | Endpoint pattern |
|------|-----------------|
| Employee list | `GET /api/resource/Employee?fields=[...]` |
| Examining Authorities | `GET /api/resource/Examining Authority` |
| Labs | `GET /api/resource/Labs Required` |
| Deficiency List | `GET /api/resource/Deficiency List` |
| Budget | `GET /api/resource/Budget` |

---

## 10. Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Navigate to the admin portal via the sidebar: **Admin → Dashboard → Employee** or any other section.

### TypeScript check

```bash
npx tsc --noEmit --skipLibCheck
```

There is one pre-existing error in `appConfig/AppHelper.tsx` (`Property 'cn' does not exist on type 'Window'`) that is from the original Atlantis boilerplate — not introduced by this branch.

### Branch merge notes

This branch adds only new files and targeted edits to layout components. No existing page outside of `layout/` is modified. Safe to merge into `main` or alongside other feature branches as long as `layout/layout.tsx`, `layout/AppTopbar.tsx`, and `layout/AppSidebar.tsx` do not have conflicting edits in the other branch.

---

*Last updated: April 2026 · Branch: feature/admin-portal-Abhishek*
