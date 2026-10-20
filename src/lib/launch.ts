export const LAUNCH_AT = Date.parse('2026-10-24T10:31:00Z');
export const VISITOR_BASE = 1365;
export const WAITLIST_BASE = 847;
export const WAITLIST_KEY = 'nixora_early_access';
export function countdown(now: number) {
  const seconds = Math.max(0, Math.floor((LAUNCH_AT - now) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
}
export function addSignup(emails: string[], input: string) {
  const email = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  const next = emails.includes(email) ? emails : [...emails, email];
  return { emails: next, position: WAITLIST_BASE + next.indexOf(email) + 1 };
}
