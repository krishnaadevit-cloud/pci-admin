// Mock in-memory store — kept for reference only.
// The real scrutiny-config APIs are now on the application-service backend.
// This file is no longer called by the frontend; it can be deleted once the
// backend is fully deployed.

const store = new Map<string, any>();

export function getConfig(appTypeCode: string): any | undefined {
  return store.get(appTypeCode);
}

export function getAllConfigs(): any[] {
  return Array.from(store.values());
}

export function saveConfig(config: any): any {
  store.set(config.applicationUuid ?? config.appTypeCode, config);
  return config;
}
