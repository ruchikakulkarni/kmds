import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      {/* ── Top accessibility bar (navy) ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarControls}>
          <span className={styles.fontSizeBtn}>A-</span>
          <div className={styles.fontSizeTrack}>
            <div className={styles.fontSizeTrackFill} />
            <div className={styles.fontSizeThumb} />
          </div>
          <span className={styles.fontSizeBtn}>A+</span>
          <div className={styles.topBarDivider} />
          <button className={styles.globeBtn} aria-label="Language">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="rgba(249,253,242,0.9)" strokeWidth="1.2"/>
              <path d="M10 2c0 0-3.5 3-3.5 8s3.5 8 3.5 8" stroke="rgba(249,253,242,0.9)" strokeWidth="1.2"/>
              <path d="M10 2c0 0 3.5 3 3.5 8s-3.5 8-3.5 8" stroke="rgba(249,253,242,0.9)" strokeWidth="1.2"/>
              <path d="M2 10h16" stroke="rgba(249,253,242,0.9)" strokeWidth="1.2"/>
            </svg>
          </button>
          <div className={styles.langToggle}>
            <span className={styles.langKannada}>ಅ</span>
            <div className={styles.langToggleTrack}>
              <div className={styles.langToggleThumb} />
            </div>
            <span className={styles.langEng}>A</span>
          </div>
        </div>
      </div>

      {/* ── Main header (white) ── */}
      <div className={styles.mainHeader}>
        {/* Left: Logos + Title */}
        <div className={styles.brand}>
          <img src="/logo1.png" alt="Karnataka Emblem" className={styles.logo1} />
          <img src="/logo2.png" alt="KMDS Logo" className={styles.logo2} />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>KMDS - Integrated Financial Management System</span>
            <span className={styles.brandSubtitle}>Directorate of Municipal Administration | Government of Karnataka</span>
          </div>
        </div>

        {/* Right: Actions + KMDS logo image */}
        <div className={styles.right}>
          <div className={styles.actions}>
            <button className={styles.actionBtn}>Switch Office</button>
            <button className={styles.actionBtn}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M14 14l-3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              User Manual
            </button>
            <button className={styles.iconBtn} title="Profile">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3.5" stroke="#222" strokeWidth="1.3"/>
                <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#222" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
            <button className={styles.iconBtn} title="Notifications">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 0 0-6 6c0 5.5-2.5 7-2.5 7h17S16 13.5 16 8a6 6 0 0 0-6-6z" stroke="#222" strokeWidth="1.3"/>
                <path d="M11.73 16a2 2 0 0 1-3.46 0" stroke="#222" strokeWidth="1.3"/>
              </svg>
            </button>
            <button className={styles.iconBtn} title="Logout" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8 18H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4" stroke="#222" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14l4-4-4-4M18 10H8" stroke="#222" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <img src="/kmds-logo.png" alt="KMDS" className={styles.kmdsLogo} />
        </div>
      </div>
    </header>
  );
};

export default Header;
