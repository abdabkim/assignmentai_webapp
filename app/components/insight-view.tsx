"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Clock, Target, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Planner } from "../lib/storage"

interface InsightViewProps {
  planners: Planner[]
}

export default function InsightView({ planners }: InsightViewProps) {
  const calculateStats = () => {
    const totalTasks = planners.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)
    const completedTasks = planners.reduce(
      (sum, p) => sum + (p.tasks?.filter((t) => t.completed).length || 0),
      0
    )
    const overduePlanners = planners.filter(
      (p) => new Date(p.dueDate) < new Date() && p.tasks?.some((t) => !t.completed)
    ).length
    const averageProgress = planners.length > 0
      ? Math.round(
          planners.reduce((sum, p) => {
            const tasks = p.tasks?.length || 0
            const completed = p.tasks?.filter((t) => t.completed).length || 0
            return sum + (tasks > 0 ? (completed / tasks) * 100 : 0)
          }, 0) / planners.length
        )
      : 0

    return {
      totalTasks,
      completedTasks,
      overduePlanners,
      averageProgress,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  }

  const getProductivityByType = () => {
    const types = ["essay", "coding", "presentation", "design", "research"]
    return types.map((type) => {
      const typePlanners = planners.filter((p) => p.assignmentType === type)
      const totalTasks = typePlanners.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)
      const completedTasks = typePlanners.reduce(
        (sum, p) => sum + (p.tasks?.filter((t) => t.completed).length || 0),
        0
      )
      return {
        type,
        count: typePlanners.length,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      }
    }).filter((t) => t.count > 0)
  }

  const stats = calculateStats()
  const productivityByType = getProductivityByType()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Insights & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your productivity and progress</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Across all assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">Per assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overduePlanners}</div>
            <p className="text-xs text-muted-foreground">Assignments past due</p>
          </CardContent>
        </Card>
      </div>

      {/* Productivity by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Productivity by Assignment Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productivityByType.length > 0 ? (
            <div className="space-y-4">
              {productivityByType.map((type) => (
                <div key={type.type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium">{type.type}</span>
                      <span className="text-sm text-gray-500">({type.count} assignments)</span>
                    </div>
                    <span className="text-sm font-medium">{type.progress}%</span>
                  </div>
                  <Progress value={type.progress} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No data available yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {planners.slice(0, 5).map((planner) => {
              const progress = planner.tasks?.length
                ? Math.round((planner.tasks.filter((t) => t.completed).length / planner.tasks.length) * 100)
                : 0
              return (
                <div key={planner.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{planner.title}</p>
                    <p className="text-sm text-gray-500">
                      {planner.tasks?.filter((t) => t.completed).length || 0} of {planner.tasks?.length || 0} tasks
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-20" />
                    <span className="text-sm font-medium w-12 text-right">{progress}%</span>
                  </div>
                </div>
              )
            })}
            {planners.length === 0 && (
              <p className="text-center text-gray-500 py-4">No assignments yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}