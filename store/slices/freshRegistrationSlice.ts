import { AdditionalQualificationState, AddressState, CommunicationState, createBlankEducation, createBlankPersonal, createInitialRegistrationState, DocumentRowState, EducationState, PersonalState, RegistrationFormState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchDashboard } from "@/services/dashboardService";
import { fetchPreview } from "@/services/previewService";
import { fetchBoards, fetchHospitals } from "@/services/educationService";

export const fetchDashboardData = createAsyncThunk(
  "freshRegistration/fetchDashboard",
  async () => fetchDashboard(),
);

export const fetchApplicationPreview = createAsyncThunk(
  "freshRegistration/fetchPreview",
  async (appUuid: string) => fetchPreview(appUuid),
);

export const fetchBoardOptions = createAsyncThunk(
  "freshRegistration/fetchBoards",
  async () => fetchBoards(),
);

export const fetchHospitalOptions = createAsyncThunk(
  "freshRegistration/fetchHospitals",
  async () => fetchHospitals(),
);

type AddressKey = keyof Pick<CommunicationState, "permanent" | "correspondence" | "professional">;

export interface FreshRegistrationState {
  registration: RegistrationFormState;
  dashboardData: any;
  previewData: RegistrationFormState | null;
  previewLoading: boolean;
  isLoading: boolean;
  error: string | null;
  currentStep: number;
  boardOptions: { label: string; value: string }[];
  boardsLoading: boolean;
  hospitalOptions: { label: string; value: string }[];
  hospitalsLoading: boolean;
}

const initialState: FreshRegistrationState = {
  registration: createInitialRegistrationState(),
  dashboardData: null,
  previewData: null,
  previewLoading: false,
  isLoading: false,
  error: null,
  currentStep: 0,
  boardOptions: [],
  boardsLoading: false,
  hospitalOptions: [],
  hospitalsLoading: false,
};

