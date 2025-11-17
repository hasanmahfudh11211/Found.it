import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
// @ts-expect-error - Subpath types may be missing in RN env, import at runtime
import { getReactNativePersistence } from "@firebase/auth/dist/rn/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";

const firebaseConfig = (Constants.expoConfig?.extra as any)?.firebase;

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

// Initialize Auth with RN persistence (if not already initialized)
export const firebaseAuth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // If already initialized, fall back to existing instance
    return getAuth(app);
  }
})();
export const firestoreDb = getFirestore(app);
export const firebaseStorage = getStorage(app);


