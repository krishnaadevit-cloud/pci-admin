# Migration Guide: Context API to Redux Toolkit

This guide helps you migrate components from React Context to Redux Toolkit for state management.

## Overview

The project is transitioning from using React Context (like `RegistrationFormContext`) to Redux Toolkit for better scalability and state management across multiple modules.

## Quick Migration Steps

### Step 1: Replace Context Provider with Redux Provider

**Before:**
```tsx
import { RegistrationFormProvider } from "@/components/prts/fresh-registration/RegistrationFormContext";

export function MyPage() {
  return (
    <RegistrationFormProvider>
      <MyComponent />
    </RegistrationFormProvider>
  );
}
```

**After:**
```tsx
// No need to add provider - it's already in root layout (layout.tsx)
export function MyPage() {
  return <MyComponent />;
}
```

---

### Step 2: Replace useContext with useAppDispatch and useAppSelector

#### Personal Details Example

**Before (Context):**
```tsx
"use client";
import { useContext } from "react";
import { RegistrationFormContext } from "@/components/prts/fresh-registration/RegistrationFormContext";

export function PersonalDetailsForm() {
  const { registration, updatePersonal } = useContext(RegistrationFormContext);
  const { personal } = registration;

  const handleChange = (e) => {
    updatePersonal({ [e.target.name]: e.target.value });
  };

  return (
    <input
      name="firstName"
      value={personal.firstName}
      onChange={handleChange}
    />
  );
}
```

**After (Redux):**
```tsx
"use client";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectPersonal, updatePersonal } from "@/lib/store/slices/freshRegistrationSlice";

export function PersonalDetailsForm() {
  const dispatch = useAppDispatch();
  const personal = useAppSelector(selectPersonal);

  const handleChange = (e) => {
    dispatch(updatePersonal({ [e.target.name]: e.target.value }));
  };

  return (
    <input
      name="firstName"
      value={personal.firstName}
      onChange={handleChange}
    />
  );
}
```

---

### Step 3: Update All Components in Fresh-Registration Module

#### Document Upload Step

**Before:**
```tsx
const { registration, updateDocument } = useContext(RegistrationFormContext);
```

**After:**
```tsx
const dispatch = useAppDispatch();
const documents = useAppSelector(selectDocuments);

// When updating:
dispatch(updateDocument({ id: docId, patch: { status: "uploaded" } }));
```

#### Education Details Step

**Before:**
```tsx
const { registration, updateEducation, setAdditionalQualifications } = 
  useContext(RegistrationFormContext);
```

**After:**
```tsx
const dispatch = useAppDispatch();
const education = useAppSelector(selectEducation);
const qualifications = useAppSelector(selectAdditionalQualifications);

// When updating:
dispatch(updateEducation({ sscSchool: "ABC School" }));
dispatch(setAdditionalQualifications(newQualifications));
```

#### Communication Details Step

**Before:**
```tsx
const { 
  registration, 
  updateCommunicationAddress, 
  setCommunicationAgreed 
} = useContext(RegistrationFormContext);
```

**After:**
```tsx
const dispatch = useAppDispatch();
const communication = useAppSelector(selectCommunication);

// When updating address:
dispatch(updateCommunicationAddress({
  key: "permanent",
  patch: { address: "123 Main St" }
}));

// When updating agreement:
dispatch(setCommunicationAgreed(true));
```

---

## Module-by-Module Migration

### Fresh-Registration Module

| Context Method | Redux Equivalent |
|---|---|
| `updatePersonal(patch)` | `dispatch(updatePersonal(patch))` |
| `updateEducation(patch)` | `dispatch(updateEducation(patch))` |
| `updateCommunicationAddress(key, patch)` | `dispatch(updateCommunicationAddress({key, patch}))` |
| `setCommunicationAgreed(bool)` | `dispatch(setCommunicationAgreed(bool))` |
| `updateDocument(id, patch)` | `dispatch(updateDocument({id, patch}))` |
| `resetPersonalForm()` | `dispatch(resetPersonalForm())` |
| `resetDocumentsToInitial()` | `dispatch(resetDocuments())` |
| `resetEducationSection()` | `dispatch(resetEducationSection())` |
| `resetCommunicationSection()` | `dispatch(resetCommunicationSection())` |

### Dashboard Module

