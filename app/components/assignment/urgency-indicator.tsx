"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Clock, CheckCircle, Target, TrendingUp, Zap } from "lucide-react"
import { calculateUrgencyMetrics } from "../../lib/assignment-breakdown"

interface UrgencyIndicatorProps {
  dueDate: string
  assignmentTitle: string
  progress?: number
  className?: string
  variant?: 'compact' | 'detailed'
}

export default function UrgencyIndicator({ 
  dueDate, 
  assignmentTitle, 
  progress = 0, 
  className = "",
  variant = 'compact' 
}: UrgencyIndicatorProps) {
  const urgencyMetrics = calculateUrgencyMetrics(dueDate)
  
  const getUrgencyConfig = () => {
    switch (urgencyMetrics.urgencyLevel) {
      case 'critical':
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          textColor: 'text-red-700 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: AlertTriangle,
          label: urgencyMetrics.daysUntilDue < 0 ? 'Overdue' : 'Critical',
          description: urgencyMetrics.daysUntilDue < 0 
            ? `${Math.abs(urgencyMetrics.daysUntilDue)} days overdue`
            : 'Due very soon'
        }
      case 'high':
        return {
          color: 'bg-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          textColor: 'text-orange-700 dark:text-orange-300',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: Clock,
          label: 'High Priority',
          description: `${urgencyMetrics.daysUntilDue} days remaining`
        }
      case 'medium':
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: Target,
          label: 'Moderate',
          description: `${urgencyMetrics.daysUntilDue} days to complete`
        }
      case 'low':
        return {
          color: 'bg-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          textColor: 'text-green-700 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: CheckCircle,
          label: 'On Track',
          description: `${urgencyMetrics.daysUntilDue} days available`
        }
    }
  }
  
  const config = getUrgencyConfig()
  const IconComponent = config.icon
  
  const expectedProgress = Math.max(0, 100 - (urgencyMetrics.daysUntilDue * 100 / 30))
  const progressRisk = progress < expectedProgress - 20 ? 'behind' : 
                      progress > expectedProgress + 10 ? 'ahead' : 'on-track'
  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`p-1 rounded-full ${config.color}`}>
          <IconComponent className="h-3 w-3 text-white" />
        </div>
        <Badge variant="outline" className={`${config.textColor} ${config.borderColor}`}>
          {config.label}
        </Badge>
        <span className="text-xs text-gray-500">
          {config.description}
        </span>
      </div>
    )
  }
  
  return (
    <Card className={`${config.borderColor} border-2 ${className}`}>
      <CardContent className={`p-4 ${config.bgColor}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${config.color}`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className={`font-semibold ${config.textColor}`}>
                  {config.label} Priority
                </h4>
                <p className={`text-sm ${config.textColor} opacity-80`}>
                  {config.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${config.textColor}`}>
                {urgencyMetrics.urgencyScore}
              </div>
              <div className={`text-xs ${config.textColor} opacity-80`}>
                Urgency Score
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={config.textColor}>Progress</span>
              <span className={config.textColor}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {progressRisk !== 'on-track' && (
              <div className="flex items-center gap-1">
                {progressRisk === 'behind' ? (
                  <>
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Behind expected progress
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Ahead of schedule
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-current/20">
            <div className="text-center">
              <div className={`text-lg font-bold ${config.textColor}`}>
                {urgencyMetrics.workingDaysUntilDue}
              </div>
              <div className={`text-xs ${config.textColor} opacity-80`}>
                Working Days
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${config.textColor}`}>
                {urgencyMetrics.recommendedHoursPerDay}h
              </div>
              <div className={`text-xs ${config.textColor} opacity-80`}>
                Per Day
              </div>
            </div>
          </div>
          
          {urgencyMetrics.urgencyLevel === 'critical' && (
            <div className="mt-3 p-2 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Immediate Action Required
                </span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Focus on core requirements only. Consider seeking help or extension.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}