// Fixed browser notification utilities

export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("This browser does not support notifications")
    return "denied"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission()
      return permission
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return "denied"
    }
  }

  return Notification.permission
}

export const scheduleNotification = (task, assignmentTitle) => {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return
  }

  // Calculate when to show notification (day before task end date)
  const taskEndDate = new Date(task.endDate)
  const notificationDate = new Date(taskEndDate)
  notificationDate.setDate(notificationDate.getDate() - 1)
  notificationDate.setHours(9, 0, 0, 0) // 9 AM reminder

  const now = new Date()
  const timeUntilNotification = notificationDate.getTime() - now.getTime()

  // Only schedule if notification date is in the future
  if (timeUntilNotification > 0) {
    setTimeout(() => {
      showNotification(task, assignmentTitle)
    }, timeUntilNotification)
  }
}

export const showNotification = (task, assignmentTitle) => {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return
  }

  try {
    const notification = new Notification(`📚 Assignment Reminder: ${assignmentTitle}`, {
      body: `Don't forget: ${task.name} - Due tomorrow!`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `task-${task.name}`,
      requireInteraction: true,
    })

    notification.onclick = () => {
      if (typeof window !== "undefined") {
        window.focus()
      }
      notification.close()
    }

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)
  } catch (error) {
    console.error("Error showing notification:", error)
  }
}

export const showDailyReminder = (planners) => {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted" ||
    !planners.length
  ) {
    return
  }

  // Find tasks due today or overdue
  const today = new Date().toISOString().split("T")[0]
  const urgentTasks = []

  planners.forEach((planner) => {
    planner.tasks?.forEach((task) => {
      if (!task.completed && task.endDate <= today) {
        urgentTasks.push({
          task,
          plannerTitle: planner.title,
        })
      }
    })
  })

  if (urgentTasks.length > 0) {
    const firstTask = urgentTasks[0]
    const message =
      urgentTasks.length === 1
        ? `${firstTask.task.name} for ${firstTask.plannerTitle}`
        : `${firstTask.task.name} and ${urgentTasks.length - 1} other tasks`

    try {
      const notification = new Notification("📚 Daily Assignment Reminder", {
        body: `You have urgent tasks: ${message}`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "daily-reminder",
        requireInteraction: true,
      })

      notification.onclick = () => {
        if (typeof window !== "undefined") {
          window.focus()
        }
        notification.close()
      }
    } catch (error) {
      console.error("Error showing daily reminder:", error)
    }
  }
}

// Set up daily reminders
export const setupDailyReminders = (planners) => {
  if (typeof window === "undefined") {
    return
  }

  // Show reminder at 9 AM every day
  const now = new Date()
  const nextReminder = new Date()
  nextReminder.setHours(9, 0, 0, 0)

  // If it's already past 9 AM today, schedule for tomorrow
  if (now.getHours() >= 9) {
    nextReminder.setDate(nextReminder.getDate() + 1)
  }

  const timeUntilReminder = nextReminder.getTime() - now.getTime()

  setTimeout(() => {
    showDailyReminder(planners)

    // Set up recurring daily reminders
    setInterval(
      () => {
        showDailyReminder(planners)
      },
      24 * 60 * 60 * 1000,
    ) // Every 24 hours
  }, timeUntilReminder)
}
