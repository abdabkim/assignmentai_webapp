"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Lightbulb, 
  RefreshCw, 
  BookOpen, 
  Clock, 
  Brain, 
  Target,
  Zap,
  CheckCircle,
  Star,
  TrendingUp
} from "lucide-react"
import { addNotification } from "./notification-system"

interface MicroTip {
  id: string
  title: string
  content: string
  category: 'study' | 'time-management' | 'motivation' | 'productivity' | 'wellness'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  icon: string
}

const microTips: MicroTip[] = [
  {
    id: '1',
    title: 'The 2-Minute Rule',
    content: 'If a task takes less than 2 minutes, do it immediately instead of adding it to your to-do list. This prevents small tasks from accumulating and becoming overwhelming.',
    category: 'productivity',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    icon: 'zap'
  },
  {
    id: '2',
    title: 'Active Recall While Reading',
    content: 'After reading a paragraph, close your book and try to summarize what you just read in your own words. This strengthens memory consolidation by 40% compared to passive re-reading.',
    category: 'study',
    difficulty: 'intermediate',
    estimatedTime: '5 min',
    icon: 'brain'
  },
  {
    id: '3',
    title: 'Time Boxing with Buffer',
    content: 'When planning your day, allocate 25% extra time to each task. This buffer accounts for unexpected interruptions and reduces stress from running behind schedule.',
    category: 'time-management',
    difficulty: 'intermediate',
    estimatedTime: '3 min',
    icon: 'clock'
  },
  {
    id: '4',
    title: 'The Feynman Technique',
    content: 'Explain complex concepts in simple terms as if teaching a 12-year-old. If you struggle, you\'ve found knowledge gaps to fill. This technique improves understanding by up to 60%.',
    category: 'study',
    difficulty: 'advanced',
    estimatedTime: '10 min',
    icon: 'target'
  },
  {
    id: '5',
    title: 'Energy Management Over Time Management',
    content: 'Schedule your most important work during your natural energy peaks. Most people have high energy 2-4 hours after waking. Align difficult tasks with your biological rhythm.',
    category: 'productivity',
    difficulty: 'intermediate',
    estimatedTime: '4 min',
    icon: 'trending-up'
  },
  {
    id: '6',
    title: 'The 5-Minute Focus Reset',
    content: 'When you feel distracted, do 10 deep breaths, write down what\'s on your mind, then set a timer for 5 minutes of focused work. This mini-meditation resets your attention span.',
    category: 'wellness',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    icon: 'brain'
  },
  {
    id: '7',
    title: 'Spaced Repetition for Assignments',
    content: 'Review your assignment outline 1 day, 3 days, and 7 days after creating it. Each review strengthens your understanding and reveals new connections and improvements.',
    category: 'study',
    difficulty: 'intermediate',
    estimatedTime: '6 min',
    icon: 'book-open'
  },
  {
    id: '8',
    title: 'The Progress Momentum Hack',
    content: 'Start your work session by completing one small, easy task first. This creates psychological momentum and makes tackling larger tasks feel more manageable.',
    category: 'motivation',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    icon: 'star'
  },
  {
    id: '9',
    title: 'Context Switching Cost',
    content: 'It takes an average of 23 minutes to fully refocus after an interruption. Batch similar tasks together and use "focus blocks" of at least 45 minutes for deep work.',
    category: 'productivity',
    difficulty: 'advanced',
    estimatedTime: '7 min',
    icon: 'target'
  },
  {
    id: '10',
    title: 'The Zeigarnik Effect for Motivation',
    content: 'Start working on a project for just 5 minutes, even if you don\'t feel motivated. Your brain\'s tendency to remember incomplete tasks will create natural momentum to continue.',
    category: 'motivation',
    difficulty: 'intermediate',
    estimatedTime: '5 min',
    icon: 'zap'
  }
]

const categoryConfig = {
  'study': { color: 'bg-blue-500', label: 'Study Technique' },
  'time-management': { color: 'bg-green-500', label: 'Time Management' },
  'motivation': { color: 'bg-purple-500', label: 'Motivation' },
  'productivity': { color: 'bg-orange-500', label: 'Productivity' },
  'wellness': { color: 'bg-pink-500', label: 'Wellness' }
}

const difficultyConfig = {
  'beginner': { color: 'bg-gray-500', label: 'Beginner' },
  'intermediate': { color: 'bg-yellow-500', label: 'Intermediate' },
  'advanced': { color: 'bg-red-500', label: 'Advanced' }
}

const iconMap = {
  'zap': Zap,
  'brain': Brain,
  'clock': Clock,
  'target': Target,
  'trending-up': TrendingUp,
  'book-open': BookOpen,
  'star': Star
}

export default function DailyMicroTips() {
  const [currentTip, setCurrentTip] = useState<MicroTip>(microTips[0])
  const [viewedTips, setViewedTips] = useState<Set<string>>(new Set())
  const [isNewTip, setIsNewTip] = useState(true)

  // Get tip of the day based on current date
  useEffect(() => {
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    const tipIndex = dayOfYear % microTips.length
    const todaysTip = microTips[tipIndex]
    
    setCurrentTip(todaysTip)
    
    // Check if this tip was already viewed today
    const viewedToday = localStorage.getItem(`tip_viewed_${today.toDateString()}`)
    if (viewedToday === todaysTip.id) {
      setIsNewTip(false)
    }
  }, [])

  const getRandomTip = () => {
    const availableTips = microTips.filter(tip => tip.id !== currentTip.id)
    const randomIndex = Math.floor(Math.random() * availableTips.length)
    const newTip = availableTips[randomIndex]
    setCurrentTip(newTip)
    setIsNewTip(false)
  }

  const markTipAsViewed = () => {
    const today = new Date()
    localStorage.setItem(`tip_viewed_${today.toDateString()}`, currentTip.id)
    setViewedTips(prev => new Set([...prev, currentTip.id]))
    setIsNewTip(false)
    
    // Show notification when tip is applied
    addNotification({
      title: "Tip Applied! 🎉",
      message: `Great job applying "${currentTip.title}"! Keep building those productive habits.`,
      type: 'success',
      duration: 5000
    })
  }

  const IconComponent = iconMap[currentTip.icon as keyof typeof iconMap] || Lightbulb

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">Daily Micro-Tip</CardTitle>
            {isNewTip && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 animate-pulse">
                New Today!
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={getRandomTip}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Random Tip
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tip Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {currentTip.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`${categoryConfig[currentTip.category].color} text-white text-xs`}
                >
                  {categoryConfig[currentTip.category].label}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`${difficultyConfig[currentTip.difficulty].color} text-white text-xs`}
                >
                  {difficultyConfig[currentTip.difficulty].label}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {currentTip.estimatedTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Content */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentTip.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {!viewedTips.has(currentTip.id) && (
              <Button
                variant="default"
                size="sm"
                onClick={markTipAsViewed}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Applied
              </Button>
            )}
            {viewedTips.has(currentTip.id) && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Applied
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            Tip {microTips.findIndex(tip => tip.id === currentTip.id) + 1} of {microTips.length}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}