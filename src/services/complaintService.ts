import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Complaint, ComplaintStatus, UrgencyLevel, StatusHistoryItem } from '../types/complaint';

const STORAGE_KEY = 'cg_complaints_cache';

export const DEFAULT_DEMO_COMPLAINTS: Complaint[] = [
  {
    complaintId: 'CG-2026-DEMO1',
    issueTitle: 'Ceiling fan making loud grinding noise and vibrating in Room 204',
    description:
      'The center ceiling fan in Room 204 makes an intense clicking and scraping sound at speeds above 2. It wobbles visibly and poses a distraction during ongoing lectures.',
    category: 'Electrical',
    aiCategory: 'Electrical',
    urgency: 'High',
    department: 'Electrical Department',
    aiReason:
      'Ceiling fan motor defect and vibration indicates bearing wear; high urgency due to lecture hall safety.',
    aiConfidence: 94,
    building: 'Academic Block',
    floor: 'Second Floor',
    roomArea: 'Room 204 (Lecture Hall)',
    status: 'In Progress',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav.sharma@campus.edu',
    studentRollNo: '22EE041',
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        note: 'Logged via Campus Guard intake.',
        updatedBy: 'Student Portal',
      },
      {
        status: 'Under Review',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
        note: 'Triage officer reviewed reported video & sound defect.',
        updatedBy: 'Facilities Office',
      },
      {
        status: 'Assigned',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        note: 'Assigned to Electrician Team Beta for capacitor and blade replacement.',
        updatedBy: 'Duty Engineer',
      },
      {
        status: 'In Progress',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        note: 'Electrician on site with replacement capacitor and safety ladder.',
        updatedBy: 'Duty Electrician',
      },
    ],
  },
  {
    complaintId: 'CG-2026-DEMO2',
    issueTitle: 'Continuous water leakage under sink in 1st Floor washroom',
    description:
      'The pipe connection below the middle basin has slipped and water is constantly pooling on the floor tiles, making the entry slippery and wasting fresh water.',
    category: 'Plumbing',
    aiCategory: 'Plumbing',
    urgency: 'High',
    department: 'Plumbing & Water Maintenance',
    aiReason: 'Fresh water pooling and slippery tile hazards detected in sanitary block.',
    aiConfidence: 96,
    building: 'Administrative Block',
    floor: 'First Floor',
    roomArea: 'Faculty Washroom',
    status: 'Assigned',
    studentName: 'Priya Patel',
    studentEmail: 'priya.patel@campus.edu',
    studentRollNo: '23CE012',
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 60000).toISOString(),
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
        note: 'Reported by staff member.',
      },
      {
        status: 'Under Review',
        timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
        note: 'Flagged for quick resolution before evening footfall.',
      },
      {
        status: 'Assigned',
        timestamp: new Date(Date.now() - 80 * 60000).toISOString(),
        note: 'Assigned to Plumber M. Kumar with PVC connector kit.',
        updatedBy: 'Maintenance Lead',
      },
    ],
  },
  {
    complaintId: 'CG-2026-DEMO3',
    issueTitle: 'Broken wooden bench armrest with protruding screw in Lab 3',
    description:
      'Right armrest of bench 14 is cracked in half with a rusty nail exposed. Needs wooden replacement or immediate removal to prevent clothing tears or scratches.',
    category: 'Furniture',
    aiCategory: 'Furniture',
    urgency: 'Medium',
    department: 'Maintenance Department',
    aiReason: 'Damaged classroom furniture with sharp screw exposure.',
    aiConfidence: 91,
    building: 'Mechanical Lab',
    floor: 'Ground Floor',
    roomArea: 'Computer Lab 3 (Bench 14)',
    status: 'Submitted',
    studentName: 'Rohan Verma',
    studentEmail: 'rohan.v@campus.edu',
    studentRollNo: '21ME098',
    isDemo: true,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        note: 'Submitted by student after practical class.',
      },
    ],
  },
  {
    complaintId: 'CG-2026-DEMO4',
    issueTitle: 'Wi-Fi access point SSID dropping intermittently in Library 2nd Floor',
    description:
      'Campus_Secure Wi-Fi signal drops every 5 minutes in the quiet study zone of the central library. Multiple students cannot access research repositories.',
    category: 'Network / Internet',
    aiCategory: 'Network / Internet',
    urgency: 'Medium',
    department: 'IT & Network Services',
    aiReason: 'Wireless AP disconnection and intermittent connectivity in library hall.',
    aiConfidence: 97,
    building: 'Library',
    floor: 'Second Floor',
    roomArea: 'Quiet Study Hall (North Wing)',
    status: 'Resolved',
    studentName: 'Neha Sen',
    studentEmail: 'neha.sen@campus.edu',
    studentRollNo: '24CS119',
    isDemo: true,
    createdAt: new Date(Date.now() - 360 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
        note: 'Reported during exam prep week.',
      },
      {
        status: 'Under Review',
        timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
        note: 'IT Helpdesk verified packet drop on AP-LIB-04.',
      },
      {
        status: 'In Progress',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        note: 'Re-flashing firmware and replacing PoE injector on AP-LIB-04.',
        updatedBy: 'NOC Engineer',
      },
      {
        status: 'Resolved',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        note: 'PoE injector replaced. Wi-Fi throughput back to 100Mbps. Verified by library staff.',
        updatedBy: 'Network Admin',
      },
    ],
  },
];

