"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timer, Lightbulb, TrendingUp, Target } from "lucide-react"
import DailyMicroTips from "./daily-micro-tips"
import FocusTimer from "./focus-timer"
import { NotificationCenter, NotificationProvider } from "./notification-system"

interface ProductivityStats {
  tipsAppliedToday: number
  totalFocusTimeToday: number
  currentStreak: number
}

function useProductivityStats(): ProductivityStats {
  const [stats, setStats] = useState<ProductivityStats>({
    tipsAppliedToday: 0,
    totalFocusTimeToday: 0,
    currentStreak: 0
  })

  useEffect(() => {
    const today = new Date().toDateString()
    
    // Get tips applied today
    const tipsApplied = Object.keys(localStorage)
      .filter(key => key.startsWith('tip_viewed_') && key.endsWith(today))
      .length
    
    // Get focus time from timer stats
    const timerStats = localStorage.getItem(`timer_stats_${today}`)
    let focusTime = 0
    let streak = 0
    
    if (timerStats) {
      const parsed = JSON.parse(timerStats)
      focusTime = parsed.totalFocusTimeToday || 0
      streak = parsed.currentStreak || 0
    }
    
    setStats({
      tipsAppliedToday: tipsApplied,
      totalFocusTimeToday: focusTime,
      currentStreak: streak
    })
    
    // Update stats every 30 seconds
    const interval = setInterval(() => {
      const currentTipsApplied = Object.keys(localStorage)
        .filter(key => key.startsWith('tip_viewed_') && key.endsWith(today))
        .length
      
      const currentTimerStats = localStorage.getItem(`timer_stats_${today}`)
      let currentFocusTime = 0
      let currentStreak = 0
      
      if (currentTimerStats) {
        const parsed = JSON.parse(currentTimerStats)
        currentFocusTime = parsed.totalFocusTimeToday || 0
        currentStreak = parsed.currentStreak || 0
      }
      
      setStats({
        tipsAppliedToday: currentTipsApplied,
        totalFocusTimeToday: currentFocusTime,
        currentStreak: currentStreak
      })
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  return stats
}

export default function ProductivityHub() {
  const [activeTab, setActiveTab] = useState("tips")
  const stats = useProductivityStats()
  
  const formatFocusTime = (minutes: number) => {
    if (minutes === 0) return '0m'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <NotificationProvider>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Productivity Hub
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Daily tips and focus tools to boost your academic performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Boost Mode
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tips" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Daily Tips
          </TabsTrigger>
          <TabsTrigger value="timer" className="gap-2">
            <Timer className="h-4 w-4" />
            Focus Timer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="mt-6">
          <DailyMicroTips />
        </TabsContent>

        <TabsContent value="timer" className="mt-6">
          <FocusTimer />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.tipsAppliedToday}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Tips Applied</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatFocusTime(stats.totalFocusTimeToday)}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Focus Time</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.currentStreak}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Session Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </NotificationProvider>
  )
}