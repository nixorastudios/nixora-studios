export const LAUNCH_AT = Date.parse('2026-10-24T10:31:00Z');
export const VISITOR_BASE = 1365;
export const WAITLIST_BASE = 847;
export const WAITLIST_KEY = 'nixora_early_access';
export const PROMPT_DRAFT_KEY = 'nixora_draft';
export const PROMPT_WAITLIST_KEY = 'nixora_waitlist';
export function saveLaunchDraft(storage: Pick<Storage, 'setItem'>, tool: string, prompt: string, date: Date) {
  if (!prompt.trim()) throw new Error('Enter prompt first');
  storage.setItem(PROMPT_DRAFT_KEY, JSON.stringify({ tool, prompt, date }));
}
export function saveLocalWaitlist(storage: Pick<Storage, 'setItem'>, input: string) {
  const { emails } = addSignup([], input);
  const email = emails[0];
  if (!email) throw new Error('Enter a valid email address.');
  storage.setItem(PROMPT_WAITLIST_KEY, email);
}
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