// Local cache retrieval
export function getLocalComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_COMPLAINTS));
      return DEFAULT_DEMO_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_DEMO_COMPLAINTS;
  } catch (err) {
    console.warn('Could not read complaints from localStorage:', err);
    return DEFAULT_DEMO_COMPLAINTS;
  }
}

// Local cache saver
export function saveLocalComplaint(complaint: Complaint): void {
  try {
    const current = getLocalComplaints();
    const existingIndex = current.findIndex((c) => c.complaintId === complaint.complaintId);
    let updated: Complaint[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = complaint;
    } else {
      updated = [complaint, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save complaint to localStorage:', err);
  }
}

export function generateComplaintId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CG-2026-${rand}`;
}

export async function submitComplaint(
  data: Omit<Complaint, 'complaintId' | 'status' | 'createdAt' | 'updatedAt' | 'statusHistory'>
): Promise<Complaint> {
  const complaintId = generateComplaintId();
  const now = new Date().toISOString();

  const initialHistory: StatusHistoryItem = {
    status: 'Submitted',
    timestamp: now,
    note: 'Complaint registered by student and logged into campus triage system.',
    updatedBy: data.studentName || 'Student Reporter',
  };

  const newComplaint: Complaint = {
    ...data,
    complaintId,
    status: 'Submitted',
    createdAt: now,
    updatedAt: now,
    statusHistory: [initialHistory],
  };

  // 1. Immediately store in local persistence cache
  saveLocalComplaint(newComplaint);

  // 2. Synchronize to Firestore with 4s timeout
  const path = `complaints/${complaintId}`;
  try {
    const docRef = doc(db, 'complaints', complaintId);
    const writePromise = setDoc(docRef, newComplaint);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), 4000)
    );
    await Promise.race([writePromise, timeoutPromise]);
    console.log(`[Campus Guard] Complaint ${complaintId} successfully synced to Firestore.`);
  } catch (error) {
    console.warn(
      `[Campus Guard] Firestore sync skipped or pending rules publication (${error instanceof Error ? error.message : String(error)}). Complaint safely preserved in local storage cache.`
    );
  }

  return newComplaint;
}

export async function fetchComplaintById(complaintId: string): Promise<Complaint | null> {
  const cleanId = complaintId.trim().toUpperCase();

  // Check local cache first
  const localList = getLocalComplaints();
  const foundLocal = localList.find((c) => c.complaintId.toUpperCase() === cleanId);

  // Attempt Firestore fetch with 4s timeout
  try {
    const docRef = doc(db, 'complaints', cleanId);
    const fetchPromise = getDoc(docRef);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore get timed out')), 4000)
    );
    const snap = await Promise.race([fetchPromise, timeoutPromise]);

    if (snap.exists()) {
      const remoteData = { id: snap.id, ...snap.data() } as Complaint;
      saveLocalComplaint(remoteData);
      return remoteData;
    }
  } catch (err) {
    console.warn(
      `[Campus Guard] Remote Firestore lookup for ${cleanId} bypassed (${err instanceof Error ? err.message : String(err)}). Returning local cached record.`
    );
  }

  return foundLocal || null;
}

export async function fetchAllComplaints(): Promise<Complaint[]> {
  const localItems = getLocalComplaints();

  try {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const fetchPromise = getDocs(q);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore list timed out')), 4000)
    );
    const snap = await Promise.race([fetchPromise, timeoutPromise]);

    const remoteItems = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));

    // Merge remote and local without duplicates
    const map = new Map<string, Complaint>();
    remoteItems.forEach((c) => map.set(c.complaintId, c));
    localItems.forEach((c) => {
      if (!map.has(c.complaintId)) {
        map.set(c.complaintId, c);
      }
    });

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.warn(
      `[Campus Guard] Firestore list fetch bypassed (${error instanceof Error ? error.message : String(error)}). Serving local complaints.`
    );
    return localItems;
  }
}

export function subscribeToComplaints(
  onUpdate: (complaints: Complaint[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  // Immediately emit local complaints so the UI renders instantly
  const localItems = getLocalComplaints();
  onUpdate(localItems);

  const path = 'complaints';
  const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));

  try {
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteItems = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));
        const localCurrent = getLocalComplaints();
        const map = new Map<string, Complaint>();
        remoteItems.forEach((c) => map.set(c.complaintId, c));
        localCurrent.forEach((c) => {
          if (!map.has(c.complaintId)) {
            map.set(c.complaintId, c);
          }
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        onUpdate(merged);
      },
      (error) => {
        console.warn(
          `[Campus Guard] Firestore realtime snapshot listener bypassed (${error.message}). Continuing with local data layer.`
        );
        onUpdate(getLocalComplaints());
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.warn('[Campus Guard] Could not attach Firestore snapshot listener:', e);
    return () => {};
  }
}

export async function updateComplaintState(
  complaintId: string,
  updates: {
    status?: ComplaintStatus;
    department?: string;
    urgency?: UrgencyLevel;
    note?: string;
    updatedBy?: string;
  }
): Promise<void> {
  const cleanId = complaintId.trim().toUpperCase();
  const localList = getLocalComplaints();
  const target = localList.find((c) => c.complaintId === cleanId);

  const now = new Date().toISOString();
  const currentHistory = target?.statusHistory ? [...target.statusHistory] : [];
  const newStatus = updates.status || target?.status || 'Under Review';

  const historyItem: StatusHistoryItem = {
    status: newStatus,
    timestamp: now,
    note: updates.note || `Status modified to ${newStatus}`,
    updatedBy: updates.updatedBy || 'Campus Administrator',
  };
  currentHistory.push(historyItem);

  const updatedComplaint: Complaint = {
    ...(target || {
      complaintId: cleanId,
      issueTitle: 'Campus Issue',
      description: '',
      category: 'Other',
      urgency: 'Medium',
      department: updates.department || 'General Campus Administration',
      building: 'Campus',
      floor: 'Ground',
      roomArea: 'Facility',
      status: newStatus,
      createdAt: now,
      updatedAt: now,
    }),
    updatedAt: now,
    statusHistory: currentHistory,
    ...(updates.status ? { status: updates.status } : {}),
    ...(updates.department ? { department: updates.department } : {}),
    ...(updates.urgency ? { urgency: updates.urgency } : {}),
  };

  // 1. Immediately save updated complaint in local cache
  saveLocalComplaint(updatedComplaint);

  // 2. Attempt remote Firestore update
  try {
    const docRef = doc(db, 'complaints', cleanId);
    const updatePayload: Partial<Complaint> = {
      updatedAt: now,
      statusHistory: currentHistory,
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.department ? { department: updates.department } : {}),
      ...(updates.urgency ? { urgency: updates.urgency } : {}),
    };
    await updateDoc(docRef, updatePayload);
    console.log(`[Campus Guard] Complaint ${cleanId} update synced to Firestore.`);
  } catch (error) {
    console.warn(
      `[Campus Guard] Firestore update bypassed (${error instanceof Error ? error.message : String(error)}). Locally updated with audit trail.`
    );
  }
}

export async function seedDemoComplaints(): Promise<void> {
  // Save demo complaints to local cache
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_COMPLAINTS));

  // Attempt Firestore sync
  for (const item of DEFAULT_DEMO_COMPLAINTS) {
    try {
      const docRef = doc(db, 'complaints', item.complaintId);
      await setDoc(docRef, item);
    } catch {
      // Ignored for offline/permission fallback
    }
  }
}
