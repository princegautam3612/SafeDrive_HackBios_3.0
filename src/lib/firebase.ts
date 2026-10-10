import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, TripRecord, PointTransaction, UserSessionPayload } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handling helpers according to skill specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Test connection to Firestore on initialization
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    } else {
      console.info('Firebase Firestore health check responded:', error instanceof Error ? error.message : error);
    }
    return false;
  }
}

// Call test connection immediately
testConnection();

// Google Auth Sign-In with popup
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Firebase Google Sign-In error:', error);
    throw error;
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase logout error:', error);
    throw error;
  }
}

// Sync user profile to Firestore
export async function saveUserProfileToFirestore(userId: string, profile: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      userId,
      name: profile.name,
      email: profile.email || '',
      phone: profile.phone || '',
      avatar: profile.avatar || '',
      dlNumber: profile.dlNumber || '',
      dlVerified: Boolean(profile.dlVerified),
      joinedDate: profile.joinedDate || new Date().toISOString(),
      historicalSafeScore: profile.historicalSafeScore || 90,
      totalKms: profile.totalKms || 0,
      totalRides: profile.totalRides || 0,
      points: 500,
      xp: 250,
      driverRole: profile.driverRole || 'SafeDrive Rider',
      badgeLabel: profile.badgeLabel || 'RIDER',
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Save trip to Firestore subcollection
export async function saveTripToFirestore(userId: string, trip: TripRecord): Promise<void> {
  const path = `users/${userId}/trips/${trip.id}`;
  try {
    const tripRef = doc(db, 'users', userId, 'trips', trip.id);
    await setDoc(tripRef, {
      id: trip.id,
      userId,
      startTime: trip.startTime,
      endTime: trip.endTime,
      dateStr: trip.dateStr,
      distanceKm: trip.distanceKm,
      durationSec: trip.durationSec,
      avgSpeedKmH: trip.avgSpeedKmH,
      maxSpeedKmH: trip.maxSpeedKmH,
      score: trip.score,
      smoothBrakingPct: trip.smoothBrakingPct,
      phoneFocusPct: trip.phoneFocusPct,
      co2SavedKg: trip.co2SavedKg,
      pointsEarned: trip.pointsEarned,
      xpEarned: trip.xpEarned,
      origin: trip.origin || '',
      destination: trip.destination || '',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch user profile from Firestore
export async function getUserProfileFromFirestore(userId: string): Promise<Record<string, any> | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}
