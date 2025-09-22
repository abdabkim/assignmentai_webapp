"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Settings, 
  Clock,
  Target,
  Zap,
  Timer
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { addNotification } from "./notification-system"

interface TimerSession {
  type: 'focus' | 'short-break' | 'long-break'
  duration: number
  completed: boolean
  startTime?: Date
  endTime?: Date
}

interface TimerStats {
  focusSessionsToday: number
  totalFocusTimeToday: number
  currentStreak: number
  longestStreak: number
}

const timerPresets = {
  pomodoro: { focus: 25, shortBreak: 5, longBreak: 15 },
  extended: { focus: 45, shortBreak: 10, longBreak: 20 },
  sprint: { focus: 15, shortBreak: 3, longBreak: 10 },
  marathon: { focus: 90, shortBreak: 15, longBreak: 30 }
}

const motivationalMessages = [
  "You're in the zone! Keep going strong.",
  "Focus is your superpower. Use it wisely.",
  "Every minute of focus gets you closer to your goals.",
  "Deep work is where breakthroughs happen.",
  "Your future self will thank you for this focus session.",
  "Concentration is the key to economic results.",
  "The expert in anything was once a beginner who refused to give up.",
  "Success is the sum of small efforts repeated day in and day out."
]

export default function FocusTimer() {
  const [currentSession, setCurrentSession] = useState<TimerSession>({
    type: 'focus',
    duration: 25,
    completed: false
  })
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [stats, setStats] = useState<TimerStats>({
    focusSessionsToday: 0,
    totalFocusTimeToday: 0,
    currentStreak: 0,
    longestStreak: 0
  })
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof timerPresets>('pomodoro')
  const [showSettings, setShowSettings] = useState(false)
  const [customDuration, setCustomDuration] = useState([25])
  const [motivationalMessage, setMotivationalMessage] = useState(motivationalMessages[0])
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load stats from localStorage on mount
  useEffect(() => {
    const today = new Date().toDateString()
    const savedStats = localStorage.getItem(`timer_stats_${today}`)
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [])

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Update motivational message periodically
  useEffect(() => {
    if (isRunning) {
      const messageInterval = setInterval(() => {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
        setMotivationalMessage(randomMessage)
      }, 60000) // Change message every minute during focus

      return () => clearInterval(messageInterval)
    }
  }, [isRunning])

  const handleSessionComplete = () => {
    setIsRunning(false)
    
    // Show in-app notification
    addNotification({
      title: "Focus Session Complete!",
      message: `Your ${currentSession.type === 'focus' ? 'focus session' : 'break'} is complete. ${currentSession.type === 'focus' ? 'Time for a break!' : 'Ready to focus again?'}`,
      type: 'success',
      duration: 10000,
      actions: currentSession.type === 'focus' ? [
        {
          label: 'Start Break',
          action: () => {
            const breakType = (sessionCount + 1) % 4 === 0 ? 'long-break' : 'short-break'
            const breakDuration = breakType === 'long-break' 
              ? timerPresets[selectedPreset].longBreak 
              : timerPresets[selectedPreset].shortBreak
            
            setCurrentSession({
              type: breakType,
              duration: breakDuration,
              completed: false
            })
            setTimeLeft(breakDuration * 60)
            setIsRunning(true)
          }
        }
      ] : [
        {
          label: 'Start Focus',
          action: () => {
            setCurrentSession({
              type: 'focus',
              duration: timerPresets[selectedPreset].focus,
              completed: false
            })
            setTimeLeft(timerPresets[selectedPreset].focus * 60)
            setIsRunning(true)
          }
        }
      ]
    })
    
    // Show browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Focus Timer", {
        body: `${currentSession.type === 'focus' ? 'Focus session' : 'Break'} completed!`,
        icon: "/favicon.ico"
      })
    }
    
    // Update stats
    if (currentSession.type === 'focus') {
      const today = new Date().toDateString()
      const newStats = {
        ...stats,
        focusSessionsToday: stats.focusSessionsToday + 1,
        totalFocusTimeToday: stats.totalFocusTimeToday + currentSession.duration,
        currentStreak: stats.currentStreak + 1,
        longestStreak: Math.max(stats.longestStreak, stats.currentStreak + 1)
      }
      setStats(newStats)
      localStorage.setItem(`timer_stats_${today}`, JSON.stringify(newStats))
    }
    
    // Auto-switch to break after focus session
    if (currentSession.type === 'focus') {
      const breakType = (sessionCount + 1) % 4 === 0 ? 'long-break' : 'short-break'
      const breakDuration = breakType === 'long-break' 
        ? timerPresets[selectedPreset].longBreak 
        : timerPresets[selectedPreset].shortBreak
      
      setCurrentSession({
        type: breakType,
        duration: breakDuration,
        completed: false
      })
      setTimeLeft(breakDuration * 60)
      setSessionCount(prev => prev + 1)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    setCurrentSession(prev => ({
      ...prev,
      startTime: new Date()
    }))
    
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(currentSession.duration * 60)
  }

  const applyPreset = (presetName: keyof typeof timerPresets) => {
    const preset = timerPresets[presetName]
    setSelectedPreset(presetName)
    setCurrentSession({
      type: 'focus',
      duration: preset.focus,
      completed: false
    })
    setTimeLeft(preset.focus * 60)
    setIsRunning(false)
  }

  const applyCustomDuration = () => {
    const duration = customDuration[0]
    setCurrentSession({
      type: 'focus',
      duration: duration,
      completed: false
    })
    setTimeLeft(duration * 60)
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSessionIcon = () => {
    switch (currentSession.type) {
      case 'focus':
        return <Brain className="h-5 w-5" />
      case 'short-break':
        return <Coffee className="h-5 w-5" />
      case 'long-break':
        return <Target className="h-5 w-5" />
      default:
        return <Timer className="h-5 w-5" />
    }
  }

  const getSessionColor = () => {
    switch (currentSession.type) {
      case 'focus':
        return 'from-blue-500 to-purple-500'
      case 'short-break':
        return 'from-green-500 to-teal-500'
      case 'long-break':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const progressPercentage = ((currentSession.duration * 60 - timeLeft) / (currentSession.duration * 60)) * 100

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-gradient-to-br ${getSessionColor()} rounded-lg text-white`}>
              {getSessionIcon()}
            </div>
            <CardTitle className="text-lg">Focus Timer</CardTitle>
            <Badge variant="secondary" className="capitalize">
              {currentSession.type.replace('-', ' ')}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white">
            {formatTime(timeLeft)}
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="w-full h-3"
          />
          
          {isRunning && currentSession.type === 'focus' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              {motivationalMessage}
            </p>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <Button onClick={startTimer} className="gap-2 px-8">
              <Play className="h-4 w-4" />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" className="gap-2 px-8">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          
          <Button onClick={resetTimer} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.focusSessionsToday}</div>
            <div className="text-xs text-gray-500">Sessions Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.floor(stats.totalFocusTimeToday / 60)}h</div>
            <div className="text-xs text-gray-500">Focus Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.longestStreak}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
        </div>

        {/* Settings Panel */}
        <Collapsible open={showSettings} onOpenChange={setShowSettings}>
          <CollapsibleContent className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold mb-3">Timer Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(timerPresets).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant={selectedPreset === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyPreset(key as keyof typeof timerPresets)}
                    className="capitalize"
                  >
                    {key}
                    <div className="text-xs ml-2">
                      {preset.focus}m
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Custom Duration</h4>
              <div className="space-y-3">
                <Slider
                  value={customDuration}
                  onValueChange={setCustomDuration}
                  max={120}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{customDuration[0]} minutes</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyCustomDuration}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}