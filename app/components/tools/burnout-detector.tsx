"use client"

import { useState, useEffect } from "react"
import { Heart, AlertTriangle, CheckCircle, Brain, Activity, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface BurnoutMetrics {
  workload: number;
  sleepQuality: number;
  stressLevel: number;
  socialTime: number;
  exerciseFrequency: number;
}

export default function BurnoutDetector() {
  const [metrics, setMetrics] = useState<BurnoutMetrics>({
    workload: 5,
    sleepQuality: 5,
    stressLevel: 5,
    socialTime: 5,
    exerciseFrequency: 5,
  });
  const [burnoutScore, setBurnoutScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    calculateBurnoutScore();
  }, [metrics]);

  const calculateBurnoutScore = () => {
    const { workload, sleepQuality, stressLevel, socialTime, exerciseFrequency } = metrics;
    
    const score = Math.round(
      (workload * 0.3 + 
       (10 - sleepQuality) * 0.25 + 
       stressLevel * 0.25 + 
       (10 - socialTime) * 0.1 + 
       (10 - exerciseFrequency) * 0.1) / 10 * 100
    );
    
    setBurnoutScore(score);
  };

  const getBurnoutLevel = (): { level: string; color: string; icon: any; message: string } => {
    if (burnoutScore < 30) {
      return {
        level: 'Low Risk',
        color: 'text-green-600',
        icon: CheckCircle,
        message: "You're managing well! Keep up the healthy habits."
      };
    } else if (burnoutScore < 60) {
      return {
        level: 'Moderate Risk',
        color: 'text-yellow-600',
        icon: AlertTriangle,
        message: "Watch out! Consider taking more breaks and prioritizing self-care."
      };
    } else {
      return {
        level: 'High Risk',
        color: 'text-red-600',
        icon: AlertTriangle,
        message: "Warning! You may be experiencing burnout. Please seek support and rest."
      };
    }
  };

  const getRecommendations = (): string[] => {
    const recommendations = [];
    
    if (metrics.sleepQuality < 5) {
      recommendations.push("Prioritize 7-9 hours of quality sleep");
    }
    if (metrics.stressLevel > 6) {
      recommendations.push("Practice stress-reduction techniques like meditation or deep breathing");
    }
    if (metrics.socialTime < 4) {
      recommendations.push("Schedule regular social time with friends and family");
    }
    if (metrics.exerciseFrequency < 4) {
      recommendations.push("Add 20-30 minutes of exercise to your daily routine");
    }
    if (metrics.workload > 7) {
      recommendations.push("Consider delegating tasks or asking for deadline extensions");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Maintain your current healthy habits!");
      recommendations.push("Keep monitoring your wellness regularly");
    }
    
    return recommendations;
  };

  const { level, color, icon: Icon, message } = getBurnoutLevel();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Burnout Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Workload Level</label>
              <span className="text-sm text-gray-500">{metrics.workload}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.workload}
              onChange={(e) => setMetrics(prev => ({ ...prev, workload: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Sleep Quality</label>
              <span className="text-sm text-gray-500">{metrics.sleepQuality}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.sleepQuality}
              onChange={(e) => setMetrics(prev => ({ ...prev, sleepQuality: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Stress Level</label>
              <span className="text-sm text-gray-500">{metrics.stressLevel}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.stressLevel}
              onChange={(e) => setMetrics(prev => ({ ...prev, stressLevel: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Social Time</label>
              <span className="text-sm text-gray-500">{metrics.socialTime}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.socialTime}
              onChange={(e) => setMetrics(prev => ({ ...prev, socialTime: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Exercise Frequency</label>
              <span className="text-sm text-gray-500">{metrics.exerciseFrequency}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.exerciseFrequency}
              onChange={(e) => setMetrics(prev => ({ ...prev, exerciseFrequency: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>

        <Button onClick={() => setShowResults(true)} className="w-full">
          <Activity className="h-4 w-4 mr-2" />
          Analyze Burnout Risk
        </Button>

        {showResults && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`h-8 w-8 ${color}`} />
                <div>
                  <h3 className="font-semibold text-lg">{level}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Burnout Risk Score: {burnoutScore}%</p>
                </div>
              </div>
              <Progress value={burnoutScore} className="h-3 mb-4" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Wellness Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getRecommendations().map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
