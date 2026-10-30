import { Link } from "@tanstack/react-router";
import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(`NIXORA STUDIOS contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:support@nixorastudios.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="launch-theme min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl p-8 text-sm leading-7">
        <h1 className="mb-2 text-4xl font-bold">Contact</h1>
        <p className="mb-8 text-muted-foreground">
          NIXORASTUDIOS LTD (RC 9950450) — we reply within 24 hours.
        </p>

        <h2 className="mt-8 text-lg font-bold">Email</h2>
        <p>
          Support:{" "}
          <a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">
            support@nixorastudios.com
          </a>
          <br />
          General enquiries:{" "}
          <a href="mailto:hello@nixorastudios.com" className="underline text-link hover:text-link/80">
            hello@nixorastudios.com
          </a>
        </p>

        <h2 className="mt-8 text-lg font-bold">Address</h2>
        <p>
          NIXORASTUDIOS LTD
          <br />
          81 Friday Momomi Egwuogwu Street, Amachai 2, Okpanam
          <br />
          Asaba, Delta State, Nigeria
        </p>

        <h2 className="mt-8 text-lg font-bold">Send Us a Message</h2>
        <p className="mb-4 text-muted-foreground">
          Fill this in and it opens in your own email app, addressed to our support team.
        </p>
        <form onSubmit={sendMessage} className="flex flex-col gap-3">
          <input
            required
            aria-label="Your name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-2 border-camera-line bg-card p-3 text-card-foreground outline-none focus:border-primary"
          />
          <input
            required
            type="email"
            aria-label="Your email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-2 border-camera-line bg-card p-3 text-card-foreground outline-none focus:border-primary"
          />
          <textarea
            required
            aria-label="Your message"
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-32 rounded-xl border-2 border-camera-line bg-card p-3 text-card-foreground outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="h-auto rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Send Message
          </button>
        </form>

        <div className="mt-8 pb-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
