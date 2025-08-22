import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface UserData {
  uid: string
  email: string
  displayName: string
  fullName?: string
  username?: string
  isPremium: boolean
  isEnterprise: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  plannerCount: number
  subscriptionId?: string
  subscriptionStatus?: string
  premiumExpiresAt?: string
}

// Email validation function
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation function
export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const signUp = async (email: string, password: string, fullName: string) => {
  if (!validateEmail(email)) {
    throw new Error("Please enter a valid email address")
  }

  if (!validatePassword(password)) {
    throw new Error("Password must be at least 8 characters with uppercase, lowercase, and number")
  }

  if (!fullName.trim()) {
    throw new Error("Please enter your full name")
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update the user's display name
    await updateProfile(user, {
      displayName: fullName,
    })

    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName: fullName,
      fullName: fullName,
      username: fullName.toLowerCase().replace(/\s+/g, ""),
      isPremium: false,
      isEnterprise: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      plannerCount: 0,
    }

    await setDoc(doc(db, "users", user.uid), userData)

    return { user, userData }
  } catch (error: any) {
    console.error("Error signing up:", error)

    if (error.code === "auth/email-already-in-use") {
      throw new Error("An account with this email already exists")
    } else if (error.code === "auth/weak-password") {
      throw new Error("Password is too weak")
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address")
    }

    throw new Error(error.message || "Failed to create account")
  }
}

export const signIn = async (email: string, password: string) => {
  if (!validateEmail(email)) {
    throw new Error("Please enter a valid email address")
  }

  if (!password.trim()) {
    throw new Error("Please enter your password")
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update last login time
    try {
      await updateDoc(doc(db, "users", user.uid), {
        lastLoginAt: new Date().toISOString(),
      })
    } catch (firestoreError) {
      console.warn("Could not update last login time:", firestoreError)
    }

    return user
  } catch (error: any) {
    console.error("Error signing in:", error)

    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email")
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password")
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address")
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many failed attempts. Please try again later")
    }

    throw new Error(error.message || "Failed to sign in")
  }
}

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    // Check if user document exists, create if not
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || user.email!.split("@")[0],
        fullName: user.displayName || user.email!.split("@")[0],
        username: (user.displayName || user.email!.split("@")[0]).toLowerCase().replace(/\s+/g, ""),
        isPremium: false,
        isEnterprise: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        plannerCount: 0,
      }

      await setDoc(userDocRef, userData)
    } else {
      // Update last login time
      await updateDoc(userDocRef, {
        lastLoginAt: new Date().toISOString(),
      })
    }

    return user
  } catch (error: any) {
    console.error("Error signing in with Google:", error)

    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled")
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Popup was blocked. Please allow popups and try again")
    }

    throw new Error(error.message || "Failed to sign in with Google")
  }
}

export const logOut = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    console.error("Error logging out:", error)
    throw new Error("Failed to log out")
  }
}

export const resetPassword = async (email: string) => {
  if (!validateEmail(email)) {
    throw new Error("Please enter a valid email address")
  }

  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error("Error sending password reset email:", error)

    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email address")
    }

    throw new Error(error.message || "Failed to send password reset email")
  }
}

export const changePassword = async (newPassword: string) => {
  if (!validatePassword(newPassword)) {
    throw new Error("Password must be at least 8 characters with uppercase, lowercase, and number")
  }

  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No user is currently signed in")
    }

    await updatePassword(user, newPassword)
  } catch (error: any) {
    console.error("Error changing password:", error)

    if (error.code === "auth/requires-recent-login") {
      throw new Error("Please sign out and sign back in before changing your password")
    }

    throw new Error(error.message || "Failed to change password")
  }
}

export const updateUserProfile = async (uid: string, updates: { fullName?: string; username?: string }) => {
  try {
    const user = auth.currentUser
    if (!user || user.uid !== uid) {
      throw new Error("User not authenticated or UID mismatch")
    }

    // Update Firestore user document
    const userDocRef = doc(db, "users", uid)
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (updates.fullName) {
      updateData.fullName = updates.fullName
      updateData.displayName = updates.fullName
      
      // Also update Firebase Auth profile
      await updateProfile(user, {
        displayName: updates.fullName,
      })
    }
    
    if (updates.username) {
      updateData.username = updates.username
    }

    await updateDoc(userDocRef, updateData)
  } catch (error: any) {
    console.error("Error updating user profile:", error)
    throw new Error(error.message || "Failed to update profile")
  }
}

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    } else {
      // If user document doesn't exist, create a default one
      const defaultUserData: UserData = {
        uid: uid,
        email: auth.currentUser?.email || "",
        displayName: auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "User",
        fullName: auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "User",
        username: (auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "user").toLowerCase().replace(/\s+/g, ""),
        isPremium: false,
        isEnterprise: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        plannerCount: 0,
      }
      
      try {
        await setDoc(doc(db, "users", uid), defaultUserData)
        return defaultUserData
      } catch (createError) {
        console.warn("Could not create user document, using default data:", createError)
        return defaultUserData
      }
    }
  } catch (error) {
    console.error("Error getting user data:", error)
    // Return default user data if Firestore fails
    return {
      uid: uid,
      email: auth.currentUser?.email || "",
      displayName: auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "User",
      fullName: auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "User",
      username: (auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "user").toLowerCase().replace(/\s+/g, ""),
      isPremium: false,
      isEnterprise: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      plannerCount: 0,
    }
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
