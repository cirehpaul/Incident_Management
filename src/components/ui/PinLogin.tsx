'use client';

import React, { useState, useCallback } from 'react';
import type { Account } from '@/lib/auth';
import { findAccountByPin } from '@/lib/auth';

interface PinLoginProps {
  onLogin: (account: Account) => void;
}

const MAX_PIN_LENGTH = 4;

export function PinLogin({ onLogin }: PinLoginProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  const handleKey = useCallback(
    (digit: string) => {
      if (pin.length >= MAX_PIN_LENGTH) return;
      setError('');
      setPin((prev) => prev + digit);
    },
    [pin]
  );

  const handleBackspace = useCallback(() => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(() => {
    if (pin.length < MAX_PIN_LENGTH) {
      setError('Enter a 4-digit PIN');
      triggerShake();
      return;
    }
    const account = findAccountByPin(pin);
    if (!account) {
      setError('Invalid PIN. Please try again.');
      triggerShake();
      setPin('');
      return;
    }
    onLogin(account);
  }, [pin, onLogin]);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  // Allow pressing Enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
      else if (e.key === 'Backspace') handleBackspace();
      else if (/^[0-9]$/.test(e.key)) handleKey(e.key);
    },
    [handleSubmit, handleBackspace, handleKey]
  );

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="pin-overlay" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="pin-card">
        {/* Brand */}
        <div className="pin-brand">
          <div className="pin-brand-icon" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src="/images/EQUI.png" alt="Equicom Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.5)' }} />
          </div>
          <h1 className="pin-title">SMAC REPORTING</h1>
          <p className="pin-subtitle">Enter your PIN to continue</p>
        </div>

        {/* PIN Dots */}
        <div className={`pin-dots ${shake ? 'pin-shake' : ''}`}>
          {Array.from({ length: MAX_PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`pin-dot ${i < pin.length ? 'pin-dot--filled' : ''}`}
            />
          ))}
        </div>

        {/* Error */}
        {error && <p className="pin-error">{error}</p>}

        {/* Keypad */}
        <div className="pin-keypad">
          {digits.map((d) => (
            <button
              key={d}
              className="pin-key"
              onClick={() => handleKey(d)}
              type="button"
            >
              {d}
            </button>
          ))}

          {/* Bottom row: backspace | 0 | submit */}
          <button
            className="pin-key pin-key--danger"
            onClick={handleBackspace}
            type="button"
            aria-label="Backspace"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>

          <button
            className="pin-key"
            onClick={() => handleKey('0')}
            type="button"
          >
            0
          </button>

          <button
            className="pin-key pin-key--primary"
            onClick={handleSubmit}
            type="button"
            aria-label="Login"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
