import { initializeApp } from "firebase/app";
import {
    initializeFirestore,
    persistentLocalCache,
    doc,
    onSnapshot,
    setDoc
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { RoomOrder, AvailabilitySettings } from "../types";

// Firebase Configuration (Provided by User)
const firebaseConfig = {
  apiKey: "AIzaSyDkMGSxxabdujBVr0lQxZjjlAXyRlp7n9M",
  authDomain: "eastin-taipei-h-bf-od-sys.firebaseapp.com",
  projectId: "eastin-taipei-h-bf-od-sys",
  storageBucket: "eastin-taipei-h-bf-od-sys.firebasestorage.app",
  messagingSenderId: "439090389662",
  appId: "1:439090389662:web:203c285f072a470252918f",
  measurementId: "G-RMD3T0ZX62"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent IndexedDB cache (new recommended API)
const db = initializeFirestore(app, {
    cache: typeof window !== 'undefined'
        ? persistentLocalCache()
        : undefined
});

// Safer Analytics initialization
isSupported()
    .then(yes => yes && getAnalytics(app))
    .catch(() => null);

const COLLECTIONS = {
    DAILY_ORDERS: 'daily_orders',
    APP_SETTINGS: 'app_settings'
};

/**
 * Subscribe to orders for a specific date (Real-time)
 */
export const subscribeToOrders = (
    dateKey: string,
    onUpdate: (orders: Record<string, RoomOrder>) => void,
    onError?: (error: any) => void
) => {
    const orderDocRef = doc(db, COLLECTIONS.DAILY_ORDERS, dateKey);

    const unsubscribe = onSnapshot(
        orderDocRef,
        (docSnap) => {
            if (docSnap.exists()) {
                onUpdate(docSnap.data() as Record<string, RoomOrder>);
            } else {
                onUpdate({});
            }
        },
        (error) => {
            if (onError) onError(error);
        }
    );

    return unsubscribe;
};

/**
 * Save an individual room order to the daily document
 */
export const saveOrderToFirebase = async (dateKey: string, order: RoomOrder) => {
    const orderDocRef = doc(db, COLLECTIONS.DAILY_ORDERS, dateKey);

    await setDoc(
        orderDocRef,
        { [order.roomId]: order },
        { merge: true }
    );
};

/**
 * Subscribe to global availability settings (Real-time)
 */
export const subscribeToSettings = (
    onUpdate: (settings: AvailabilitySettings) => void,
    onError?: (error: any) => void
) => {
    const settingsDocRef = doc(db, COLLECTIONS.APP_SETTINGS, 'availability');

    const unsubscribe = onSnapshot(
        settingsDocRef,
        (docSnap) => {
            if (docSnap.exists()) {
                onUpdate(docSnap.data() as AvailabilitySettings);
            } else {
                onUpdate({
                    isMcDonaldsClosed: false,
                    isChineseClosed: false,
                    unavailableItems: []
                });
            }
        },
        (error) => {
            if (onError) onError(error);
        }
    );

    return unsubscribe;
};

/**
 * Save global availability settings
 */
export const saveSettingsToFirebase = async (settings: AvailabilitySettings) => {
    const settingsDocRef = doc(db, COLLECTIONS.APP_SETTINGS, 'availability');
    await setDoc(settingsDocRef, settings);
};
