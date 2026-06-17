import { NextResponse } from 'next/server';
import type { TenantReadiness, ReadinessCheck, SubCheckItem } from '@/types/onboarding';
import { SCRUTINY_APP_TYPES, isScrutinyConfigComplete } from '@/types/scrutinyConfig';
import { getConfig } from '@/app/api/scrutiny-config/_store';

// Step 3 reflects the live in-memory scrutiny-config store, so configuring a
// pipeline on the Scrutiny Configuration screen updates this checklist.
export const dynamic = 'force-dynamic';

// Build the 5 scrutiny sub-items from the shared store (real completion state).
function buildScrutinySubItems(): SubCheckItem[] {
  return SCRUTINY_APP_TYPES.map((t) => ({
    key: t.code,
    label: `${t.name} — scrutiny steps configured`,
    completed: isScrutinyConfigComplete(getConfig(t.code)),
    fixRoute: `/office-portal/scrutiny/configuration?appType=${t.code}`,
  }));
}

export function GET() {
  const checks: ReadinessCheck[] = [
    {
      key: 'CHANGE_PASSWORD',
      title: 'Change registrar password',
      detail: 'The registrar must change the initial temporary password before going live.',
      // Static mock: pre-completed so the demo can reach the scrutiny step.
      state: 'COMPLETE',
      fixRoute: '/office-portal/change-password',
    },
    {
      key: 'MASTER_DATA',
      title: 'Add required master data',
      detail: 'Each of the following masters must have at least one record.',
      // Static mock: sub-items pending — Configure buttons link to each master screen.
      state: 'ACTION_NEEDED',
      fixRoute: null,
      subItems: [
        { key: 'documents', label: 'Documents — at least one record', completed: false, fixRoute: '/office-portal/master/documents/list' },
        { key: 'app_documents', label: 'Application Documents — every application type has at least one document', completed: false, fixRoute: '/office-portal/master/application-document-master/list' },
        { key: 'hospitals', label: 'Hospital — at least one record', completed: false, fixRoute: '/office-portal/master/hospital-application/list' },
        { key: 'boards', label: 'Board — at least one record', completed: false, fixRoute: '/office-portal/master/board-application/list' },
      ],
    },
    {
      key: 'SCRUTINY_CONFIG',
      title: 'Configure scrutiny steps',
      detail: 'Each application type that requires scrutiny must have its review pipeline configured (steps with a role and assigned user(s); the final step has a single user).',
      state: 'ACTION_NEEDED',
      fixRoute: '/office-portal/scrutiny/configuration',
      subItems: buildScrutinySubItems(),
    },
    {
      key: 'REGISTRAR_SIGNATURE',
      title: 'Upload registrar signature',
      detail: "Upload the registrar's signature used on generated certificates.",
      // Static mock: pre-completed (the upload screen is a separate follow-up),
      // so scrutiny configuration (step 3) is the meaningful gate for go-live.
      state: 'COMPLETE',
      fixRoute: '/office-portal/registrar-signature',
    },
  ];

  const data: TenantReadiness = {
    tenantId: 'tenant-pci-guj-001',
    status: 'CONFIGURING',
    checks,
  };

  return NextResponse.json(data);
}
