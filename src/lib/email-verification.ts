// Hosted Auth enforces confirmation; this is defense-in-depth before navigation.
export function hasVerifiedEmail(user: { email?: string; email_confirmed_at?: string | null } | null): boolean {
  return Boolean(user?.email && user.email_confirmed_at);
}

export function isEmailUnconfirmed(error: { code?: string | undefined; message: string }): boolean {
  return error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message);
}