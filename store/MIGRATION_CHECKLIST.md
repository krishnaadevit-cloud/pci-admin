# Redux Migration Checklist

Track your progress as you migrate components from Context API to Redux Toolkit.

## Setup Phase ✅

- [x] Install Redux Toolkit and React-Redux dependencies
- [x] Create Redux store configuration (`lib/store/store.ts`)
- [x] Create custom hooks (`lib/store/hooks.ts`)
- [x] Create Redux slices (freshRegistration, dashboard, registration, ui)
- [x] Create selectors for all modules
- [x] Create Redux provider component (`PrtsReduxProvider`)
- [x] Update root layout to use Redux provider
- [x] Create documentation (README, MIGRATION, QUICK_REFERENCE)

**Status:** ✅ COMPLETE

**Next Step:** Run `npm install` and test the app

---

## Phase 1: Fresh-Registration Module

### Core Setup
- [ ] Test app runs with Redux provider
- [ ] Verify Redux DevTools shows store
- [ ] Confirm no TypeScript errors

### Form Steps Migration

#### 1. PersonalDetailsStep.tsx
- [ ] Import Redux hooks and selectors
- [ ] Replace context with `useAppSelector(selectPersonal)`
- [ ] Replace updatePersonal with `dispatch(updatePersonal(...))`
- [ ] Test form input/output
- [ ] Test reset functionality
- [ ] Remove context imports
- [ ] Status: Not Started

#### 2. EducationDetailsStep.tsx
- [ ] Import Redux hooks and selectors
- [ ] Replace context with `useAppSelector(selectEducation)`
- [ ] Implement education updates via Redux
- [ ] Handle additional qualifications with Redux
- [ ] Test form behavior
- [ ] Remove context imports
- [ ] Status: Not Started

#### 3. CommunicationDetailsStep.tsx
- [ ] Import Redux hooks and selectors
- [ ] Replace context with Redux selectors for communication
- [ ] Implement address updates via `updateCommunicationAddress`
- [ ] Handle agreement checkbox with `setCommunicationAgreed`
- [ ] Test all three address types (permanent, correspondence, professional)
- [ ] Remove context imports
- [ ] Status: Not Started

#### 4. DocumentUploadStep.tsx
- [ ] Import Redux hooks and selectors
- [ ] Replace context with `useAppSelector(selectDocuments)`
- [ ] Implement document updates via `updateDocument`
- [ ] Handle file uploads with Redux
- [ ] Test upload status tracking
- [ ] Implement document reset
- [ ] Remove context imports
- [ ] Status: Not Started

#### 5. EkycStep.tsx
- [ ] Import Redux hooks and selectors
- [ ] Replace context with relevant selectors
- [ ] Implement Aadhaar updates via Redux
- [ ] Test e-KYC flow
- [ ] Remove context imports
- [ ] Status: Not Started

### Form Components

#### PrtsRegistrationFlow.tsx
- [ ] Update to use Redux for step navigation
- [ ] Replace `setCurrentStep` calls with Redux dispatch
- [ ] Implement next/previous step via Redux
- [ ] Handle form completion state
- [ ] Remove context imports
- [ ] Status: Not Started

#### PrtsVerticalStepper.tsx
- [ ] Update to use Redux for current step state
- [ ] Replace context usage with selectors
- [ ] Remove context imports
- [ ] Status: Not Started

#### ApplicationPreview.tsx
- [ ] Use Redux selectors to display form data
- [ ] Remove context imports
- [ ] Status: Not Started

#### PaymentConfirmDialog.tsx
- [ ] Use Redux for application data
- [ ] Implement modal using UI slice
- [ ] Remove context imports
- [ ] Status: Not Started

### UI Components (Fresh-Registration)

#### PrtsFormSection.tsx
- [ ] Update if it uses context
- [ ] Status: Not Started

#### PrtsOtpInput.tsx
- [ ] Update if it uses context
- [ ] Status: Not Started

### Cleanup
- [ ] Delete `RegistrationFormContext.tsx`
- [ ] Delete old context usage from constants.ts if any
- [ ] Delete `createInitialRegistrationState` and `createBlankPersonal` helpers if moved to slice
- [ ] Update imports across all files
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Run lint: `npm run lint`
- [ ] Test entire fresh-registration flow

---

## Phase 2: Dashboard Module

### Dashboard Setup
- [ ] Identify all dashboard state needs
- [ ] Create selectors for computed dashboard data if needed
- [ ] Plan async thunks for API calls

### Components
- [ ] **PrtsDashboard.tsx** - Update to use Redux
- [ ] **PrtsDashboardSidebar.tsx** - Update filters to use Redux
- [ ] **PrtsRecentActivity.tsx** - Use Redux for activity data
- [ ] **PrtsServiceCard.tsx** - Use Redux if needed

