"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Clock, TrendingUp, AlertCircle, Sparkles } from "lucide-react"

interface ProcrastinationData {
  tasksDelayed: number
  daysPostponed: number
  completionRate: number
  timeOfDay: string[]
}

export default function ProcrastinationAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false)
  const [hasData, setHasData] = useState(false)

  const analyzePatterns = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setHasData(true)
    }, 2000)
  }

  const mockData: ProcrastinationData = {
    tasksDelayed: 12,
    daysPostponed: 3.5,
    completionRate: 68,
    timeOfDay: ['Late Night', 'Early Morning']
  }

  const insights = [
    {
      title: "Peak Procrastination Time",
      value: "11 PM - 2 AM",
      trend: "↑ 23% from last week",
      color: "text-red-600",
      icon: Clock
    },
    {
      title: "Most Delayed Task Type",
      value: "Research Papers",
      trend: "Avg. 4.2 days delay",
      color: "text-orange-600",
      icon: AlertCircle
    },
    {
      title: "Completion Momentum",
      value: `${mockData.completionRate}%`,
      trend: "↑ 12% improvement",
      color: "text-green-600",
      icon: TrendingUp
    }
  ]

  const aiRecommendations = [
    "🎯 Break large tasks into 15-minute micro-tasks to reduce overwhelm",
    "⏰ Your productivity peaks at 9-11 AM - schedule difficult work then",
    "🔄 Start assignments 2 days earlier than your typical pattern to build buffer",
    "📊 Set accountability check-ins every 2 days to maintain momentum"
  ]

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Procrastination Pattern Analyzer
          </span>
          <span className="ml-auto text-xs px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold">
            PREMIUM
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="analyze">AI Analysis</TabsTrigger>
            <TabsTrigger value="insights">Deep Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            {!hasData ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                  <Sparkles className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Pattern Detection</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Our AI analyzes your assignment history to identify procrastination patterns and provide personalized strategies
                </p>
                <Button
                  onClick={analyzePatterns}
                  disabled={analyzing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing Patterns...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze My Patterns
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.map((insight, idx) => {
                    const Icon = insight.icon
                    return (
                      <div key={idx} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 bg-gray-100 dark:bg-gray-700 rounded-lg`}>
                            <Icon className={`h-5 w-5 ${insight.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{insight.title}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{insight.value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{insight.trend}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI-Generated Recommendations
                  </h4>
                  <div className="space-y-3">
                    {aiRecommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h4 className="font-semibold mb-4">Delay Patterns</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Essays</span>
                      <span className="text-sm font-semibold">5.2 days avg</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[87%] bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Coding Projects</span>
                      <span className="text-sm font-semibold">3.1 days avg</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[52%] bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Presentations</span>
                      <span className="text-sm font-semibold">1.8 days avg</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[30%] bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h4 className="font-semibold mb-4">Productivity Windows</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm flex-1">9 AM - 11 AM</span>
                    <span className="text-xs text-green-600 font-semibold">PEAK</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm flex-1">2 PM - 4 PM</span>
                    <span className="text-xs text-yellow-600 font-semibold">GOOD</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm flex-1">11 PM - 2 AM</span>
                    <span className="text-xs text-red-600 font-semibold">AVOID</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
