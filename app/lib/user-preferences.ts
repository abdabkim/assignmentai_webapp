import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  autoSave: boolean;
  notificationsEnabled: boolean;
  pomodoroWorkDuration: number;
  pomodoroBreakDuration: number;
  pomodoroLongBreakDuration: number;
  pomodoroSessionsBeforeLongBreak: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  fontSize: 'medium',
  theme: 'system',
  highContrast: false,
  reducedMotion: false,
  autoSave: true,
  notificationsEnabled: false,
  pomodoroWorkDuration: 25,
  pomodoroBreakDuration: 5,
  pomodoroLongBreakDuration: 15,
  pomodoroSessionsBeforeLongBreak: 4,
};

const STORAGE_KEY = 'user-preferences';

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
  
  return DEFAULT_PREFERENCES;
}

export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    applyPreferences(updated);
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

export function applyPreferences(preferences: UserPreferences): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  root.setAttribute('data-font-size', preferences.fontSize);
  root.setAttribute('data-high-contrast', preferences.highContrast.toString());
  root.setAttribute('data-reduced-motion', preferences.reducedMotion.toString());
  
  const fontSizeMap = {
    'small': '14px',
    'medium': '16px',
    'large': '18px',
    'extra-large': '20px',
  };
  
  root.style.fontSize = fontSizeMap[preferences.fontSize];
}

// Save preferences to Firebase for logged-in users
export async function saveUserPreferencesToFirebase(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
  try {
    const userPrefsRef = doc(db, "userPreferences", userId)
    const userPrefsDoc = await getDoc(userPrefsRef)
    
    const current = userPrefsDoc.exists() ? userPrefsDoc.data() as UserPreferences : DEFAULT_PREFERENCES
    const updated = { ...current, ...preferences }
    
    await setDoc(userPrefsRef, {
      ...updated,
      updatedAt: new Date().toISOString()
    })
    
    // Also save to localStorage for offline access
    saveUserPreferences(updated)
  } catch (error) {
    console.error('Error saving preferences to Firebase:', error)
    // Fallback to localStorage only
    saveUserPreferences(preferences)
  }
}

// Load preferences from Firebase for logged-in users
export async function loadUserPreferencesFromFirebase(userId: string): Promise<UserPreferences> {
  try {
    const userPrefsRef = doc(db, "userPreferences", userId)
    const userPrefsDoc = await getDoc(userPrefsRef)
    
    if (userPrefsDoc.exists()) {
      const firebasePrefs = userPrefsDoc.data() as UserPreferences
      // Save to localStorage for offline access
      saveUserPreferences(firebasePrefs)
      return firebasePrefs
    }
    
    // If no Firebase preferences exist, use localStorage or defaults
    const localPrefs = getUserPreferences()
    // Save to Firebase for future use
    await setDoc(userPrefsRef, {
      ...localPrefs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    return localPrefs
  } catch (error) {
    console.error('Error loading preferences from Firebase:', error)
    // Fallback to localStorage
    return getUserPreferences()
  }
}
