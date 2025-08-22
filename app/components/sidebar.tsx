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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { logOut } from "../lib/auth"
import { useRouter } from "next/navigation"
import type { UserData } from "../lib/auth"
import type { PlannerData } from "../lib/firestore"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
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
}

export default function Sidebar({
  currentView,
  onViewChange,
  onCreatePlanner,
  planners,
  onViewPlanner,
  userData,
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

  // Get display name and email with fallbacks
  const displayName = userData?.username || userData?.email?.split('@')[0] || "User"
  const displayEmail = userData?.email || "No email"
  const displayInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* User Profile */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {displayInitial}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{displayName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{displayEmail}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </div>

          {showUserMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  onViewChange("profile")
                  setShowUserMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          )
        })}

        {/* Projects Section */}
        <div className="pt-6">
          <Collapsible open={projectsExpanded} onOpenChange={setProjectsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="font-medium">Projects</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${projectsExpanded ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {/* Create New Project Button */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onCreatePlanner}
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Button>

              {/* Project Types */}
              {projectTypes.map((type) => {
                const Icon = type.icon
                const count = planners.filter((p) => p.assignmentType === type.id).length

                return (
                  <div
                    key={type.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
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
                      className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 h-auto py-2"
                      onClick={() => onViewPlanner(planner)}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 text-left">
                        <p className="text-sm truncate">{planner.title}</p>
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