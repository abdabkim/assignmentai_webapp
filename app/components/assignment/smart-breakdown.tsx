"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Brain, 
  Clock, 
  ChevronDown, 
  Lightbulb, 
  Target, 
  Calendar,
  BarChart3,
  RefreshCw,
  Zap
} from "lucide-react"
import { generateSmartBreakdown, AssignmentBreakdown } from "../../lib/assignment-breakdown"
import { Planner, Task } from "../../lib/storage"
import UrgencyIndicator from "./urgency-indicator"

interface SmartBreakdownProps {
  planner: Planner
  onTasksGenerated: (tasks: Task[]) => void
  onPlannerUpdate: (updates: Partial<Planner>) => void
}

export default function SmartBreakdown({ planner, onTasksGenerated, onPlannerUpdate }: SmartBreakdownProps) {
  const [breakdown, setBreakdown] = useState<AssignmentBreakdown | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedRecommendations, setExpandedRecommendations] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState(true)

  useEffect(() => {
    generateBreakdown()
  }, [planner.dueDate, planner.assignmentType, planner.requirements, planner.deliverables])

  const generateBreakdown = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newBreakdown = generateSmartBreakdown(planner)
      setBreakdown(newBreakdown)
    } catch (error) {
      console.error('Error generating breakdown:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const applySmartTasks = () => {
    if (breakdown) {
      onTasksGenerated(breakdown.tasks)
      onPlannerUpdate({
        tasks: breakdown.tasks,
        updatedAt: new Date().toISOString()
      })
    }
  }

  const getComplexityLabel = (score: number) => {
    if (score >= 8) return { label: 'High', color: 'bg-red-500' }
    if (score >= 6) return { label: 'Medium', color: 'bg-yellow-500' }
    return { label: 'Low', color: 'bg-green-500' }
  }

  const getAssignmentTypeLabel = (type: string) => {
    const labels = {
      essay: { label: 'Essay Writing', icon: '📝', color: 'bg-blue-500' },
      research: { label: 'Research Project', icon: '🔬', color: 'bg-purple-500' },
      presentation: { label: 'Presentation', icon: '📊', color: 'bg-green-500' },
      coding: { label: 'Coding Project', icon: '💻', color: 'bg-orange-500' },
      design: { label: 'Design Project', icon: '🎨', color: 'bg-pink-500' }
    }
    return labels[type] || labels.essay
  }

  if (!breakdown) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing assignment requirements...</p>
        </CardContent>
      </Card>
    )
  }

  const complexityInfo = getComplexityLabel(breakdown.complexityScore)
  const typeInfo = getAssignmentTypeLabel(breakdown.assignmentType)
  const progress = planner.tasks && planner.tasks.length > 0 
    ? Math.round((planner.tasks.filter(t => t.completed).length / planner.tasks.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <UrgencyIndicator 
        dueDate={planner.dueDate}
        assignmentTitle={planner.title}
        progress={progress}
        variant="detailed"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Smart Analysis
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateBreakdown}
              disabled={isGenerating}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${typeInfo.color} text-white mb-2`}>
                <span className="text-lg">{typeInfo.icon}</span>
              </div>
              <div className="text-sm font-medium">{typeInfo.label}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${complexityInfo.color} text-white mb-2`}>
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium">{complexityInfo.label} Complexity</div>
              <div className="text-xs text-gray-500">{breakdown.complexityScore}/10</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500 text-white mb-2">
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium">{Math.round(breakdown.timeToCompletion)}h</div>
              <div className="text-xs text-gray-500">Estimated Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Collapsible open={expandedTasks} onOpenChange={setExpandedTasks}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Smart Task Breakdown ({breakdown.tasks.length} phases)
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedTasks ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-4 space-y-4">
                {breakdown.tasks.map((task, index) => {
                  const isCompleted = planner.tasks?.some(t => t.name === task.name && t.completed)
                  const priorityConfig = {
                    high: { color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300', label: 'High' },
                    medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Medium' },
                    low: { color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300', label: 'Low' }
                  }
                  const priority = priorityConfig[task.priority || 'medium']
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isCompleted 
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${
                              isCompleted ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'
                            }`}>
                              {task.name}
                            </h4>
                            <Badge variant="outline" className={`text-xs ${priority.color}`}>
                              {priority.label}
                            </Badge>
                            {task.estimatedHours && (
                              <Badge variant="secondary" className="text-xs">
                                {task.estimatedHours}h
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {task.description}
                          </p>
                          {task.tip && (
                            <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                {task.tip}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>📅 Start: {new Date(task.startDate).toLocaleDateString()}</span>
                          <span>🎯 End: {new Date(task.endDate).toLocaleDateString()}</span>
                        </div>
                        {isCompleted && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            ✅ Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                {!planner.tasks || planner.tasks.length === 0 ? (
                  <div className="text-center py-6">
                    <Button onClick={applySmartTasks} className="gap-2">
                      <Zap className="h-4 w-4" />
                      Apply Smart Tasks
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      This will replace your current task list with the smart breakdown
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 border-t">
                    <Button variant="outline" onClick={applySmartTasks} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Update Tasks with Smart Breakdown
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <Collapsible open={expandedRecommendations} onOpenChange={setExpandedRecommendations}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Adaptive Recommendations ({breakdown.adaptiveRecommendations.length})
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedRecommendations ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {breakdown.adaptiveRecommendations.map((recommendation, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div className="p-1 bg-blue-500 rounded-full flex-shrink-0 mt-0.5">
                        <Lightbulb className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>
    </div>
  )
}