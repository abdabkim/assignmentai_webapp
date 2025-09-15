"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  FileText,
  Target,
  Crown,
  BookOpen,
  Code,
  Presentation,
  FlaskConical,
  Calculator,
  Palette,
  Music,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateAssignmentPlan } from "../lib/ai-service"
import { savePlannerToFirestore, getUserPlanners } from "../lib/firestore"
import { savePlanner, loadPlanners } from "../lib/storage"
import { useAuth } from "../contexts/auth-context"

const assignmentTypes = [
  {
    value: "essay",
    label: "Essay/Research Paper",
    icon: FileText,
    description: "Academic essays, research papers, literature reviews",
  },
  {
    value: "coding",
    label: "Programming Project",
    icon: Code,
    description: "Software development, coding assignments, algorithms",
  },
  {
    value: "presentation",
    label: "Presentation",
    icon: Presentation,
    description: "Slide presentations, oral presentations, pitches",
  },
  {
    value: "lab-report",
    label: "Lab Report",
    icon: FlaskConical,
    description: "Scientific experiments, lab analysis, research reports",
  },
  {
    value: "math",
    label: "Math/Problem Set",
    icon: Calculator,
    description: "Mathematical problems, calculations, proofs",
  },
  {
    value: "creative",
    label: "Creative Project",
    icon: Palette,
    description: "Art projects, creative writing, design work",
  },
  {
    value: "music",
    label: "Music Assignment",
    icon: Music,
    description: "Compositions, music analysis, performance preparation",
  },
  {
    value: "language",
    label: "Language Assignment",
    icon: Globe,
    description: "Foreign language exercises, translations, linguistics",
  },
  {
    value: "general",
    label: "General Assignment",
    icon: BookOpen,
    description: "Any other type of academic assignment",
  },
]

interface PlannerInputProps {
  onBack?: () => void
  onCancel?: () => void
  onPlannerCreated: (planner: any) => void
}

