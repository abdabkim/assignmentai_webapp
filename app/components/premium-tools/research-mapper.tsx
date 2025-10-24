"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Network, Sparkles, Link2, BookOpen, ExternalLink } from "lucide-react"

interface Connection {
  id: string
  title: string
  relevance: number
  type: string
  summary: string
}

export default function ResearchConnectionMapper() {
  const [topic, setTopic] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [connections, setConnections] = useState<Connection[]>([])

  const findConnections = () => {
    if (!topic.trim()) return
    
    setAnalyzing(true)
    setTimeout(() => {
      setConnections([
        {
          id: "1",
          title: "Neural Networks in Climate Modeling",
          relevance: 95,
          type: "Related Field",
          summary: "Applies similar AI techniques to environmental science, showing cross-domain applications"
        },
        {
          id: "2",
          title: "Ethical Implications of Machine Learning",
          relevance: 88,
          type: "Ethical Perspective",
          summary: "Explores societal impact and bias considerations relevant to your research area"
        },
        {
          id: "3",
          title: "Data Preprocessing Best Practices",
          relevance: 92,
          type: "Methodology",
          summary: "Provides foundational techniques applicable to your data collection approach"
        },
        {
          id: "4",
          title: "Interdisciplinary AI Applications",
          relevance: 79,
          type: "Broad Context",
          summary: "Shows how your topic connects to healthcare, finance, and education sectors"
        }
      ])
      setAnalyzing(false)
    }, 2500)
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardTitle className="flex items-center gap-2">
          <Network className="h-6 w-6 text-blue-600" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Research Connection Mapper
          </span>
          <span className="ml-auto text-xs px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold">
            PREMIUM
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter Your Research Topic</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Machine Learning in Healthcare"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && findConnections()}
                className="flex-1"
              />
              <Button
                onClick={findConnections}
                disabled={analyzing || !topic.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finding...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Map Connections
                  </>
                )}
              </Button>
            </div>
          </div>

          {connections.length === 0 && !analyzing && (
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <Network className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Hidden Connections</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Enter your research topic to find related studies, methodologies, and cross-disciplinary insights
              </p>
            </div>
          )}

          {connections.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Discovered Connections</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {connections.length} relevant connections found
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="group bg-white dark:bg-gray-800 p-5 rounded-lg border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="relative w-16 h-16">
                          <svg className="transform -rotate-90 w-16 h-16">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - conn.relevance / 100)}`}
                              className={conn.relevance >= 90 ? "text-green-500" : conn.relevance >= 80 ? "text-yellow-500" : "text-blue-500"}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold">{conn.relevance}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {conn.title}
                          </h4>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            <Link2 className="h-3 w-3" />
                            {conn.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {conn.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Next Steps</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Explore high-relevance connections (90%+) first</li>
                      <li>• Look for methodology overlaps you can adapt</li>
                      <li>• Consider cross-disciplinary perspectives for innovation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
