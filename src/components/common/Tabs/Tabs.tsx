import React, { useState, useRef, useEffect } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  onChange,
  className = '',
}) => {
  const [active, setActive] = useState(activeKey ?? items[0]?.key);
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const current = activeKey ?? active;

  const handleSelect = (key: string) => {
    setActive(key);
    onChange?.(key);
  };

  const checkScroll = () => {
    if (listRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = listRef.current;
    el?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const scrollBy = (dir: number) => {
    listRef.current?.scrollBy({ left: dir * 150, behavior: 'smooth' });
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {canScrollLeft && (
        <button className={`${styles.scrollBtn} ${styles.scrollLeft}`} onClick={() => scrollBy(-1)} aria-label="Scroll left">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      <div ref={listRef} className={styles.list} role="tablist">
        {items.map((item) => (
          <button
            key={item.key}
            role="tab"
            aria-selected={current === item.key}
            aria-disabled={item.disabled}
            className={`${styles.tab} ${current === item.key ? styles.active : ''} ${item.disabled ? styles.disabled : ''}`}
            onClick={() => !item.disabled && handleSelect(item.key)}
            tabIndex={current === item.key ? 0 : -1}
          >
            {item.label}
          </button>
        ))}
      </div>
      {canScrollRight && (
        <button className={`${styles.scrollBtn} ${styles.scrollRight}`} onClick={() => scrollBy(1)} aria-label="Scroll right">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
    </div>
  );
};

export default Tabs;
