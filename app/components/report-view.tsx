"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, BarChart, PieChart, TrendingUp, FileDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  const handleExportPDF = () => {
    // Generate HTML content for the report
    const reportDate = new Date().toLocaleDateString()
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Assignment Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .summary-item { margin: 10px 0; }
          .assignment { border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .progress-bar { background: #e5e7eb; height: 10px; border-radius: 5px; margin: 10px 0; }
          .progress-fill { background: #3b82f6; height: 100%; border-radius: 5px; }
          .label { font-weight: bold; color: #666; }
        </style>
      </head>
      <body>
        <h1>Assignment Report</h1>
        <p>Generated on ${reportDate}</p>
        <p>Period: ${selectedPeriod === "all" ? "All Time" : `This ${selectedPeriod}`}</p>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-item"><span class="label">Total Assignments:</span> ${report.totalAssignments}</div>
          <div class="summary-item"><span class="label">Completed:</span> ${report.completedAssignments} (${report.completionRate}%)</div>
          <div class="summary-item"><span class="label">In Progress:</span> ${report.inProgressAssignments}</div>
          <div class="summary-item"><span class="label">Task Completion Rate:</span> ${report.taskCompletionRate}%</div>
          <div class="summary-item"><span class="label">Total Tasks:</span> ${report.completedTasks} of ${report.totalTasks} completed</div>
        </div>
        
        <h2>Assignments by Type</h2>
        ${Object.entries(report.byType).map(([type, count]) => 
          `<div class="summary-item"><span class="label">${type}:</span> ${count} assignments</div>`
        ).join('')}
        
        <h2>Assignment Details</h2>
        ${planners.map(p => {
          const progress = p.tasks?.length
            ? Math.round((p.tasks.filter((t) => t.completed).length / p.tasks.length) * 100)
            : 0
          return `
            <div class="assignment">
              <h3>${p.title}</h3>
              <p><span class="label">Type:</span> ${p.assignmentType}</p>
              <p><span class="label">Due Date:</span> ${new Date(p.dueDate).toLocaleDateString()}</p>
              <p><span class="label">Progress:</span> ${progress}% (${p.tasks?.filter(t => t.completed).length || 0}/${p.tasks?.length || 0} tasks)</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
              </div>
            </div>
          `
        }).join('')}
      </body>
      </html>
    `

    // Create a new window and print it as PDF
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const handleExportDOCX = () => {
    // Generate HTML content that Word can properly read
    const reportDate = new Date().toLocaleDateString()
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="utf-8">
        <title>Assignment Report</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page { margin: 1in; }
          body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }
          h1 { font-size: 18pt; color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { font-size: 14pt; color: #374151; margin-top: 20px; }
          h3 { font-size: 12pt; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 8px; text-align: left; border: 1px solid #d1d5db; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .summary { background-color: #f9fafb; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <h1>Assignment Report</h1>
        <p><strong>Generated on:</strong> ${reportDate}</p>
        <p><strong>Period:</strong> ${selectedPeriod === "all" ? "All Time" : `This ${selectedPeriod}`}</p>
        
        <div class="summary">
          <h2>Executive Summary</h2>
          <table border="1" cellspacing="0" cellpadding="8">
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Assignments</td><td>${report.totalAssignments}</td></tr>
            <tr><td>Completed</td><td>${report.completedAssignments} (${report.completionRate}%)</td></tr>
            <tr><td>In Progress</td><td>${report.inProgressAssignments}</td></tr>
            <tr><td>Task Completion Rate</td><td>${report.taskCompletionRate}%</td></tr>
            <tr><td>Total Tasks</td><td>${report.completedTasks} of ${report.totalTasks} completed</td></tr>
          </table>
        </div>
        
        <h2>Assignments by Type</h2>
        <table border="1" cellspacing="0" cellpadding="8">
          <tr><th>Type</th><th>Count</th></tr>
          ${Object.entries(report.byType).map(([type, count]) => 
            `<tr><td style="text-transform: capitalize;">${type}</td><td>${count}</td></tr>`
          ).join('')}
        </table>
        
        <h2>Assignment Details</h2>
        ${planners.map(p => {
          const progress = p.tasks?.length
            ? Math.round((p.tasks.filter((t) => t.completed).length / p.tasks.length) * 100)
            : 0
          return `
            <div style="page-break-inside: avoid; margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb;">
              <h3>${p.title}</h3>
              <table border="1" cellspacing="0" cellpadding="8">
                <tr><td><strong>Type:</strong></td><td>${p.assignmentType}</td></tr>
                <tr><td><strong>Due Date:</strong></td><td>${new Date(p.dueDate).toLocaleDateString()}</td></tr>
                <tr><td><strong>Progress:</strong></td><td>${progress}% (${p.tasks?.filter(t => t.completed).length || 0}/${p.tasks?.length || 0} tasks completed)</td></tr>
              </table>
            </div>
          `
        }).join('')}
      </body>
      </html>
    `

    // Create and download the file as .doc (HTML format that Word can open)
    const blob = new Blob([htmlContent], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `assignment-report-${new Date().toISOString().split("T")[0]}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">View and export your assignment reports</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportDOCX}>
              <FileText className="h-4 w-4 mr-2" />
              Export as Word (.doc)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {["week", "month", "semester", "all"].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period)}
            className="capitalize text-sm sm:text-base"
          >
            {period === "all" ? "All Time" : `This ${period}`}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <span className="capitalize font-medium text-sm sm:text-base">{type}</span>
                  <span className="text-xs sm:text-sm text-gray-500">{count} assignments</span>
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm sm:text-base">{planner.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Type: {planner.assignmentType} | Due: {new Date(planner.dueDate).toLocaleDateString()}
                          {daysUntilDue > 0 && ` (${daysUntilDue} days left)`}
                          {daysUntilDue < 0 && ` (${Math.abs(daysUntilDue)} days overdue)`}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-medium text-sm sm:text-base">{progress}%</p>
                        <p className="text-xs sm:text-sm text-gray-500">
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
