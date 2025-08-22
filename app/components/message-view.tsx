"use client"

import { useState } from "react"
import { MessageCircle, Send, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function MessageView() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  const chats = [
    { id: 1, name: "Study Group", lastMessage: "Meeting tomorrow at 3pm", time: "2m ago", unread: 2 },
    { id: 2, name: "Prof. Johnson", lastMessage: "Your assignment looks good", time: "1h ago", unread: 0 },
    { id: 3, name: "Library Assistant", lastMessage: "Your book is ready", time: "3h ago", unread: 1 },
    { id: 4, name: "Writing Center", lastMessage: "Appointment confirmed", time: "Yesterday", unread: 0 },
  ]

  const messages = [
    { id: 1, sender: "You", content: "Hi, I need help with my essay", time: "10:00 AM", isMe: true },
    { id: 2, sender: "Writing Center", content: "Sure! What topic are you working on?", time: "10:05 AM", isMe: false },
    { id: 3, sender: "You", content: "It's about climate change impacts", time: "10:10 AM", isMe: true },
    { id: 4, sender: "Writing Center", content: "Great topic! Have you created an outline yet?", time: "10:15 AM", isMe: false },
  ]

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6">
      {/* Chat List */}
      <Card className="w-80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b ${
                  selectedChat === chat.id ? "bg-gray-50 dark:bg-gray-800" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{chat.name}</p>
                      <span className="text-xs text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <Badge variant="default" className="ml-2">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {chats.find((c) => c.id === selectedChat)?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {chats.find((c) => c.id === selectedChat)?.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-20rem)] p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.isMe
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.isMe ? "text-blue-100" : "text-gray-500"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      // Send message logic
                      setMessage("")
                    }
                  }}
                />
                <Button disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}