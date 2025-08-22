"use client"

import { useState } from "react"
import { User, Mail, Edit, Save, X, Eye, EyeOff, Crown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../contexts/auth-context"
import { updateUserProfile, changePassword, resetPassword } from "../lib/auth"

export default function ProfileView() {
  const { user, userData, refreshUserData } = useAuth()
  
  // Debug: Check if user and userData are available
  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">No user found. Please log in.</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading profile data...</p>
        <p className="text-sm text-gray-500 mt-2">User: {user?.email}</p>
      </div>
    )
  }
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    fullName: userData?.fullName || "",
    username: userData?.username || "",
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileUpdate = async () => {
    if (!userData || !user) return

    if (!profileData.fullName.trim() || !profileData.username.trim()) {
      setError("Full name and username are required")
      return
    }

    if (profileData.username.length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await updateUserProfile(user.uid, {
        fullName: profileData.fullName,
        username: profileData.username,
      })

      await refreshUserData()
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Please fill in all password fields")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await changePassword(passwordData.newPassword)
      setSuccess("Password changed successfully!")
      setIsChangingPassword(false)
      setPasswordData({ newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      if (error.message.includes("requires-recent-login")) {
        setError("For security reasons, please use the 'Send Password Reset Email' option below to change your password.")
      } else {
        setError(error.message || "Failed to change password")
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!userData?.email) {
      setError("No email address found")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await resetPassword(userData.email)
      setSuccess("Password reset email sent! Check your inbox and follow the instructions to reset your password.")
      setIsChangingPassword(false)
    } catch (error: any) {
      setError(error.message || "Failed to send password reset email")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsChangingPassword(false)
    setProfileData({
      fullName: userData?.fullName || "",
      username: userData?.username || "",
    })
    setPasswordData({ newPassword: "", confirmPassword: "" })
    setError("")
    setSuccess("")
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account information</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
              {userData.isPremium && (
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-2">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </CardTitle>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="dark:text-white">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    {userData.fullName || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="dark:text-white">
                  Username
                </Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your username"
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-white">
                    {userData.username || "Not set"}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-white">
                Email Address
              </Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{userData.email}</span>
                <span className="text-xs text-gray-500 ml-auto">(Cannot be changed)</span>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleProfileUpdate} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-white">Change Password</CardTitle>
            {!isChangingPassword && (
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isChangingPassword ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="dark:text-white">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="dark:text-white">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handlePasswordChange} disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Alternative Method</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          If you're having trouble changing your password, you can receive a password reset email instead.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handlePasswordReset}
                          disabled={loading}
                          className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
                        >
                          Send Password Reset Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Click "Change Password" to update your account password.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-white">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Account Created</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Account Type</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {userData.isPremium ? "Premium Account" : "Free Account"}
                </span>
                {userData.isPremium && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
            {userData.isPremium && userData.premiumExpiresAt && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Premium Expires</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(userData.premiumExpiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}