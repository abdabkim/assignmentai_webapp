"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timer, BookOpen, Heart, Mic, Users } from "lucide-react"
import PomodoroTimer from "./tools/pomodoro-timer"
import CitationBuilder from "./tools/citation-builder"
import BurnoutDetector from "./tools/burnout-detector"
import VoiceMemoNotes from "./tools/voice-memo"
import StudyGroupCollaboration from "./tools/study-group"

export default function ToolsView() {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Student Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Powerful tools to enhance your productivity and wellness
          </p>
        </div>

        <Tabs defaultValue="pomodoro" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
            <TabsTrigger value="pomodoro" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Pomodoro</span>
            </TabsTrigger>
            <TabsTrigger value="citation" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Citations</span>
            </TabsTrigger>
            <TabsTrigger value="burnout" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wellness</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice Memos</span>
            </TabsTrigger>
            <TabsTrigger value="study" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Study Groups</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pomodoro" className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PomodoroTimer />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">About Pomodoro Technique</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p>The Pomodoro Technique helps you maintain focus and avoid burnout.</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Work in focused 25-minute sessions</li>
                    <li>Take 5-minute breaks between sessions</li>
                    <li>After 4 sessions, take a longer 15-minute break</li>
                    <li>Stay refreshed and productive all day</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="citation" className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CitationBuilder />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Citation Styles</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">APA</h4>
                    <p>American Psychological Association - Social sciences</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">MLA</h4>
                    <p>Modern Language Association - Humanities</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Chicago</h4>
                    <p>Chicago Manual of Style - History & Arts</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="burnout" className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BurnoutDetector />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Student Wellness</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p>Academic success isn't just about studying - it's about balance.</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Regular sleep (7-9 hours)</li>
                    <li>Exercise (20-30 min daily)</li>
                    <li>Social connections</li>
                    <li>Stress management</li>
                    <li>Healthy work-life balance</li>
                  </ul>
                  <p className="text-xs italic mt-4">
                    If you're experiencing severe stress, please reach out to campus counseling services.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VoiceMemoNotes />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Voice Memo Tips</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p>Capture ideas quickly while researching or studying.</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Record thoughts during reading</li>
                    <li>Capture lecture insights on the go</li>
                    <li>Voice notes are faster than typing</li>
                    <li>Perfect for mobile research</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="study" className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StudyGroupCollaboration />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Collaboration Benefits</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p>Learn better together with peer collaboration.</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Share different perspectives</li>
                    <li>Learn from peer approaches</li>
                    <li>Anonymous feedback builds confidence</li>
                    <li>Strengthen understanding through teaching</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
