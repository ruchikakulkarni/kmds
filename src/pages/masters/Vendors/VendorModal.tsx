import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../components/common/Toast';
import {
  generatePayeeCode,
  fetchPANDetails,
  fetchBankByIFSC,
  fetchGSTByGSTIN,
  STATE_OPTIONS,
} from './data';
import type {
  VendorRecord,
  PayeeType,
  VendorStatus,
  EmployeeType,
  StatutoryPaymentType,
  AddressContact,
  BankInfo,
  GSTInfo,
  BeneficiaryEntry,
  FinancialYear,
} from './types';
import ConfirmSaveModal from './ConfirmSaveModal';
import styles from './VendorModal.module.css';

// ── Scheme reference type (passed in as prop) ─────────────────────────────────
interface SchemeOption {
  id: string;
  name: string;
  frequency: string;
}

// ── Empty sub-form defaults ───────────────────────────────────────────────────

function emptyAddress(): AddressContact {
  return {
    addressLine1: '',
    addressLine2: '',
    district: '',
    talukCity: '',
    state: 'Karnataka',
    pinCode: '',
    contactPersonName: '',
    mobile: '',
    email: '',
  };
}

function emptyBank(): BankInfo {
  return { accountNumber: '', ifscCode: '', bankName: '', branchName: '', micr: '' };
}

function emptyGST(): GSTInfo {
  return { gstRegistered: 'No', gstin: '', legalName: '', tradeName: '', gstStatus: '' };
}

