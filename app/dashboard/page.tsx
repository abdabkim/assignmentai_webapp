"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, BookOpen, BarChart3, Trash2, Edit, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Sidebar from "../components/sidebar"
import RightSidebar from "../components/right-sidebar"
import PlannerInput from "../components/planner-input"
import PlannerView from "../components/planner-view"

import InsightView from "../components/insight-view"
import ScheduleView from "../components/schedule-view"
import ReportView from "../components/report-view"
import SettingsView from "../components/settings-view"
import ProfileView from "../components/profile-view"
import { getUserPlanners, deletePlannerFromFirestore, savePlannerToFirestore } from "../lib/firestore"
import { getPlanners, savePlannerLocally, deletePlannerLocally } from "../lib/storage"
import type { Planner } from "../lib/storage"

export default function Dashboard() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState("dashboard")
  const [planners, setPlanners] = useState<Planner[]>([])
  const [selectedPlanner, setSelectedPlanner] = useState<Planner | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasLoadedPlanners, setHasLoadedPlanners] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPlannerInput, setShowPlannerInput] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Load planners on component mount - with flag to prevent multiple loads
  useEffect(() => {
    if (user && !hasLoadedPlanners) {
      loadPlanners()
      setHasLoadedPlanners(true)
    }
  }, [user, hasLoadedPlanners])

  const loadPlanners = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Try localStorage first for faster loading
      const localPlanners = getPlanners()
      if (localPlanners && localPlanners.length > 0) {
        setPlanners(localPlanners)
        setLoading(false)
      }

      // Then try Firestore in background
      try {
        const firestorePlanners = await getUserPlanners(user.uid)
        const validPlanners = firestorePlanners.filter(
          (planner) => planner && planner.title && planner.topic && Array.isArray(planner.tasks),
        )
        if (validPlanners.length > 0) {
          setPlanners(validPlanners)
        }
      } catch (error) {
        console.log("Using local storage due to Firestore error")
      }
    } catch (error: any) {
      console.error("Error loading planners:", error)
      setPlanners([])
    } finally {
      setLoading(false)
    }
  }

  const handlePlannerCreated = async (newPlanner: Planner) => {
    if (!user) return

    try {
      let savedPlanner: Planner

      // Try to save to Firestore first
      try {
        savedPlanner = await savePlannerToFirestore(user.uid, newPlanner)
      } catch (error: any) {
        console.error("Error saving to Firestore:", error)

        // Fallback to localStorage
        savedPlanner = savePlannerLocally(newPlanner)

        if (error.message !== "permissions") {
          setError("Saved locally. Sync when online.")
        }
      }

      // Update local state
      setPlanners((prev) => [savedPlanner, ...prev])
      setShowPlannerInput(false)
      setSelectedPlanner(savedPlanner)
      setActiveView("planner")
    } catch (error: any) {
      console.error("Error creating planner:", error)
      setError(`Failed to create planner: ${error.message}`)
    }
  }

  const handlePlannerUpdate = (updatedPlanner: Planner) => {
    setPlanners((prev) => prev.map((p) => (p.id === updatedPlanner.id ? updatedPlanner : p)))
    setSelectedPlanner(updatedPlanner)
  }

  const handleDeletePlanner = async (plannerId: string) => {
    if (!plannerId) return

    try {
      // Try to delete from Firestore first
      try {
        await deletePlannerFromFirestore(plannerId)
      } catch (error: any) {
        console.error("Error deleting from Firestore:", error)

        // Fallback to localStorage
        deletePlannerLocally(plannerId)

        if (error.message !== "permissions") {
          setError("Deleted locally. Will sync when online.")
        }
      }

      // Update local state
      setPlanners((prev) => prev.filter((p) => p.id !== plannerId))

      // If we're viewing the deleted planner, go back to dashboard
      if (selectedPlanner?.id === plannerId) {
        setSelectedPlanner(null)
        setActiveView("dashboard")
      }
    } catch (error: any) {
      console.error("Error deleting planner:", error)
      setError(`Failed to delete planner: ${error.message}`)
    }
  }

  const handleViewPlanner = (planner: Planner) => {
    setSelectedPlanner(planner)
    setActiveView("planner")
  }

  const calculateOverallProgress = () => {
    if (!planners || planners.length === 0) return 0

    const totalProgress = planners.reduce((sum, planner) => {
      if (!planner.tasks || planner.tasks.length === 0) return sum
      const completed = planner.tasks.filter((task) => task.completed).length
      return sum + (completed / planner.tasks.length) * 100
    }, 0)

    return Math.round(totalProgress / planners.length)
  }

  const getUpcomingDeadlines = () => {
    if (!planners || planners.length === 0) return []

    const today = new Date()
    return planners
      .filter((planner) => planner.dueDate)
      .map((planner) => ({
        ...planner,
        daysUntilDue: Math.ceil((new Date(planner.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .filter((planner) => planner.daysUntilDue >= 0)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 3)
  }

  // Show loading spinner while checking authentication
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show planner input form
  if (showPlannerInput) {
    return <PlannerInput onPlannerCreated={handlePlannerCreated} onCancel={() => setShowPlannerInput(false)} />
  }

  // Show individual planner view
  if (activeView === "planner" && selectedPlanner) {
    return (
      <PlannerView
        planner={selectedPlanner}
        onBack={() => {
          setActiveView("dashboard")
          setSelectedPlanner(null)
        }}
        onUpdate={handlePlannerUpdate}
      />
    )
  }

  // Check if we're showing a full-page view
  const isFullPageView = ["insight", "schedule", "report", "settings", "profile"].includes(activeView)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Left Sidebar - Fixed */}
        <div className="fixed left-0 top-0 h-full w-64 z-10">
          <Sidebar 
            currentView={activeView} 
            onViewChange={setActiveView}
            onCreatePlanner={() => setShowPlannerInput(true)}
            planners={planners}
            onViewPlanner={handleViewPlanner}
            userData={userData}
          />
        </div>

        {/* Main Content - Adjusted margins */}
        <main className={`flex-1 ml-64 ${!isFullPageView ? 'mr-80' : ''} p-8`}>
          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome back, {userData?.username || user.email}!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Manage your assignments and track your progress
                  </p>
                </div>
                <Button onClick={() => setShowPlannerInput(true)} size="lg" className="px-6 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  New Assignment
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{planners.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active projects</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{calculateOverallProgress()}%</div>
                    <Progress value={calculateOverallProgress()} className="mt-3 h-2" />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{getUpcomingDeadlines().length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Due this week</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Assignments */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">Your Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : planners.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create your first assignment to get started
                      </p>
                      <Button onClick={() => setShowPlannerInput(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {planners.map((planner) => {
                        const progress =
                          planner.tasks && planner.tasks.length > 0
                            ? Math.round((planner.tasks.filter((t) => t.completed).length / planner.tasks.length) * 100)
                            : 0

                        const daysUntilDue = Math.ceil(
                          (new Date(planner.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )

                        return (
                          <div
                            key={planner.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{planner.title}</h3>
                                <Badge variant={planner.assignmentType === "essay" ? "default" : "secondary"}>
                                  {planner.assignmentType || "essay"}
                                </Badge>
                                <Badge
                                  variant={
                                    daysUntilDue < 0 ? "destructive" : daysUntilDue <= 3 ? "secondary" : "outline"
                                  }
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {daysUntilDue < 0
                                    ? "Overdue"
                                    : daysUntilDue === 0
                                      ? "Due Today"
                                      : `${daysUntilDue} days left`}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{planner.topic}</p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Progress value={progress} className="w-24 h-2" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  Due: {new Date(planner.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewPlanner(planner)}>
                                <Edit className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => planner.id && handleDeletePlanner(planner.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other Views - Full Width */}
          {activeView === "insight" && <InsightView planners={planners} />}
          {activeView === "schedule" && <ScheduleView planners={planners} />}
          {activeView === "report" && <ReportView planners={planners} />}
          {activeView === "settings" && <SettingsView />}
          {activeView === "profile" && <ProfileView />}
        </main>

        {/* Right Sidebar - Fixed position, only show on dashboard */}
        {activeView === "dashboard" && (
          <div className="fixed right-0 top-0 h-full w-80 z-10">
            <RightSidebar planners={planners} />
          </div>
        )}
      </div>
    </div>
  )
}