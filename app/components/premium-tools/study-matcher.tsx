"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Heart, MessageCircle, UserPlus, Sparkles } from "lucide-react"

interface StudyBuddy {
  id: string
  name: string
  course: string
  matchScore: number
  vibe: string[]
  studyStyle: string
  availability: string
  interests: string[]
  bio: string
}

export default function StudyBuddyMatcher() {
  const [course, setCourse] = useState("")
  const [vibe, setVibe] = useState("")
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<StudyBuddy[]>([])

  const findMatches = () => {
    if (!course) return
    
    setSearching(true)
    setTimeout(() => {
      setMatches([
        {
          id: "1",
          name: "Alex Chen",
          course: "CS 101",
          matchScore: 95,
          vibe: ["Focused", "Collaborative", "Morning Person"],
          studyStyle: "Visual Learner",
          availability: "Mon/Wed/Fri 9-11 AM",
          interests: ["Machine Learning", "Web Dev", "Gaming"],
          bio: "Looking for a study partner who likes to break down complex topics and practice coding together. Coffee shops preferred!"
        },
        {
          id: "2",
          name: "Sam Rodriguez",
          course: "CS 101",
          matchScore: 88,
          vibe: ["Chill", "Patient", "Flexible"],
          studyStyle: "Hands-on Practice",
          availability: "Tue/Thu 2-5 PM",
          interests: ["Data Science", "Music", "Hiking"],
          bio: "Prefer working through problems together. Let's build projects and learn by doing!"
        },
        {
          id: "3",
          name: "Jordan Lee",
          course: "CS 101",
          matchScore: 82,
          vibe: ["Energetic", "Competitive", "Night Owl"],
          studyStyle: "Rapid Review",
          availability: "Weekends 7-10 PM",
          interests: ["Algorithms", "Hackathons", "Coffee"],
          bio: "High-energy study sessions! Let's crush these assignments and maybe hit a hackathon together."
        }
      ])
      setSearching(false)
    }, 2000)
  }

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-blue-600"
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-pink-600" />
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Study Buddy Matcher
          </span>
          <span className="ml-auto text-xs px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold">
            PREMIUM
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course</label>
            <Input
              placeholder="e.g., CS 101"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Study Vibe</label>
            <Select value={vibe} onValueChange={setVibe}>
              <SelectTrigger>
                <SelectValue placeholder="Select vibe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focused">Focused & Serious</SelectItem>
                <SelectItem value="chill">Chill & Relaxed</SelectItem>
                <SelectItem value="energetic">Energetic & Fast-paced</SelectItem>
                <SelectItem value="collaborative">Collaborative & Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={findMatches}
          disabled={searching || !course}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white h-12"
        >
          {searching ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Finding Your Perfect Match...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Find Study Buddies
            </>
          )}
        </Button>

        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Your Top Matches</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">{matches.length} compatible buddies</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {matches.map((buddy) => (
                <div
                  key={buddy.id}
                  className="group bg-white dark:bg-gray-800 p-6 rounded-lg border hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-pink-600">
                        {buddy.name.charAt(0)}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{buddy.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{buddy.course} • {buddy.studyStyle}</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getMatchColor(buddy.matchScore)}`}>
                            {buddy.matchScore}%
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Match</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 italic">
                        "{buddy.bio}"
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {buddy.vibe.map((v, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                            {v}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Available:</span>
                          <span>{buddy.availability}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Interests:</span>
                          <span>{buddy.interests.slice(0, 2).join(", ")}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
              <h4 className="font-semibold mb-2">Matching Tips</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Higher match scores indicate similar study styles and schedules</li>
                <li>• Check availability before reaching out</li>
                <li>• Be respectful and communicate expectations clearly</li>
              </ul>
            </div>
          </div>
        )}

        {matches.length === 0 && !searching && (
          <div className="text-center py-12 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-4">
              <Users className="h-10 w-10 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Your Perfect Study Partner</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Match with students in your course who share your study style, schedule, and vibe
            </p>
            <ul className="text-sm text-left text-gray-600 dark:text-gray-400 max-w-md mx-auto space-y-2">
              <li>✓ AI-powered compatibility matching</li>
              <li>✓ Filter by course, schedule, and study vibe</li>
              <li>✓ Connect with compatible study partners</li>
              <li>✓ Build accountability and motivation</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
