import { RootState } from "@/store/store";

export const selectOtherApplicationSubmitting = (state: RootState) =>
  state?.otherApplication?.isSubmitting ?? false;

export const selectOtherApplicationSubmitError = (state: RootState) =>
  state?.otherApplication?.submitError ?? null;

export const selectOtherApplicationUuid = (state: RootState) =>
  state?.otherApplication?.applicationUuid ?? null;

export const selectRenewalPeriod = (state: RootState) =>
  state?.otherApplication?.renewalPeriod ?? null;

export const selectApplicationTypes = (state: RootState) =>
  state?.otherApplication?.applicationTypes ?? [];

export const selectApplicationTypesLoading = (state: RootState) =>
  state?.otherApplication?.applicationTypesLoading ?? false;

export const selectApplicationTypeByName = (name: string) => (state: RootState) =>
  state?.otherApplication?.applicationTypes?.find(
    (t) => t.applicationName?.toLowerCase() === name.toLowerCase(),
  ) ?? null;

export const selectEmploymentDetails = (state: RootState) =>
  state?.otherApplication?.employmentDetails ?? null;
