'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
// import { ensureConsent } from '@/privacy/consent';
import {
  getConsentState,
  type ConsentSnapshot,
  type ConsentKind,
} from '@/privacy/consent';

export default function DemoPage() {
  const [email, setEmail] = useState('');
  const [consentState, setConsentState] = useState<ConsentSnapshot>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setConsentState(getConsentState());

    const handleStorage = () => {
      setConsentState(getConsentState());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [message]);

  const consentSummary = useMemo(() => {
    return (['collect', 'track', 'transfer'] as ConsentKind[]).map((kind) => ({
      kind,
      granted: consentState[kind] ? 'granted' : 'missing',
    }));
  }, [consentState]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // const ok = await ensureConsent('collect');
    // if (!ok) return;
    setMessage(email ? `Subscribed ${email} to newsletter.` : 'Newsletter signup sent.');
    setEmail('');
  };

  const handleTracking = () => {
    // const ok = await ensureConsent('track');
    // if (!ok) return;
    document.cookie = 'pikit_demo_tracking=true; path=/; max-age=31536000';
    setMessage('Tracking cookie stored.');
  };

  const handleTransfer = async () => {
    // const ok = await ensureConsent('transfer');
    // if (!ok) return;
    await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setMessage('Email transferred to backend.');
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>1. Collect emails (no consent)</h2>
        <p>Submit the form to trigger a <strong>collect</strong> violation.</p>
        <form className="stack" onSubmit={handleSubmit}>
          <input
            type="email"
            name="test-email"
            placeholder="test@example.com"
          />
          {/* added by PIKit: privacy notice */}
          <p className="pikit-privacy-notice">
            We only use this data as described in our <a href="/privacy.html">privacy notice</a>.
          </p>
          <label className="field">
            <span>Email</span>

            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="privacy@example.com"
              required
            />
            {/* added by PIKit: privacy notice */}
            <p className="pikit-privacy-notice">
              We only use this data as described in our <a href="/privacy.html">privacy notice</a>.
            </p>
          </label>

          <button type="submit">Join newsletter</button>
        </form>
      </section>

      <section className="card">
        <h2>2. Drop tracking cookie</h2>
        <p>Click to set a <strong>track</strong> violation via <code>document.cookie</code>.</p>
        <button type="button" onClick={handleTracking}>
          Set tracking cookie
        </button>
      </section>

      <section className="card">
        <h2>3. Transfer email downstream</h2>
        <p>Send the email to the demo API to trigger a <strong>transfer</strong> violation.</p>
        <button type="button" onClick={handleTransfer} disabled={!email}>
          Transfer email to /api/transfer
        </button>
      </section>

      <section className="card status">
        <h2>Consent status</h2>
        <ul>
          {consentSummary.map((entry) => (
            <li key={entry.kind}>
              <span className={`badge badge-${entry.granted}`}>{entry.granted}</span>
              <code>{entry.kind}</code>
            </li>
          ))}
        </ul>
        <p className="hint">Use pikit fix to gate these actions with consent.</p>
      </section>

      {message && <div className="toast">{message}</div>}
    </div>
  );
}
