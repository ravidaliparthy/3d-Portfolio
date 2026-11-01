/**
 * Measurement Switches Utility for Phase 0 & Phase 1 Diagnostic Telemetry.
 * Strict Rule: For measurement only — zero impact in normal use.
 */

let cachedParams: URLSearchParams | null = null;

function getParams(): URLSearchParams | null {
  if (typeof window === 'undefined') return null;
  if (!cachedParams) {
    cachedParams = new URLSearchParams(window.location.search);
  }
  return cachedParams;
}

export function getDebugSwitch(param: string): string | null {
  const p = getParams();
  return p ? p.get(param) : null;
}

export function isDebugDisabled(param: string): boolean {
  return getDebugSwitch(param) === 'off';
}
