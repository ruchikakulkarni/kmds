import React from 'react';
import styles from './Home.module.css';
import { useAuth } from '../../context/AuthContext';

/* ── Data ─────────────────────────────────────── */
const NEWS_ITEMS = [
  {
    id: 1,
    category: 'DEVELOPMENT',
    color: 'blue',
    date: '2 Feb 2025',
    title: 'Smart City Project Phase II Approved',
    description: 'The Karnataka state government has approved Rs. 320 Cr for the second phase of Belgavi Smart City Infrastructure development.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l8 6v10H2V8l8-6z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="7" y="12" width="6" height="6" stroke="white" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    id: 2,
    category: 'SERVICES',
    color: 'amber',
    date: '2 Feb 2025',
    title: 'Property Tax Online Payment Now Available',
    description: 'Citizens can now pay property tax online through the corporation portal. Multiple payment modes supported.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="12" rx="1.5" stroke="white" strokeWidth="1.4" />
        <path d="M7 5V3.5A1.5 1.5 0 0 1 8.5 2h3A1.5 1.5 0 0 1 13 3.5V5" stroke="white" strokeWidth="1.4" />
        <path d="M7 10h6M7 13h4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3,
    category: 'ENVIRONMENT',
    color: 'green',
    date: '2 Feb 2025',
    title: 'New Solid Waste Management Drive',
    description: 'A city-wide cleanliness and waste segregation awareness drive has been launched across all 58 wards in partnership with local NGOs.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C6.7 2 4 5 4 8.5c0 2.5 1.4 4.7 3.5 5.8V17h5v-2.7C14.6 13.2 16 11 16 8.5 16 5 13.3 2 10 2z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M10 14v3" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const NOTIFICATIONS = [
  {
    id: 1,
    name: 'Brajesh Kumar',
    action: 'submitted a new trade licence application',
    time: '5 hours ago',
    color: 'blue',
    initials: 'BK',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    action: 'updated property tax records for Ward 4',
    time: '5 hours ago',
    color: 'pink',
    initials: 'PS',
  },
  {
    id: 3,
    name: 'System',
    action: 'Water supply maintenance scheduled for Zone 2',
    time: '2 hours ago',
    color: 'amber',
    initials: 'SY',
  },
  {
    id: 4,
    name: 'Admin Office',
    action: 'Council meeting rescheduled to 10 Feb 2025',
    time: '1 day ago',
    color: 'gray',
    initials: 'AO',
  },
];

/* ── Component ────────────────────────────────── */
const Home: React.FC = () => {
  const { role } = useAuth();
  const isDMA = role === 'DMA_ADMIN';

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <span className={styles.breadcrumbCurrent}>Home</span>
      </nav>

      {/* ── Hero Banner ── */}
      <div className={isDMA ? styles.heroDMA : styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {isDMA ? (
            <>
              <p className={styles.heroLabel}>Karnataka Municipal Data System</p>
              <h1 className={styles.heroTitle}>Directorate of Municipal Administration</h1>
              <p className={styles.heroSub}>Government of Karnataka</p>
            </>
          ) : (
            <>
              <p className={styles.heroLabel}>Directorate of Municipal Administration</p>
              <h1 className={styles.heroTitle}>Welcome to Belgavi City Corporation</h1>
            </>
          )}
        </div>
      </div>

      {/* ── Two-column content grid ── */}
      <div className={styles.mainGrid}>

        {/* ── Left: News & Announcements ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={styles.sectionIcon}>
                <rect x="2" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5 7h8M5 10h8M5 13h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <h2 className={styles.sectionTitle}>News &amp; Announcements</h2>
            </div>
            <button className={styles.viewAllBtn}>
              View All
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className={styles.newsCard}>
            {NEWS_ITEMS.map((item, idx) => (
              <div
                key={item.id}
                className={`${styles.newsItem} ${idx < NEWS_ITEMS.length - 1 ? styles.newsItemBorder : ''}`}
              >
                {/* Category icon box */}
                <div className={`${styles.newsIconBox} ${styles[`newsIcon_${item.color}` as keyof typeof styles]}`}>
                  {item.icon}
                </div>

                {/* Content */}
                <div className={styles.newsBody}>
                  <div className={styles.newsMeta}>
                    <span className={`${styles.newsCategoryTag} ${styles[`tag_${item.color}` as keyof typeof styles]}`}>
                      {item.category}
                    </span>
                    <span className={styles.newsDate}>{item.date}</span>
                  </div>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  <p className={styles.newsDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Right: Recent Notifications ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={styles.sectionIcon}>
                <path d="M9 2a1 1 0 0 1 1 1v.3A5.5 5.5 0 0 1 14.5 9v3l1.5 1.5H2L3.5 12V9A5.5 5.5 0 0 1 8 3.3V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M7 14a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              <h2 className={styles.sectionTitle}>Recent Notifications</h2>
            </div>
          </div>

          <div className={styles.notificationCard}>
            {NOTIFICATIONS.map((item, idx) => (
              <div
                key={item.id}
                className={`${styles.notificationItem} ${idx < NOTIFICATIONS.length - 1 ? styles.notificationItemBorder : ''}`}
              >
                <div className={`${styles.notificationAvatar} ${styles[`avatar_${item.color}` as keyof typeof styles]}`}>
                  {item.initials}
                </div>
                <div className={styles.notificationBody}>
                  <p className={styles.notificationName}>{item.name}</p>
                  <p className={styles.notificationAction}>{item.action}</p>
                  <p className={styles.notificationTime}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