```tsx
const dispatch = useAppDispatch();
const selectedService = useAppSelector(selectSelectedService);

// Update service
dispatch(setSelectedService("service-123"));

// Update filters
dispatch(setStatusFilter("completed"));
dispatch(setDateRangeFilter({ from: new Date(), to: new Date() }));
```

### Registration Module

```tsx
const dispatch = useAppDispatch();
const registrations = useAppSelector(selectFilteredRegistrations);
const error = useAppSelector(selectRegistrationError);

// Update search
dispatch(setSearchQuery("app-001"));

// Update status filter
dispatch(setStatusFilter("pending"));
```

---

## Using Selectors

Always use pre-built selectors for better performance and maintainability:

```tsx
import { 
  selectPersonal, 
  selectDocuments,
  selectCurrentStep,
  selectFreshRegistrationLoading 
} from "@/lib/store/selectors";

export function MyComponent() {
  const personal = useAppSelector(selectPersonal);
  const documents = useAppSelector(selectDocuments);
  const currentStep = useAppSelector(selectCurrentStep);
  const isLoading = useAppSelector(selectFreshRegistrationLoading);
  
  return (
    // ... JSX
  );
}
```

---

## Handling Async Operations (API Calls)

For operations that require API calls, create async thunks:

```tsx
// lib/store/slices/freshRegistrationSlice.ts
import { createAsyncThunk } from "@reduxjs/toolkit";

export const submitRegistration = createAsyncThunk(
  "freshRegistration/submitRegistration",
  async (data: RegistrationFormState, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit");
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// In slice reducers:
const freshRegistrationSlice = createSlice({
  // ...
  extraReducers: (builder) => {
    builder
      .addCase(submitRegistration.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitRegistration.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(submitRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});
```

Usage in components:
```tsx
const dispatch = useAppDispatch();
const isLoading = useAppSelector(selectFreshRegistrationLoading);

const handleSubmit = async () => {
  const result = await dispatch(submitRegistration(formData));
  if (result.type === submitRegistration.fulfilled.type) {
    // Success
  }
};
```

---

## Common Patterns

### Controlled Input

```tsx
const dispatch = useAppDispatch();
const firstName = useAppSelector(state => 
  state.freshRegistration.registration.personal.firstName
);

return (
  <input
    value={firstName}
    onChange={(e) => dispatch(updatePersonal({ firstName: e.target.value }))}
  />
);
```

### List Operations

```tsx
const documents = useAppSelector(selectDocuments);

// Filter documents
const uploadedDocs = documents.filter(d => d.status === "uploaded");

// Update specific document
dispatch(updateDocument({
  id: documentId,
  patch: { status: "failed", fileName: "error.pdf" }
}));
```

### Conditional Rendering

```tsx
const isFormComplete = useAppSelector(selectIsFormComplete);
const error = useAppSelector(selectFreshRegistrationError);

return (
  <>
    {error && <div className="error">{error}</div>}
    {isFormComplete ? (
      <button onClick={handleSubmit}>Submit</button>
    ) : (
      <p>Please complete all sections</p>
    )}
  </>
);
```

---

## DevTools Integration

Redux Toolkit works with Redux DevTools browser extension. You can:

1. Install Redux DevTools Extension
2. View state history
3. Time-travel debug
4. Inspect dispatched actions
5. Export/import state

The extension is automatically integrated - no additional setup needed!

---

## Troubleshooting

### Issue: "Cannot read property 'personal' of undefined"

**Cause:** Selector is accessing state before Redux is initialized.

**Solution:** Ensure components are wrapped with Redux Provider (already done in layout.tsx).

---

### Issue: State not updating

**Cause:** Forgot to dispatch the action.

**Solution:**
```tsx
// Wrong
updatePersonal({ firstName: "John" });

// Correct
dispatch(updatePersonal({ firstName: "John" }));
```

---

### Issue: Multiple component updates not triggering re-render

**Cause:** Not using correct selector or selector returning different reference.

**Solution:** Use the provided selectors and avoid inline selectors:
```tsx
// Avoid (creates new object reference each render)
const personal = useAppSelector(state => state.freshRegistration.registration.personal);

// Good (memoized selector)
const personal = useAppSelector(selectPersonal);
```

---

## Next Steps

1. Start migrating fresh-registration components
2. Follow the same pattern for dashboard and registration modules
3. Create new slices for any additional features
4. Use DevTools to verify state updates
5. Test thoroughly before deploying

---

For more details, see [Redux Store Architecture Documentation](./README.md)
