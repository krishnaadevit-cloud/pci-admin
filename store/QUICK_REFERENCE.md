# Redux Quick Reference Card

## Essential Imports

```tsx
// Hooks
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

// All Fresh-Registration Actions & Selectors
import { 
  updatePersonal, updateEducation, updateDocument,
  setCurrentStep, nextStep, previousStep,
  selectPersonal, selectEducation, selectDocuments,
  selectCurrentStep, selectFreshRegistrationLoading
} from "@/lib/store/selectors"; // OR from "@/lib/store/slices"

// Dashboard
import { 
  setSelectedService, setStatusFilter, setDateRangeFilter,
  selectDashboardFilters, selectRecentActivityCount
} from "@/lib/store/slices";

// Registration
import {
  setSearchQuery, setStatusFilter,
  selectFilteredRegistrations
} from "@/lib/store/slices";

// UI
import {
  addNotification, toggleSidebar, openModal,
  selectNotifications, selectSidebarOpen
} from "@/lib/store/slices";
```

---

## Component Template

```tsx
"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { 
  selectPersonal,
  updatePersonal 
} from "@/lib/store/selectors";

export function MyComponent() {
  const dispatch = useAppDispatch();
  
  // Select state
  const personal = useAppSelector(selectPersonal);

  // Dispatch action
  const handleChange = (field: string, value: string) => {
    dispatch(updatePersonal({ [field]: value }));
  };

  return (
    <div>
      <input
        value={personal.firstName}
        onChange={(e) => handleChange("firstName", e.target.value)}
      />
    </div>
  );
}
```

---

## Fresh-Registration Actions

```tsx
// Personal
dispatch(updatePersonal({ firstName: "John", surname: "Doe" }));
dispatch(resetPersonalForm());

// Education
dispatch(updateEducation({ sscSchool: "ABC School" }));
dispatch(resetEducationSection());

// Additional Qualifications
dispatch(setAdditionalQualifications([...]));

// Communication
dispatch(updateCommunicationAddress({
  key: "permanent", // or "correspondence" or "professional"
  patch: { address: "123 Main St", pinCode: "12345" }
}));
dispatch(setCommunicationAgreed(true));

// Documents
dispatch(updateDocument({
  id: 1,
  patch: { status: "uploaded", fileName: "doc.pdf" }
}));
dispatch(resetDocuments());

// Step Navigation
dispatch(setCurrentStep(2));    // Jump to step 2
dispatch(nextStep());            // Go to next
dispatch(previousStep());        // Go to previous

// Form State
dispatch(resetAllRegistration()); // Reset everything
dispatch(setLoading(true));
dispatch(setError("Error message"));
```

---

## Fresh-Registration Selectors

```tsx
// Personal Details
selectPersonal                    // Full personal object
selectPersonalAadhaar            // Just Aadhaar number
selectPersonalMobile             // Just mobile number

// Education
selectEducation                   // Full education object
selectAdditionalQualifications    // List of additional quals

// Communication
selectCommunication               // Full communication object
selectPermanentAddress            // Permanent address
selectCorrespondenceAddress       // Correspondence address
selectProfessionalAddress         // Professional address
selectCommunicationAgreed         // Terms agreement status

// Documents
selectDocuments                   // All documents
selectDocumentById(id)            // Specific document
selectDocumentsWithStatus("uploaded") // Filtered documents

// Form
selectApplicationId               // Application ID
selectCurrentStep                 // Current step (0-4)
selectFreshRegistrationLoading    // Loading state
selectFreshRegistrationError      // Error message

// Computed
selectIsFormComplete              // Is form ready to submit?
selectDocumentUploadProgress      // Upload progress percentage
```

---

## Dashboard Actions

```tsx
dispatch(setSelectedService("service-123"));
dispatch(setStatusFilter("completed")); // or any status
dispatch(setDateRangeFilter({ from: new Date(), to: new Date() }));
dispatch(setRecentActivityCount(15));
dispatch(resetFilters());
dispatch(setLoading(true));
dispatch(setError(null));
```

---

## Dashboard Selectors

```tsx
selectSelectedService
selectDashboardFilters
selectStatusFilter
selectDateRangeFilter
selectRecentActivityCount
selectDashboardLoading
selectDashboardError
selectIsDashboardActive
```

---

## Registration Actions