### Features
- [ ] Service selection via Redux
- [ ] Filter functionality via Redux
- [ ] Activity tracking via Redux
- [ ] Add async thunks for API calls
- [ ] Test entire dashboard flow

---

## Phase 3: Registration Module

### Components
- [ ] Identify all registration list components
- [ ] Create necessary async thunks for API calls
- [ ] Implement registration list display
- [ ] Implement search functionality
- [ ] Implement filtering
- [ ] Implement status tracking

---

## Phase 4: Global UI Components

### Layout Components

#### PrtsHeader.tsx
- [ ] Update if it uses sidebar state
- [ ] Use Redux for UI state (sidebar, notifications)

#### PrtsFooter.tsx
- [ ] Update if needed
- [ ] Status: Not Started

### Reusable UI Components

#### PrtsInputText.tsx
- [ ] Update if it uses context
- [ ] Status: Not Started

#### PrtsDropdown.tsx
- [ ] Update if it uses context
- [ ] Status: Not Started

#### PrtsCalendar.tsx
- [ ] Update if it uses context
- [ ] Status: Not Started

### Notifications & Modals
- [ ] Implement notification display component using UI slice
- [ ] Implement modal system using UI slice
- [ ] Test auto-dismiss notifications
- [ ] Test modal open/close

---

## Phase 5: API Integration

### Async Thunks
- [ ] Create `submitRegistration` async thunk
- [ ] Create `fetchDashboardData` async thunk
- [ ] Create `fetchRegistrations` async thunk
- [ ] Create `uploadDocument` async thunk
- [ ] Handle error states in all thunks
- [ ] Implement retry logic if needed

### Error Handling
- [ ] Display error messages via notifications
- [ ] Handle validation errors
- [ ] Handle network errors
- [ ] Implement loading states

---

## Phase 6: Testing

### Unit Tests
- [ ] Test fresh-registration slice reducers
- [ ] Test dashboard slice reducers
- [ ] Test registration slice reducers
- [ ] Test UI slice reducers
- [ ] Test selectors (optional but recommended)

### Integration Tests
- [ ] Test fresh-registration form flow
- [ ] Test dashboard filtering
- [ ] Test registration list
- [ ] Test notifications
- [ ] Test modals

### Manual Testing
- [ ] Test entire application flow
- [ ] Test Redux DevTools integration
- [ ] Verify no console errors
- [ ] Test on different browsers
- [ ] Test on mobile

---

## Phase 7: Cleanup & Documentation

### Code Cleanup
- [ ] Remove all Context API code
- [ ] Remove unused imports
- [ ] Clean up old helper files
- [ ] Update all internal documentation

### External Documentation
- [ ] Update project README if needed
- [ ] Document any custom patterns used
- [ ] Update developer onboarding docs
- [ ] Create team guidelines for Redux usage

### Performance
- [ ] Check for unnecessary re-renders (use React DevTools Profiler)
- [ ] Verify selectors are memoized
- [ ] Check for selector dependency issues
- [ ] Optimize if needed

---

## Migration Statistics

### Before Migration
- **State Management:** React Context (single) + Component State
- **Modules:** 1 (Fresh-Registration)
- **Components:** ~10
- **Files:** 2 (RegistrationFormContext.tsx + registrationState.ts)

### After Migration
- **State Management:** Redux Toolkit (5 slices) + PrimeReact styling
- **Modules:** 4 (freshRegistration, dashboard, registration, ui)
- **Components:** ~20+ (prepared for future modules)
- **Files:** 15+ (store structure with slices, selectors, hooks)

### Progress Tracking
| Phase | Status | Completion |
|-------|--------|-----------|
| Setup | ✅ Complete | 100% |
| Fresh-Registration | ⏳ Pending | 0% |
| Dashboard | ⏳ Pending | 0% |
| Registration | ⏳ Pending | 0% |
| Global UI | ⏳ Pending | 0% |
| API Integration | ⏳ Pending | 0% |
| Testing | ⏳ Pending | 0% |
| Cleanup | ⏳ Pending | 0% |

---

## Notes for Team

- **Estimated Timeline:** 2-3 weeks for full migration
- **Priority:** Fresh-registration module (most complex)
- **Support:** Refer to `lib/store/MIGRATION.md` and `QUICK_REFERENCE.md`
- **Questions:** Check `lib/store/README.md` for architecture details

---

## Getting Help

1. **Quick Reference:** See `lib/store/QUICK_REFERENCE.md`
2. **Migration Issues:** See `lib/store/MIGRATION.md`
3. **Architecture:** See `lib/store/README.md`
4. **Redux DevTools:** Use browser extension for debugging
5. **TypeScript Issues:** Check type definitions in store.ts

---

**Last Updated:** 2026-05-21
**Redux Toolkit Version:** 1.9.7
**React-Redux Version:** 8.1.3
