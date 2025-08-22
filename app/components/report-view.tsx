"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, BarChart, PieChart, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Planner } from "../lib/storage"

interface ReportViewProps {
  planners: Planner[]
}

export default function ReportView({ planners }: ReportViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const generateReport = () => {
    // Calculate report data
    const totalAssignments = planners.length
    const completedAssignments = planners.filter(
      (p) => p.tasks?.every((t) => t.completed)
    ).length
    const inProgressAssignments = totalAssignments - completedAssignments
    
    const totalTasks = planners.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)
    const completedTasks = planners.reduce(
      (sum, p) => sum + (p.tasks?.filter((t) => t.completed).length || 0),
      0
    )

    const byType = {
      essay: planners.filter((p) => p.assignmentType === "essay").length,
      coding: planners.filter((p) => p.assignmentType === "coding").length,
      presentation: planners.filter((p) => p.assignmentType === "presentation").length,
      design: planners.filter((p) => p.assignmentType === "design").length,
      research: planners.filter((p) => p.assignmentType === "research").length,
    }

    return {
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
      totalTasks,
      completedTasks,
      byType,
      completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  }

  const report = generateReport()

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      summary: report,
      assignments: planners.map((p) => ({
        title: p.title,
        type: p.assignmentType,
        dueDate: p.dueDate,
        progress: p.tasks?.length
          ? Math.round((p.tasks.filter((t) => t.completed).length / p.tasks.length) * 100)
          : 0,
        totalTasks: p.tasks?.length || 0,
        completedTasks: p.tasks?.filter((t) => t.completed).length || 0,
      })),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `assignment-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
          <p className="text-gray-600 dark:text-gray-300">View and export your assignment reports</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {["week", "month", "semester", "all"].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period)}
            className="capitalize"
          >
            {period === "all" ? "All Time" : `This ${period}`}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{report.completedAssignments}</div>
            <p className="text-xs text-muted-foreground">{report.completionRate}% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{report.inProgressAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.taskCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {report.completedTasks} of {report.totalTasks} tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(report.byType).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-2">
                  <span className="capitalize font-medium">{type}</span>
                  <span className="text-sm text-gray-500">{count} assignments</span>
                </div>
                <Progress 
                  value={report.totalAssignments > 0 ? (count / report.totalAssignments) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Assignment List */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {planners.length > 0 ? (
              planners.map((planner) => {
                const progress = planner.tasks?.length
                  ? Math.round((planner.tasks.filter((t) => t.completed).length / planner.tasks.length) * 100)
                  : 0
                const daysUntilDue = Math.ceil(
                  (new Date(planner.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )

                return (
                  <div key={planner.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{planner.title}</h3>
                        <p className="text-sm text-gray-500">
                          Type: {planner.assignmentType} | Due: {new Date(planner.dueDate).toLocaleDateString()}
                          {daysUntilDue > 0 && ` (${daysUntilDue} days left)`}
                          {daysUntilDue < 0 && ` (${Math.abs(daysUntilDue)} days overdue)`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{progress}%</p>
                        <p className="text-sm text-gray-500">
                          {planner.tasks?.filter((t) => t.completed).length || 0}/{planner.tasks?.length || 0} tasks
                        </p>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              })
            ) : (
              <p className="text-center text-gray-500 py-8">No assignments to report</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}