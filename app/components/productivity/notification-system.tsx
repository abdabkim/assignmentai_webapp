"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Bell, CheckCircle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  actions?: {
    label: string
    action: () => void
  }[]
}

interface NotificationProviderProps {
  children: React.ReactNode
}

// Global notification state
let notifications: Notification[] = []
let notificationListeners: ((notifications: Notification[]) => void)[] = []

export const addNotification = (notification: Omit<Notification, 'id'>) => {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }
  
  notifications = [newNotification, ...notifications]
  notificationListeners.forEach(listener => listener([...notifications]))
  
  // Auto-remove notification after duration
  if (notification.duration !== 0) {
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, notification.duration || 5000)
  }
}

export const removeNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id)
  notificationListeners.forEach(listener => listener([...notifications]))
}

export const clearAllNotifications = () => {
  notifications = []
  notificationListeners.forEach(listener => listener([]))
}

export function useNotifications() {
  const [currentNotifications, setCurrentNotifications] = useState<Notification[]>([])
  
  useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setCurrentNotifications(newNotifications)
    }
    
    notificationListeners.push(listener)
    setCurrentNotifications([...notifications])
    
    return () => {
      notificationListeners = notificationListeners.filter(l => l !== listener)
    }
  }, [])
  
  return {
    notifications: currentNotifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  }
}

const typeConfig = {
  info: { icon: Info, color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300' },
  success: { icon: CheckCircle, color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-300' },
  warning: { icon: AlertCircle, color: 'bg-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', textColor: 'text-yellow-700 dark:text-yellow-300' },
  error: { icon: AlertCircle, color: 'bg-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-300' }
}

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const config = typeConfig[notification.type]
  const IconComponent = config.icon
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border shadow-sm animate-in slide-in-from-top-2",
      config.bgColor
    )}>
      <div className={cn("p-1 rounded-full", config.color)}>
        <IconComponent className="h-4 w-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold text-sm", config.textColor)}>
          {notification.title}
        </h4>
        <p className={cn("text-sm mt-1", config.textColor)}>
          {notification.message}
        </p>
        
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {notification.actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  action.action()
                  onRemove(notification.id)
                }}
                className="h-7 text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(notification.id)}
        className="h-6 w-6 p-0 hover:bg-white/20"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

export function NotificationCenter() {
  const { notifications, removeNotification, clearAllNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {notifications.length}
          </Badge>
        )}
      </Button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRemove={removeNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  return (
    <>
      {children}
      <NotificationToasts />
    </>
  )
}

function NotificationToasts() {
  const { notifications, removeNotification } = useNotifications()
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}