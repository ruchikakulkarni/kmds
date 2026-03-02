import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import LevelModal from './LevelModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import {
  INITIAL_ACCOUNT_TYPES, INITIAL_MAJOR_HEADS,
  INITIAL_MINOR_HEADS, INITIAL_SUB_HEADS, INITIAL_DETAIL_CODES,
} from './data';
import type {
  AccountType, MajorHead, MinorHead, SubHead, DetailCode,
  AccountStatus, ActiveLevel,
} from './types';
import styles from './AccountCodeTab.module.css';

const PAGE_SIZE = 8;

/* ── Composite code helpers ──────────────────────────────────────────────── */
const ccMajor = (at: AccountType | undefined, mh: MajorHead) =>
  (at?.code ?? '') + mh.code;

const ccMinor = (at: AccountType | undefined, mh: MajorHead | undefined, min: MinorHead) =>
  (at?.code ?? '') + (mh?.code ?? '') + min.code;

const ccSub = (at: AccountType | undefined, mh: MajorHead | undefined, min: MinorHead | undefined, sh: SubHead) =>
  (at?.code ?? '') + (mh?.code ?? '') + (min?.code ?? '') + sh.code;

const ccDetail = (
  at: AccountType | undefined, mh: MajorHead | undefined,
  min: MinorHead | undefined, sh: SubHead | undefined, dc: DetailCode,
) => (at?.code ?? '') + (mh?.code ?? '') + (min?.code ?? '') + (sh?.code ?? '') + dc.code;

/* ── Level config ─────────────────────────────────────────────────────────── */
const LEVEL_META: { key: ActiveLevel; label: string }[] = [
  { key: 'account-type', label: 'Account Type' },
  { key: 'major-head',   label: 'Major Head'   },
  { key: 'minor-head',   label: 'Minor Head'   },
  { key: 'sub-head',     label: 'Sub Head'     },
  { key: 'detail-code',  label: 'Detail Code'  },
  { key: 'all-codes',    label: 'All Codes'    },
];

/* ── Modal edit target union ─────────────────────────────────────────────── */
type ModalTarget =
  | { level: 'account-type'; data: AccountType | null }
  | { level: 'major-head';   data: MajorHead   | null }
  | { level: 'minor-head';   data: MinorHead   | null }
  | { level: 'sub-head';     data: SubHead     | null }
  | { level: 'detail-code';  data: DetailCode  | null };

type DeleteTarget =
  | { level: 'account-type'; id: number }
  | { level: 'major-head';   id: number }
  | { level: 'minor-head';   id: number }
  | { level: 'sub-head';     id: number }
  | { level: 'detail-code';  id: number };

