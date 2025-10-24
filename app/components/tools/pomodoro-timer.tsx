"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getUserPreferences, saveUserPreferences } from "../../lib/user-preferences"

type TimerMode = 'work' | 'break' | 'longBreak';

export default function PomodoroTimer() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [preferences, setPreferences] = useState(getUserPreferences());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    }
  }, []);

  useEffect(() => {
    const duration = mode === 'work' ? preferences.pomodoroWorkDuration 
      : mode === 'break' ? preferences.pomodoroBreakDuration 
      : preferences.pomodoroLongBreakDuration;
    setTimeLeft(duration * 60);
  }, [mode, preferences]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (mode === 'work') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      if (newSessions % preferences.pomodoroSessionsBeforeLongBreak === 0) {
        setMode('longBreak');
      } else {
        setMode('break');
      }
    } else {
      setMode('work');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const duration = mode === 'work' ? preferences.pomodoroWorkDuration 
      : mode === 'break' ? preferences.pomodoroBreakDuration 
      : preferences.pomodoroLongBreakDuration;
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = mode === 'work' ? preferences.pomodoroWorkDuration * 60 
      : mode === 'break' ? preferences.pomodoroBreakDuration * 60
      : preferences.pomodoroLongBreakDuration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const updatePreference = (key: keyof typeof preferences, value: number) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    saveUserPreferences(newPrefs);
  };

  if (!mounted) return null;

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'work' ? <Brain className="h-5 w-5 text-blue-600" /> : <Coffee className="h-5 w-5 text-green-600" />}
            <span>Pomodoro Timer</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pomodoro Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Work Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={preferences.pomodoroWorkDuration}
                    onChange={(e) => updatePreference('pomodoroWorkDuration', parseInt(e.target.value) || 25)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short Break (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={preferences.pomodoroBreakDuration}
                    onChange={(e) => updatePreference('pomodoroBreakDuration', parseInt(e.target.value) || 5)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Long Break (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={preferences.pomodoroLongBreakDuration}
                    onChange={(e) => updatePreference('pomodoroLongBreakDuration', parseInt(e.target.value) || 15)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sessions before long break</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={preferences.pomodoroSessionsBeforeLongBreak}
                    onChange={(e) => updatePreference('pomodoroSessionsBeforeLongBreak', parseInt(e.target.value) || 4)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2">
          <Button
            variant={mode === 'work' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setMode('work'); setIsRunning(false); }}
            className="transition-all"
          >
            Work
          </Button>
          <Button
            variant={mode === 'break' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setMode('break'); setIsRunning(false); }}
            className="transition-all"
          >
            Break
          </Button>
          <Button
            variant={mode === 'longBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setMode('longBreak'); setIsRunning(false); }}
            className="transition-all"
          >
            Long Break
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="text-6xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
            {formatTime(timeLeft)}
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={toggleTimer}
            className="w-32 transition-all hover:scale-105"
          >
            {isRunning ? <><Pause className="h-5 w-5 mr-2" /> Pause</> : <><Play className="h-5 w-5 mr-2" /> Start</>}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={resetTimer}
            className="transition-all hover:scale-105"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed today
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
