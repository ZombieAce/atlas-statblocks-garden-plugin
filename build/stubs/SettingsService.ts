/** A published page keeps no Atlas settings; every lookup answers "unset". */
const settings: Record<string, unknown> = new Proxy({}, { get: () => () => undefined });

export class SettingsService {
  static forApp(): Record<string, unknown> { return settings; }
  static getInstance(): Record<string, unknown> { return settings; }
}
