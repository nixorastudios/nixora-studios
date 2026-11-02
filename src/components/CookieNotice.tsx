import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "cookie_notice_dismissed";

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(localStorage.getItem(KEY) !== "1"); } catch { setShow(false); }
  }, []);
  if (!show) return null;
  const dismiss = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setShow(false);
  };
  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-2 bottom-2 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-3 rounded-lg border border-border bg-background/95 p-3 text-xs text-foreground shadow-lg backdrop-blur sm:text-sm">
      <p className="flex-1 min-w-[200px]">
        We use only essential cookies to keep you signed in and save drafts. No analytics. Learn more in our{" "}
        <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>
      <button type="button" onClick={dismiss} className="rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground">
        Got it
      </button>
    </div>
  );
}
