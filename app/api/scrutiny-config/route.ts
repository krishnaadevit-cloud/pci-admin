import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from './_store';

// Mock route — no longer called by the frontend.
// Real endpoints are on the application-service backend:
//   GET  /proxy/v1/application/scrutiny-step-config?applicationUuid=...
//   POST /proxy/v1/application/scrutiny-step-config/bulk-save

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appType = searchParams.get('appType') ?? searchParams.get('applicationUuid');
  if (!appType) return NextResponse.json({ message: 'appType is required' }, { status: 400 });
  const config = getConfig(appType) ?? { applicationUuid: appType, numberOfSteps: 0, steps: [] };
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.applicationUuid) {
    return NextResponse.json({ message: 'applicationUuid is required' }, { status: 400 });
  }
  return NextResponse.json(saveConfig(body));
}
