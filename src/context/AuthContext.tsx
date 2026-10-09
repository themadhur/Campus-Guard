import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types/complaint';
import { getUserProfile, saveUserProfile } from '../services/userService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isDemoAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    studentId?: string,
    department?: string
  ) => Promise<void>;
  loginAsDemoStudent: () => Promise<void>;
  signOut: () => Promise<void>;
  enableDemoAdmin: () => void;
  disableDemoAdmin: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isDemoAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  loginAsDemoStudent: async () => {},
  signOut: async () => {},
  enableDemoAdmin: () => {},
  disableDemoAdmin: () => {},
  refreshProfile: async () => {},
});

const DESIGNATED_ADMIN_EMAIL = 'madhurnous@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(() => {
    return localStorage.getItem('cg_demo_admin') === 'true';
  });

  const loadOrCreateProfile = async (firebaseUser: User, extraInfo?: { studentId?: string; department?: string }) => {
    try {
      let existing = await getUserProfile(firebaseUser.uid);
      if (!existing) {
        const now = new Date().toISOString();
        const isAdm =
          Boolean(firebaseUser.email && firebaseUser.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) ||
          isDemoAdmin;

        const newProfile: UserProfile = {
          userId: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Campus Student',
          email: firebaseUser.email || '',
          studentId: extraInfo?.studentId || 'STU-2026-' + Math.floor(1000 + Math.random() * 9000),
          department: extraInfo?.department || 'General Academic',
          role: isAdm ? 'admin' : 'student',
          createdAt: now,
          updatedAt: now,
        };
        await saveUserProfile(newProfile);
        setProfile(newProfile);
      } else {
        setProfile(existing);
      }
    } catch (err) {
      console.warn('Could not load user profile from Firestore:', err);
      // Fallback local memory profile so user is not blocked
      setProfile({
        userId: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Campus Student',
        email: firebaseUser.email || '',
        studentId: extraInfo?.studentId || 'STU-2026-AUTO',
        department: extraInfo?.department || 'General',
        role: 'student',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadOrCreateProfile(currentUser);
      } else {
        // Check for local demo student session
        const demoStored = localStorage.getItem('cg_demo_student');
        if (demoStored) {
          try {
            const parsed = JSON.parse(demoStored);
            setProfile(parsed);
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await loadOrCreateProfile(cred.user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await loadOrCreateProfile(cred.user);
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    studentId?: string,
    department?: string
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName });
      await loadOrCreateProfile(cred.user, { studentId, department });
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  const loginAsDemoStudent = async () => {
    const demoStudent: UserProfile = {
      userId: 'student_demo_' + Date.now().toString().slice(-5),
      displayName: 'Alex Rivers (Demo Student)',
      email: 'alex.rivers@campus.edu',
      studentId: 'STU-2026-4421',
      department: 'Computer Science & Engineering',
      role: 'student',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('cg_demo_student', JSON.stringify(demoStudent));
    setProfile(demoStudent);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('cg_demo_student');
      localStorage.removeItem('cg_demo_admin');
      setIsDemoAdmin(false);
      setProfile(null);
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const enableDemoAdmin = () => {
    setIsDemoAdmin(true);
    localStorage.setItem('cg_demo_admin', 'true');
  };

  const disableDemoAdmin = () => {
    setIsDemoAdmin(false);
    localStorage.removeItem('cg_demo_admin');
  };

  const refreshProfile = async () => {
    if (user) {
      await loadOrCreateProfile(user);
    }
  };

  const isGoogleAdmin = Boolean(
    user && user.email && user.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()
  );

  const isAdmin = isGoogleAdmin || isDemoAdmin || profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isDemoAdmin,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginAsDemoStudent,
        signOut,
        enableDemoAdmin,
        disableDemoAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
