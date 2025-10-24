"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gauge, Clock, AlertTriangle, CheckCircle, Sparkles, TrendingUp } from "lucide-react"

interface ComplexityResult {
  score: number
  level: string
  estimatedHours: number
  breakdown: {
    research: number
    writing: number
    revision: number
    formatting: number
  }
  risks: string[]
  recommendations: string[]
}

export default function AssignmentComplexityPredictor() {
  const [assignmentType, setAssignmentType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<ComplexityResult | null>(null)

  const analyzeComplexity = () => {
    setAnalyzing(true)
    setTimeout(() => {
      const mockResult: ComplexityResult = {
        score: 78,
        level: "High",
        estimatedHours: 24,
        breakdown: {
          research: 8,
          writing: 10,
          revision: 4,
          formatting: 2
        },
        risks: [
          "Large scope may lead to scope creep",
          "Multiple sources required - allow extra time",
          "Complex topic requires deep understanding"
        ],
        recommendations: [
          "Start 2 weeks before deadline minimum",
          "Break into 4 major milestones",
          "Schedule 2 peer review sessions",
          "Allocate 3 hours daily during final week"
        ]
      }
      setResult(mockResult)
      setAnalyzing(false)
    }, 2500)
  }

  const getComplexityColor = (score: number) => {
    if (score >= 70) return { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", gradient: "from-red-500 to-orange-500" }
    if (score >= 40) return { color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", gradient: "from-yellow-500 to-orange-500" }
    return { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", gradient: "from-green-500 to-teal-500" }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-6 w-6 text-orange-600" />
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Assignment Complexity Predictor
          </span>
          <span className="ml-auto text-xs px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold">
            PREMIUM
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Assignment Type</label>
              <Select value={assignmentType} onValueChange={setAssignmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essay">Research Essay</SelectItem>
                  <SelectItem value="coding">Coding Project</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="lab">Lab Report</SelectItem>
                  <SelectItem value="research">Research Paper</SelectItem>
                  <SelectItem value="design">Design Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assignment Title</label>
              <Input
                placeholder="e.g., Analysis of Climate Change Policies"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Brief description of what the assignment requires..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Key Requirements</label>
              <Textarea
                placeholder="e.g., 3000 words, 10+ sources, APA format..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={2}
              />
            </div>

            <Button
              onClick={analyzeComplexity}
              disabled={analyzing || !assignmentType || !title}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-12"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Complexity...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Predict Complexity & Time
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg border shadow-md">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{assignmentType}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResult(null)}
                >
                  New Analysis
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                  <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                    <div className="relative w-24 h-24">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.score / 100)}`}
                          className={getComplexityColor(result.score).color}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{result.score}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Complexity</span>
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getComplexityColor(result.score).bg} ${getComplexityColor(result.score).color}`}>
                    {result.level} Complexity
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-blue-600 mb-2">{result.estimatedHours}h</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Time</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">≈ {Math.ceil(result.estimatedHours / 3)} days at 3h/day</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Time Breakdown
                </h4>
                <div className="space-y-3">
                  {Object.entries(result.breakdown).map(([phase, hours]) => (
                    <div key={phase}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="capitalize">{phase}</span>
                        <span className="font-semibold">{hours} hours</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getComplexityColor(result.score).gradient} rounded-full`}
                          style={{ width: `${(hours / result.estimatedHours) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Potential Risks
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {result.risks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 flex-shrink-0 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Recommendations
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 flex-shrink-0 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {!result && (
          <div className="text-center py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-3">
              <Gauge className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered Time Estimation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Get accurate time predictions and complexity analysis before you start
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
