"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, PieChart } from "lucide-react"
import type { Planner } from "../lib/storage"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line } from "recharts"

interface DashboardChartsProps {
  planners: Planner[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function DashboardCharts({ planners }: DashboardChartsProps) {
  // Assignment type distribution
  const assignmentTypeData = planners.reduce((acc: any[], planner) => {
    const type = planner.assignmentType || 'essay'
    const existing = acc.find(item => item.name === type)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: type, value: 1 })
    }
    return acc
  }, [])

  // Progress distribution
  const progressData = planners.map(planner => {
    const progress = planner.tasks && planner.tasks.length > 0
      ? Math.round((planner.tasks.filter(t => t.completed).length / planner.tasks.length) * 100)
      : 0
    
    return {
      name: planner.title.substring(0, 15) + (planner.title.length > 15 ? '...' : ''),
      progress
    }
  }).slice(0, 6)

  // Completion trend (last 7 days)
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }
    return days
  }

  const trendData = getLast7Days().map(day => ({
    day,
    completed: Math.floor(Math.random() * 5) // Simulated data
  }))

  if (planners.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Assignment Progress Bar Chart */}
      {progressData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Assignment Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="progress" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Assignment Type Distribution */}
      {assignmentTypeData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
              Assignment Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={assignmentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assignmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Completion Trend */}
      <Card className="shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
            7-Day Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
