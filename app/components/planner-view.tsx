"use client"

import { useState } from "react"
import { ArrowLeft, Download, Bell, BellOff, CheckCircle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { updatePlannerInFirestore } from "../lib/firestore"
import { exportToPDF } from "../lib/pdf-export"
import { requestNotificationPermission, scheduleNotification } from "../lib/notifications"

export default function PlannerView({ planner, onBack, onUpdate }) {
  const [localPlanner, setLocalPlanner] = useState(planner)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [expandedTips, setExpandedTips] = useState({})
  const [loading, setLoading] = useState(false)

  const calculateProgress = () => {
    if (!localPlanner.tasks || localPlanner.tasks.length === 0) return 0
    const completed = localPlanner.tasks.filter((task) => task.completed).length
    return Math.round((completed / localPlanner.tasks.length) * 100)
  }

  const handleTaskToggle = async (taskIndex) => {
    if (!localPlanner.tasks || taskIndex < 0 || taskIndex >= localPlanner.tasks.length) {
      console.error("Invalid task index:", taskIndex)
      return
    }

    setLoading(true)

    try {
      const updatedTasks = localPlanner.tasks.map((task, index) =>
        index === taskIndex ? { ...task, completed: !task.completed } : task,
      )

      const completedCount = updatedTasks.filter((task) => task.completed).length
      const progress = Math.round((completedCount / updatedTasks.length) * 100)

      const updatedPlanner = {
        ...localPlanner,
        tasks: updatedTasks,
        progress,
      }

      setLocalPlanner(updatedPlanner)

      // Update in Firestore
      await updatePlannerInFirestore(localPlanner.id, {
        tasks: updatedTasks,
        progress,
      })

      onUpdate(updatedPlanner)

      // Schedule notification for next incomplete task
      if (notificationsEnabled && !localPlanner.tasks[taskIndex].completed) {
        const nextTask = updatedPlanner.tasks.find((task) => !task.completed)
        if (nextTask) {
          scheduleNotification(nextTask, localPlanner.title)
        }
      }
    } catch (error) {
      console.error("Error updating task:", error)
      // Revert on error
      setLocalPlanner(localPlanner)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = async (taskIndex, field, value) => {
    if (!localPlanner.tasks || taskIndex < 0 || taskIndex >= localPlanner.tasks.length) {
      return
    }

    try {
      const updatedTasks = localPlanner.tasks.map((task, index) =>
        index === taskIndex ? { ...task, [field]: value } : task,
      )

      const updatedPlanner = {
        ...localPlanner,
        tasks: updatedTasks,
      }

      setLocalPlanner(updatedPlanner)

      await updatePlannerInFirestore(localPlanner.id, { tasks: updatedTasks })
      onUpdate(updatedPlanner)
    } catch (error) {
      console.error("Error updating task date:", error)
    }
  }

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await requestNotificationPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)

        // Schedule notifications for incomplete tasks
        if (localPlanner.tasks) {
          localPlanner.tasks.forEach((task) => {
            if (!task.completed) {
              scheduleNotification(task, localPlanner.title)
            }
          })
        }
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  const handleExportPDF = () => {
    exportToPDF(localPlanner)
  }

  const getDaysUntilDue = () => {
    const today = new Date()
    const due = new Date(localPlanner.dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const toggleTipExpansion = (taskIndex) => {
    setExpandedTips((prev) => ({
      ...prev,
      [taskIndex]: !prev[taskIndex],
    }))
  }

  // Format description as list items
  const formatDescription = (description) => {
    if (!description) return ""

    // Split by bullet points and format as HTML list
    const items = description.split("\n").filter((item) => item.trim())

    return items
      .map((item, index) => {
        const cleanItem = item.replace(/^[•\-*]\s*/, "").trim()
        return cleanItem ? (
          <li key={index} className="mb-1">
            {cleanItem}
          </li>
        ) : null
      })
      .filter(Boolean)
  }

  const progress = calculateProgress()
  const daysUntilDue = getDaysUntilDue()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{localPlanner.title}</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Due: {new Date(localPlanner.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleNotifications}>
              {notificationsEnabled ? (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications On
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Overall Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Time Remaining</h3>
                <Badge
                  variant={daysUntilDue < 0 ? "destructive" : daysUntilDue <= 3 ? "secondary" : "default"}
                  className="text-lg px-3 py-1"
                >
                  {daysUntilDue < 0 ? "Overdue" : daysUntilDue === 0 ? "Due Today" : `${daysUntilDue} days left`}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tasks Status</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {localPlanner.tasks ? localPlanner.tasks.filter((t) => t.completed).length : 0} of{" "}
                  {localPlanner.tasks ? localPlanner.tasks.length : 0} completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Topic */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assignment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{localPlanner.topic}</p>
            {localPlanner.wordCount && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Target word count: {localPlanner.wordCount} words
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Assignment Tasks</h2>

          {localPlanner.tasks &&
            localPlanner.tasks.map((task, index) => (
              <Card key={index} className={`transition-all ${task.completed ? "opacity-75" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(index)}
                      className="mt-1"
                      disabled={loading}
                    />

                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-lg font-semibold ${
                            task.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {task.name}
                        </h3>
                        {task.completed && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>

                      {/* Task Description as List */}
                      {task.description && (
                        <div className="text-gray-600 dark:text-gray-400">
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            {formatDescription(task.description)}
                          </ul>
                        </div>
                      )}

                      {/* Date Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            value={task.startDate}
                            onChange={(e) => handleDateChange(index, "startDate", e.target.value)}
                            disabled={task.completed}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date
                          </label>
                          <Input
                            type="date"
                            value={task.endDate}
                            onChange={(e) => handleDateChange(index, "endDate", e.target.value)}
                            disabled={task.completed}
                          />
                        </div>
                      </div>

                      {/* Writing Tips */}
                      {localPlanner.showTips && task.tip && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="p-0 h-auto font-normal text-blue-600 hover:text-blue-700"
                              onClick={() => toggleTipExpansion(index)}
                            >
                              <Lightbulb className="h-4 w-4 mr-2" />
                              {expandedTips[index] ? "Hide" : "Show"} Writing Tips
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                              <p className="text-sm text-blue-800 dark:text-blue-200">{task.tip}</p>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Completion Message */}
        {progress === 100 && (
          <Card className="mt-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">🎉 Assignment Complete!</h3>
              <p className="text-green-700 dark:text-green-300">
                Congratulations! You've completed all tasks for this assignment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
