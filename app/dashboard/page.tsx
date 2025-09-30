"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, BookOpen, BarChart3, Trash2, Edit, Clock, Menu, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Sidebar from "../components/sidebar"
import RightSidebar from "../components/right-sidebar"
import PlannerInput from "../components/planner-input"
import PlannerView from "../components/planner-view"
import UrgencyIndicator from "../components/assignment/urgency-indicator"

import InsightView from "../components/insight-view"
import ScheduleView from "../components/schedule-view"
import ReportView from "../components/report-view"
import SettingsView from "../components/settings-view"
import ProfileView from "../components/profile-view"
import ProductivityHub from "../components/productivity/productivity-hub"
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

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
    if (!plannerId || !user) return

    // Check if user is premium
    const isPremium = userData?.isPremium || userData?.isEnterprise || false

    try {
      // Try to delete from Firestore first
      try {
        await deletePlannerFromFirestore(plannerId, user.uid, isPremium)
      } catch (error: any) {
        console.error("Error deleting from Firestore:", error)

        // Fallback to localStorage with premium check
        deletePlannerLocally(plannerId, isPremium)

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
      setError(error.message || "Failed to delete planner")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      
      <div className="flex">
        {/* Left Sidebar - Responsive */}
        <div className={`
          fixed left-0 top-0 h-full w-64 z-40 backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:transform-none
        `}>
          <Sidebar 
            currentView={activeView} 
            onViewChange={setActiveView}
            onCreatePlanner={() => setShowPlannerInput(true)}
            planners={planners}
            onViewPlanner={handleViewPlanner}
            userData={userData}
          />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Responsive margins */}
        <main className={`
          flex-1 
          ${/* Mobile: full width with padding for menu button */ ''}
          p-4 pt-20 lg:pt-8 lg:p-8
          ${/* Desktop: margins for sidebars */ ''}
          lg:ml-0
          ${!isFullPageView ? 'xl:mr-80' : ''}
          animate-in fade-in-50 duration-500
        `}>
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200 animate-in slide-in-from-top-3 duration-300">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Header */}
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-3xl transform rotate-1"></div>
                <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-white">
                            {(userData?.username || user?.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            Welcome back, {userData?.username || user?.email?.split('@')[0] || 'Student'}! 👋
                          </h1>
                          <p className="text-slate-600 dark:text-slate-400 flex items-center space-x-2">
                            <span>Ready to tackle your assignments?</span>
                            <span className="animate-pulse">✨</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowPlannerInput(true)} 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3"
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Assignment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Assignments</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-200">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {planners.length}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      Active projects
                    </p>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Overall Progress</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-200">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {calculateOverallProgress()}%
                    </div>
                    <div className="mt-3">
                      <Progress 
                        value={calculateOverallProgress()} 
                        className="h-2 bg-green-100 dark:bg-green-900/30" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 border-0 shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Upcoming Deadlines</CardTitle>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-200">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                      {getUpcomingDeadlines().length}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                      <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                      Due this week
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Assignments */}
              <Card className="hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      Your Assignments
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                        <div className="absolute inset-0 rounded-full bg-blue-100/20 animate-ping"></div>
                      </div>
                    </div>
                  ) : planners.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                          <BookOpen className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <span className="text-white text-lg">✨</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        Ready to start your academic journey?
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Create your first assignment and let our AI help you break it down into manageable steps. 🎓
                      </p>
                      <Button 
                        onClick={() => setShowPlannerInput(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-3"
                        size="lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Your First Assignment
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
                            className="group relative p-6 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                          >
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full translate-y-10 -translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                        {planner.title}
                                      </h3>
                                    </div>
                                    <Badge 
                                      variant="secondary"
                                      className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-0 font-medium px-3 py-1"
                                    >
                                      {planner.assignmentType || "essay"}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">
                                    {planner.topic}
                                  </p>
                                  
                                  {/* Urgency Indicator */}
                                  <div className="mb-4">
                                    <UrgencyIndicator 
                                      dueDate={planner.dueDate}
                                      assignmentTitle={planner.title}
                                      progress={progress}
                                      variant="compact"
                                    />
                                  </div>
                                  
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                          style={{ width: `${progress}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[3rem]">
                                        {progress}%
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(planner.dueDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-3">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleViewPlanner(planner)}
                                    className="flex-1 sm:flex-none bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 group-hover:shadow-md transition-all duration-200"
                                  >
                                    <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">View Details</span>
                                    <span className="sm:hidden">View</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => planner.id && handleDeletePlanner(planner.id)}
                                    className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 text-red-600 hover:text-red-700 transition-all duration-200"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
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
          {activeView === "productivity" && <ProductivityHub />}
          {activeView === "insight" && <InsightView planners={planners} />}
          {activeView === "schedule" && <ScheduleView planners={planners} />}
          {activeView === "report" && <ReportView planners={planners} />}
          {activeView === "settings" && <SettingsView />}
          {activeView === "profile" && <ProfileView />}
        </main>

        {/* Right Sidebar - Desktop Only */}
        {activeView === "dashboard" && (
          <div className="hidden xl:block fixed right-0 top-0 h-full w-80 z-10 backdrop-blur-sm">
            <RightSidebar planners={planners} />
          </div>
        )}
        
        {/* Mobile Right Sidebar Toggle Button */}
        {activeView === "dashboard" && (
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="xl:hidden fixed top-4 right-4 z-50 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
        )}
        
        {/* Mobile Right Sidebar */}
        {activeView === "dashboard" && rightSidebarOpen && (
          <div className="xl:hidden fixed right-0 top-0 h-full w-80 z-40 backdrop-blur-sm transform transition-transform duration-300 ease-in-out">
            <RightSidebar planners={planners} />
          </div>
        )}
        
        {/* Mobile Right Sidebar Overlay */}
        {activeView === "dashboard" && rightSidebarOpen && (
          <div 
            className="xl:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setRightSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}