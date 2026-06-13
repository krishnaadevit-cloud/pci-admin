# Project Documentation: Atlantis React Dashboard

This document provides a comprehensive overview of the project's architecture, folder structure, styling conventions, and core components.

---

## 1. Project Overview & Architecture

This project is built using **Next.js** (App Router) and **PrimeReact**. It is based on the **Atlantis** premium template, designed for high-fidelity corporate dashboards.

### Core Technology Stack:
- **Framework**: Next.js (React 18+)
- **UI Components**: PrimeReact (DataTable, Dialog, etc.)
- **Styling**: Sass (SCSS), PrimeFlex (Utility Classes), and Tailwind CSS
- **Icons**: PrimeIcons
- **State Management**: React Context API (LayoutContext)

---

## 2. Folder Structure

Understanding the organization of files is crucial for development.

```text
my-project/
├── app/                    # Next.js App Router (Routes & Pages)
│   ├── (main)/             # Routes that use the Main Layout (Sidebar/Topbar)
│   │   ├── fresh-application/
│   │   ├── pci/
│   │   └── layout.tsx      # Main layout wrapper
│   ├── (full-page)/        # Routes without the main layout (Login, 404)
│   └── layout.tsx          # Root layout (Html/Body tags)
├── appConfig/              # Global configuration & Constants
│   ├── DatatableSetting.ts # Centralized column definitions for Tables
│   └── Settings.ts         # Global app constants (pagination, etc.)
├── components/             # Reusable UI Components
│   └── ui/                 # Custom UI wrappers (FormRow, InputField)
├── layout/                 # Layout structure components
│   ├── AppTopbar.tsx       # Navigation bar
│   ├── AppSidebar.tsx      # Side menu
│   └── context/            # LayoutContext (handles theme, menu state)
├── service/                # Data fetching and API services
├── styles/                 # Global Styles & Sass partials
│   └── layout/             # Core layout styling files
│       ├── layout.scss     # Main entry point for Sass
│       ├── _common-styles.scss # General custom styles
│       └── _custom_table.scss  # DataTable specific styles
├── types/                  # TypeScript interfaces and types
└── public/                 # Static assets (images, icons)
```

---

## 3. How to Add Custom CSS

There are several ways to add custom styling depending on the scope.

### A. Global Styles (Project-wide)
To add styles that should be available everywhere, use:
- **File**: `styles/layout/_common-styles.scss`
- **Why**: This file is already imported in the main layout and is meant for project-specific custom overrides.

### B. Creating New SCSS Modules
1. Create a new partial in `styles/layout/`, e.g., `_my-feature.scss`.
2. Import it in `styles/layout/layout.scss` using `@use './my-feature';`.

### C. Component-Level Styling
For simple overrides, you can use:
- **PrimeFlex**: Utility classes like `flex`, `align-items-center`, `p-4`, `m-2`.
- **Inline Style**: `<div style={{ backgroundColor: 'red' }}>`.
- **className**: `<div className="my-custom-class">` and define `.my-custom-class` in `_common-styles.scss`.

---

## 4. Pages and Routing

The project uses Next.js Route Groups to manage different layouts.

### (main) Route Group
Files under `app/(main)/` share the `layout.tsx` located in that folder. This layout includes the **Sidebar**, **Topbar**, and **Breadcrumbs**.
- **Example Route**: `/fresh-application/list` is found at `app/(main)/fresh-application/list/page.tsx`.

### (full-page) Route Group
Files under `app/(full-page)/` do not have the sidebar/topbar. This is used for login pages or landing pages.

---

## 5. Working with DataTables

The project uses a standardized approach for DataTables to ensure consistency.

### Column Configuration
Instead of defining columns inside the page, they are often centralized in `appConfig/DatatableSetting.ts`.

```typescript
// Example usage in page.tsx
import { FreshApplicationColumns } from '../../../../appConfig/DatatableSetting';

<DataTable value={data}>
    {FreshApplicationColumns.map((col) => (
        <Column key={col.field} field={col.field} header={col.header} sortable />
    ))}
</DataTable>
```

### Table Customization
Most tables use the `.custom-base-table` class found in `styles/layout/_custom_table.scss` to maintain a premium look.

---

## 6. Layout Context (State Management)

The `LayoutContext` (located in `layout/context/layoutcontext.tsx`) manages:
- **Theme**: Light/Dark mode.
- **Menu Mode**: Static, Overlay, Slim, Horizontal.
- **Menu State**: Whether the sidebar is expanded or collapsed.
- **Color Scheme**: Primary colors of the application.

You can access these states in any component using:
```typescript
const { layoutConfig, setLayoutState } = useContext(LayoutContext);
```

---

## 7. Adding a New Page

1. Create a folder under `app/(main)/` for your new route (e.g., `app/(main)/my-new-page`).
2. Create a `page.tsx` inside that folder.
3. Export a default React component.
4. Add the new page to the sidebar menu in `layout/AppMenu.tsx` (if needed).

---

## 8. Best Practices
- **Use Semantic HTML**: Use `<div className="card">` for content containers.
- **Utility First**: Favor PrimeFlex classes over writing new CSS for simple padding/margin.
- **Centralize Config**: Keep Table columns and constants in `appConfig`.
- **TypeScript**: Always define interfaces for your data in the `types/` folder.
