import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Planner } from "./storage"

// Save planner to Firestore
export const savePlannerToFirestore = async (userId: string, planner: Planner): Promise<Planner> => {
  try {
    // Ensure all required fields are present
    const plannerData = {
      title: planner.title || "Untitled Assignment",
      topic: planner.topic || "",
      dueDate: planner.dueDate || new Date().toISOString().split("T")[0],
      assignmentType: planner.assignmentType || "essay",
      requirements: planner.requirements || "",
      deliverables: planner.deliverables || "",
      resources: planner.resources || "",
      showTips: Boolean(planner.showTips),
      tasks: Array.isArray(planner.tasks) ? planner.tasks : [],
      progress: planner.progress || 0,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "planners"), plannerData)

    return {
      ...planner,
      id: docRef.id,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("Error saving planner to Firestore:", error)

    if (error.code === "permission-denied") {
      throw new Error("permissions")
    }

    throw new Error(`Failed to save planner: ${error.message}`)
  }
}

// Get user planners from Firestore
export const getUserPlanners = async (userId: string): Promise<Planner[]> => {
  try {
    const q = query(collection(db, "planners"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const planners: Planner[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()

      // Validate and sanitize data
      if (data && data.title && data.topic) {
        planners.push({
          id: doc.id,
          title: data.title,
          topic: data.topic,
          dueDate: data.dueDate,
          assignmentType: data.assignmentType || "essay",
          requirements: data.requirements || "",
          deliverables: data.deliverables || "",
          resources: data.resources || "",
          showTips: Boolean(data.showTips),
          tasks: Array.isArray(data.tasks) ? data.tasks : [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          userId: data.userId,
          progress: data.progress || 0,
        })
      }
    })

    return planners
  } catch (error: any) {
    console.error("Error getting user planners:", error)

    if (error.code === "permission-denied") {
      console.warn("Firestore permissions not configured, falling back to localStorage")
      return []
    }

    throw new Error(`Failed to get planners: ${error.message}`)
  }
}

// Update planner in Firestore with comprehensive error handling
export const updatePlannerInFirestore = async (plannerId: string, updates: Partial<Planner>): Promise<void> => {
  try {
    if (!plannerId) {
      throw new Error("Planner ID is required")
    }

    // Sanitize updates to ensure valid data
    const sanitizedUpdates: any = {
      updatedAt: serverTimestamp(),
    }

    // Only include valid fields in the update
    if (updates.title !== undefined) sanitizedUpdates.title = updates.title
    if (updates.topic !== undefined) sanitizedUpdates.topic = updates.topic
    if (updates.dueDate !== undefined) sanitizedUpdates.dueDate = updates.dueDate
    if (updates.assignmentType !== undefined) sanitizedUpdates.assignmentType = updates.assignmentType
    if (updates.requirements !== undefined) sanitizedUpdates.requirements = updates.requirements
    if (updates.deliverables !== undefined) sanitizedUpdates.deliverables = updates.deliverables
    if (updates.resources !== undefined) sanitizedUpdates.resources = updates.resources
    if (updates.showTips !== undefined) sanitizedUpdates.showTips = Boolean(updates.showTips)
    if (updates.progress !== undefined) sanitizedUpdates.progress = Number(updates.progress) || 0

    // Handle tasks array update
    if (updates.tasks !== undefined) {
      if (Array.isArray(updates.tasks)) {
        sanitizedUpdates.tasks = updates.tasks.map((task) => ({
          id: task.id || `task-${Date.now()}-${Math.random()}`,
          name: task.name || "Untitled Task",
          description: task.description || "",
          tip: task.tip || null,
          startDate: task.startDate || new Date().toISOString().split("T")[0],
          endDate: task.endDate || new Date().toISOString().split("T")[0],
          completed: Boolean(task.completed),
        }))
      } else {
        sanitizedUpdates.tasks = []
      }
    }

    const plannerRef = doc(db, "planners", plannerId)

    await updateDoc(plannerRef, sanitizedUpdates)
  } catch (error: any) {
    console.error("Error updating planner in Firestore:", error)

    if (error.code === "permission-denied") {
      throw new Error("permissions")
    }

    if (error.code === "not-found") {
      throw new Error("Planner not found")
    }

    throw new Error(`Failed to update planner: ${error.message}`)
  }
}

// Delete planner from Firestore
export const deletePlannerFromFirestore = async (plannerId: string): Promise<void> => {
  try {
    if (!plannerId) {
      throw new Error("Planner ID is required")
    }

    await deleteDoc(doc(db, "planners", plannerId))
  } catch (error: any) {
    console.error("Error deleting planner from Firestore:", error)

    if (error.code === "permission-denied") {
      throw new Error("permissions")
    }

    if (error.code === "not-found") {
      throw new Error("Planner not found")
    }

    throw new Error(`Failed to delete planner: ${error.message}`)
  }
}

// Get single planner from Firestore
export const getPlannerFromFirestore = async (plannerId: string): Promise<Planner | null> => {
  try {
    if (!plannerId) {
      return null
    }

    const docRef = doc(db, "planners", plannerId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()

      // Validate data before returning
      if (!data || !data.title || !data.topic) {
        return null
      }

      return {
        id: docSnap.id,
        title: data.title,
        topic: data.topic,
        dueDate: data.dueDate,
        assignmentType: data.assignmentType || "essay",
        requirements: data.requirements || "",
        deliverables: data.deliverables || "",
        resources: data.resources || "",
        showTips: Boolean(data.showTips),
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        userId: data.userId,
        progress: data.progress || 0,
      }
    } else {
      return null
    }
  } catch (error: any) {
    console.error("Error getting planner from Firestore:", error)

    if (error.code === "permission-denied") {
      return null
    }

    throw new Error(`Failed to get planner: ${error.message}`)
  }
}

// Update task completion in Firestore with better error handling
export const updateTaskCompletionInFirestore = async (
  plannerId: string,
  taskIndex: number,
  completed: boolean,
): Promise<void> => {
  try {
    if (!plannerId) {
      throw new Error("Planner ID is required")
    }

    // First get the current planner
    const planner = await getPlannerFromFirestore(plannerId)
    if (!planner) {
      throw new Error("Planner not found")
    }

    if (!Array.isArray(planner.tasks) || taskIndex < 0 || taskIndex >= planner.tasks.length) {
      throw new Error("Invalid task index")
    }

    // Update the specific task
    const updatedTasks = planner.tasks.map((task, index) => (index === taskIndex ? { ...task, completed } : task))

    // Calculate new progress
    const completedTasks = updatedTasks.filter((task) => task.completed).length
    const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0

    // Update the planner
    await updatePlannerInFirestore(plannerId, {
      tasks: updatedTasks,
      progress,
    })
  } catch (error: any) {
    console.error("Error updating task completion in Firestore:", error)

    if (error.code === "permission-denied") {
      throw new Error("permissions")
    }

    throw new Error(`Failed to update task: ${error.message}`)
  }
}
