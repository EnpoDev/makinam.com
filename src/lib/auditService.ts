import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, cleanFirestoreDoc } from './firebase';

export interface AuditLog {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  targetId?: string;
  targetType: 'listing' | 'user' | 'application' | 'category' | 'setting';
  timestamp: any;
  createdAtIso?: string;
}

/**
 * Logs an administrative action to Firestore.
 */
export async function logAdminAction(
  action: string,
  description: string,
  performedBy: string,
  targetType: 'listing' | 'user' | 'application' | 'category' | 'setting',
  targetId?: string
) {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const logRef = doc(db, 'audit_logs', logId);

    const logData = cleanFirestoreDoc({
      id: logId,
      action,
      description,
      performedBy,
      targetId: targetId || '',
      targetType,
      timestamp: serverTimestamp(),
      createdAtIso: new Date().toISOString()
    });

    await setDoc(logRef, logData);
  } catch (err) {
    console.warn('Audit log kaydedilemedi:', err);
  }
}

/**
 * Real-time subscription to the latest audit logs.
 */
export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void, maxCount = 20) {
  const colRef = collection(db, 'audit_logs');
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(maxCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLog[] = [];
      snapshot.forEach((d) => {
        logs.push(d.data() as AuditLog);
      });
      callback(logs);
    },
    (err) => {
      console.warn('Audit logs okuma uyarısı:', err);
      callback([]);
    }
  );
}
