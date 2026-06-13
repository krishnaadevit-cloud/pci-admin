# Redux Toolkit Architecture

This project uses Redux Toolkit for state management across multiple modules. The architecture is designed to be modular and scalable for adding new features.

## Project Structure

```
lib/store/
├── store.ts                    # Store configuration
├── hooks.ts                    # Custom Redux hooks
└── slices/
    ├── freshRegistrationSlice.ts    # Fresh Registration module state
    ├── dashboardSlice.ts            # Dashboard module state
    ├── registrationSlice.ts         # Registration module state
    └── uiSlice.ts                   # Global UI state
```

## Store Architecture

### Modules

#### 1. **Fresh Registration Module** (`freshRegistrationSlice.ts`)
Manages the fresh registration form state.

**State Structure:**
```typescript
{
  freshRegistration: {
    registration: {
      applicationId: string;
      personal: PersonalState;
      education: EducationState;
      additionalQualifications: AdditionalQualificationState[];
      communication: CommunicationState;
      documents: DocumentRowState[];
    };
    isLoading: boolean;
    error: string | null;
    currentStep: number;
  }
}
```

**Available Actions:**
- `updatePersonal(patch)` - Update personal details
- `updateEducation(patch)` - Update education details
- `setAdditionalQualifications(rows)` - Set additional qualifications
- `updateCommunicationAddress({key, patch})` - Update address (permanent/correspondence/professional)
- `setCommunicationAgreed(bool)` - Set terms agreement
- `updateDocument({id, patch})` - Update document status
- `resetPersonalForm()` - Reset personal section
- `resetDocuments()` - Reset documents section
- `resetEducationSection()` - Reset education section
- `resetCommunicationSection()` - Reset communication section
- `resetAllRegistration()` - Reset entire form
- `setCurrentStep(step)` - Navigate to specific step
- `nextStep()` / `previousStep()` - Navigate steps
- `setLoading(bool)` - Set loading state
- `setError(error)` - Set error state

#### 2. **Dashboard Module** (`dashboardSlice.ts`)
Manages dashboard state, filters, and service selection.

**State Structure:**
```typescript
{
  dashboard: {
    selectedService: string | null;
    isLoading: boolean;
    error: string | null;
    filters: {
      status: string | null;
      dateRange: { from: Date | null; to: Date | null };
    };
    recentActivityCount: number;
  }
}
```

**Available Actions:**
- `setSelectedService(service)` - Select a service
- `setStatusFilter(status)` - Filter by status
- `setDateRangeFilter({from, to})` - Filter by date range
- `setRecentActivityCount(count)` - Update activity count
- `resetFilters()` - Reset all filters
- `resetDashboard()` - Reset dashboard state
- `setLoading(bool)` - Set loading state
- `setError(error)` - Set error state

#### 3. **Registration Module** (`registrationSlice.ts`)
Manages registration records and history.

**State Structure:**
```typescript
{
  registration: {
    registrations: RegistrationRecord[];
    selectedRegistration: RegistrationRecord | null;
    isLoading: boolean;
    error: string | null;
    filters: {
      status: string | null;
      searchQuery: string;
    };
  }
}
```

**Available Actions:**
- `setRegistrations(records)` - Set all registrations
- `addRegistration(record)` - Add new registration
- `updateRegistration({id, patch})` - Update registration
- `removeRegistration(id)` - Remove registration
- `setSelectedRegistration(record)` - Select a registration
- `setStatusFilter(status)` - Filter by status
- `setSearchQuery(query)` - Search registrations
- `resetFilters()` - Reset filters
- `resetRegistrations()` - Reset state
- `setLoading(bool)` - Set loading state
- `setError(error)` - Set error state

#### 4. **UI Module** (`uiSlice.ts`)
Manages global UI state like sidebar, theme, notifications, and modals.

**State Structure:**
```typescript
{
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    notifications: Notification[];
    modal: {
      isOpen: boolean;
      type: string | null;
      data?: any;
    };
  }
}
```

