export type TenantStatus =
  | 'PROVISIONING'
  | 'CONFIGURING'
  | 'CONFIGURABLE'
  | 'READY'
  | 'LIVE'
  | 'SUSPENDED';

export type CheckState = 'COMPLETE' | 'ACTION_NEEDED' | 'PENDING';

export interface SubCheckItem {
  key: string;
  label: string;
  completed: boolean;
  fixRoute?: string | null;
}

export interface ReadinessCheck {
  key: string;
  title: string;
  detail: string;
  state: CheckState;
  fixRoute: string | null;
  subItems?: SubCheckItem[];
}

export interface TenantReadiness {
  tenantId: string;
  status: TenantStatus;
  checks: ReadinessCheck[];
}
