"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PlannerData } from "../lib/firestore"

interface ScheduleViewProps {
  onBack: () => void
  planners: PlannerData[]
}

export default function ScheduleView({ onBack, planners }: ScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week">("month")

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    const tasksForDate: any[] = []

    planners.forEach((planner) => {
      // Check for due dates
      if (planner.dueDate === dateStr) {
        tasksForDate.push({
          type: "due",
          title: `${planner.title} - DUE`,
          planner: planner.title,
          color: "bg-red-500",
        })
      }

      // Check for task dates
      planner.tasks?.forEach((task) => {
        if (task.startDate <= dateStr && task.endDate >= dateStr && !task.completed) {
          tasksForDate.push({
            type: "task",
            title: task.name,
            planner: planner.title,
            color: "bg-blue-500",
          })
        }
      })
    })

    return tasksForDate
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = date.toDateString() === today.toDateString()
      const tasksForDay = getTasksForDate(date)

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-1 ${
            isToday ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"
          }`}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {tasksForDay.slice(0, 2).map((task, index) => (
              <div
                key={index}
                className={`text-xs px-1 py-0.5 rounded text-white truncate ${task.color}`}
                title={`${task.title} - ${task.planner}`}
              >
                {task.title}
              </div>
            ))}
            {tasksForDay.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">+{tasksForDay.length - 2} more</div>
            )}
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule</h1>
            <p className="text-gray-600 dark:text-gray-300">View your assignment timeline</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {planners.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Assignments Scheduled</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your first assignment planner to see your schedule
                </p>
              </div>
            ) : (
              <>
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-0 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="p-2 text-center font-medium text-gray-600 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700">
                  {renderCalendar()}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Due Dates</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planners.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {planners
                  .filter((planner) => new Date(planner.dueDate) >= new Date())
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 5)
                  .map((planner) => {
                    const daysUntilDue = Math.ceil(
                      (new Date(planner.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                    )
                    return (
                      <div
                        key={planner.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{planner.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {new Date(planner.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={daysUntilDue <= 3 ? "destructive" : "default"}>
                          {daysUntilDue === 0 ? "Due Today" : `${daysUntilDue} days left`}
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
