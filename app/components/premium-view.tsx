"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Network, Image, Gauge, Users, Crown } from "lucide-react"
import ProcrastinationAnalyzer from "./premium-tools/procrastination-analyzer"
import ResearchConnectionMapper from "./premium-tools/research-mapper"
import ScreenshotLectureNotes from "./premium-tools/screenshot-notes"
import AssignmentComplexityPredictor from "./premium-tools/complexity-predictor"
import StudyBuddyMatcher from "./premium-tools/study-matcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface PremiumViewProps {
  isPremium: boolean
}

export default function PremiumView({ isPremium }: PremiumViewProps) {
  const router = useRouter()

  if (!isPremium) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-orange-900/10">
        <Card className="max-w-2xl mx-4">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
              <Crown className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Unlock Premium Features
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-xl mx-auto">
              Get access to AI-powered tools that take your productivity to the next level
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h3 className="font-semibold">Procrastination Analyzer</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI identifies your patterns and provides personalized strategies
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Network className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold">Research Connection Mapper</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover hidden connections in your research topics
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Image className="h-6 w-6 text-green-600" />
                  <h3 className="font-semibold">Screenshot → Notes</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Convert lecture slides to searchable, organized notes
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Gauge className="h-6 w-6 text-orange-600" />
                  <h3 className="font-semibold">Complexity Predictor</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get accurate time estimates before starting assignments
                </p>
              </div>
              
              <div className="col-span-1 md:col-span-2 bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-pink-600" />
                  <h3 className="font-semibold">Study Buddy Matcher</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find compatible study partners by course, schedule, and vibe
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push("/premium")}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white px-8 py-6 text-lg h-auto shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Premium
            </Button>
            
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              7-day free trial • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-orange-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Premium Features
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced AI-powered tools to supercharge your academic success
          </p>
        </div>

        <Tabs defaultValue="procrastination" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8 bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="procrastination" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Procrastination</span>
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Research</span>
            </TabsTrigger>
            <TabsTrigger value="screenshot" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Screenshot</span>
            </TabsTrigger>
            <TabsTrigger value="complexity" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">Complexity</span>
            </TabsTrigger>
            <TabsTrigger value="matcher" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Study Buddy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="procrastination" className="animate-in fade-in slide-in-from-bottom-4">
            <ProcrastinationAnalyzer />
          </TabsContent>

          <TabsContent value="research" className="animate-in fade-in slide-in-from-bottom-4">
            <ResearchConnectionMapper />
          </TabsContent>

          <TabsContent value="screenshot" className="animate-in fade-in slide-in-from-bottom-4">
            <ScreenshotLectureNotes />
          </TabsContent>

          <TabsContent value="complexity" className="animate-in fade-in slide-in-from-bottom-4">
            <AssignmentComplexityPredictor />
          </TabsContent>

          <TabsContent value="matcher" className="animate-in fade-in slide-in-from-bottom-4">
            <StudyBuddyMatcher />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
