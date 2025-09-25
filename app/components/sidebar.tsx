"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  FileText,
  Settings,
  ChevronDown,
  Plus,
  BookOpen,
  Palette,
  Smartphone,
  FileImage,
  User,
  LogOut,
  Target,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { logOut } from "../lib/auth"
import { useRouter } from "next/navigation"
import type { UserData } from "../lib/auth"
import type { PlannerData } from "../lib/firestore"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "productivity", label: "Productivity", icon: Target },
  { id: "insight", label: "Insight", icon: BarChart3 },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "report", label: "Report", icon: FileText },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
]

const projectTypes = [
  { id: "essay", label: "Essay Writing", icon: BookOpen, color: "bg-purple-500" },
  { id: "coding", label: "Coding Project", icon: Smartphone, color: "bg-blue-500" },
  { id: "presentation", label: "Presentation", icon: FileImage, color: "bg-green-500" },
  { id: "design", label: "Design Project", icon: Palette, color: "bg-yellow-500" },
  { id: "research", label: "Research", icon: FileText, color: "bg-red-500" },
]

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  onCreatePlanner: () => void
  planners: PlannerData[]
  onViewPlanner: (planner: PlannerData) => void
  userData: UserData | null
  onClose?: () => void
  isMobile?: boolean
}

export default function Sidebar({
  currentView,
  onViewChange,
  onCreatePlanner,
  planners,
  onViewPlanner,
  userData,
  onClose,
  isMobile = false,
}: SidebarProps) {
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()

  const getRecentPlanners = () => {
    return planners.slice(0, 5)
  }

  const handleLogout = async () => {
    try {
      await logOut()
      router.push("/landing")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handleViewChange = (view: string) => {
    onViewChange(view)
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleCreatePlanner = () => {
    onCreatePlanner()
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleViewPlanner = (planner: PlannerData) => {
    onViewPlanner(planner)
    if (isMobile && onClose) {
      onClose()
    }
  }

  // Get display name and email with fallbacks
  const displayName = userData?.username || userData?.email?.split('@')[0] || "User"
  const displayEmail = userData?.email || "No email"
  const displayInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="h-full w-full sm:w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden shadow-2xl">
      {/* Mobile Close Button */}
      {isMobile && (
        <div className="flex justify-end p-4 sm:hidden">
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="relative">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <span className="text-base sm:text-lg font-bold text-white">{displayInitial}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{displayName}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Free Account</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-all duration-200 flex-shrink-0 ${showUserMenu ? "rotate-180 text-blue-500" : ""}`} />
          </div>

          {showUserMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  handleViewChange("profile")
                  setShowUserMenu(false)
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-3 transition-all duration-150"
              >
                <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 transition-all duration-150"
              >
                <div className="p-1 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <LogOut className="h-3 w-3 text-red-600 dark:text-red-400" />
                </div>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 transition-all duration-200 group text-sm sm:text-base ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                onClick={() => handleViewChange(item.id)}
              >
                <div className={`p-1 sm:p-1.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-white/20" 
                    : "bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Button>
            )
          })}
        </div>

        {/* Projects Section */}
        <div className="pt-6 sm:pt-8">
          <Collapsible open={projectsExpanded} onOpenChange={setProjectsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200 h-9 sm:h-10 transition-all duration-200 text-sm sm:text-base"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg">
                    <BookOpen className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium">Projects</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-all duration-200 ${
                  projectsExpanded ? "rotate-180 text-purple-500" : ""
                }`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Create New Project Button */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 sm:gap-3 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 hover:text-green-700 dark:hover:text-green-400 h-9 sm:h-10 transition-all duration-200 group text-sm sm:text-base"
                onClick={handleCreatePlanner}
              >
                <div className="p-1 sm:p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                  <Plus className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">New Project</span>
              </Button>

              {/* Project Types */}
              {projectTypes.map((type) => {
                const Icon = type.icon
                const count = planners.filter((p) => p.assignmentType === type.id).length

                return (
                  <div
                    key={type.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                  >
                    <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">{type.label}</span>
                    {count > 0 && <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>}
                  </div>
                )
              })}

              {/* Recent Planners */}
              {getRecentPlanners().length > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-3">Recent</p>
                  {getRecentPlanners().map((planner) => (
                    <Button
                      key={planner.id}
                      variant="ghost"
                      className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 h-auto py-2 text-sm"
                      onClick={() => handleViewPlanner(planner)}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="truncate">{planner.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(planner.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>
    </div>
  )
}
