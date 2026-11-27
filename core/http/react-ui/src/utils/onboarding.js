// Onboarding state lives in one localStorage key so the companion overlay
// and a "Replay welcome" action elsewhere in the app agree on it.

export const ONBOARDING_FLAG = 'localai.onboarding.v1'

export function onboardingDone() {
  try { return window.localStorage.getItem(ONBOARDING_FLAG) === '1' }
  catch { return true }
}

export function markOnboardingDone() {
  try { window.localStorage.setItem(ONBOARDING_FLAG, '1') } catch { /* private window */ }
}

export function resetOnboarding() {
  try { window.localStorage.removeItem(ONBOARDING_FLAG) } catch { /* private window */ }
  // Prod a cross-tab listener so the companion remounts without a reload.
  try { window.dispatchEvent(new StorageEvent('storage', { key: ONBOARDING_FLAG, newValue: null })) } catch { /* no-op */ }
}
