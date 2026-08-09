import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { PatientRecord, AuditLogItem } from '../types/health';

const PATIENTS_COLLECTION = 'patientRecords';
const AUDIT_COLLECTION = 'auditLogs';

/**
 * Subscribe to real-time updates for patient records from Firestore
 */
export function subscribePatientRecords(
  onData: (records: PatientRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PATIENTS_COLLECTION);
  
  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: PatientRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as PatientRecord);
      });
      // Sort newest registration date or updatedAt first
      records.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.registrationDate).getTime();
        const dateB = new Date(b.updatedAt || b.registrationDate).getTime();
        return dateB - dateA;
      });
      onData(records);
    },
    (error) => {
      console.error('Firestore patientRecords subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribe to real-time updates for audit logs from Firestore
 */
export function subscribeAuditLogs(
  onData: (logs: AuditLogItem[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, AUDIT_COLLECTION);
  
  return onSnapshot(
    colRef,
    (snapshot) => {
      const logs: AuditLogItem[] = [];
      snapshot.forEach((docSnap) => {
        logs.push(docSnap.data() as AuditLogItem);
      });
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(logs);
    },
    (error) => {
      console.error('Firestore auditLogs subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save or update a patient record in Firestore
 */
export async function savePatientRecordToFirestore(record: PatientRecord): Promise<void> {
  const docRef = doc(db, PATIENTS_COLLECTION, record.id);
  const recordToSave: PatientRecord = {
    ...record,
    syncStatus: 'synced',
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, recordToSave, { merge: true });
}

/**
 * Delete a patient record from Firestore
 */
export async function deletePatientRecordFromFirestore(recordId: string): Promise<void> {
  const docRef = doc(db, PATIENTS_COLLECTION, recordId);
  await deleteDoc(docRef);
}

/**
 * Add an audit log item to Firestore
 */
export async function saveAuditLogToFirestore(log: AuditLogItem): Promise<void> {
  const docRef = doc(db, AUDIT_COLLECTION, log.id);
  await setDoc(docRef, log, { merge: true });
}

/**
 * Seed initial records if Firestore is completely empty on first launch
 */
export async function seedInitialDataIfEmpty(initialRecords: PatientRecord[]): Promise<void> {
  try {
    const colRef = collection(db, PATIENTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialRecords.length > 0) {
      console.log('Seeding initial patient records to Firestore...');
      for (const record of initialRecords) {
        const docRef = doc(db, PATIENTS_COLLECTION, record.id);
        await setDoc(docRef, { ...record, syncStatus: 'synced' });
      }
    }
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
  }
}
