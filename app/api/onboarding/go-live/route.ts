import { NextResponse } from 'next/server';
import type { TenantReadiness, ReadinessCheck, SubCheckItem } from '@/types/onboarding';
import { SCRUTINY_APP_TYPES, isScrutinyConfigComplete } from '@/types/scrutinyConfig';
import { getConfig } from '@/app/api/scrutiny-config/_store';

// Re-runs validation against the same (mock) state used by /readiness and only
// transitions the tenant to LIVE if every check passes.
export const dynamic = 'force-dynamic';

function buildScrutinySubItems(): SubCheckItem[] {
  return SCRUTINY_APP_TYPES.map((t) => ({
    key: t.code,
    label: `${t.name} — scrutiny steps configured`,
    completed: isScrutinyConfigComplete(getConfig(t.code)),
    fixRoute: `/office-portal/scrutiny/configuration?appType=${t.code}`,
  }));
}

export async function POST() {
  const checks: ReadinessCheck[] = [
    {
      key: 'CHANGE_PASSWORD',
      title: 'Change registrar password',
      detail: 'The registrar must change the initial temporary password before going live.',
      state: 'COMPLETE',
      fixRoute: '/office-portal/change-password',
    },
    {
      key: 'MASTER_DATA',
      title: 'Add required master data',
      detail: 'Each of the following masters must have at least one record.',
      state: 'ACTION_NEEDED',
      fixRoute: null,
      subItems: [
        { key: 'documents', label: 'Documents — at least one record', completed: false, fixRoute: '/office-portal/master/documents/list' },
        { key: 'app_documents', label: 'Application Documents — every application type has at least one document', completed: false, fixRoute: '/office-portal/master/application-document-master/list' },
        { key: 'hospital', label: 'Hospital — at least one record', completed: false, fixRoute: '/office-portal/master/hospital-application/list' },
        { key: 'board', label: 'Board — at least one record', completed: false, fixRoute: '/office-portal/master/board-application/list' },
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
      state: 'COMPLETE',
      fixRoute: '/office-portal/registrar-signature',
    },
  ];

  const allComplete = checks.every((c) => {
    if (!c.subItems || c.subItems.length === 0) return c.state === 'COMPLETE';
    return c.subItems.every((i) => i.completed);
  });

  const body: TenantReadiness = {
    tenantId: 'tenant-pci-guj-001',
    status: allComplete ? 'LIVE' : 'CONFIGURING',
    checks,
  };

  if (!allComplete) {
    return NextResponse.json(body, { status: 422 });
  }

  return NextResponse.json(body);
}
