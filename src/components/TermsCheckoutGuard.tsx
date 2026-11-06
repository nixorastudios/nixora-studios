import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { acceptCurrentTerms } from '@/lib/terms.functions';

// Future checkout gate (payments are not enabled yet). Renders nothing for
// visitors; for signed-in users it records terms acceptance server-side and
// only then enables the payment action it wraps.
export function TermsCheckoutGuard({ children }: { children: (ready: boolean) => ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [recording, setRecording] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setIsLoggedIn(Boolean(data.user));
      setEmailVerified(Boolean(data.user?.email_confirmed_at));
    });
    return () => {
      active = false;
    };
  }, []);

  const onCheck = async (value: boolean) => {
    setChecked(value);
    if (!value) {
      setAccepted(false);
      return;
    }
    setRecording(true);
    try {
      await acceptCurrentTerms();
      setAccepted(true);
    } catch {
      setAccepted(false);
      setChecked(false);
    } finally {
      setRecording(false);
    }
  };

  const ready = checked && accepted && isLoggedIn && emailVerified && !recording;

  return (
    <div className="space-y-3">
      <label className="flex gap-3 text-xs leading-5 text-muted-foreground">
        <input
          type="checkbox"
          checked={checked}
          disabled={recording || !isLoggedIn}
          onChange={e => onCheck(e.target.checked)}
          className="mt-1 accent-primary"
        />
        I have verified my email and I accept the Terms, Refund Policy and Privacy Policy —
        engine credit costs are shown before checkout; failed charged generations auto-refund in credits.
      </label>
      {isLoggedIn && !emailVerified && (
        <p className="text-xs text-destructive">Verify your email before continuing to payment.</p>
      )}
      {children(ready)}
    </div>
  );
}
