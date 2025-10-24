"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardTimeWidget() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-100" />
            <span className="text-sm font-medium text-blue-100">Current Time</span>
          </div>
          <CalendarIcon className="h-5 w-5 text-blue-200" />
        </div>
        
        <div className="space-y-2">
          <div className="text-4xl font-bold text-white font-mono tracking-tight">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-blue-100">
            {formatDate(currentTime)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
