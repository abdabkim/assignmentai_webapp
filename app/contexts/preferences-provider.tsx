"use client"

import { useEffect } from "react"
import { getUserPreferences, applyPreferences } from "../lib/user-preferences"

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const preferences = getUserPreferences()
    applyPreferences(preferences)
  }, [])

  return <>{children}</>
}
