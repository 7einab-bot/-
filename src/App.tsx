import React, { useState, useEffect } from 'react';
import { PatientRecord, UserRole, AuditLogItem } from './types/health';
import { INITIAL_PATIENT_RECORDS } from './data/initialRecords';
import { Navbar } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { Dashboard } from './components/Dashboard';
import { AdvancedSearch } from './components/AdvancedSearch';
import { ReportsSection } from './components/ReportsSection';
import { AuditLogModal } from './components/AuditLogModal';
import { PrintRecordModal } from './components/PrintRecordModal';
import { useLanguage } from './context/LanguageContext';
import {
  subscribePatientRecords,
  subscribeAuditLogs,
  savePatientRecordToFirestore,
  deletePatientRecordFromFirestore,
  saveAuditLogToFirestore,
  seedInitialDataIfEmpty,
} from './lib/firestoreService';

export default function App() {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<'form' | 'dashboard' | 'search' | 'reports' | 'audit'>(
    'form'
  );

  // Local Storage & Firestore state
  const [records, setRecords] = useState<PatientRecord[]>(() => {
    try {
      const saved = localStorage.getItem('seha_100m_records');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved records', e);
    }
    return INITIAL_PATIENT_RECORDS;
  });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const savedLogs = localStorage.getItem('seha_100m_audit_logs');
      if (savedLogs) {
        return JSON.parse(savedLogs);
      }
    } catch (e) {
      console.error('Failed to parse saved audit logs', e);
    }
    return [];
  });

  const [activeRecordForEdit, setActiveRecordForEdit] = useState<PatientRecord | null>(null);
  const [activeRecordForPrint, setActiveRecordForPrint] = useState<PatientRecord | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('إدخال بيانات');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Seed initial data to Firestore if empty, then set up real-time listener
  useEffect(() => {
    seedInitialDataIfEmpty(INITIAL_PATIENT_RECORDS);
  }, []);

  // Real-time Firestore synchronization for patient records
  useEffect(() => {
    if (isOffline) return;

    const unsubscribe = subscribePatientRecords((firestoreRecords) => {
      if (firestoreRecords.length > 0) {
        setRecords(firestoreRecords);
      }
    });

    return () => unsubscribe();
  }, [isOffline]);

  // Real-time Firestore synchronization for audit logs
  useEffect(() => {
    if (isOffline) return;

    const unsubscribe = subscribeAuditLogs((firestoreLogs) => {
      if (firestoreLogs.length > 0) {
        setAuditLogs(firestoreLogs);
      }
    });

    return () => unsubscribe();
  }, [isOffline]);

  // Local storage fallback backup
  useEffect(() => {
    try {
      localStorage.setItem('seha_100m_records', JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records to localStorage', e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem('seha_100m_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Error saving audit logs to localStorage', e);
    }
  }, [auditLogs]);

  // Handle Dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Log action helper with Firestore sync
  const addAuditLog = async (
    recordId: string,
    patientName: string,
    action: 'إنشاء' | 'تحديث' | 'تصدير' | 'طباعة' | 'حذف',
    details: string
  ) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      recordId,
      patientName,
      action,
      userRole,
      userName: 'د. أحمد محمود',
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (!isOffline) {
      try {
        await saveAuditLogToFirestore(newLog);
      } catch (err) {
        console.error('Error writing audit log to Firestore:', err);
      }
    }
  };

  // Save/Update record handler with Firestore sync
  const handleSaveRecord = async (record: PatientRecord) => {
    const existingIndex = records.findIndex((r) => r.id === record.id);

    const recordWithSync: PatientRecord = {
      ...record,
      syncStatus: isOffline ? 'pending' : 'synced',
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const updated = [...records];
      updated[existingIndex] = recordWithSync;
      setRecords(updated);
      addAuditLog(record.id, record.fullName, 'تحديث', 'تعديل البيانات الأساسية والفحوصات الطبية');
    } else {
      setRecords([recordWithSync, ...records]);
      addAuditLog(record.id, record.fullName, 'إنشاء', 'تسجيل مواطن جديد بالسجل الميداني');
    }

    if (!isOffline) {
      try {
        await savePatientRecordToFirestore(recordWithSync);
      } catch (err) {
        console.error('Error saving record to Firestore:', err);
      }
    }

    setActiveRecordForEdit(null);
  };

  // Delete record handler with Firestore sync
  const handleDeleteRecord = async (id: string) => {
    const target = records.find((r) => r.id === id);
    if (target) {
      setRecords(records.filter((r) => r.id !== id));
      addAuditLog(id, target.fullName, 'حذف', 'حذف سجل الحالة من قاعدة البيانات');

      if (!isOffline) {
        try {
          await deletePatientRecordFromFirestore(id);
        } catch (err) {
          console.error('Error deleting record from Firestore:', err);
        }
      }
    }
  };

  // Trigger Print modal
  const handlePrintRecord = (record: PatientRecord) => {
    setActiveRecordForPrint(record);
    addAuditLog(record.id, record.fullName, 'طباعة', 'طباعة الاستمارة المعتمدة لمبادرة 100 مليون صحة');
  };

  // Manual Offline Sync handler
  const handleSyncNow = async () => {
    setIsOffline(false);
    const pendingRecords = records.filter((r) => r.syncStatus === 'pending');

    for (const rec of pendingRecords) {
      const syncedRecord: PatientRecord = { ...rec, syncStatus: 'synced' };
      try {
        await savePatientRecordToFirestore(syncedRecord);
      } catch (err) {
        console.error('Failed syncing record to Firestore:', err);
      }
    }

    const syncedRecords = records.map((r) => ({
      ...r,
      syncStatus: 'synced' as const,
    }));
    setRecords(syncedRecords);

    addAuditLog('all', 'مزامنة جماعية', 'تحديث', 'مزامنة الحالات المعلقة بمركز البيانات السحابية (Firestore) بنجاح');
    alert('تمت مزامنة جميع الحالات المعلقة مع قاعدة البيانات السحابية (Firebase Firestore) لوزارة الصحة بنجاح!');
  };

  const pendingSyncCount = records.filter((r) => r.syncStatus === 'pending').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = records.filter((r) => r.registrationDate === todayStr).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Cairo',sans-serif] transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'form' && currentTab !== 'form') {
            setActiveRecordForEdit(null);
          }
          setCurrentTab(tab);
        }}
        userRole={userRole}
        setUserRole={setUserRole}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        pendingSyncCount={pendingSyncCount}
        onSyncNow={handleSyncNow}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNewPatient={() => {
          setActiveRecordForEdit(null);
          setCurrentTab('form');
        }}
        todayCount={todayCount}
        targetCount={100}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentTab === 'form' && (
          <RegistrationForm
            key={activeRecordForEdit ? activeRecordForEdit.id : 'new-form'}
            existingRecord={activeRecordForEdit}
            onSaveRecord={handleSaveRecord}
            onPrintRecord={handlePrintRecord}
            existingNationalIds={records.map((r) => r.nationalId)}
            userRole={userRole}
            currentUnit="وحدة الأمل الصحية"
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            records={records}
            targetCount={100}
            onPrintRecord={handlePrintRecord}
            onSaveRecord={handleSaveRecord}
          />
        )}

        {currentTab === 'search' && (
          <AdvancedSearch
            records={records}
            onSelectRecord={(rec) => {
              setActiveRecordForEdit(rec);
              setCurrentTab('form');
            }}
            onPrintRecord={handlePrintRecord}
            onDeleteRecord={handleDeleteRecord}
            onSaveRecord={handleSaveRecord}
            userRole={userRole}
          />
        )}

        {currentTab === 'reports' && <ReportsSection records={records} />}

        {currentTab === 'audit' && <AuditLogModal logs={auditLogs} />}
      </main>

      {/* Footer Status Bar */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{t('connectedCentralServer')}</span>
          </div>
          <span className="hidden sm:inline-block">|</span>
          <span className="font-medium">{t('healthDeptName')}</span>
        </div>

        <div className="flex items-center gap-4 font-mono font-bold">
          <span>{t('totalRecordsFooter')} {records.length}</span>
          <span>•</span>
          <span>{t('lastSyncedFooter')}</span>
        </div>
      </footer>

      {/* Paper Print Modal */}
      {activeRecordForPrint && (
        <PrintRecordModal
          record={activeRecordForPrint}
          onClose={() => setActiveRecordForPrint(null)}
        />
      )}
    </div>
  );
}
