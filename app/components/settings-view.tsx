"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Bell, CreditCard, Moon, Sun, Trash2, Crown, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/auth-context"
import { getNotificationSettings, saveNotificationSettings, clearAllData } from "../lib/storage"

export default function SettingsView({ onBack }) {
  const [notificationSettings, setNotificationSettings] = useState({ enabled: false })
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { userData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setNotificationSettings(getNotificationSettings())
  }, [])

  const handleNotificationToggle = (enabled) => {
    const newSettings = { ...notificationSettings, enabled }
    setNotificationSettings(newSettings)
    saveNotificationSettings(newSettings)
  }

  const handleUpgrade = () => {
    router.push("/premium")
  }

  const handleClearData = () => {
    const confirmed = confirm("Are you sure you want to clear all data? This action cannot be undone.")
    if (confirmed) {
      clearAllData()
      alert("All data has been cleared.")
      onBack()
    }
  }

  // Don't render theme toggle until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your preferences and account</p>
          </div>
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
                      {userData?.isEnterprise
                        ? "Enterprise Account"
                        : userData?.isPremium
                          ? "Premium Account"
                          : "Free Account"}
                    </h3>
                    {userData?.isEnterprise && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <Users className="h-3 w-3 mr-1" />
                        Enterprise
                      </Badge>
                    )}
                    {userData?.isPremium && !userData?.isEnterprise && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
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
                  {(userData?.isPremium || userData?.isEnterprise) && userData.premiumExpiresAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Expires: {new Date(userData.premiumExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {!userData?.isPremium && !userData?.isEnterprise && (
                  <Button onClick={handleUpgrade} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>

              {(userData?.isPremium || userData?.isEnterprise) && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✓ {userData?.isEnterprise ? "Enterprise" : "Premium"} features active
                  </p>
                </div>
              )}
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
                  checked={notificationSettings.enabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>

              {notificationSettings.enabled && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    You'll receive daily reminders about your active assignments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
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