```tsx
dispatch(setSearchQuery("app-001"));
dispatch(setStatusFilter("pending"));
dispatch(setRegistrations([...]));
dispatch(addRegistration(newReg));
dispatch(updateRegistration({ id: "123", patch: { status: "completed" } }));
dispatch(removeRegistration("123"));
dispatch(setSelectedRegistration(reg));
```

---

## Registration Selectors

```tsx
selectAllRegistrations
selectFilteredRegistrations        // Already filtered by status & search
selectRegistrationCountByStatus    // { pending, completed, rejected, underReview }
selectSelectedRegistration
selectRegistrationFilters
selectRegistrationStatusFilter
selectRegistrationSearchQuery
selectRegistrationError
selectRegistrationLoading
```

---

## UI Actions

```tsx
// Sidebar
dispatch(toggleSidebar());
dispatch(setSidebarOpen(true));

// Theme
dispatch(setTheme("dark")); // or "light"

// Notifications (auto-remove after 5s)
dispatch(addNotification({
  type: "success", // or "error", "warning", "info"
  message: "Success!"
}));
dispatch(removeNotification(id));
dispatch(clearNotifications());

// Modals
dispatch(openModal({
  type: "paymentConfirm",
  data: { amount: 500, orderId: "ORD-123" }
}));
dispatch(closeModal());
```

---

## UI Selectors

```tsx
selectSidebarOpen
selectTheme
selectNotifications
selectNotificationCount
selectSuccessNotifications     // Filter by type
selectErrorNotifications
selectWarningNotifications
selectInfoNotifications
selectModal
selectIsModalOpen
selectModalType
selectModalData
selectIsDarkTheme
selectIsLightTheme
```

---

## Common Patterns

### Controlled Input
```tsx
const firstName = useAppSelector(state => 
  state.freshRegistration.registration.personal.firstName
);

<input
  value={firstName}
  onChange={(e) => dispatch(updatePersonal({ firstName: e.target.value }))}
/>
```

### Conditional Rendering
```tsx
const isFormComplete = useAppSelector(selectIsFormComplete);
const error = useAppSelector(selectFreshRegistrationError);

{error && <ErrorBanner>{error}</ErrorBanner>}
{isFormComplete ? <SubmitButton /> : <DisabledButton />}
```

### List Rendering with Updates
```tsx
const documents = useAppSelector(selectDocuments);

{documents.map(doc => (
  <DocumentRow
    key={doc.id}
    doc={doc}
    onUpdate={(patch) => dispatch(updateDocument({ id: doc.id, patch }))}
  />
))}
```

### Filtered Data
```tsx
const uploaded = useAppSelector(state =>
  state.freshRegistration.registration.documents
    .filter(d => d.status === "uploaded")
);
```

---

## Step-by-Step Component Migration Example

### Before (Context)
```tsx
const { registration, updatePersonal } = useContext(RegistrationFormContext);
const { personal } = registration;
```

### After (Redux)
```tsx
const dispatch = useAppDispatch();
const personal = useAppSelector(selectPersonal);
dispatch(updatePersonal({ firstName: value }));
```

---

## Redux DevTools

1. Install extension
2. Open Browser DevTools → Redux tab
3. See all actions, state changes, and time-travel debug

---

## Async Example (API calls)

```tsx
import { createAsyncThunk } from "@reduxjs/toolkit";

// Create async thunk
export const submitForm = createAsyncThunk(
  "freshRegistration/submit",
  async (data, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/register", { method: "POST", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Handle in slice
extraReducers: (builder) => {
  builder
    .addCase(submitForm.pending, (state) => { state.isLoading = true; })
    .addCase(submitForm.fulfilled, (state) => { state.isLoading = false; })
    .addCase(submitForm.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
}

// Use in component
const result = await dispatch(submitForm(formData));
```

---

## File Locations

| What | Where |
|------|-------|
| Store config | `lib/store/store.ts` |
| Hooks | `lib/store/hooks.ts` |
| Fresh-Reg Slice | `lib/store/slices/freshRegistrationSlice.ts` |
| All Selectors | `lib/store/selectors/index.ts` |
| All Actions | `lib/store/slices/index.ts` |
| Architecture Docs | `lib/store/README.md` |
| Migration Guide | `lib/store/MIGRATION.md` |
| Provider Component | `components/prts/providers/PrtsReduxProvider.tsx` |

---

**Quick Start:** Copy the component template and start using Redux!
