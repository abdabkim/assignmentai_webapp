export interface Task {
  id?: string
  name: string
  description: string
  tip?: string | null
  startDate: string
  endDate: string
  completed: boolean
  priority?: "low" | "medium" | "high"
  estimatedHours?: number
}

export interface Planner {
  id?: string
  title: string
  topic: string
  dueDate: string
  assignmentType?: string
  requirements?: string
  deliverables?: string
  resources?: string
  showTips?: boolean
  tasks: Task[]
  createdAt?: string
  updatedAt?: string
  userId?: string
  progress?: number
}

const STORAGE_KEYS = {
  PLANNERS: "assignment_planners",
  PLANNER_COUNT: "planner_count",
  PAID_STATUS: "paid_status",
  NOTIFICATIONS: "notification_settings",
  USER_PREFERENCES: "user_preferences",
}

const LOCAL_STORAGE_KEY = "essay-planners"
const FIRESTORE_STORAGE_KEY = "assignment_planners"

// Generate unique ID
export const generateId = () => {
  return `planner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Local storage functions (fallback when Firestore is not available)
export const savePlannerLocally = (planner: Planner): Planner => {
  try {
    const planners = getPlanners()
    const newPlanner = {
      ...planner,
      id: planner.id || generateId(),
      createdAt: planner.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: planner.progress || 0,
    }

    const updatedPlanners = [...planners, newPlanner]
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlanners))
    return newPlanner
  } catch (error) {
    console.error("Error saving planner locally:", error)
    throw new Error("Failed to save planner locally")
  }
}

export const getPlanners = (): Planner[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!stored) return []

    const planners = JSON.parse(stored)
    return Array.isArray(planners) ? planners : []
  } catch (error) {
    console.error("Error getting planners from localStorage:", error)
    return []
  }
}

export const updatePlannerLocally = (id: string, updates: Partial<Planner>): void => {
  try {
    const planners = getPlanners()
    const index = planners.findIndex((p) => p.id === id)

    if (index !== -1) {
      planners[index] = {
        ...planners[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planners))
    }
  } catch (error) {
    console.error("Error updating planner locally:", error)
    throw new Error("Failed to update planner locally")
  }
}

export const deletePlannerLocally = (id: string): void => {
  try {
    const planners = getPlanners()
    const filtered = planners.filter((p) => p.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting planner locally:", error)
    throw new Error("Failed to delete planner locally")
  }
}

export const getPlannerByIdLocally = (id: string): Planner | null => {
  try {
    const planners = getPlanners()
    return planners.find((p) => p.id === id) || null
  } catch (error) {
    console.error("Error getting planner by ID locally:", error)
    return null
  }
}

// Clear all planners (useful for testing)
export const clearAllPlannersLocally = (): void => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing planners locally:", error)
  }
}

// Planner operations
export const loadPlanners = (): Planner[] => {
  try {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(FIRESTORE_STORAGE_KEY)
    if (!stored) return []

    const planners = JSON.parse(stored)

    // Validate and filter out invalid planners
    return planners.filter((planner: any) => {
      return planner && typeof planner === "object" && planner.id && planner.title && Array.isArray(planner.tasks)
    })
  } catch (error) {
    console.error("Error loading planners from localStorage:", error)
    return []
  }
}

export const savePlanner = (planner: Planner): Planner => {
  try {
    const planners = loadPlanners()

    // Generate ID if not provided
    if (!planner.id) {
      planner.id = generateId()
    }

    // Add timestamps
    const now = new Date().toISOString()
    if (!planner.createdAt) {
      planner.createdAt = now
    }
    planner.updatedAt = now

    // Calculate progress
    planner.progress = calculateProgress(planner.tasks)

    // Add or update planner
    const existingIndex = planners.findIndex((p) => p.id === planner.id)
    if (existingIndex >= 0) {
      planners[existingIndex] = planner
    } else {
      planners.push(planner)
    }

    localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(planners))
    return planner
  } catch (error) {
    console.error("Error saving planner to localStorage:", error)
    throw new Error("Failed to save planner locally")
  }
}

export const loadPlanner = (id: string): Planner | null => {
  try {
    const planners = loadPlanners()
    return planners.find((p) => p.id === id) || null
  } catch (error) {
    console.error("Error loading planner from localStorage:", error)
    return null
  }
}

export const updatePlanner = (id: string, updates: Partial<Planner>): Planner | null => {
  try {
    const planners = loadPlanners()
    const index = planners.findIndex((p) => p.id === id)

    if (index === -1) {
      return null
    }

    // Update planner
    planners[index] = {
      ...planners[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Recalculate progress if tasks were updated
    if (updates.tasks) {
      planners[index].progress = calculateProgress(updates.tasks)
    }

    localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(planners))
    return planners[index]
  } catch (error) {
    console.error("Error updating planner in localStorage:", error)
    return null
  }
}

export const deletePlanner = (id: string): boolean => {
  try {
    const planners = loadPlanners()
    const filteredPlanners = planners.filter((p) => p.id !== id)

    if (filteredPlanners.length === planners.length) {
      return false // Planner not found
    }

    localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(filteredPlanners))
    return true
  } catch (error) {
    console.error("Error deleting planner from localStorage:", error)
    return false
  }
}

export const getPlannerByIdFirestore = (plannerId: string): Planner | null => {
  try {
    const planners = loadPlanners()
    return planners.find((p) => p.id === plannerId) || null
  } catch (error) {
    console.error("Error getting planner by ID from localStorage:", error)
    return null
  }
}

export const updateTaskCompletion = (plannerId: string, taskId: string, completed: boolean): boolean => {
  try {
    const planners = loadPlanners()
    const plannerIndex = planners.findIndex((p) => p.id === plannerId)

    if (plannerIndex === -1) {
      return false
    }

    const taskIndex = planners[plannerIndex].tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) {
      return false
    }

    // Update task completion
    planners[plannerIndex].tasks[taskIndex].completed = completed
    planners[plannerIndex].updatedAt = new Date().toISOString()

    // Recalculate progress
    planners[plannerIndex].progress = calculateProgress(planners[plannerIndex].tasks)

    localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(planners))
    return true
  } catch (error) {
    console.error("Error updating task completion:", error)
    return false
  }
}

// Calculate progress percentage
export const calculateProgress = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) return 0

  const completedTasks = tasks.filter((task) => task.completed).length
  return Math.round((completedTasks / tasks.length) * 100)
}

// Get planners by user ID (for when user is logged in)
export const getPlannersByUserId = (userId: string): Planner[] => {
  try {
    const planners = loadPlanners()
    return planners.filter((p) => p.userId === userId)
  } catch (error) {
    console.error("Error getting planners by user ID:", error)
    return []
  }
}

// Planner count operations
export const getPlannerCount = () => {
  try {
    const count = localStorage.getItem(STORAGE_KEYS.PLANNER_COUNT)
    if (count) {
      return Number.parseInt(count, 10)
    }

    // If count doesn't exist, calculate from actual planners
    const planners = loadPlanners()
    const actualCount = planners.length
    localStorage.setItem(STORAGE_KEYS.PLANNER_COUNT, actualCount.toString())
    return actualCount
  } catch (error) {
    console.error("Error getting planner count:", error)
    return 0
  }
}

// Paid status operations (kept for backward compatibility)
export const isPaidUser = () => {
  try {
    const status = localStorage.getItem(STORAGE_KEYS.PAID_STATUS)
    return status === "true"
  } catch (error) {
    console.error("Error checking paid status:", error)
    return false
  }
}

export const setPaidStatus = (isPaid) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAID_STATUS, isPaid.toString())
  } catch (error) {
    console.error("Error setting paid status:", error)
  }
}

// Notification settings
export const getNotificationSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    return settings ? JSON.parse(settings) : { enabled: false }
  } catch (error) {
    console.error("Error getting notification settings:", error)
    return { enabled: false }
  }
}

export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(settings))
  } catch (error) {
    console.error("Error saving notification settings:", error)
  }
}

// User preferences
export const getUserPreferences = () => {
  try {
    const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    return prefs
      ? JSON.parse(prefs)
      : {
          theme: "system",
          defaultAssignmentType: "general",
          showTips: true,
          emailReminders: false,
        }
  } catch (error) {
    console.error("Error getting user preferences:", error)
    return {
      theme: "system",
      defaultAssignmentType: "general",
      showTips: true,
      emailReminders: false,
    }
  }
}

export const saveUserPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences))
  } catch (error) {
    console.error("Error saving user preferences:", error)
  }
}

// Clear all data
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error("Error clearing data:", error)
  }
}

// Export data for backup
export const exportData = () => {
  try {
    const data = {
      planners: loadPlanners(),
      plannerCount: getPlannerCount(),
      paidStatus: isPaidUser(),
      notifications: getNotificationSettings(),
      preferences: getUserPreferences(),
      exportDate: new Date().toISOString(),
      version: "2.0.0",
    }
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error("Error exporting data:", error)
    return null
  }
}

// Import data from backup
export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData)

    if (data.planners) {
      localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(data.planners))
    }
    if (data.plannerCount !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PLANNER_COUNT, data.plannerCount.toString())
    }
    if (data.paidStatus !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PAID_STATUS, data.paidStatus.toString())
    }
    if (data.notifications) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications))
    }
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.preferences))
    }

    return true
  } catch (error) {
    console.error("Error importing data:", error)
    return false
  }
}

// Sync with Firebase (when available)
export const syncWithFirebase = async (firebasePlanners: Planner[], userId: string): Promise<Planner[]> => {
  try {
    const localPlanners = loadPlanners()

    // Create a map of Firebase planners by ID
    const firebaseMap = new Map(firebasePlanners.map((p) => [p.id, p]))

    // Create a map of local planners by ID
    const localMap = new Map(localPlanners.map((p) => [p.id, p]))

    // Merge planners - Firebase takes precedence for conflicts
    const mergedPlanners: Planner[] = []

    // Add all Firebase planners
    firebasePlanners.forEach((planner) => {
      mergedPlanners.push(planner)
    })

    // Add local planners that don't exist in Firebase
    localPlanners.forEach((planner) => {
      if (!firebaseMap.has(planner.id)) {
        mergedPlanners.push(planner)
      }
    })

    // Sort by creation date (newest first)
    mergedPlanners.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Save merged result to localStorage
    localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(mergedPlanners))

    return mergedPlanners
  } catch (error) {
    console.error("Error syncing with Firebase:", error)
    return loadPlanners()
  }
}

// Sync planners with user ID (when user logs in)
export const syncPlannersWithUser = (userId: string): void => {
  try {
    const planners = loadPlanners()
    const updatedPlanners = planners.map((planner) => ({
      ...planner,
      userId: planner.userId || userId,
    }))

    localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(updatedPlanners))
  } catch (error) {
    console.error("Error syncing planners with user:", error)
  }
}

// Export planners as JSON
export const exportPlanners = (): string => {
  try {
    const planners = loadPlanners()
    return JSON.stringify(planners, null, 2)
  } catch (error) {
    console.error("Error exporting planners:", error)
    return "[]"
  }
}

// Import planners from JSON
export const importPlanners = (jsonData: string): boolean => {
  try {
    const importedPlanners = JSON.parse(jsonData)

    if (!Array.isArray(importedPlanners)) {
      throw new Error("Invalid data format")
    }

    // Validate imported planners
    const validPlanners = importedPlanners.filter((planner: any) => {
      return planner && typeof planner === "object" && planner.title && Array.isArray(planner.tasks)
    })

    // Generate new IDs to avoid conflicts
    const processedPlanners = validPlanners.map((planner: any) => ({
      ...planner,
      id: planner.id || generateId(),
      createdAt: planner.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    // Merge with existing planners
    const existingPlanners = loadPlanners()
    const allPlanners = [...existingPlanners, ...processedPlanners]

    localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(allPlanners))
    return true
  } catch (error) {
    console.error("Error importing planners:", error)
    return false
  }
}
