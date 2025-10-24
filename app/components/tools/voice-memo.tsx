"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Trash2, Download, FileAudio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface VoiceMemo {
  id: string;
  title: string;
  blob: Blob;
  duration: number;
  createdAt: Date;
}

export default function VoiceMemoNotes() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [memoTitle, setMemoTitle] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('voice-memos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMemos(parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })));
      } catch (e) {
        console.error('Failed to load memos:', e);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const newMemo: VoiceMemo = {
          id: Date.now().toString(),
          title: memoTitle || `Research Note ${memos.length + 1}`,
          blob: audioBlob,
          duration: recordingTime,
          createdAt: new Date(),
        };

        const updatedMemos = [newMemo, ...memos];
        setMemos(updatedMemos);
        setMemoTitle('');
        setRecordingTime(0);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playMemo = (memo: VoiceMemo) => {
    if (playingId === memo.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      const url = URL.createObjectURL(memo.blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingId(memo.id);
        
        audioRef.current.onended = () => {
          setPlayingId(null);
        };
      } else {
        audioRef.current = new Audio(url);
        audioRef.current.play();
        setPlayingId(memo.id);
        
        audioRef.current.onended = () => {
          setPlayingId(null);
        };
      }
    }
  };

  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  };

  const downloadMemo = (memo: VoiceMemo) => {
    const url = URL.createObjectURL(memo.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${memo.title}.webm`;
    a.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5 text-indigo-600" />
          Voice Memo Research Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {!isRecording && (
            <div>
              <label className="text-sm font-medium mb-2 block">Memo Title (Optional)</label>
              <Input
                placeholder="e.g., Literature Review Ideas"
                value={memoTitle}
                onChange={(e) => setMemoTitle(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-center">
            <div className="text-center space-y-4">
              {isRecording && (
                <div className="animate-pulse">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-red-600 font-mono">
                    {formatTime(recordingTime)}
                  </div>
                </div>
              )}

              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                className="w-full"
              >
                {isRecording ? (
                  <><Square className="h-5 w-5 mr-2" /> Stop Recording</>
                ) : (
                  <><Mic className="h-5 w-5 mr-2" /> Start Recording</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {memos.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Saved Memos</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {memos.map((memo) => (
                <div
                  key={memo.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border transition-all hover:shadow-md"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => playMemo(memo)}
                    className="flex-shrink-0"
                  >
                    {playingId === memo.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{memo.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatTime(memo.duration)} • {memo.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadMemo(memo)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMemo(memo.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