export default function PlannerInput({ onBack, onCancel, onPlannerCreated }: PlannerInputProps) {
  const { user, userData } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    dueDate: "",
    assignmentType: "",
    requirements: "",
    deliverables: "",
    resources: "",
    showTips: true,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [plannerCount, setPlannerCount] = useState(0)

  // Check planner count on component mount
  useEffect(() => {
    const checkPlannerCount = async () => {
      if (user) {
        try {
          const firebasePlanners = await getUserPlanners(user.uid)
          setPlannerCount(firebasePlanners.length)
        } catch (error) {
          // Fallback to localStorage if Firebase fails
          const localPlanners = loadPlanners()
          setPlannerCount(localPlanners.length)
        }
      } else {
        const localPlanners = loadPlanners()
        setPlannerCount(localPlanners.length)
      }
    }
    checkPlannerCount()
  }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

    if (!formData.title || !formData.topic || !formData.dueDate || !formData.assignmentType) {
      alert("Please fill in all required fields")
      return
    }

    if (user && !userData?.isPremium && plannerCount >= 3) {
      alert("You've reached the free limit of 3 planners. Upgrade to Premium for unlimited planners!")
      return
    }

    const today = new Date()
    const dueDate = new Date(formData.dueDate)
    if (dueDate < today) {
      alert("Due date cannot be in the past")
      return
    }

    setIsGenerating(true)

    try {
      const plan = await generateAssignmentPlan(formData)

      let savedPlanner
      if (user) {
        try {
          // Try to save to Firebase first
          savedPlanner = await savePlannerToFirestore(user.uid, plan)
        } catch (firestoreError) {
          console.error("Firestore save error:", firestoreError)

          // Fallback to localStorage
          savedPlanner = savePlanner({
            ...plan,
            userId: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

          alert("Plan saved locally. Cloud sync will be available when you're online.")
        }
      } else {
        // Save to localStorage for non-authenticated users
        savedPlanner = savePlanner({
          ...plan,
          userId: "guest",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      onPlannerCreated(savedPlanner)
    } catch (error) {
      console.error("Error generating plan:", error)

      if (error.message.includes("API key not configured") || error.message.includes("Gemini AI is not configured")) {
        alert("AI service is not configured. Please check that your NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file. You can get a free API key from https://makersuite.google.com/app/apikey")
      } else if (error.message.includes("API request failed")) {
        alert("Unable to connect to AI service. Please check your internet connection and try again.")
      } else {
        alert(`Failed to generate plan: ${error.message}`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedType = assignmentTypes.find((type) => type.value === formData.assignmentType)

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack || onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Assignment Plan</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Let AI help you break down any assignment into manageable steps
            </p>
          </div>
          {userData?.isPremium && (
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Usage Limit Warning for Free Users */}
        {user && !userData?.isPremium && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{3 - plannerCount}</span>
                </div>
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    {3 - plannerCount} free planners remaining
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    Upgrade to Premium for unlimited planners and advanced features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Assignment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Assignment Type */}
              <div className="space-y-2">
                <Label htmlFor="assignmentType" className="flex items-center gap-2 dark:text-white">
                  <BookOpen className="h-4 w-4" />
                  Assignment Type *
                </Label>
                <Select
                  value={formData.assignmentType}
                  onValueChange={(value) => handleInputChange("assignmentType", value)}
                >
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    {assignmentTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="dark:text-white dark:focus:bg-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {selectedType && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedType.description}</p>
                )}
              </div>

              {/* Assignment Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2 dark:text-white">
                  <FileText className="h-4 w-4" />
                  Assignment Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., React Todo App, History Research Paper, Marketing Presentation"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Topic/Description */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="flex items-center gap-2 dark:text-white">
                  <Target className="h-4 w-4" />
                  Assignment Description *
                </Label>
                <Textarea
                  id="topic"
                  placeholder="Describe what you need to do, the main topic, objectives, and any specific instructions..."
                  value={formData.topic}
                  onChange={(e) => handleInputChange("topic", e.target.value)}
                  rows={3}
                  required
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="dark:text-white">
                  Requirements & Specifications
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="List specific requirements: word count, programming languages, tools, format, citations style, etc."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  rows={2}
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Deliverables */}
              <div className="space-y-2">
                <Label htmlFor="deliverables" className="dark:text-white">
                  Deliverables & Output
                </Label>
                <Textarea
                  id="deliverables"
                  placeholder="What should you submit? (e.g., PDF report, source code, presentation slides, demo video)"
                  value={formData.deliverables}
                  onChange={(e) => handleInputChange("deliverables", e.target.value)}
                  rows={2}
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Resources */}
              <div className="space-y-2">
                <Label htmlFor="resources" className="dark:text-white">
                  Resources & Materials
                </Label>
                <Textarea
                  id="resources"
                  placeholder="List available resources: textbooks, datasets, APIs, software, research papers, etc."
                  value={formData.resources}
                  onChange={(e) => handleInputChange("resources", e.target.value)}
                  rows={2}
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2 dark:text-white">
                  <Calendar className="h-4 w-4" />
                  Due Date *
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  min={today}
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  required
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Show Tips Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="showTips" className="text-base font-medium dark:text-white">
                    Include Helpful Tips
                    {userData?.isPremium && (
                      <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                        Enhanced
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get helpful advice and best practices for each step
                  </p>
                </div>
                <Switch
                  id="showTips"
                  checked={formData.showTips}
                  onCheckedChange={(checked) => handleInputChange("showTips", checked)}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isGenerating || (user && !userData?.isPremium && plannerCount >= 3)}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Plan
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  This may take a few moments while AI analyzes your assignment...
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Tips for Better Plans</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                • <strong>Be specific:</strong> Include exact requirements, tools, and technologies needed
              </li>
              <li>
                • <strong>Add context:</strong> Mention your skill level and available time per day
              </li>
              <li>
                • <strong>List constraints:</strong> Budget limits, software restrictions, or resource availability
              </li>
              <li>
                • <strong>Include examples:</strong> Reference similar projects or desired outcomes
              </li>
              <li>
                • <strong>Mention evaluation:</strong> How will this be graded or assessed?
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