// ── Validation helpers ────────────────────────────────────────────────────────

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const MOBILE_RE = /^\d{10}$/;
const PIN_RE = /^\d{6}$/;
const AADHAAR_RE = /^\d{12}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  vendor: VendorRecord | null;
  schemes: SchemeOption[];
  allRecords: VendorRecord[];
  onSave: (record: VendorRecord) => void;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const VendorModal: React.FC<Props> = ({
  isOpen,
  vendor,
  schemes,
  allRecords,
  onSave,
  onClose,
}) => {
  const { showToast } = useToast();

  // ── Common state ──────────────────────────────────────────────────────────
  const [date, setDate] = useState(todayISO());
  const [payeeType, setPayeeType] = useState<PayeeType | ''>('');
  const [status, setStatus] = useState<VendorStatus>('Active');
  const [payeeCode, setPayeeCode] = useState('');

  // ── Beneficiary form ──────────────────────────────────────────────────────
  const [benSchemeId, setBenSchemeId] = useState('');
  const [benSchemeFreq, setBenSchemeFreq] = useState('');
  const [benFY, setBenFY] = useState<FinancialYear | ''>('');
  const [benAddMode, setBenAddMode] = useState<'single' | 'csv'>('single');
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryEntry[]>([]);
  // staging fields
  const [stagingName, setStagingName] = useState('');
  const [stagingAadhaar, setStagingAadhaar] = useState('');
  const [stagingMobile, setStagingMobile] = useState('');
  const [stagingBankAccount, setStagingBankAccount] = useState('');
  const [stagingIfsc, setStagingIfsc] = useState('');
  const [stagingErrors, setStagingErrors] = useState<Record<string, string>>({});

  // ── Employee form ──────────────────────────────────────────────────────────
  const [empType, setEmpType] = useState<EmployeeType | ''>('');
  const [empName, setEmpName] = useState('');
  const [empDesignation, setEmpDesignation] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empKgid, setEmpKgid] = useState('');
  const [empHrms, setEmpHrms] = useState('');
  const [empK2, setEmpK2] = useState('');
  const [empMobile, setEmpMobile] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empEndDate, setEmpEndDate] = useState('');

  // ── Statutory form ────────────────────────────────────────────────────────
  const [staPayType, setStaPayType] = useState<StatutoryPaymentType | ''>('');
  const [staPan, setStaPan] = useState('');
  const [staPanName, setStaPanName] = useState('');
  const [staPanStatus, setStaPanStatus] = useState('');
  const [staPanFetching, setStaPanFetching] = useState(false);
  const [staAddress, setStaAddress] = useState<AddressContact>(emptyAddress());
  const [staBank, setStaBank] = useState<BankInfo>(emptyBank());
  const [staConfirmAcct, setStaConfirmAcct] = useState('');
  const [staIfscFetching, setStaIfscFetching] = useState(false);
  const [staGST, setStaGST] = useState<GSTInfo>(emptyGST());
  const [staGstFetching, setStaGstFetching] = useState(false);
  const [staOtpSent, setStaOtpSent] = useState(false);

  // ── Vendor form ───────────────────────────────────────────────────────────
  const [venPan, setVenPan] = useState('');
  const [venPanName, setVenPanName] = useState('');
  const [venPanStatus, setVenPanStatus] = useState('');
  const [venPanFetching, setVenPanFetching] = useState(false);
  const [venMsme, setVenMsme] = useState<'Yes' | 'No'>('No');
  const [venUdyam, setVenUdyam] = useState('');
  const [venK2, setVenK2] = useState('');
  const [venPfms, setVenPfms] = useState('');
  const [venAddress, setVenAddress] = useState<AddressContact>(emptyAddress());
  const [venBank, setVenBank] = useState<BankInfo>(emptyBank());
  const [venConfirmAcct, setVenConfirmAcct] = useState('');
  const [venIfscFetching, setVenIfscFetching] = useState(false);
  const [venGST, setVenGST] = useState<GSTInfo>(emptyGST());
  const [venGstFetching, setVenGstFetching] = useState(false);
  const [venOtpSent, setVenOtpSent] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── Reset / populate on open ───────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    if (vendor) {
      // Populate from existing record
      setDate(vendor.date);
      setPayeeType(vendor.payeeType);
      setStatus(vendor.status);
      setPayeeCode(vendor.payeeCode);

      if (vendor.beneficiaryData) {
        const b = vendor.beneficiaryData;
        setBenSchemeId(b.schemeId);
        setBenSchemeFreq(b.schemeFrequency);
        setBenFY(b.financialYear);
        setBeneficiaries([...b.beneficiaries]);
      }

      if (vendor.employeeData) {
        const e = vendor.employeeData;
        setEmpType(e.employeeType);
        setEmpName(e.name);
        setEmpDesignation(e.designation);
        setEmpDept(e.department);
        setEmpKgid(e.kgid);
        setEmpHrms(e.hrmsId);
        setEmpK2(e.k2Id);
        setEmpMobile(e.mobile);
        setEmpEmail(e.email);
        setEmpEndDate(e.endDate);
      }

      if (vendor.statutoryData) {
        const s = vendor.statutoryData;
        setStaPayType(s.statutoryPaymentType);
        setStaPan(s.pan);
        setStaPanName(s.panName);
        setStaPanStatus(s.panStatus);
        setStaAddress({ ...s.address });
        setStaBank({ ...s.bank });
        setStaConfirmAcct(s.bank.accountNumber);
        setStaGST({ ...s.gst });
      }

      if (vendor.vendorData) {
        const v = vendor.vendorData;
        setVenPan(v.pan);
        setVenPanName(v.panName);
        setVenPanStatus(v.panStatus);
        setVenMsme(v.msmeRegistered);
        setVenUdyam(v.udyamRegistrationNo);
        setVenK2(v.k2RecipientId);
        setVenPfms(v.pfmsVendorId);
        setVenAddress({ ...v.address });
        setVenBank({ ...v.bank });
        setVenConfirmAcct(v.bank.accountNumber);
        setVenGST({ ...v.gst });
      }
    } else {
      // Reset all
      setDate(todayISO());
      setPayeeType('');
      setStatus('Active');
      setPayeeCode('');
      setBenSchemeId(''); setBenSchemeFreq(''); setBenFY(''); setBeneficiaries([]);
      setStagingName(''); setStagingAadhaar(''); setStagingMobile('');
      setStagingBankAccount(''); setStagingIfsc('');
      setEmpType(''); setEmpName(''); setEmpDesignation(''); setEmpDept('');
      setEmpKgid(''); setEmpHrms(''); setEmpK2(''); setEmpMobile('');
      setEmpEmail(''); setEmpEndDate('');
      setStaPayType(''); setStaPan(''); setStaPanName(''); setStaPanStatus('');
      setStaAddress(emptyAddress()); setStaBank(emptyBank());
      setStaConfirmAcct(''); setStaGST(emptyGST());
      setVenPan(''); setVenPanName(''); setVenPanStatus(''); setVenMsme('No');
      setVenUdyam(''); setVenK2(''); setVenPfms('');
      setVenAddress(emptyAddress()); setVenBank(emptyBank());
      setVenConfirmAcct(''); setVenGST(emptyGST());
    }

    setErrors({});
    setStagingErrors({});
    setStaOtpSent(false);
    setVenOtpSent(false);
  }, [isOpen, vendor]);

  // ── Auto-generate code when payee type changes (create mode) ──────────────

  useEffect(() => {
    if (!isOpen || vendor) return;
    if (!payeeType) { setPayeeCode(''); return; }
    setPayeeCode(generatePayeeCode(payeeType, empType || undefined));
  }, [payeeType, isOpen, vendor]);

  // Employee: re-generate code when employee type changes
  useEffect(() => {
    if (!isOpen || vendor || payeeType !== 'Employee') return;
    if (!empType) return;
    setPayeeCode(generatePayeeCode('Employee', empType));
  }, [empType, isOpen, vendor, payeeType]);

  // Employee End Date → auto inactive
  useEffect(() => {
    if (!empEndDate) return;
    if (new Date(empEndDate) < new Date()) setStatus('Inactive');
  }, [empEndDate]);

  // Scheme → auto-fill frequency
  useEffect(() => {
    if (!benSchemeId) { setBenSchemeFreq(''); return; }
    const scheme = schemes.find((s) => s.id === benSchemeId);
    setBenSchemeFreq(scheme?.frequency ?? '');
  }, [benSchemeId, schemes]);

  // ── Duplicate detection (beneficiary scheme + FY) ─────────────────────────

  const isDuplicate =
    payeeType === 'Beneficiary' &&
    benSchemeId !== '' &&
    benFY !== '' &&
    allRecords.some(
      (r) =>
        r.id !== vendor?.id &&
        r.payeeType === 'Beneficiary' &&
        r.beneficiaryData?.schemeId === benSchemeId &&
        r.beneficiaryData?.financialYear === benFY,
    );

  // ── PAN fetch helpers ─────────────────────────────────────────────────────

  const handleFetchStaPAN = useCallback(async () => {
    if (!staPan || staPanFetching) return;
    setStaPanFetching(true);
    try {
      const res = await fetchPANDetails(staPan.toUpperCase());
      setStaPanName(res.name);
      setStaPanStatus(res.status);
    } finally {
      setStaPanFetching(false);
    }
  }, [staPan, staPanFetching]);

  const handleFetchVenPAN = useCallback(async () => {
    if (!venPan || venPanFetching) return;
    setVenPanFetching(true);
    try {
      const res = await fetchPANDetails(venPan.toUpperCase());
      setVenPanName(res.name);
      setVenPanStatus(res.status);
    } finally {
      setVenPanFetching(false);
    }
  }, [venPan, venPanFetching]);

  // ── IFSC fetch helpers ────────────────────────────────────────────────────

  const handleFetchStaIFSC = useCallback(async () => {
    if (!staBank.ifscCode || staIfscFetching) return;
    setStaIfscFetching(true);
    try {
      const res = await fetchBankByIFSC(staBank.ifscCode);
      setStaBank((prev) => ({ ...prev, bankName: res.bankName, branchName: res.branchName, micr: res.micr }));
    } finally {
      setStaIfscFetching(false);
    }
  }, [staBank.ifscCode, staIfscFetching]);

  const handleFetchVenIFSC = useCallback(async () => {
    if (!venBank.ifscCode || venIfscFetching) return;
    setVenIfscFetching(true);
    try {
      const res = await fetchBankByIFSC(venBank.ifscCode);
      setVenBank((prev) => ({ ...prev, bankName: res.bankName, branchName: res.branchName, micr: res.micr }));
    } finally {
      setVenIfscFetching(false);
    }
  }, [venBank.ifscCode, venIfscFetching]);

  // ── GST fetch helpers ─────────────────────────────────────────────────────

  const handleFetchStaGST = useCallback(async () => {
    if (!staGST.gstin || staGstFetching) return;
    setStaGstFetching(true);
    try {
      const res = await fetchGSTByGSTIN(staGST.gstin);
      setStaGST((prev) => ({ ...prev, legalName: res.legalName, tradeName: res.tradeName, gstStatus: res.gstStatus }));
    } finally {
      setStaGstFetching(false);
    }
  }, [staGST.gstin, staGstFetching]);

  const handleFetchVenGST = useCallback(async () => {
    if (!venGST.gstin || venGstFetching) return;
    setVenGstFetching(true);
    try {
      const res = await fetchGSTByGSTIN(venGST.gstin);
      setVenGST((prev) => ({ ...prev, legalName: res.legalName, tradeName: res.tradeName, gstStatus: res.gstStatus }));
    } finally {
      setVenGstFetching(false);
    }
  }, [venGST.gstin, venGstFetching]);

  // ── Add beneficiary ───────────────────────────────────────────────────────

  const handleAddBeneficiary = () => {
    const errs: Record<string, string> = {};
    if (!stagingName.trim()) errs.stagingName = 'Name is required';
    if (!AADHAAR_RE.test(stagingAadhaar)) errs.stagingAadhaar = 'Aadhaar must be 12 digits';
    if (!MOBILE_RE.test(stagingMobile)) errs.stagingMobile = 'Mobile must be 10 digits';
    if (!stagingBankAccount.trim()) errs.stagingBankAccount = 'Account number is required';
    if (!stagingIfsc.trim()) errs.stagingIfsc = 'IFSC is required';
    if (Object.keys(errs).length > 0) { setStagingErrors(errs); return; }

    setBeneficiaries((prev) => [
      ...prev,
      {
        id: `ben-${Date.now()}`,
        name: stagingName.trim(),
        aadhaar: stagingAadhaar,
        mobile: stagingMobile,
        bankAccount: stagingBankAccount.trim(),
        ifsc: stagingIfsc.trim().toUpperCase(),
      },
    ]);
    setStagingName(''); setStagingAadhaar(''); setStagingMobile('');
    setStagingBankAccount(''); setStagingIfsc('');
    setStagingErrors({});
  };

  const handleDeleteBeneficiary = (id: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
  };

  // ── CSV mock parse ────────────────────────────────────────────────────────

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      const parsed: BeneficiaryEntry[] = [];
      for (const line of lines) {
        const [name, aadhaar, mobile, bankAccount, ifsc] = line.split(',').map((s) => s.trim());
        if (name && aadhaar && mobile && bankAccount && ifsc) {
          parsed.push({ id: `ben-${Date.now()}-${Math.random()}`, name, aadhaar, mobile, bankAccount, ifsc });
        }
      }
      setBeneficiaries((prev) => [...prev, ...parsed]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};

    if (!date) e.date = 'Date is required';
    if (!payeeType) e.payeeType = 'Payee type is required';

    if (payeeType === 'Beneficiary') {
      if (!benSchemeId) e.benSchemeId = 'Scheme is required';
      if (!benFY) e.benFY = 'Financial year is required';
      if (beneficiaries.length === 0) e.beneficiaries = 'Add at least one beneficiary';
    }

    if (payeeType === 'Employee') {
      if (!empType) e.empType = 'Employee type is required';
      if (!empName.trim()) e.empName = 'Name is required';
      if (!empDesignation.trim()) e.empDesignation = 'Designation is required';
      if (!empDept.trim()) e.empDept = 'Department is required';
      if (!MOBILE_RE.test(empMobile)) e.empMobile = 'Mobile must be 10 digits';
      if (empEmail && !EMAIL_RE.test(empEmail)) e.empEmail = 'Invalid email';
      if (empType === 'Permanent') {
        if (!empKgid.trim()) e.empKgid = 'KGID is required for Permanent employees';
        if (!empHrms.trim()) e.empHrms = 'HRMS ID is required for Permanent employees';
        if (!empK2.trim()) e.empK2 = 'K2 ID is required for Permanent employees';
      }
    }

    if (payeeType === 'Statutory') {
      if (!staPayType) e.staPayType = 'Payment type is required';
      if (!staPan.trim()) {
        e.staPan = 'PAN is required';
      } else if (!PAN_RE.test(staPan.toUpperCase())) {
        e.staPan = 'Enter a valid 10-character PAN (e.g. AAAAB1234C)';
      }
      if (!staAddress.addressLine1.trim()) e.staAddr1 = 'Address Line 1 is required';
      if (!PIN_RE.test(staAddress.pinCode)) e.staPinCode = 'Pin code must be 6 digits';
      if (!MOBILE_RE.test(staAddress.mobile)) e.staMobile = 'Mobile must be 10 digits';
      if (staAddress.email && !EMAIL_RE.test(staAddress.email)) e.staEmail = 'Invalid email';
      if (!staBank.accountNumber.trim()) e.staBankAcct = 'Account number is required';
      if (staBank.accountNumber !== staConfirmAcct) e.staConfirmAcct = 'Account numbers do not match';
      if (!staBank.ifscCode.trim()) e.staIFSC = 'IFSC code is required';
      if (staGST.gstRegistered === 'Yes' && !GSTIN_RE.test(staGST.gstin.toUpperCase()))
        e.staGstin = 'Enter a valid 15-character GSTIN';
    }

    if (payeeType === 'Vendor') {
      if (!venPan.trim()) {
        e.venPan = 'PAN is required';
      } else if (!PAN_RE.test(venPan.toUpperCase())) {
        e.venPan = 'Enter a valid 10-character PAN (e.g. AAAAB1234C)';
      }
      if (venMsme === 'Yes' && !venUdyam.trim()) e.venUdyam = 'Udyam Registration No. is required';
      if (!venAddress.addressLine1.trim()) e.venAddr1 = 'Address Line 1 is required';
      if (!PIN_RE.test(venAddress.pinCode)) e.venPinCode = 'Pin code must be 6 digits';
      if (!MOBILE_RE.test(venAddress.mobile)) e.venMobile = 'Mobile must be 10 digits';
      if (venAddress.email && !EMAIL_RE.test(venAddress.email)) e.venEmail = 'Invalid email';
      if (!venBank.accountNumber.trim()) e.venBankAcct = 'Account number is required';
      if (venBank.accountNumber !== venConfirmAcct) e.venConfirmAcct = 'Account numbers do not match';
      if (!venBank.ifscCode.trim()) e.venIFSC = 'IFSC code is required';
      if (venGST.gstRegistered === 'Yes' && !GSTIN_RE.test(venGST.gstin.toUpperCase()))
        e.venGstin = 'Enter a valid 15-character GSTIN';
    }

    return e;
  };

  // ── Save flow ─────────────────────────────────────────────────────────────

  const handleSaveClick = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    const record: VendorRecord = {
      id: vendor?.id ?? `new-${Date.now()}`,
      payeeCode,
      payeeType: payeeType as PayeeType,
      date,
      status,
    };

    if (payeeType === 'Beneficiary') {
      const scheme = schemes.find((s) => s.id === benSchemeId);
      record.beneficiaryData = {
        schemeId: benSchemeId,
        schemeName: scheme?.name ?? '',
        schemeFrequency: benSchemeFreq,
        financialYear: benFY as FinancialYear,
        beneficiaries: [...beneficiaries],
      };
    }

    if (payeeType === 'Employee') {
      record.employeeData = {
        employeeType: empType as EmployeeType,
        name: empName.trim(),
        designation: empDesignation.trim(),
        department: empDept.trim(),
        kgid: empKgid.trim(),
        hrmsId: empHrms.trim(),
        k2Id: empK2.trim(),
        mobile: empMobile,
        email: empEmail,
        endDate: empEndDate,
      };
    }

    if (payeeType === 'Statutory') {
      record.statutoryData = {
        statutoryPaymentType: staPayType as import('./types').StatutoryPaymentType,
        pan: staPan.toUpperCase(),
        panName: staPanName,
        panStatus: staPanStatus,
        address: { ...staAddress },
        bank: { ...staBank },
        gst: { ...staGST },
      };
    }

    if (payeeType === 'Vendor') {
      record.vendorData = {
        pan: venPan.toUpperCase(),
        panName: venPanName,
        panStatus: venPanStatus,
        msmeRegistered: venMsme,
        udyamRegistrationNo: venUdyam.trim(),
        k2RecipientId: venK2.trim(),
        pfmsVendorId: venPfms.trim(),
        address: { ...venAddress },
        bank: { ...venBank },
        gst: { ...venGST },
      };
    }

    setConfirmOpen(false);
    onSave(record);
    showToast('Data Saved Successfully', 'success');
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const Err = ({ field }: { field: string }) =>
    errors[field] ? <span className={styles.errorText}>{errors[field]}</span> : null;

  const renderAddressFields = (
    addr: AddressContact,
    setAddr: (fn: (prev: AddressContact) => AddressContact) => void,
    prefix: string,
    otpSent: boolean,
    setOtpSent: (v: boolean) => void,
  ) => (
    <div className={styles.subSection}>
      <div className={styles.subSectionTitle}>Address &amp; Contact</div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Address Line 1</label>
          <input
            className={`${styles.input} ${errors[`${prefix}Addr1`] ? styles.error : ''}`}
            value={addr.addressLine1}
            onChange={(e) => setAddr((p) => ({ ...p, addressLine1: e.target.value }))}
            placeholder="Building / Street / Locality"
          />
          <Err field={`${prefix}Addr1`} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Address Line 2</label>
          <input
            className={styles.input}
            value={addr.addressLine2}
            onChange={(e) => setAddr((p) => ({ ...p, addressLine2: e.target.value }))}
            placeholder="Landmark / Area (optional)"
          />
        </div>
      </div>
      <div className={styles.row3}>
        <div className={styles.field}>
          <label className={styles.label}>District</label>
          <input
            className={styles.input}
            value={addr.district}
            onChange={(e) => setAddr((p) => ({ ...p, district: e.target.value }))}
            placeholder="District"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Taluk / City</label>
          <input
            className={styles.input}
            value={addr.talukCity}
            onChange={(e) => setAddr((p) => ({ ...p, talukCity: e.target.value }))}
            placeholder="Taluk or City"
          />
        </div>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Pin Code</label>
          <input
            className={`${styles.input} ${errors[`${prefix}PinCode`] ? styles.error : ''}`}
            value={addr.pinCode}
            maxLength={6}
            onChange={(e) => setAddr((p) => ({ ...p, pinCode: e.target.value.replace(/\D/g, '') }))}
            placeholder="6-digit pin code"
          />
          <Err field={`${prefix}PinCode`} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>State</label>
          <select
            className={styles.select}
            value={addr.state}
            onChange={(e) => setAddr((p) => ({ ...p, state: e.target.value }))}
          >
            {STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Contact Person Name</label>
          <input
            className={styles.input}
            value={addr.contactPersonName}
            onChange={(e) => setAddr((p) => ({ ...p, contactPersonName: e.target.value }))}
            placeholder="Contact person"
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Mobile</label>
          <div className={styles.inputWithAction}>
            <input
              className={`${styles.input} ${errors[`${prefix}Mobile`] ? styles.error : ''}`}
              value={addr.mobile}
              maxLength={10}
              onChange={(e) => setAddr((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, '') }))}
              placeholder="10-digit mobile"
            />
            <button
              type="button"
              className={styles.otpBtn}
              onClick={() => { setOtpSent(true); }}
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>
          {otpSent && <span className={styles.otpSentHint}>OTP sent to {addr.mobile}</span>}
          <Err field={`${prefix}Mobile`} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={`${styles.input} ${errors[`${prefix}Email`] ? styles.error : ''}`}
            type="email"
            value={addr.email}
            onChange={(e) => setAddr((p) => ({ ...p, email: e.target.value }))}
            placeholder="email@example.com"
          />
          <Err field={`${prefix}Email`} />
        </div>
      </div>
    </div>
  );

  const renderBankFields = (
    bank: BankInfo,
    setBank: (fn: (prev: BankInfo) => BankInfo) => void,
    confirmAcct: string,
    setConfirmAcct: (v: string) => void,
    fetching: boolean,
    onFetch: () => void,
    prefix: string,
  ) => (
    <div className={styles.subSection}>
      <div className={styles.subSectionTitle}>Bank Details</div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Account Number</label>
          <input
            className={`${styles.input} ${errors[`${prefix}BankAcct`] ? styles.error : ''}`}
            value={bank.accountNumber}
            onChange={(e) => setBank((p) => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
            placeholder="Bank account number"
          />
          <Err field={`${prefix}BankAcct`} />
        </div>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Confirm Account Number</label>
          <input
            className={`${styles.input} ${errors[`${prefix}ConfirmAcct`] ? styles.error : ''}`}
            type="password"
            value={confirmAcct}
            onChange={(e) => setConfirmAcct(e.target.value.replace(/\D/g, ''))}
            placeholder="Re-enter account number"
          />
          <Err field={`${prefix}ConfirmAcct`} />
        </div>
      </div>
      <div className={styles.fetchRow}>
        <div className={`${styles.field} ${styles.fetchInput}`}>
          <label className={`${styles.label} ${styles.required}`}>IFSC Code</label>
          <input
            className={`${styles.input} ${errors[`${prefix}IFSC`] ? styles.error : ''}`}
            value={bank.ifscCode}
            maxLength={11}
            onChange={(e) => setBank((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
            placeholder="11-char IFSC"
          />
          <Err field={`${prefix}IFSC`} />
        </div>
        <button
          type="button"
          className={styles.fetchBtn}
          onClick={onFetch}
          disabled={fetching || !bank.ifscCode}
          style={{ marginBottom: errors[`${prefix}IFSC`] ? '1.25rem' : '0' }}
        >
          {fetching ? 'Fetching…' : 'Fetch Bank'}
        </button>
      </div>
      {(bank.bankName || bank.branchName) && (
        <div className={styles.fetchResult}>
          <div className={styles.fetchResultItem}>
            <span className={styles.fetchResultLabel}>Bank Name</span>
            <span className={styles.fetchResultValue}>{bank.bankName}</span>
          </div>
          <div className={styles.fetchResultItem}>
            <span className={styles.fetchResultLabel}>Branch</span>
            <span className={styles.fetchResultValue}>{bank.branchName}</span>
          </div>
          <div className={styles.fetchResultItem}>
            <span className={styles.fetchResultLabel}>MICR</span>
            <span className={styles.fetchResultValue}>{bank.micr}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderGSTFields = (
    gst: GSTInfo,
    setGST: (fn: (prev: GSTInfo) => GSTInfo) => void,
    fetching: boolean,
    onFetch: () => void,
    prefix: string,
  ) => (
    <div className={styles.subSection}>
      <div className={styles.subSectionTitle}>GST Details</div>
      <div className={styles.field}>
        <label className={styles.label}>GST Registered</label>
        <div className={styles.radioGroup}>
          {(['Yes', 'No'] as const).map((v) => (
            <label key={v} className={styles.radioLabel}>
              <input
                type="radio"
                className={styles.radioInput}
                checked={gst.gstRegistered === v}
                onChange={() => setGST((p) => ({ ...p, gstRegistered: v }))}
              />
              {v}
            </label>
          ))}
        </div>
      </div>

      {gst.gstRegistered === 'Yes' && (
        <>
          <div className={styles.fetchRow}>
            <div className={`${styles.field} ${styles.fetchInput}`}>
              <label className={styles.label}>GSTIN</label>
              <input
                className={`${styles.input} ${errors[`${prefix}Gstin`] ? styles.error : ''}`}
                value={gst.gstin}
                maxLength={15}
                onChange={(e) => setGST((p) => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                placeholder="15-character GSTIN"
              />
              <Err field={`${prefix}Gstin`} />
            </div>
            <button
              type="button"
              className={styles.fetchBtn}
              onClick={onFetch}
              disabled={fetching || !gst.gstin}
              style={{ marginBottom: errors[`${prefix}Gstin`] ? '1.25rem' : '0' }}
            >
              {fetching ? 'Fetching…' : 'Validate'}
            </button>
          </div>
          {(gst.legalName || gst.tradeName) && (
            <div className={styles.fetchResult}>
              <div className={styles.fetchResultItem}>
                <span className={styles.fetchResultLabel}>Legal Name</span>
                <span className={styles.fetchResultValue}>{gst.legalName}</span>
              </div>
              <div className={styles.fetchResultItem}>
                <span className={styles.fetchResultLabel}>Trade Name</span>
                <span className={styles.fetchResultValue}>{gst.tradeName}</span>
              </div>
              <div className={styles.fetchResultItem}>
                <span className={styles.fetchResultLabel}>GST Status</span>
                <span className={styles.fetchResultValue}>{gst.gstStatus}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── Conditional sections ──────────────────────────────────────────────────

  const renderBeneficiarySection = () => (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Beneficiary Information</div>

      {/* Duplicate warn */}
      {isDuplicate && (
        <div className={styles.warnBanner}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: '#92400e' }}>
            <path d="M8 5v4M8 11h.01M2 13h12L8 3 2 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.warnBannerText}>
            A beneficiary record with this scheme and financial year already exists. Please verify before saving.
          </span>
        </div>
      )}

      <div className={styles.row3}>
        <div className={styles.field} style={{ gridColumn: '1 / 2' }}>
          <label className={`${styles.label} ${styles.required}`}>Scheme Name</label>
          <select
            className={`${styles.select} ${errors.benSchemeId ? styles.error : ''}`}
            value={benSchemeId}
            onChange={(e) => setBenSchemeId(e.target.value)}
          >
            <option value="">Select scheme…</option>
            {schemes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Err field="benSchemeId" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Scheme Frequency</label>
          <div className={styles.readonlyInput}>{benSchemeFreq || 'Auto-filled'}</div>
        </div>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Financial Year</label>
          <select
            className={`${styles.select} ${errors.benFY ? styles.error : ''}`}
            value={benFY}
            onChange={(e) => setBenFY(e.target.value as FinancialYear)}
          >
            <option value="">Select FY…</option>
            {(['2024-25', '2025-26', '2026-27'] as FinancialYear[]).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Err field="benFY" />
        </div>
      </div>

      {/* Beneficiary details */}
      <div className={styles.subSection}>
        <div className={styles.subSectionTitle}>Beneficiary Details</div>

        {/* Toggle */}
        <div>
          <div className={styles.toggleBar}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${benAddMode === 'single' ? styles.toggleActive : ''}`}
              onClick={() => setBenAddMode('single')}
            >
              Single Add
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${benAddMode === 'csv' ? styles.toggleActive : ''}`}
              onClick={() => setBenAddMode('csv')}
            >
              Upload CSV
            </button>
          </div>
        </div>

        {benAddMode === 'single' ? (
          <div className={styles.stagingForm}>
            <div className={styles.row3}>
              <div className={styles.field}>
                <label className={`${styles.label} ${styles.required}`}>Name</label>
                <input
                  className={`${styles.input} ${stagingErrors.stagingName ? styles.error : ''}`}
                  value={stagingName}
                  onChange={(e) => setStagingName(e.target.value)}
                  placeholder="Full name"
                />
                {stagingErrors.stagingName && <span className={styles.errorText}>{stagingErrors.stagingName}</span>}
              </div>
              <div className={styles.field}>
                <label className={`${styles.label} ${styles.required}`}>Aadhaar Number</label>
                <input
                  className={`${styles.input} ${stagingErrors.stagingAadhaar ? styles.error : ''}`}
                  value={stagingAadhaar}
                  maxLength={12}
                  onChange={(e) => setStagingAadhaar(e.target.value.replace(/\D/g, ''))}
                  placeholder="12-digit Aadhaar"
                />
                {stagingErrors.stagingAadhaar && <span className={styles.errorText}>{stagingErrors.stagingAadhaar}</span>}
              </div>
              <div className={styles.field}>
                <label className={`${styles.label} ${styles.required}`}>Mobile</label>
                <input
                  className={`${styles.input} ${stagingErrors.stagingMobile ? styles.error : ''}`}
                  value={stagingMobile}
                  maxLength={10}
                  onChange={(e) => setStagingMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                />
                {stagingErrors.stagingMobile && <span className={styles.errorText}>{stagingErrors.stagingMobile}</span>}
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={`${styles.label} ${styles.required}`}>Bank Account</label>
                <input
                  className={`${styles.input} ${stagingErrors.stagingBankAccount ? styles.error : ''}`}
                  value={stagingBankAccount}
                  onChange={(e) => setStagingBankAccount(e.target.value.replace(/\D/g, ''))}
                  placeholder="Account number"
                />
                {stagingErrors.stagingBankAccount && <span className={styles.errorText}>{stagingErrors.stagingBankAccount}</span>}
              </div>
              <div className={styles.field}>
                <label className={`${styles.label} ${styles.required}`}>IFSC Code</label>
                <input
                  className={`${styles.input} ${stagingErrors.stagingIfsc ? styles.error : ''}`}
                  value={stagingIfsc}
                  maxLength={11}
                  onChange={(e) => setStagingIfsc(e.target.value.toUpperCase())}
                  placeholder="11-char IFSC"
                />
                {stagingErrors.stagingIfsc && <span className={styles.errorText}>{stagingErrors.stagingIfsc}</span>}
              </div>
            </div>
            <div className={styles.stagingActions}>
              <button type="button" className={styles.addBenBtn} onClick={handleAddBeneficiary}>
                + Add Beneficiary
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.csvUpload}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.csvUploadLabel}>Upload CSV File</span>
            <span className={styles.csvUploadHint}>Format: Name, Aadhaar, Mobile, BankAccount, IFSC (one per line)</span>
            <input type="file" accept=".csv,.txt" onChange={handleCSVUpload} />
          </div>
        )}

        {/* Error if none added */}
        <Err field="beneficiaries" />

        {/* Mini-table */}
        {beneficiaries.length > 0 && (
          <table className={styles.benTable}>
            <thead>
              <tr>
                <th className={styles.benTh}>Name</th>
                <th className={styles.benTh}>Aadhaar</th>
                <th className={styles.benTh}>Mobile</th>
                <th className={styles.benTh}>Bank A/c</th>
                <th className={styles.benTh}>IFSC</th>
                <th className={styles.benTh}></th>
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map((b) => (
                <tr key={b.id} className={styles.benTr}>
                  <td className={styles.benTd}>{b.name}</td>
                  <td className={styles.benTd}>{'•'.repeat(8) + b.aadhaar.slice(-4)}</td>
                  <td className={styles.benTd}>{b.mobile}</td>
                  <td className={styles.benTd}>{b.bankAccount}</td>
                  <td className={styles.benTd}>{b.ifsc}</td>
                  <td className={styles.benTd}>
                    <button
                      type="button"
                      className={styles.benDeleteBtn}
                      onClick={() => handleDeleteBeneficiary(b.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderEmployeeSection = () => (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Employee Information</div>

      {/* Employee Type */}
      <div className={styles.field}>
        <label className={`${styles.label} ${styles.required}`}>Employee Type</label>
        <div className={styles.radioGroup}>
          {(['Permanent', 'Temporary', 'Contract'] as EmployeeType[]).map((t) => (
            <label key={t} className={styles.radioLabel}>
              <input
                type="radio"
                className={styles.radioInput}
                checked={empType === t}
                onChange={() => setEmpType(t)}
              />
              {t}
            </label>
          ))}
        </div>
        <Err field="empType" />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Name</label>
          <input
            className={`${styles.input} ${errors.empName ? styles.error : ''}`}
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            placeholder="Employee full name"
          />
          <Err field="empName" />
        </div>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Designation</label>
          <input
            className={`${styles.input} ${errors.empDesignation ? styles.error : ''}`}
            value={empDesignation}
            onChange={(e) => setEmpDesignation(e.target.value)}
            placeholder="e.g. Junior Engineer"
          />
          <Err field="empDesignation" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Department</label>
          <input
            className={`${styles.input} ${errors.empDept ? styles.error : ''}`}
            value={empDept}
            onChange={(e) => setEmpDept(e.target.value)}
            placeholder="e.g. Civil Works"
          />
          <Err field="empDept" />
        </div>
        <div className={styles.field}>
          <label className={`${styles.label} ${styles.required}`}>Mobile</label>
          <input
            className={`${styles.input} ${errors.empMobile ? styles.error : ''}`}
            value={empMobile}
            maxLength={10}
            onChange={(e) => setEmpMobile(e.target.value.replace(/\D/g, ''))}
            placeholder="10-digit mobile"
          />
          <Err field="empMobile" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={`${styles.input} ${errors.empEmail ? styles.error : ''}`}
            type="email"
            value={empEmail}
            onChange={(e) => setEmpEmail(e.target.value)}
            placeholder="employee@ulb.gov.in"
          />
          <Err field="empEmail" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>End Date</label>
          <input
            className={styles.input}
            type="date"
            value={empEndDate}
            onChange={(e) => setEmpEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* End-date auto-inactive hint */}
      {empEndDate && new Date(empEndDate) < new Date() && (
        <div className={styles.infoHint}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6" stroke="#1d4ed8" strokeWidth="1.4" />
            <path d="M8 5v4M8 11h.01" stroke="#1d4ed8" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className={styles.infoHintText}>
            End date is in the past. Status has been auto-set to <strong>Inactive</strong>.
          </span>
        </div>
      )}

      {/* Permanent-only fields */}
      {empType === 'Permanent' && (
        <div className={styles.row3}>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>KGID</label>
            <input
              className={`${styles.input} ${errors.empKgid ? styles.error : ''}`}
              value={empKgid}
              onChange={(e) => setEmpKgid(e.target.value)}
              placeholder="e.g. KG-2023-4501"
            />
            <Err field="empKgid" />
          </div>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>HRMS ID</label>
            <input
              className={`${styles.input} ${errors.empHrms ? styles.error : ''}`}
              value={empHrms}
              onChange={(e) => setEmpHrms(e.target.value)}
              placeholder="HRMS identifier"
            />
            <Err field="empHrms" />
          </div>
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>K2 ID</label>
            <input
              className={`${styles.input} ${errors.empK2 ? styles.error : ''}`}
              value={empK2}
              onChange={(e) => setEmpK2(e.target.value)}
              placeholder="K2 employee ID"
            />
            <Err field="empK2" />
          </div>
        </div>
      )}
    </div>
  );

  const renderStatutorySection = () => (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Statutory Information</div>

      <div className={styles.field}>
        <label className={`${styles.label} ${styles.required}`}>Statutory Payment Type</label>
        <select
          className={`${styles.select} ${errors.staPayType ? styles.error : ''}`}
          value={staPayType}
          onChange={(e) => setStaPayType(e.target.value as StatutoryPaymentType)}
        >
          <option value="">Select type…</option>
          {(['TDS', 'GST', 'Professional Tax', 'PF', 'ESI', 'Labour Cess'] as const).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <Err field="staPayType" />
      </div>

      {/* PAN */}
      <div className={styles.fetchRow}>
        <div className={`${styles.field} ${styles.fetchInput}`}>
          <label className={`${styles.label} ${styles.required}`}>PAN Number</label>
          <input
            className={`${styles.input} ${errors.staPan ? styles.error : ''}`}
            value={staPan}
            maxLength={10}
            onChange={(e) => setStaPan(e.target.value.toUpperCase())}
            placeholder="10-char PAN (e.g. AAAAB1234C)"
          />
          <Err field="staPan" />
        </div>
        <button
          type="button"
          className={styles.fetchBtn}
          onClick={handleFetchStaPAN}
          disabled={staPanFetching || !staPan}
          style={{ marginBottom: errors.staPan ? '1.25rem' : '0' }}
        >
          {staPanFetching ? 'Fetching…' : 'Validate'}
        </button>
      </div>
      {(staPanName || staPanStatus) && (
        <div className={styles.fetchResult}>
          <div className={styles.fetchResultItem}>
            <span className={styles.fetchResultLabel}>Entity Name</span>
            <span className={styles.fetchResultValue}>{staPanName}</span>
          </div>
          <div className={styles.fetchResultItem}>
            <span className={styles.fetchResultLabel}>PAN Status</span>
            <span className={styles.fetchResultValue}>{staPanStatus}</span>
          </div>
        </div>
      )}

      {renderAddressFields(
        staAddress,
        setStaAddress as (fn: (prev: AddressContact) => AddressContact) => void,
        'sta',
        staOtpSent,
        setStaOtpSent,
      )}

      {renderBankFields(
        staBank,
        setStaBank as (fn: (prev: BankInfo) => BankInfo) => void,
        staConfirmAcct,
        setStaConfirmAcct,
        staIfscFetching,
        handleFetchStaIFSC,
        'sta',
      )}

      {renderGSTFields(
        staGST,
        setStaGST as (fn: (prev: GSTInfo) => GSTInfo) => void,
        staGstFetching,
        handleFetchStaGST,
        'sta',
      )}
    </div>
  );

  const renderVendorSection = () => (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Vendor Information</div>

      {/* PAN */}
      <div className={styles.fetchRow}>
        <div className={`${styles.field} ${styles.fetchInput}`}>
          <label className={`${styles.label} ${styles.required}`}>PAN Number</label>
          <input
            className={`${styles.input} ${errors.venPan ? styles.error : ''}`}
            value={venPan}
            maxLength={10}
            onChange={(e) => setVenPan(e.target.value.toUpperCase())}
            placeholder="10-char PAN (e.g. AAAAB1234C)"
          />
          <Err field="venPan" />
        </div>
        <button
          type="button"
          className={styles.fetchBtn}
          onClick={handleFetchVenPAN}
          disabled={venPanFetching || !venPan}
          style={{ marginBottom: errors.venPan ? '1.25rem' : '0' }}
        >
          {venPanFetching ? 'Fetching…' : 'Validate'}
        </button>
      </div>
      {(venPanName || venPanStatus) && (
        <div className={styles.fetchResult}>
          <div className={styles.fetchResultItem}>
            <span className={styles.fetchResultLabel}>Entity Name</span>
            <span className={styles.fetchResultValue}>{venPanName}</span>
          </div>
          <div className={styles.fetchResultItem}>
            <span className={styles.fetchResultLabel}>PAN Status</span>
            <span className={styles.fetchResultValue}>{venPanStatus}</span>
          </div>
        </div>
      )}

      {/* MSME */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>MSME Registered</label>
          <div className={styles.radioGroup}>
            {(['Yes', 'No'] as const).map((v) => (
              <label key={v} className={styles.radioLabel}>
                <input
                  type="radio"
                  className={styles.radioInput}
                  checked={venMsme === v}
                  onChange={() => setVenMsme(v)}
                />
                {v}
              </label>
            ))}
          </div>
        </div>
        {venMsme === 'Yes' && (
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.required}`}>Udyam Registration No.</label>
            <input
              className={`${styles.input} ${errors.venUdyam ? styles.error : ''}`}
              value={venUdyam}
              onChange={(e) => setVenUdyam(e.target.value)}
              placeholder="UDYAM-XX-00-0000000"
            />
            <Err field="venUdyam" />
          </div>
        )}
      </div>

      {/* K2 + PFMS */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>K2 Recipient ID</label>
          <input
            className={styles.input}
            value={venK2}
            onChange={(e) => setVenK2(e.target.value)}
            placeholder="e.g. K2-REC-001"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>PFMS Vendor ID</label>
          <input
            className={styles.input}
            value={venPfms}
            onChange={(e) => setVenPfms(e.target.value)}
            placeholder="e.g. PFMS-VEN-9001"
          />
        </div>
      </div>

      {renderAddressFields(
        venAddress,
        setVenAddress as (fn: (prev: AddressContact) => AddressContact) => void,
        'ven',
        venOtpSent,
        setVenOtpSent,
      )}

      {renderBankFields(
        venBank,
        setVenBank as (fn: (prev: BankInfo) => BankInfo) => void,
        venConfirmAcct,
        setVenConfirmAcct,
        venIfscFetching,
        handleFetchVenIFSC,
        'ven',
      )}

      {renderGSTFields(
        venGST,
        setVenGST as (fn: (prev: GSTInfo) => GSTInfo) => void,
        venGstFetching,
        handleFetchVenGST,
        'ven',
      )}
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  const isEdit = !!vendor;
  const title = isEdit ? `Edit — ${vendor.payeeCode}` : 'Create Vendor / Payee';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="xl"
        closeOnOverlayClick={false}
        footer={
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.submitBtn} onClick={handleSaveClick}>Save Details</button>
          </div>
        }
      >
        <div className={styles.formBody}>
          {/* ── Section 1: Common ── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Common Details</div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={`${styles.label} ${styles.required}`}>Date</label>
                <input
                  className={`${styles.input} ${errors.date ? styles.error : ''}`}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Err field="date" />
              </div>

              <div className={styles.field}>
                <label className={`${styles.label} ${styles.required}`}>Payee Type</label>
                <select
                  className={`${styles.select} ${errors.payeeType ? styles.error : ''}`}
                  value={payeeType}
                  disabled={isEdit}
                  onChange={(e) => setPayeeType(e.target.value as PayeeType)}
                >
                  <option value="">Select payee type…</option>
                  <option value="Beneficiary">Beneficiary</option>
                  <option value="Employee">Employee</option>
                  <option value="Statutory">Statutory</option>
                  <option value="Vendor">Vendor</option>
                </select>
                <Err field="payeeType" />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <div className={styles.radioGroup}>
                  {(['Active', 'Inactive'] as VendorStatus[]).map((s) => (
                    <label key={s} className={styles.radioLabel}>
                      <input
                        type="radio"
                        className={styles.radioInput}
                        checked={status === s}
                        onChange={() => setStatus(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Payee Code</label>
                {payeeCode ? (
                  <div className={styles.payeeCodeBox}>
                    <span className={styles.payeeCodeLabel}>Auto-generated</span>
                    <span className={styles.payeeCodeValue}>{payeeCode}</span>
                  </div>
                ) : (
                  <div className={styles.payeeCodeBox}>
                    <span className={styles.payeeCodeEmpty}>Select Payee Type to generate</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: Conditional ── */}
          {payeeType === 'Beneficiary' && renderBeneficiarySection()}
          {payeeType === 'Employee' && renderEmployeeSection()}
          {payeeType === 'Statutory' && renderStatutorySection()}
          {payeeType === 'Vendor' && renderVendorSection()}
        </div>
      </Modal>

      {/* Confirm save */}
      <ConfirmSaveModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default VendorModal;