/* ─────────────────────────────────────────────────────────────────────────── */
const AccountCodeTab: React.FC = () => {
  const { role } = useAuth();
  const isReadOnly = role === 'ULB_ADMIN';

  /* ── Data state ── */
  const [accountTypes, setAccountTypes] = useState<AccountType[]>(INITIAL_ACCOUNT_TYPES);
  const [majorHeads,   setMajorHeads]   = useState<MajorHead[]>(INITIAL_MAJOR_HEADS);
  const [minorHeads,   setMinorHeads]   = useState<MinorHead[]>(INITIAL_MINOR_HEADS);
  const [subHeads,     setSubHeads]     = useState<SubHead[]>(INITIAL_SUB_HEADS);
  const [detailCodes,  setDetailCodes]  = useState<DetailCode[]>(INITIAL_DETAIL_CODES);

  /* ── ID counters ── */
  const [nextAtId,  setNextAtId]  = useState(INITIAL_ACCOUNT_TYPES.length + 1);
  const [nextMhId,  setNextMhId]  = useState(INITIAL_MAJOR_HEADS.length   + 1);
  const [nextMinId, setNextMinId] = useState(INITIAL_MINOR_HEADS.length   + 1);
  const [nextShId,  setNextShId]  = useState(INITIAL_SUB_HEADS.length     + 1);
  const [nextDcId,  setNextDcId]  = useState(INITIAL_DETAIL_CODES.length  + 1);

  /* ── Navigation ── */
  const [activeLevel, setActiveLevel] = useState<ActiveLevel>('account-type');

  /* ── Parent filters (cascading dropdowns in toolbar) ── */
  const [filterAtId,  setFilterAtId]  = useState<number | 'all'>('all');
  const [filterMhId,  setFilterMhId]  = useState<number | 'all'>('all');
  const [filterMinId, setFilterMinId] = useState<number | 'all'>('all');
  const [filterShId,  setFilterShId]  = useState<number | 'all'>('all');

  /* ── Shared search / status / page (reset on level change) ── */
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AccountStatus>('All');
  const [page,         setPage]         = useState(1);

  /* ── Modal state ── */
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  /* ── Level change: reset filters + search ── */
  const handleLevelChange = useCallback((level: ActiveLevel) => {
    setActiveLevel(level);
    setSearch('');
    setStatusFilter('All');
    setPage(1);
  }, []);

  /* ── Parent filter resets ── */
  const handleFilterAt = (val: number | 'all') => {
    setFilterAtId(val); setFilterMhId('all'); setFilterMinId('all'); setFilterShId('all'); setPage(1);
  };
  const handleFilterMh = (val: number | 'all') => {
    setFilterMhId(val); setFilterMinId('all'); setFilterShId('all'); setPage(1);
  };
  const handleFilterMin = (val: number | 'all') => {
    setFilterMinId(val); setFilterShId('all'); setPage(1);
  };

  /* ── Derived: available options for cascading dropdowns ── */
  const availableMajorHeads = useMemo(
    () => filterAtId === 'all' ? majorHeads : majorHeads.filter(m => m.accountTypeId === filterAtId),
    [majorHeads, filterAtId],
  );
  const availableMinorHeads = useMemo(
    () => filterMhId === 'all' ? minorHeads : minorHeads.filter(m => m.majorHeadId === filterMhId),
    [minorHeads, filterMhId],
  );
  const availableSubHeads = useMemo(
    () => filterMinId === 'all' ? subHeads : subHeads.filter(s => s.minorHeadId === filterMinId),
    [subHeads, filterMinId],
  );

  /* ── Filtered items for each level ── */
  const matchesSearch = (s: string) =>
    !search || s.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = (st: AccountStatus) =>
    statusFilter === 'All' || st === statusFilter;

  const filteredAt = useMemo(() =>
    accountTypes.filter(r => (matchesSearch(r.nameEnglish) || matchesSearch(r.code) || r.nameKannada.includes(search)) && matchesStatus(r.status)),
    [accountTypes, search, statusFilter],
  );

  const filteredMh = useMemo(() =>
    majorHeads
      .filter(r => filterAtId === 'all' || r.accountTypeId === filterAtId)
      .filter(r => (matchesSearch(r.nameEnglish) || matchesSearch(r.code) || r.nameKannada.includes(search)) && matchesStatus(r.status)),
    [majorHeads, filterAtId, search, statusFilter],
  );

  const filteredMin = useMemo(() => {
    const mhIds = filterMhId === 'all'
      ? availableMajorHeads.map(m => m.id)
      : [filterMhId];
    return minorHeads
      .filter(r => mhIds.includes(r.majorHeadId))
      .filter(r => (matchesSearch(r.nameEnglish) || matchesSearch(r.code) || r.nameKannada.includes(search)) && matchesStatus(r.status));
  }, [minorHeads, availableMajorHeads, filterMhId, search, statusFilter]);

  const filteredSh = useMemo(() => {
    const minIds = filterMinId === 'all'
      ? availableMinorHeads.map(m => m.id)
      : [filterMinId];
    return subHeads
      .filter(r => minIds.includes(r.minorHeadId))
      .filter(r => (matchesSearch(r.nameEnglish) || matchesSearch(r.code) || r.nameKannada.includes(search)) && matchesStatus(r.status));
  }, [subHeads, availableMinorHeads, filterMinId, search, statusFilter]);

  const filteredDc = useMemo(() => {
    const shIds = filterShId === 'all'
      ? availableSubHeads.map(s => s.id)
      : [filterShId];
    return detailCodes
      .filter(r => shIds.includes(r.subHeadId))
      .filter(r => (matchesSearch(r.nameEnglish) || matchesSearch(r.code) || r.nameKannada.includes(search)) && matchesStatus(r.status));
  }, [detailCodes, availableSubHeads, filterShId, search, statusFilter]);

  /* ── All Codes flat join ── */
  const allCodes = useMemo(() => {
    return detailCodes.flatMap(dc => {
      const sh  = subHeads.find(s => s.id === dc.subHeadId);
      if (!sh) return [];
      const min = minorHeads.find(m => m.id === sh.minorHeadId);
      if (!min) return [];
      const mh  = majorHeads.find(m => m.id === min.majorHeadId);
      if (!mh) return [];
      const at  = accountTypes.find(a => a.id === mh.accountTypeId);
      if (!at) return [];
      // apply parent filters
      if (filterAtId  !== 'all' && at.id  !== filterAtId)  return [];
      if (filterMhId  !== 'all' && mh.id  !== filterMhId)  return [];
      if (filterMinId !== 'all' && min.id !== filterMinId)  return [];
      if (filterShId  !== 'all' && sh.id  !== filterShId)   return [];
      const compositeCode = at.code + mh.code + min.code + sh.code + dc.code;
      if (search && !compositeCode.includes(search) && !dc.nameEnglish.toLowerCase().includes(search.toLowerCase()) && !dc.nameKannada.includes(search)) return [];
      if (statusFilter !== 'All' && dc.status !== statusFilter) return [];
      return [{ id: dc.id, compositeCode, at, mh, min, sh, dc }];
    });
  }, [detailCodes, subHeads, minorHeads, majorHeads, accountTypes, filterAtId, filterMhId, filterMinId, filterShId, search, statusFilter]);

  /* ── Paged items ── */
  const currentItems = useMemo(() => {
    switch (activeLevel) {
      case 'account-type': return filteredAt;
      case 'major-head':   return filteredMh;
      case 'minor-head':   return filteredMin;
      case 'sub-head':     return filteredSh;
      case 'detail-code':  return filteredDc;
      case 'all-codes':    return allCodes as unknown as typeof filteredAt;
    }
  }, [activeLevel, filteredAt, filteredMh, filteredMin, filteredSh, filteredDc, allCodes]);

  const totalPages  = Math.ceil(currentItems.length / PAGE_SIZE);
  const pagedItems = currentItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Open modal helpers ── */
  const openAdd = () => {
    const level = activeLevel as Exclude<ActiveLevel, 'all-codes'>;
    setModalTarget({ level, data: null } as ModalTarget);
  };
  const openEdit = (data: AccountType | MajorHead | MinorHead | SubHead | DetailCode) => {
    const level = activeLevel as Exclude<ActiveLevel, 'all-codes'>;
    setModalTarget({ level, data } as ModalTarget);
  };

  /* ── CRUD submit handler ── */
  const handleModalSubmit = (data: Omit<AccountType | MajorHead | MinorHead | SubHead | DetailCode, 'id'>) => {
    if (!modalTarget) return;
    const { level } = modalTarget;
    const editData = modalTarget.data;

    if (level === 'account-type') {
      const d = data as Omit<AccountType, 'id'>;
      if (editData) setAccountTypes(prev => prev.map(r => r.id === editData.id ? { ...d, id: editData.id } : r));
      else { setAccountTypes(prev => [...prev, { ...d, id: nextAtId }]); setNextAtId(n => n + 1); }
    } else if (level === 'major-head') {
      const d = data as Omit<MajorHead, 'id'>;
      if (editData) setMajorHeads(prev => prev.map(r => r.id === editData.id ? { ...d, id: editData.id } : r));
      else { setMajorHeads(prev => [...prev, { ...d, id: nextMhId }]); setNextMhId(n => n + 1); }
    } else if (level === 'minor-head') {
      const d = data as Omit<MinorHead, 'id'>;
      if (editData) setMinorHeads(prev => prev.map(r => r.id === editData.id ? { ...d, id: editData.id } : r));
      else { setMinorHeads(prev => [...prev, { ...d, id: nextMinId }]); setNextMinId(n => n + 1); }
    } else if (level === 'sub-head') {
      const d = data as Omit<SubHead, 'id'>;
      if (editData) setSubHeads(prev => prev.map(r => r.id === editData.id ? { ...d, id: editData.id } : r));
      else { setSubHeads(prev => [...prev, { ...d, id: nextShId }]); setNextShId(n => n + 1); }
    } else if (level === 'detail-code') {
      const d = data as Omit<DetailCode, 'id'>;
      if (editData) setDetailCodes(prev => prev.map(r => r.id === editData.id ? { ...d, id: editData.id } : r));
      else { setDetailCodes(prev => [...prev, { ...d, id: nextDcId }]); setNextDcId(n => n + 1); }
    }

    setModalTarget(null);
    setPage(1);
  };

  /* ── Delete execution ── */
  const executeDelete = () => {
    if (!deleteTarget) return;
    const { level, id } = deleteTarget;
    if (level === 'account-type') {
      setAccountTypes(prev => prev.filter(r => r.id !== id));
      const removedMhIds = majorHeads.filter(m => m.accountTypeId === id).map(m => m.id);
      const removedMinIds = minorHeads.filter(m => removedMhIds.includes(m.majorHeadId)).map(m => m.id);
      const removedShIds  = subHeads.filter(s => removedMinIds.includes(s.minorHeadId)).map(s => s.id);
      setMajorHeads(prev => prev.filter(m => m.accountTypeId !== id));
      setMinorHeads(prev => prev.filter(m => !removedMhIds.includes(m.majorHeadId)));
      setSubHeads(prev => prev.filter(s => !removedMinIds.includes(s.minorHeadId)));
      setDetailCodes(prev => prev.filter(d => !removedShIds.includes(d.subHeadId)));
    } else if (level === 'major-head') {
      const removedMinIds = minorHeads.filter(m => m.majorHeadId === id).map(m => m.id);
      const removedShIds  = subHeads.filter(s => removedMinIds.includes(s.minorHeadId)).map(s => s.id);
      setMajorHeads(prev => prev.filter(r => r.id !== id));
      setMinorHeads(prev => prev.filter(m => m.majorHeadId !== id));
      setSubHeads(prev => prev.filter(s => !removedMinIds.includes(s.minorHeadId)));
      setDetailCodes(prev => prev.filter(d => !removedShIds.includes(d.subHeadId)));
    } else if (level === 'minor-head') {
      const removedShIds = subHeads.filter(s => s.minorHeadId === id).map(s => s.id);
      setMinorHeads(prev => prev.filter(r => r.id !== id));
      setSubHeads(prev => prev.filter(s => s.minorHeadId !== id));
      setDetailCodes(prev => prev.filter(d => !removedShIds.includes(d.subHeadId)));
    } else if (level === 'sub-head') {
      setSubHeads(prev => prev.filter(r => r.id !== id));
      setDetailCodes(prev => prev.filter(d => d.subHeadId !== id));
    } else {
      setDetailCodes(prev => prev.filter(r => r.id !== id));
    }
    setDeleteTarget(null);
  };

  /* ── Delete message ── */
  const deleteMessage = (() => {
    if (!deleteTarget) return '';
    const suffix = 'This will also remove all child records. This action cannot be undone.';
    switch (deleteTarget.level) {
      case 'account-type': return `Delete this Account Type? ${suffix}`;
      case 'major-head':   return `Delete this Major Head? ${suffix}`;
      case 'minor-head':   return `Delete this Minor Head? ${suffix}`;
      case 'sub-head':     return 'Delete this Sub Head and all its Detail Codes? This action cannot be undone.';
      case 'detail-code':  return 'Delete this Detail Code? This action cannot be undone.';
    }
  })();

  /* ── Render table body per level ── */
  const renderRows = () => {
    if (pagedItems.length === 0) {
      return (
        <tr>
          <td colSpan={10} className={styles.empty}>No records found</td>
        </tr>
      );
    }

    if (activeLevel === 'account-type') {
      return (pagedItems as AccountType[]).map((row, idx) => (
        <tr key={row.id} className={styles.tr}>
          <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
          <td className={styles.td}><span className={styles.codeChip}>{row.code}</span></td>
          <td className={styles.td}>
            <span className={`${styles.categoryBadge} ${styles[`cat${row.category}`]}`}>{row.category}</span>
          </td>
          <td className={styles.td}>{row.nameEnglish}</td>
          <td className={styles.td}>{row.nameKannada}</td>
          <td className={styles.td}><Badge variant={row.status === 'Active' ? 'success' : 'neutral'} size="sm">{row.status}</Badge></td>
          {!isReadOnly && (
            <td className={styles.td}>
              <div className={styles.actionGroup}>
                <button className={styles.actionBtn} onClick={() => openEdit(row)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                  Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ level: 'account-type', id: row.id })}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </td>
          )}
        </tr>
      ));
    }

    if (activeLevel === 'major-head') {
      return (pagedItems as MajorHead[]).map((row, idx) => {
        const at  = accountTypes.find(a => a.id === row.accountTypeId);
        const cc  = ccMajor(at, row);
        return (
          <tr key={row.id} className={styles.tr}>
            <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
            <td className={styles.td}><span className={styles.compositeChip}>{cc}</span></td>
            <td className={styles.td}><span className={styles.codeChip}>{row.code}</span></td>
            <td className={styles.td}>
              <span className={styles.parentRef}>{at?.code} – {at?.nameEnglish}</span>
            </td>
            <td className={styles.td}>{row.nameEnglish}</td>
            <td className={styles.td}>{row.nameKannada}</td>
            <td className={styles.td}><Badge variant={row.status === 'Active' ? 'success' : 'neutral'} size="sm">{row.status}</Badge></td>
            {!isReadOnly && (
              <td className={styles.td}>
                <div className={styles.actionGroup}>
                  <button className={styles.actionBtn} onClick={() => openEdit(row)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                    Edit
                  </button>
                  <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ level: 'major-head', id: row.id })}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </td>
            )}
          </tr>
        );
      });
    }

    if (activeLevel === 'minor-head') {
      return (pagedItems as MinorHead[]).map((row, idx) => {
        const mh  = majorHeads.find(m => m.id === row.majorHeadId);
        const at  = accountTypes.find(a => a.id === mh?.accountTypeId);
        const cc  = ccMinor(at, mh, row);
        return (
          <tr key={row.id} className={styles.tr}>
            <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
            <td className={styles.td}><span className={styles.compositeChip}>{cc}</span></td>
            <td className={styles.td}><span className={styles.codeChip}>{row.code}</span></td>
            <td className={styles.td}>
              <span className={styles.parentRef}>{at?.code}{mh?.code} – {mh?.nameEnglish}</span>
            </td>
            <td className={styles.td}>{row.nameEnglish}</td>
            <td className={styles.td}>{row.nameKannada}</td>
            <td className={styles.td}><Badge variant={row.status === 'Active' ? 'success' : 'neutral'} size="sm">{row.status}</Badge></td>
            {!isReadOnly && (
              <td className={styles.td}>
                <div className={styles.actionGroup}>
                  <button className={styles.actionBtn} onClick={() => openEdit(row)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                    Edit
                  </button>
                  <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ level: 'minor-head', id: row.id })}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </td>
            )}
          </tr>
        );
      });
    }

    if (activeLevel === 'sub-head') {
      return (pagedItems as SubHead[]).map((row, idx) => {
        const min = minorHeads.find(m => m.id === row.minorHeadId);
        const mh  = majorHeads.find(m => m.id === min?.majorHeadId);
        const at  = accountTypes.find(a => a.id === mh?.accountTypeId);
        const cc  = ccSub(at, mh, min, row);
        return (
          <tr key={row.id} className={styles.tr}>
            <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
            <td className={styles.td}><span className={styles.compositeChip}>{cc}</span></td>
            <td className={styles.td}><span className={styles.codeChip}>{row.code}</span></td>
            <td className={styles.td}>
              <span className={styles.parentRef}>{at?.code}{mh?.code}{min?.code} – {min?.nameEnglish}</span>
            </td>
            <td className={styles.td}>{row.nameEnglish}</td>
            <td className={styles.td}>{row.nameKannada}</td>
            <td className={styles.td}><Badge variant={row.status === 'Active' ? 'success' : 'neutral'} size="sm">{row.status}</Badge></td>
            {!isReadOnly && (
              <td className={styles.td}>
                <div className={styles.actionGroup}>
                  <button className={styles.actionBtn} onClick={() => openEdit(row)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                    Edit
                  </button>
                  <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ level: 'sub-head', id: row.id })}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </td>
            )}
          </tr>
        );
      });
    }

    if (activeLevel === 'detail-code') {
      return (pagedItems as DetailCode[]).map((row, idx) => {
        const sh  = subHeads.find(s => s.id === row.subHeadId);
        const min = minorHeads.find(m => m.id === sh?.minorHeadId);
        const mh  = majorHeads.find(m => m.id === min?.majorHeadId);
        const at  = accountTypes.find(a => a.id === mh?.accountTypeId);
        const cc  = ccDetail(at, mh, min, sh, row);
        return (
          <tr key={row.id} className={styles.tr}>
            <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
            <td className={styles.td}><span className={styles.compositeChip}>{cc}</span></td>
            <td className={styles.td}><span className={styles.codeChip}>{row.code}</span></td>
            <td className={styles.td}>
              <span className={styles.parentRef}>{at?.code}{mh?.code}{min?.code}{sh?.code} – {sh?.nameEnglish}</span>
            </td>
            <td className={styles.td}>{row.nameEnglish}</td>
            <td className={styles.td}>{row.nameKannada}</td>
            <td className={styles.td}><Badge variant={row.status === 'Active' ? 'success' : 'neutral'} size="sm">{row.status}</Badge></td>
            {!isReadOnly && (
              <td className={styles.td}>
                <div className={styles.actionGroup}>
                  <button className={styles.actionBtn} onClick={() => openEdit(row)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                    Edit
                  </button>
                  <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ level: 'detail-code', id: row.id })}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.75 7.5h6.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </td>
            )}
          </tr>
        );
      });
    }

    /* all-codes */
    return (pagedItems as unknown as typeof allCodes).map((row, idx) => (
      <tr key={row.id} className={styles.tr}>
        <td className={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
        <td className={styles.td}><span className={styles.compositeChip}>{row.compositeCode}</span></td>
        <td className={styles.td}><span className={styles.codeChip}>{row.at.code}</span> {row.at.nameEnglish}</td>
        <td className={styles.td}><span className={styles.codeChip}>{row.mh.code}</span> {row.mh.nameEnglish}</td>
        <td className={styles.td}><span className={styles.codeChip}>{row.min.code}</span> {row.min.nameEnglish}</td>
        <td className={styles.td}><span className={styles.codeChip}>{row.sh.code}</span> {row.sh.nameEnglish}</td>
        <td className={styles.td}><span className={styles.codeChip}>{row.dc.code}</span> {row.dc.nameEnglish}</td>
        <td className={styles.td}><Badge variant={row.dc.status === 'Active' ? 'success' : 'neutral'} size="sm">{row.dc.status}</Badge></td>
      </tr>
    ));
  };

  /* ── Table columns header per level ── */
  const renderColHeaders = () => {
    if (activeLevel === 'account-type') return (
      <>
        <th className={styles.th}>Sl</th>
        <th className={styles.th}>Code</th>
        <th className={styles.th}>Category</th>
        <th className={styles.th}>Name (English)</th>
        <th className={styles.th}>Name (Kannada)</th>
        <th className={styles.th}>Status</th>
        {!isReadOnly && <th className={styles.th}>Actions</th>}
      </>
    );
    if (activeLevel === 'all-codes') return (
      <>
        <th className={styles.th}>Sl</th>
        <th className={styles.th}>Composite Code</th>
        <th className={styles.th}>Account Type</th>
        <th className={styles.th}>Major Head</th>
        <th className={styles.th}>Minor Head</th>
        <th className={styles.th}>Sub Head</th>
        <th className={styles.th}>Detail Code</th>
        <th className={styles.th}>Status</th>
      </>
    );
    return (
      <>
        <th className={styles.th}>Sl</th>
        <th className={styles.th}>Composite Code</th>
        <th className={styles.th}>Code</th>
        <th className={styles.th}>Parent</th>
        <th className={styles.th}>Name (English)</th>
        <th className={styles.th}>Name (Kannada)</th>
        <th className={styles.th}>Status</th>
        {!isReadOnly && <th className={styles.th}>Actions</th>}
      </>
    );
  };

  const currentLevelLabel = LEVEL_META.find(l => l.key === activeLevel)?.label ?? '';

  /* ── Pre-selected parents for "Add" modal from current filter context ── */
  const defaultParentIds = {
    accountTypeId: filterAtId  !== 'all' ? filterAtId  : undefined,
    majorHeadId:   filterMhId  !== 'all' ? filterMhId  : undefined,
    minorHeadId:   filterMinId !== 'all' ? filterMinId : undefined,
    subHeadId:     filterShId  !== 'all' ? filterShId  : undefined,
  };

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className={styles.content}>

      {/* ── Level selector pills ── */}
      <div className={styles.levelPills}>
        {LEVEL_META.map(lm => (
          <button
            key={lm.key}
            className={`${styles.levelPill} ${activeLevel === lm.key ? styles.levelPillActive : ''}`}
            onClick={() => handleLevelChange(lm.key)}
          >
            {lm.label}
          </button>
        ))}
        {isReadOnly && (
          <span className={styles.readOnlyBadge}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            View Only
          </span>
        )}
      </div>

      {/* ── Parent filter chain ── */}
      {activeLevel !== 'account-type' && (
        <div className={styles.parentFilters}>
          <div className={styles.parentFilter}>
            <label className={styles.parentFilterLabel}>Account Type</label>
            <div className={styles.parentFilterSelect}>
              <select
                value={filterAtId}
                onChange={e => handleFilterAt(e.target.value === 'all' ? 'all' : +e.target.value)}
              >
                <option value="all">All Account Types</option>
                {accountTypes.map(at => (
                  <option key={at.id} value={at.id}>{at.code} – {at.nameEnglish}</option>
                ))}
              </select>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>

          {['minor-head', 'sub-head', 'detail-code', 'all-codes'].includes(activeLevel) && (
            <div className={styles.parentFilter}>
              <label className={styles.parentFilterLabel}>Major Head</label>
              <div className={styles.parentFilterSelect}>
                <select
                  value={filterMhId}
                  onChange={e => handleFilterMh(e.target.value === 'all' ? 'all' : +e.target.value)}
                >
                  <option value="all">All Major Heads</option>
                  {availableMajorHeads.map(mh => {
                    const at = accountTypes.find(a => a.id === mh.accountTypeId);
                    return <option key={mh.id} value={mh.id}>{ccMajor(at, mh)} – {mh.nameEnglish}</option>;
                  })}
                </select>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          )}

          {['sub-head', 'detail-code', 'all-codes'].includes(activeLevel) && (
            <div className={styles.parentFilter}>
              <label className={styles.parentFilterLabel}>Minor Head</label>
              <div className={styles.parentFilterSelect}>
                <select
                  value={filterMinId}
                  onChange={e => handleFilterMin(e.target.value === 'all' ? 'all' : +e.target.value)}
                >
                  <option value="all">All Minor Heads</option>
                  {availableMinorHeads.map(min => {
                    const mh = majorHeads.find(m => m.id === min.majorHeadId);
                    const at = accountTypes.find(a => a.id === mh?.accountTypeId);
                    return <option key={min.id} value={min.id}>{ccMinor(at, mh, min)} – {min.nameEnglish}</option>;
                  })}
                </select>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          )}

          {['detail-code', 'all-codes'].includes(activeLevel) && (
            <div className={styles.parentFilter}>
              <label className={styles.parentFilterLabel}>Sub Head</label>
              <div className={styles.parentFilterSelect}>
                <select
                  value={filterShId}
                  onChange={e => { setFilterShId(e.target.value === 'all' ? 'all' : +e.target.value); setPage(1); }}
                >
                  <option value="all">All Sub Heads</option>
                  {availableSubHeads.map(sh => {
                    const min = minorHeads.find(m => m.id === sh.minorHeadId);
                    const mh  = majorHeads.find(m => m.id === min?.majorHeadId);
                    const at  = accountTypes.find(a => a.id === mh?.accountTypeId);
                    return <option key={sh.id} value={sh.id}>{ccSub(at, mh, min, sh)} – {sh.nameEnglish}</option>;
                  })}
                </select>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Toolbar: search + status + add ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.searchIcon}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={`Search ${currentLevelLabel}...`}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.filterBox}>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.filterChevron}>
              <path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {!isReadOnly && activeLevel !== 'all-codes' && (
          <button className={styles.addBtn} onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add {currentLevelLabel}
          </button>
        )}
      </div>

      {/* ── Table card ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>{currentLevelLabel}</h2>
          <span className={styles.tableCount}>{currentItems.length} records</span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr>{renderColHeaders()}</tr></thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
        <div className={styles.paginationBar}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalRecords={currentItems.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalTarget && (
        <LevelModal
          isOpen={true}
          onClose={() => setModalTarget(null)}
          onSubmit={handleModalSubmit}
          level={modalTarget.level}
          initialData={modalTarget.data}
          accountTypes={accountTypes}
          majorHeads={majorHeads}
          minorHeads={minorHeads}
          subHeads={subHeads}
          defaultAccountTypeId={defaultParentIds.accountTypeId}
          defaultMajorHeadId={defaultParentIds.majorHeadId}
          defaultMinorHeadId={defaultParentIds.minorHeadId}
          defaultSubHeadId={defaultParentIds.subHeadId}
        />
      )}

      {/* ── Delete Confirm ── */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        message={deleteMessage}
      />
    </div>
  );
};

export default AccountCodeTab;
