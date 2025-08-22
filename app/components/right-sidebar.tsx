"use client"

import { useState } from "react"
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function RightSidebar({ planners }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0]
    const tasksForDate = []

    planners.forEach((planner) => {
      planner.tasks?.forEach((task) => {
        if (task.startDate <= dateStr && task.endDate >= dateStr) {
          tasksForDate.push({
            ...task,
            plannerTitle: planner.title,
          })
        }
      })
    })

    return tasksForDate
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = date.toDateString() === selectedDate.toDateString()
      const tasksForDay = getTasksForDate(date)
      const hasDeadline = planners.some((p) => new Date(p.dueDate).toDateString() === date.toDateString())

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-8 w-8 rounded-full text-sm flex items-center justify-center relative transition-colors ${
            isSelected
              ? "bg-purple-500 text-white"
              : isToday
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {day}
          {(tasksForDay.length > 0 || hasDeadline) && (
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          )}
        </button>
      )
    }

    return days
  }

  const getRecentActivity = () => {
    const activities = []

    // Add recent planner creations
    planners.slice(0, 3).forEach((planner) => {
      if (planner.createdAt) {
        activities.push({
          id: `created-${planner.id}`,
          type: "created",
          message: `Created "${planner.title}"`,
          time: new Date(planner.createdAt).toLocaleDateString(),
        })
      }
    })

    return activities.slice(0, 5)
  }

  return (
    <div className="h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Decorative Header */}
      <div className="h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-semibold text-lg">Stay Organized</h3>
          <p className="text-sm opacity-90">Track your assignments</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Calendar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateMonth(-1)} 
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateMonth(1)} 
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            {/* Selected date info */}
            {selectedDate && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-sm mb-2">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </h4>
                {getTasksForDate(selectedDate).length > 0 ? (
                  <div className="space-y-1">
                    {getTasksForDate(selectedDate).slice(0, 2).map((task, index) => (
                      <div key={index} className="text-xs p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <p className="font-medium text-purple-700 dark:text-purple-300 truncate">
                          {task.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No tasks scheduled</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getRecentActivity().length > 0 ? (
              <div className="space-y-2">
                {getRecentActivity().map((activity) => (
                  <div key={activity.id} className="text-sm">
                    <p className="text-gray-700 dark:text-gray-300">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}