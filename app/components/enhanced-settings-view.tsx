"use client"

import { useState, useEffect } from "react"
import { Type, Accessibility, Volume2, Bell, CreditCard, Moon, Sun, Trash2, Crown, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/auth-context"
import { getUserPreferences, saveUserPreferences, applyPreferences, saveUserPreferencesToFirebase, loadUserPreferencesFromFirebase } from "../lib/user-preferences"
import { clearAllData } from "../lib/storage"

export default function EnhancedSettingsView() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { userData } = useAuth()
  const router = useRouter()
  const [preferences, setPreferences] = useState(getUserPreferences())

  useEffect(() => {
    setMounted(true)
    const loadPreferences = async () => {
      if (userData?.uid) {
        // Load from Firebase for logged-in users
        const prefs = await loadUserPreferencesFromFirebase(userData.uid)
        setPreferences(prefs)
        applyPreferences(prefs)
      } else {
        // Load from localStorage for non-logged-in users
        const prefs = getUserPreferences()
        setPreferences(prefs)
        applyPreferences(prefs)
      }
    }
    loadPreferences()
  }, [userData?.uid])

  const updatePreference = async (key: string, value: any) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    
    // Save to Firebase if user is logged in, otherwise save to localStorage
    if (userData?.uid) {
      await saveUserPreferencesToFirebase(userData.uid, newPrefs)
    } else {
      saveUserPreferences(newPrefs)
    }
    
    applyPreferences(newPrefs)
  }

  const handleUpgrade = () => {
    router.push("/premium")
  }

  const handleClearData = () => {
    const confirmed = confirm("Are you sure you want to clear all data? This action cannot be undone.")
    if (confirmed) {
      clearAllData()
      alert("All data has been cleared.")
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Customize your experience</p>
        </div>

        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {userData?.isEnterprise ? "Enterprise Account" : userData?.isPremium ? "Premium Account" : "Free Account"}
                    </h3>
                    {userData?.isEnterprise && (
                      <Badge className="bg-blue-500 text-white">
                        <Users className="h-3 w-3 mr-1" />
                        Enterprise
                      </Badge>
                    )}
                    {userData?.isPremium && !userData?.isEnterprise && (
                      <Badge className="bg-purple-600 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userData?.isEnterprise
                      ? "Unlimited planners, team collaboration, and enterprise features"
                      : userData?.isPremium
                        ? "Unlimited planners and premium features"
                        : "3 free planners available"}
                  </p>
                </div>
                {!userData?.isPremium && !userData?.isEnterprise && (
                  <Button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appearance & Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Appearance & Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Dark Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Font Size</Label>
                <Select value={preferences.fontSize} onValueChange={(value) => updatePreference('fontSize', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium (Default)</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">High Contrast</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Increase text and UI contrast</p>
                </div>
                <Switch
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Reduced Motion</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Minimize animations for accessibility</p>
                </div>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications" className="text-base font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get reminders about upcoming assignment deadlines
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) => updatePreference('notificationsEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Productivity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Productivity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Auto-Save</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save your work</p>
                </div>
                <Switch
                  checked={preferences.autoSave}
                  onCheckedChange={(checked) => updatePreference('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Clear All Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This will permanently delete all your planners and settings. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={handleClearData}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About AssignmentPlanner AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>Version 2.0.0</p>
                <p>Built with AI to help students succeed with any assignment</p>
                <p>Data is stored locally and synced to the cloud when available</p>
                <p>Supports essays, coding projects, presentations, lab reports, and more</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