**Available Actions:**
- `toggleSidebar()` - Toggle sidebar visibility
- `setSidebarOpen(bool)` - Set sidebar state
- `setTheme(theme)` - Set theme
- `addNotification({type, message})` - Add notification (auto-removes after 5s)
- `removeNotification(id)` - Remove specific notification
- `clearNotifications()` - Clear all notifications
- `openModal({type, data})` - Open modal
- `closeModal()` - Close modal
- `resetUi()` - Reset UI state

## Usage

### In Components

#### Using Typed Hooks

```typescript
"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { updatePersonal, setCurrentStep } from "@/lib/store/slices/freshRegistrationSlice";

export function MyComponent() {
  const dispatch = useAppDispatch();
  
  // Select state
  const personal = useAppSelector(state => state.freshRegistration.registration.personal);
  const currentStep = useAppSelector(state => state.freshRegistration.currentStep);
  
  const handleUpdate = (name: string, value: string) => {
    dispatch(updatePersonal({ firstName: value }));
  };
  
  const handleNextStep = () => {
    dispatch(setCurrentStep(currentStep + 1));
  };

  return (
    <div>
      <input value={personal.firstName} onChange={(e) => handleUpdate('firstName', e.target.value)} />
      <button onClick={handleNextStep}>Next</button>
    </div>
  );
}
```

### Selectors (Recommended Pattern)

```typescript
// lib/store/selectors/freshRegistrationSelectors.ts
import { RootState } from "@/lib/store/store";

export const selectPersonal = (state: RootState) => state.freshRegistration.registration.personal;
export const selectEducation = (state: RootState) => state.freshRegistration.registration.education;
export const selectCurrentStep = (state: RootState) => state.freshRegistration.currentStep;
export const selectIsLoading = (state: RootState) => state.freshRegistration.isLoading;
export const selectError = (state: RootState) => state.freshRegistration.error;

// Usage in component
const personal = useAppSelector(selectPersonal);
```

## Adding a New Module

When adding a new module (e.g., `applicationsSlice.ts`):

1. **Create the slice file:**
```typescript
// lib/store/slices/applicationsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const applicationsSlice = createSlice({
  name: "applications",
  initialState: { /* ... */ },
  reducers: { /* ... */ },
});

export default applicationsSlice.reducer;
```

2. **Add to store configuration:**
```typescript
// lib/store/store.ts
import applicationsReducer from "./slices/applicationsSlice";

export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
    // ... other slices
  },
});
```

3. **Update RootState type automatically** - It will pick up the new slice.

## Best Practices

1. **Use Typed Hooks** - Always use `useAppDispatch` and `useAppSelector` instead of plain hooks
2. **Create Selectors** - Extract selectors into separate files for reusability
3. **Keep Slices Pure** - All logic should be in reducers
4. **Async Operations** - Use `createAsyncThunk` for API calls
5. **Normalize State** - For complex data, consider normalizing
6. **Naming Convention** - Slice names follow the pattern: `{moduleName}Slice.ts`

## Migration from Context API

If migrating from React Context (like `RegistrationFormContext`):

**Before (Context):**
```typescript
const { registration, updatePersonal } = useContext(RegistrationFormContext);
```

**After (Redux):**
```typescript
const personal = useAppSelector(state => state.freshRegistration.registration.personal);
const dispatch = useAppDispatch();
dispatch(updatePersonal({firstName: "John"}));
```

## File Organization

When working on a module:

```
components/prts/{moduleName}/
├── {Module}.tsx              # Main component
├── {ModuleSidebar}.tsx       # Sidebar component
├── {ModuleContext}.tsx       # (DEPRECATED - use Redux instead)
├── state.ts                  # (DEPRECATED - use Redux slice)
└── steps/
    ├── Step1.tsx
    └── Step2.tsx

lib/store/slices/
└── {moduleName}Slice.ts      # Redux state management
```

## Environment Setup

Make sure you have installed dependencies:
```bash
npm install
```

This includes:
- `@reduxjs/toolkit`
- `react-redux`

Enjoy managing state with Redux Toolkit! 🚀
