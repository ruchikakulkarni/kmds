import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({
    userId: '',
    password: '',
    otp: '',
    captchaInput: '',
  });
  const [captchaCode] = useState('1JMINKT');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = auth.login(form.userId, form.password);
    if (!ok) {
      setError('Invalid User ID or Password');
      return;
    }
    navigate('/home');
  };

  return (
    <div className={styles.root}>
      {/* ── Top header bar ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarBrand}>
          <img src="/logo1.png" alt="Karnataka Emblem" className={styles.emblem} />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>KMDS – Integrated Financial Management System</span>
            <span className={styles.brandSubtitle}>Directorate of Municipal Administration | Government of Karnataka</span>
          </div>
        </div>
        <div className={styles.topBarRight}>
          <button className={styles.topBarBtn}>Switch Office</button>
          <button className={styles.topBarBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11 7A4 4 0 1 1 3 7a4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2 2l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            User Manual
          </button>
          <button className={styles.topBarIcon}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className={styles.topBarIcon}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M8 1a5 5 0 0 0-5 5c0 5-2 6-2 6h14s-2-1-2-6a5 5 0 0 0-5-5z" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9.73 13a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </button>
          <button className={styles.topBarIcon}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 16H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <img src="/kmds-logo.png" alt="KMDS" className={styles.kmdsLogo} />
        </div>
      </header>

      {/* ── Main split ── */}
      <div className={styles.body}>
        {/* Left hero */}
        <div className={styles.hero}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.2)"/>
                <path d="M16 6l10 8v12H6V14L16 6z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <rect x="12" y="18" width="8" height="8" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            <h1 className={styles.heroTitle}>Welcome to<br />Integrated Financial<br />Management System</h1>
          </div>
        </div>

        {/* Right form */}
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formField}>
              <label className={styles.label} htmlFor="userId">User ID</label>
              <input
                id="userId"
                name="userId"
                type="text"
                className={styles.input}
                placeholder="Enter your ID"
                value={form.userId}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.inputAction}
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className={styles.fieldLink}>
                <a href="#forgot" className={styles.link}>Forgot Password?</a>
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="otp">Verification OTP</label>
              <div className={styles.inputWrapper}>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  className={styles.input}
                  placeholder='Click "Get OTP" to receive a code'
                  value={form.otp}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.fieldLink}>
                <button type="button" className={styles.link}>Get OTP</button>
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Verify CAPTCHA</label>
              <div className={styles.captchaBox}>
                <span className={styles.captchaCode}>{captchaCode}</span>
                <button type="button" className={styles.captchaRefresh} aria-label="Refresh CAPTCHA">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M12 7A5 5 0 0 1 2 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M12 4v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <input
                name="captchaInput"
                type="text"
                className={styles.input}
                placeholder=""
                value={form.captchaInput}
                onChange={handleChange}
              />
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <button type="submit" className={styles.submitBtn}>
              Log in
            </button>

            <p className={styles.contactLine}>
              Unable to Log in?{' '}
              <a href="#contact" className={styles.link}>Contact Administrator</a>
            </p>
          </form>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Copyright © 2025 This document is prepared by Center for Smart Governance exclusively for KMDS</span>
      </footer>
    </div>
  );
};

export default Login;
