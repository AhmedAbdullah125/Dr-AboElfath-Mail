'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Check, ArrowLeft, ShieldCheck } from 'lucide-react';

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label className="login-label" htmlFor={id}>{label}</label>
      <div className="login-input-wrap">
        <Lock className="login-input-icon" size={16} />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="login-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="login-eye-btn"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          aria-label={show ? 'Hide' : 'Show'}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter',       ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter',       ok: /[a-z]/.test(password) },
    { label: 'Number',                 ok: /\d/.test(password) },
    { label: 'Special character',      ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['', '#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      {/* Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {checks.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: i < score ? colors[score] : 'var(--border)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
      {/* Label */}
      <div style={{ fontSize: 11, color: colors[score], fontWeight: 600, marginBottom: 8 }}>
        {labels[score]}
      </div>
      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {checks.map((c) => (
          <div
            key={c.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              color: c.ok ? 'var(--success)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <Check size={11} style={{ flexShrink: 0, opacity: c.ok ? 1 : 0.3 }} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isValid = currentPassword && newPassword.length >= 8 && passwordsMatch;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to change password');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/mail'), 2500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-card" style={{ maxWidth: 460 }}>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 13,
            padding: '0 0 16px',
            fontFamily: 'var(--font)',
            transition: 'var(--transition)',
          }}
          id="back-btn"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Header */}
        <div className="login-logo">
          <div className="login-logo-icon" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <div>
            <h1 className="login-title">Change Password</h1>
            <p className="login-subtitle">Update your account password securely</p>
          </div>
        </div>

        <div className="login-divider" />

        {/* Success state */}
        {success ? (
          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'slideUp 0.4s ease',
            }}>
              <Check size={32} style={{ color: 'var(--success)' }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              Password changed!
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Redirecting you back to the mail manager…
            </p>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div className="login-error" role="alert" id="cp-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <PasswordField
                id="cp-current"
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter your current password"
                autoComplete="current-password"
              />

              <div>
                <PasswordField
                  id="cp-new"
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <StrengthBar password={newPassword} />
              </div>

              <div className="form-group">
                <label className="login-label" htmlFor="cp-confirm">Confirm New Password</label>
                <div className="login-input-wrap">
                  <Lock className="login-input-icon" size={16} />
                  <input
                    id="cp-confirm"
                    type="password"
                    className="login-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    style={{
                      borderColor: confirmPassword
                        ? passwordsMatch
                          ? 'rgba(16,185,129,0.5)'
                          : 'rgba(239,68,68,0.5)'
                        : undefined,
                    }}
                  />
                  {confirmPassword && (
                    <span style={{
                      position: 'absolute',
                      right: 12,
                      color: passwordsMatch ? 'var(--success)' : 'var(--danger)',
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {passwordsMatch ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoading || !isValid}
                id="cp-submit-btn"
                style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
              >
                {isLoading ? <span className="login-spinner" /> : <ShieldCheck size={17} />}
                {isLoading ? 'Saving…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
