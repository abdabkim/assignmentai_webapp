"use client"

import { useState } from "react"
import { Users, Share2, Eye, EyeOff, ThumbsUp, MessageCircle, Send, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface StudyGroup {
  id: string;
  name: string;
  members: number;
  description: string;
  subject: string;
}

interface Review {
  id: string;
  content: string;
  rating: number;
  helpful: number;
  comments: number;
  anonymous: boolean;
  createdAt: Date;
}

export default function StudyGroupCollaboration() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newReview, setNewReview] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [rating, setRating] = useState(0);

  const studyGroups: StudyGroup[] = [
    { id: '1', name: 'CS 101 Study Group', members: 12, description: 'Intro to Computer Science', subject: 'CS' },
    { id: '2', name: 'English Literature Circle', members: 8, description: 'Discussing classic literature', subject: 'English' },
    { id: '3', name: 'Biology Lab Partners', members: 15, description: 'Lab report collaboration', subject: 'Biology' },
  ];

  const reviews: Review[] = [
    {
      id: '1',
      content: 'This approach to the problem set was really helpful. Breaking it down into smaller functions made debugging much easier.',
      rating: 5,
      helpful: 12,
      comments: 3,
      anonymous: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      content: 'I found a different solution using recursion. It\'s more elegant but might be harder to understand at first.',
      rating: 4,
      helpful: 8,
      comments: 5,
      anonymous: false,
      createdAt: new Date('2024-01-14'),
    },
  ];

  const submitReview = () => {
    if (!newReview.trim()) return;
    
    setNewReview('');
    setRating(0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Study Groups & Peer Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups">Study Groups</TabsTrigger>
            <TabsTrigger value="reviews">Peer Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input placeholder="Search groups..." className="flex-1" />
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            <div className="space-y-3">
              {studyGroups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {group.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="secondary">{group.subject}</Badge>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {group.members} members
                        </span>
                      </div>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submit Anonymous Peer Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review</label>
                  <Textarea
                    placeholder="Share your insights, alternative approaches, or helpful feedback..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className="flex items-center gap-2 text-sm"
                  >
                    {isAnonymous ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span>{isAnonymous ? 'Anonymous' : 'Public'} Review</span>
                  </button>
                </div>

                <Button onClick={submitReview} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="font-semibold">Recent Reviews</h3>
              {reviews.map((review) => (
                <Card key={review.id} className="transition-all hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {review.anonymous ? '🎭' : '👤'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {review.anonymous ? 'Anonymous Peer' : 'Student'}
                          </span>
                          <div className="flex gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {review.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{review.helpful} helpful</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{review.comments} comments</span>
                          </button>
                          <span>{review.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
