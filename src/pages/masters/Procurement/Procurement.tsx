import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Breadcrumb, useToast } from '../../../components/common';
import ProcurementList from './ProcurementList';
import ProcurementForm from './ProcurementForm';
import { PROC_SEED, generateProcurementId } from './data';
import type { ProcurementRecord } from './types';

type View = 'list' | 'form';
type FormMode = 'create' | 'edit' | 'view' | 'update';

const Procurement: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<ProcurementRecord[]>(PROC_SEED);
  const [view, setView] = useState<View>('list');
  const [activeRecord, setActiveRecord] = useState<ProcurementRecord | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('create');

  const readOnly = role === 'ULB_ADMIN';

  const handleCreateNew = () => {
    setActiveRecord(null);
    setFormMode('create');
    setView('form');
  };

  const handleView = (r: ProcurementRecord) => {
    setActiveRecord(r);
    setFormMode('view');
    setView('form');
  };

  const handleEdit = (r: ProcurementRecord) => {
    setActiveRecord(r);
    setFormMode('edit');
    setView('form');
  };

  const handleUpdate = (r: ProcurementRecord) => {
    setActiveRecord(r);
    setFormMode('update');
    setView('form');
  };

  const handleCancel = () => {
    setView('list');
  };

  const handleSave = (record: ProcurementRecord, isDraft: boolean) => {
    if (record.id) {
      setRecords(prev => prev.map(r => r.id === record.id ? record : r));
    } else {
      setRecords(prev => [...prev, { ...record, id: generateProcurementId() }]);
    }
    setView('list');
    showToast(
      isDraft ? 'Draft saved successfully' : 'Work order submitted successfully',
      'success',
    );
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Masters' },
          { label: 'Procurement' },
        ]}
      />
      {view === 'list' ? (
        <ProcurementList
          records={records}
          onView={handleView}
          onEdit={handleEdit}
          onUpdate={handleUpdate}
          onCreateNew={handleCreateNew}
          readOnly={readOnly}
        />
      ) : (
        <ProcurementForm
          record={activeRecord}
          mode={formMode}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Procurement;
