import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Complaint } from '../types/complaint';
import { getLocalComplaints } from './complaintService';

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  // Save locally first
  try {
    localStorage.setItem(`cg_user_${profile.userId}`, JSON.stringify(profile));
  } catch (err) {
    console.warn('Could not cache user profile locally:', err);
  }

  // Attempt Firestore sync with 4s timeout
  try {
    const docRef = doc(db, 'users', profile.userId);
    const syncPromise = setDoc(docRef, profile, { merge: true });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile sync timed out')), 4000)
    );
    await Promise.race([syncPromise, timeoutPromise]);
  } catch (error) {
    console.warn(
      `[Campus Guard] Remote profile sync bypassed (${error instanceof Error ? error.message : String(error)}). Saved in local session.`
    );
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Check local cache
  let localProfile: UserProfile | null = null;
  try {
    const raw = localStorage.getItem(`cg_user_${userId}`);
    if (raw) localProfile = JSON.parse(raw);
  } catch {
    // Ignore error
  }

  // Attempt Firestore fetch
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      try {
        localStorage.setItem(`cg_user_${userId}`, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch (error) {
    console.warn(
      `[Campus Guard] Remote profile fetch bypassed (${error instanceof Error ? error.message : String(error)}).`
    );
  }

  return localProfile;
}

export async function fetchComplaintsByUserId(userId: string): Promise<Complaint[]> {
  const localItems = getLocalComplaints().filter((c) => c.userId === userId);

  try {
    const q = query(collection(db, 'complaints'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const remoteItems = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));

    const map = new Map<string, Complaint>();
    remoteItems.forEach((c) => map.set(c.complaintId, c));
    localItems.forEach((c) => {
      if (!map.has(c.complaintId)) map.set(c.complaintId, c);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.warn(
      `[Campus Guard] Remote user complaints query bypassed (${error instanceof Error ? error.message : String(error)}). Returning local complaints.`
    );
    return localItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