const freshRegistrationSlice = createSlice({
  name: "freshRegistration",
  initialState,
  reducers: {
    // Personal Details Actions
    updatePersonal: (state, action: PayloadAction<Partial<PersonalState>>) => {
      state.registration.personal = {
        ...state.registration.personal,
        ...action.payload,
      };
    },

    // Education Details Actions
    updateEducation: (state, action: PayloadAction<Partial<EducationState>>) => {
      state.registration.education = {
        ...state.registration.education,
        ...action.payload,
      };
    },

    // Additional Qualifications Actions
    setAdditionalQualifications: (
      state,
      action: PayloadAction<AdditionalQualificationState[]>
    ) => {
      state.registration.additionalQualifications = action.payload;
    },

    // Communication Address Actions
    updateCommunicationAddress: (
      state,
      action: PayloadAction<{
        key: AddressKey;
        patch: Partial<AddressState>;
      }>
    ) => {
      const { key, patch } = action.payload;
      state.registration.communication[key] = {
        ...state.registration.communication[key],
        ...patch,
      };
    },

    // Communication Terms Agreement
    setCommunicationAgreed: (state, action: PayloadAction<boolean>) => {
      state.registration.communication.agreedToTerms = action.payload;
    },

    // Document Actions
    updateDocument: (
      state,
      action: PayloadAction<{
        id: number;
        patch: Partial<DocumentRowState>;
      }>
    ) => {
      const { id, patch } = action.payload;
      const document = state.registration.documents.find((d) => d.id === id);
      if (document) {
        Object.assign(document, patch);
      }
    },

    updateEducationDocument: (
      state,
      action: PayloadAction<{
        id: number;
        patch: Partial<DocumentRowState>;
      }>
    ) => {
      const { id, patch } = action.payload;
      const document = state.registration.educationDocuments.find((d) => d.id === id);
      if (document) {
        Object.assign(document, patch);
      }
    },

    setEducationDocuments: (state, action: PayloadAction<DocumentRowState[]>) => {
      state.registration.educationDocuments = action.payload;
    },

    setDocuments: (state, action: PayloadAction<DocumentRowState[]>) => {
      state.registration.documents = action.payload;
    },

    // Reset Actions
    resetPersonalForm: (state) => {
      state.registration.personal = createBlankPersonal(true);
    },

    resetDocuments: (state) => {
      state.registration.documents = [];
    },

    resetEducationSection: (state) => {
      const init = createInitialRegistrationState();
      state.registration.education = createBlankEducation();
      state.registration.additionalQualifications = init.additionalQualifications;
      state.registration.educationDocuments = init.educationDocuments;
    },

    resetEducationDocuments: (state) => {
      state.registration.educationDocuments = createInitialRegistrationState().educationDocuments;
    },

    resetCommunicationSection: (state) => {
      const init = createInitialRegistrationState();
      state.registration.communication = init.communication;
    },

    resetAllRegistration: (state) => {
      state.registration = createInitialRegistrationState();
      state.dashboardData = null;
      state.previewData = null;
      state.previewLoading = false;
      state.currentStep = 0;
      state.error = null;
    },

    // Step Navigation
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    nextStep: (state) => {
      state.currentStep += 1;
    },

    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },

    // Loading and Error States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setApplicationId: (state, action: PayloadAction<string>) => {
      state.registration.applicationId = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;

        const data = action.payload;
        // Only pre-fill when the API confirms an existing application
        if (!data?.fresh_app_status || !data?.fresh_app_details) return;

        const details = data?.fresh_app_details;

        // Converts "Month YYYY" or "YYYY-MM[...]" → "YYYY-MM" for Calendar
        const MONTHS_SLICE = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const toYM = (val: string | null | undefined): string => {
          if (!val) return "";
          const s = String(val).trim();
          if (/^\d{4}-\d{2}/.test(s)) return s.substring(0, 7);
          const parts = s.split(/\s+/);
          if (parts.length >= 2) {
            const mi = MONTHS_SLICE.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
            const yr = parseInt(parts[parts.length - 1], 10);
            if (mi !== -1 && !isNaN(yr) && yr > 1900) return `${yr}-${String(mi + 1).padStart(2, "0")}`;
          }
          return "";
        };

        // ── Personal Details ──────────────────────────────────────────────
        const pd = details?.personalDetails;
        if (pd) {
          state.registration.applicationId = pd.uuid ?? "";
          state.registration.personal = {
            ...state.registration.personal,
            surname:         pd.surname             ?? "",
            firstName:       pd.firstName           ?? "",
            middleName:      pd.middleName          ?? "",
            email:           pd.email               ?? "",
            gender:          pd.gender              ?? "",
            dob:             pd.birthDate           ?? "",
            birthPlace:      pd.birthPlace          ?? "",
            nationality:     pd.nationality         ?? "",
            pan:             pd.panCard             ?? "",
            aadhaar:         pd.aadharCard          ?? "",
            bloodGroup:      pd.bloodGroup          ?? "",
            religion:        pd.religion            ?? "",
            category:        pd.category            ?? "",
            mobile:          pd.mobileNo            ?? "",
            altMobile:       pd.alternateMobileNo   ?? "",
            aadhaarVerified: pd.aadhaarVerified ?? details?.aadhaarVerified ?? false,
          };
        }

        // ── Education Details ─────────────────────────────────────────────
        const ed = details?.educationalDetails;
        if (ed) {
          state.registration.education = {
            ...state.registration.education,
            sscSchool:       ed.ssc_school_name    ?? "",
            sscBoard:        ed.ssc_board_uuid     ?? "",
            sscYear:         toYM(ed.ssc_passed_year),
            hscSchool:       ed.hsc_school_name    ?? "",
            hscBoard:        ed.hsc_board_uuid     ?? "",
            hscYear:         toYM(ed.hsc_passed_year),
            qualification:   ed.qualification_name ?? "",
            qualificationId: ed.qualification_uuid ?? "",
            institutionCode: ed.pci_code           ?? "",
            college:         ed.college_name       ?? "",
            collegeId:       ed.college_uuid       ?? "",
            joiningYear:     toYM(ed.college_joining_year),
            passedYear:      toYM(ed.college_passed_year),
            hospital:        ed.hospital_uuid      ?? "",
          };

          // Additional qualifications
          const additionalQuals = ed?.additional_qualifications ?? [];
          if (additionalQuals.length > 0) {
            state.registration.additionalQualifications = additionalQuals.map(
              (aq: any, index: number) => ({
                id: index + 1,
                qualification:   aq.additional_qualification_name ?? null,
                qualificationId: aq.additional_qualification_uuid ?? null,
                institutionCode: aq.additional_college_pci_code   ?? null,
                college:         aq.additional_college_name       ?? null,
                collegeId:       aq.additional_college_uuid       ?? null,
                documents: [],
              }),
            );
          }
        }

        // ── Communication Details ─────────────────────────────────────────
        const cd = details?.communicationDetails;
        if (cd) {
          state.registration.communication = {
            ...state.registration.communication,
            permanent: {
              address:  cd.permanent_address    ?? "",
              state:    cd.permanent_state      ?? "",
              district: cd.permanent_district   ?? "",
              taluka:   cd.permanent_taluka     ?? "",
              city:     cd.permanent_city       ?? "",
              pinCode:  cd.permanent_pin_code   ?? "",
            },
            correspondence: {
              address:  cd.postal_address    ?? "",
              state:    cd.postal_state      ?? "",
              district: cd.postal_district   ?? "",
              taluka:   cd.postal_taluka     ?? "",
              city:     cd.postal_city       ?? "",
              pinCode:  cd.postal_pin_code   ?? "",
            },
            professional: {
              address:  cd.professional_address    ?? "",
              state:    cd.professional_state      ?? "",
              district: cd.professional_district   ?? "",
              taluka:   cd.professional_taluka     ?? "",
              city:     cd.professional_city       ?? "",
              pinCode:  cd.professional_pin_code   ?? "",
            },
          };
        }

        // ── Education Documents (already uploaded) ────────────────────────
        const eduDocs: any[] = details?.educationalDocuments ?? [];
        if (eduDocs.length > 0) {
          state.registration.educationDocuments = eduDocs.map((doc, index) => ({
            id: index + 1,
            uuid: doc.uuid,
            qualificationDocumentUuid: doc.qualification_document_uuid,
            name: doc.documentName ?? `Document ${index + 1}`,
            status: "uploaded" as const,
            fileName: doc.documentName ?? `Document ${index + 1}`,
            fileSize: "",
            downloadUrl: doc.downloadUrl ?? "",
            digiFetchDisabled: true,
            selected: true,
            isRequired: true,
          }));
        }

        // ── Other Documents ───────────────────────────────────────────────
        const otherDocs: any[] = details?.otherDocuments ?? [];
        if (otherDocs.length > 0) {
          state.registration.documents = otherDocs.map((doc, index) => {
            const isUploaded = !!doc.downloadUrl;
            return {
              id: index + 1,
              uuid: doc.uuid ?? undefined,
              documentId: doc.documentUuid,
              name: doc.documentName ?? `Document ${index + 1}`,
              status: isUploaded ? ("uploaded" as const) : ("pending" as const),
              fileName: isUploaded ? (doc.documentName ?? `Document ${index + 1}`) : undefined,
              fileSize: "",
              downloadUrl: doc.downloadUrl ?? "",
              digiFetchDisabled: isUploaded,
              selected: isUploaded,
              isRequired: doc.is_required ?? true,
            };
          });
        }
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load dashboard";
      })

      // ── Application Preview ──────────────────────────────────────────────
      .addCase(fetchApplicationPreview.pending, (state) => {
        state.previewLoading = true;
      })
      .addCase(fetchApplicationPreview.fulfilled, (state, action) => {
        state.previewLoading = false;

        const data = action.payload;
        if (!data?.fresh_app_details) return;

        const details = data?.fresh_app_details;

        const MONTHS_PREV = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const toYM = (val: string | null | undefined): string => {
          if (!val) return "";
          const s = String(val).trim();
          if (/^\d{4}-\d{2}/.test(s)) return s.substring(0, 7);
          const parts = s.split(/\s+/);
          if (parts.length >= 2) {
            const mi = MONTHS_PREV.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
            const yr = parseInt(parts[parts.length - 1], 10);
            if (mi !== -1 && !isNaN(yr) && yr > 1900) return `${yr}-${String(mi + 1).padStart(2, "0")}`;
          }
          return "";
        };

        const preview: RegistrationFormState = createInitialRegistrationState();

        const pd = details?.personalDetails;
        if (pd) {
          preview.applicationId = pd.uuid ?? "";
          preview.personal = {
            ...preview.personal,
            surname:     pd.surname           ?? "",
            firstName:   pd.firstName         ?? "",
            middleName:  pd.middleName        ?? "",
            email:       pd.email             ?? "",
            gender:      pd.gender            ?? "",
            dob:         pd.birthDate         ?? "",
            birthPlace:  pd.birthPlace        ?? "",
            nationality: pd.nationality       ?? "",
            pan:         pd.panCard           ?? "",
            aadhaar:     pd.aadharCard        ?? "",
            bloodGroup:  pd.bloodGroup        ?? "",
            religion:    pd.religion          ?? "",
            category:    pd.category          ?? "",
            mobile:      pd.mobileNo          ?? "",
            altMobile:   pd.alternateMobileNo ?? "",
          };
        }

        const ed = details?.educationalDetails;
        if (ed) {
          preview.education = {
            ...preview.education,
            sscSchool:       ed.ssc_school_name    ?? "",
            sscBoard:        ed.ssc_board_name     ?? "",
            sscYear:         toYM(ed.ssc_passed_year),
            hscSchool:       ed.hsc_school_name    ?? "",
            hscBoard:        ed.hsc_board_name     ?? "",
            hscYear:         toYM(ed.hsc_passed_year),
            qualification:   ed.qualification_name ?? "",
            qualificationId: ed.qualification_uuid ?? "",
            institutionCode: ed.pci_code           ?? "",
            college:         ed.college_name       ?? "",
            collegeId:       ed.college_uuid       ?? "",
            joiningYear:     toYM(ed.college_joining_year),
            passedYear:      toYM(ed.college_passed_year),
            hospital:        ed.hospital_name      ?? "",
          };

          const additionalQuals = ed?.additional_qualifications ?? [];
          if (additionalQuals.length > 0) {
            preview.additionalQualifications = additionalQuals.map(
              (aq: any, index: number) => ({
                id: index + 1,
                qualification:   aq.additional_qualification_name ?? null,
                qualificationId: aq.additional_qualification_uuid ?? null,
                institutionCode: aq.additional_college_pci_code   ?? null,
                college:         aq.additional_college_name       ?? null,
                collegeId:       aq.additional_college_uuid       ?? null,
                documents: [],
              }),
            );
          }
        }

        const cd = details?.communicationDetails;
        if (cd) {
          preview.communication = {
            ...preview.communication,
            permanent: {
              address:  cd.permanent_address   ?? "",
              state:    cd.permanent_state     ?? "",
              district: cd.permanent_district  ?? "",
              taluka:   cd.permanent_taluka    ?? "",
              city:     cd.permanent_city      ?? "",
              pinCode:  cd.permanent_pin_code  ?? "",
            },
            correspondence: {
              address:  cd.postal_address   ?? "",
              state:    cd.postal_state     ?? "",
              district: cd.postal_district  ?? "",
              taluka:   cd.postal_taluka    ?? "",
              city:     cd.postal_city      ?? "",
              pinCode:  cd.postal_pin_code  ?? "",
            },
            professional: {
              address:  cd.professional_address   ?? "",
              state:    cd.professional_state     ?? "",
              district: cd.professional_district  ?? "",
              taluka:   cd.professional_taluka    ?? "",
              city:     cd.professional_city      ?? "",
              pinCode:  cd.professional_pin_code  ?? "",
            },
          };
        }

        const eduDocs: any[] = details?.educationalDocuments ?? [];
        if (eduDocs.length > 0) {
          preview.educationDocuments = eduDocs.map((doc, index) => ({
            id: index + 1,
            uuid: doc.uuid,
            qualificationDocumentUuid: doc.qualification_document_uuid,
            name: doc.documentName ?? `Document ${index + 1}`,
            status: "uploaded" as const,
            fileName: doc.documentName ?? `Document ${index + 1}`,
            fileSize: "",
            downloadUrl: doc.downloadUrl ?? "",
            digiFetchDisabled: true,
            selected: true,
            isRequired: true,
          }));
        }

        const otherDocs: any[] = details?.otherDocuments ?? [];
        if (otherDocs.length > 0) {
          preview.documents = otherDocs.map((doc, index) => {
            const isUploaded = !!doc.downloadUrl;
            return {
              id: index + 1,
              uuid: doc.uuid ?? undefined,
              documentId: doc.documentUuid,
              name: doc.documentName ?? `Document ${index + 1}`,
              status: isUploaded ? ("uploaded" as const) : ("pending" as const),
              fileName: isUploaded ? (doc.documentName ?? `Document ${index + 1}`) : undefined,
              fileSize: "",
              downloadUrl: doc.downloadUrl ?? "",
              digiFetchDisabled: isUploaded,
              selected: isUploaded,
              isRequired: doc.is_required ?? true,
            };
          });
        }

        state.previewData = preview;
      })
      .addCase(fetchApplicationPreview.rejected, (state) => {
        state.previewLoading = false;
      })

      // ── Board Options ────────────────────────────────────────────────────
      .addCase(fetchBoardOptions.pending, (state) => {
        state.boardsLoading = true;
      })
      .addCase(fetchBoardOptions.fulfilled, (state, action) => {
        state.boardsLoading = false;
        const list: any[] = Array.isArray(action.payload) ? action.payload : [];
        state.boardOptions = list.map((b) => ({ label: b.boardName, value: b.uuid }));
      })
      .addCase(fetchBoardOptions.rejected, (state) => {
        state.boardsLoading = false;
      })

      // ── Hospital Options ─────────────────────────────────────────────────
      .addCase(fetchHospitalOptions.pending, (state) => {
        state.hospitalsLoading = true;
      })
      .addCase(fetchHospitalOptions.fulfilled, (state, action) => {
        state.hospitalsLoading = false;
        const list: any[] = Array.isArray(action.payload) ? action.payload : [];
        state.hospitalOptions = list.map((h) => ({ label: h.hospitalName, value: h.uuid }));
      })
      .addCase(fetchHospitalOptions.rejected, (state) => {
        state.hospitalsLoading = false;
      });
  },
});

export const {
  updatePersonal,
  updateEducation,
  setAdditionalQualifications,
  updateCommunicationAddress,
  setCommunicationAgreed,
  updateDocument,
  updateEducationDocument,
  setEducationDocuments,
  setDocuments,
  resetPersonalForm,
  resetDocuments,
  resetEducationDocuments,
  resetEducationSection,
  resetCommunicationSection,
  resetAllRegistration,
  setCurrentStep,
  nextStep,
  previousStep,
  setLoading,
  setError,
  setApplicationId,
} = freshRegistrationSlice.actions;

export default freshRegistrationSlice.reducer;
