import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { submitRenewal, type RenewalSubmitPayload } from "@/services/renewalService";
import { fetchApplicationTypes } from "@/services/applicationTypeService";

export const submitRenewalApplication = createAsyncThunk(
  "otherApplication/submitRenewal",
  async (payload: RenewalSubmitPayload | FormData, { rejectWithValue }) => {
    try {
      return await submitRenewal(payload);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ?? error?.message ?? "Failed to submit renewal application",
      );
    }
  },
);

export const fetchApplicationTypesData = createAsyncThunk(
  "otherApplication/fetchApplicationTypes",
  async () => fetchApplicationTypes(),
);

export interface ApplicationType {
  id: string;
  uuid: string;
  applicationName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenewalEmploymentDetails {
  employmentStatus: "yes" | "no";
  designation: string;
  organizationName: string;
  employmentFileUrl: string;
}

export interface OtherApplicationState {
  isSubmitting: boolean;
  submitError: string | null;
  applicationUuid: string | null;
  renewalPeriod: number | null;
  employmentDetails: RenewalEmploymentDetails | null;
  applicationTypes: ApplicationType[];
  applicationTypesLoading: boolean;
}

const initialState: OtherApplicationState = {
  isSubmitting: false,
  submitError: null,
  applicationUuid: null,
  renewalPeriod: null,
  employmentDetails: null,
  applicationTypes: [],
  applicationTypesLoading: false,
};

const otherApplicationSlice = createSlice({
  name: "otherApplication",
  initialState,
  reducers: {
    setRenewalPeriod: (state, action: PayloadAction<number>) => {
      state.renewalPeriod = action.payload;
    },
    setEmploymentDetails: (state, action: PayloadAction<RenewalEmploymentDetails>) => {
      state.employmentDetails = action.payload;
    },
    setApplicationUuid: (state, action: PayloadAction<string>) => {
      state.applicationUuid = action.payload;
    },
    resetOtherApplicationState: (state) => {
      state.isSubmitting = false;
      state.submitError = null;
      state.applicationUuid = null;
      state.renewalPeriod = null;
      state.employmentDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Submit Renewal ─────────────────────────────────────────────────
      .addCase(submitRenewalApplication.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitRenewalApplication.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const payload = action.payload?.data ?? action.payload;
        state.applicationUuid = payload?.uuid ?? null;

        const rd = payload?.renewal_details;
        if (rd) {
          if (rd.renewalPeriod != null) {
            state.renewalPeriod = Number(rd.renewalPeriod);
          }
          if (rd.employmentStatus != null) {
            state.employmentDetails = {
              employmentStatus: rd.employmentStatus === 1 ? "yes" : "no",
              designation: rd.designation ?? "",
              organizationName: rd.organizationName ?? "",
              employmentFileUrl: rd.employmentFileUrl ?? "",
            };
          }
        }
      })
      .addCase(submitRenewalApplication.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError =
          (action.payload as string) ?? "Failed to submit renewal application";
      })

      // ── Fetch Application Types ────────────────────────────────────────
      .addCase(fetchApplicationTypesData.pending, (state) => {
        state.applicationTypesLoading = true;
      })
      .addCase(fetchApplicationTypesData.fulfilled, (state, action) => {
        state.applicationTypesLoading = false;
        state.applicationTypes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchApplicationTypesData.rejected, (state) => {
        state.applicationTypesLoading = false;
      });
  },
});

export const { setRenewalPeriod, setEmploymentDetails, setApplicationUuid, resetOtherApplicationState } = otherApplicationSlice.actions;
export default otherApplicationSlice.reducer;
