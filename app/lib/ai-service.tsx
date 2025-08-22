// Real AI service for generating assignment plans using Gemini AI

const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

// Enhanced assignment type detection
const detectAssignmentType = (title, topic) => {
  const combined = `${title} ${topic}`.toLowerCase()

  // Coding/Programming assignments
  if (
    combined.match(
      /\b(code|coding|program|programming|software|app|website|algorithm|debug|implement|function|class|api|database|frontend|backend|fullstack|javascript|python|java|c\+\+|react|node|sql|html|css)\b/,
    )
  ) {
    return "coding"
  }

  // Presentations
  if (combined.match(/\b(presentation|present|slide|pitch|demo|showcase|speak|talk|oral)\b/)) {
    return "presentation"
  }

  // Lab/Experiment assignments
  if (
    combined.match(/\b(lab|laboratory|experiment|test|analysis|data|results|hypothesis|method|procedure|observation)\b/)
  ) {
    return "lab"
  }

  // Math/Problem solving
  if (
    combined.match(/\b(math|mathematics|calculate|solve|equation|formula|proof|theorem|statistics|calculus|algebra)\b/)
  ) {
    return "math"
  }

  // Design assignments
  if (combined.match(/\b(design|create|build|prototype|mockup|wireframe|ui|ux|graphic|visual|art|creative)\b/)) {
    return "design"
  }

  // Research assignments
  if (combined.match(/\b(research|study|investigate|analyze|survey|interview|data collection|literature review)\b/)) {
    return "research"
  }

  // Reports
  if (combined.match(/\b(report|summary|findings|documentation|technical writing|case study)\b/)) {
    return "report"
  }

  // Default to essay for written assignments
  return "essay"
}

// Calculate task dates based on due date and assignment complexity
const calculateTaskDates = (dueDate, taskCount, assignmentType) => {
  const due = new Date(dueDate)
  const today = new Date()
  const totalDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

  // Adjust buffer based on assignment type
  const bufferMultiplier = {
    coding: 0.15, // More buffer for debugging
    presentation: 0.1, // Less buffer, more practice time
    lab: 0.05, // Tight schedule for lab work
    math: 0.1, // Standard buffer
    design: 0.2, // More time for iterations
    research: 0.15, // Buffer for unexpected findings
    report: 0.1, // Standard buffer
    essay: 0.1, // Standard buffer
  }

  const bufferDays = Math.max(1, Math.floor(totalDays * (bufferMultiplier[assignmentType] || 0.1)))
  const workingDays = Math.max(1, totalDays - bufferDays)
  const daysPerTask = Math.max(1, Math.floor(workingDays / taskCount))

  const dates = []
  const currentDate = new Date(today)

  for (let i = 0; i < taskCount; i++) {
    const startDate = new Date(currentDate)
    const endDate = new Date(currentDate)
    endDate.setDate(endDate.getDate() + daysPerTask - 1)

    if (endDate > due) {
      endDate.setTime(due.getTime())
    }

    dates.push({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    })

    currentDate.setDate(currentDate.getDate() + daysPerTask)
  }

  return dates
}

// Main function to generate assignment plan using Gemini AI
export const generateAssignmentPlan = async (formData) => {
  // Debug: Check if we're in the browser and log available env vars
  if (typeof window !== 'undefined') {
    console.log('Environment check:', {
      hasKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      keyLength: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length || 0,
      allPublicVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    })
  }

  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!API_KEY || API_KEY === 'your-gemini-api-key-here') {
    throw new Error(
      "Gemini AI is not configured. Please add your NEXT_PUBLIC_GEMINI_API_KEY to the .env.local file. You can get a free API key from https://makersuite.google.com/app/apikey",
    )
  }

  try {
    const assignmentType = detectAssignmentType(formData.title, formData.topic)

    const prompt = createPrompt(formData, assignmentType)

    const response = await fetch(`${API_BASE_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Gemini API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`,
      )
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API")
    }

    const aiContent = data.candidates[0].content.parts[0].text

    // Parse AI response
    let aiResponse
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in AI response")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent)

      // Create fallback response with list-formatted descriptions
      aiResponse = {
        tasks: [
          {
            name: "Research and Planning",
            description:
              "• Research the topic thoroughly using reliable sources\n• Create an outline or plan for your work\n• Identify key points and arguments\n• Organize your thoughts and materials",
            tip: "Start with reliable sources and organize your thoughts before diving into the work",
          },
          {
            name: "Initial Draft/Development",
            description:
              "• Create the first version of your work\n• Focus on getting ideas down without worrying about perfection\n• Follow your outline or plan\n• Don't edit while writing the first draft",
            tip: "Focus on getting your ideas down first, don't worry about perfection",
          },
          {
            name: "Review and Revision",
            description:
              "• Review your work for content and structure\n• Check if arguments are clear and well-supported\n• Reorganize sections if needed\n• Get feedback from others if possible",
            tip: "Take a break before reviewing to see it with fresh eyes",
          },
          {
            name: "Final Polish",
            description:
              "• Proofread for grammar, spelling, and formatting\n• Check all requirements are met\n• Ensure proper citation format\n• Prepare for submission",
            tip: "Check all requirements and formatting guidelines carefully",
          },
        ],
      }
    }

    // Validate AI response structure
    if (!aiResponse.tasks || !Array.isArray(aiResponse.tasks)) {
      throw new Error("AI response missing required tasks array")
    }

    // Calculate task dates
    const taskDates = calculateTaskDates(formData.dueDate, aiResponse.tasks.length, assignmentType)

    // Create tasks with dates and completion status
    const tasks = aiResponse.tasks.map((task, index) => ({
      id: `task-${index}-${Date.now()}`, // Add unique ID for each task
      name: task.name || `Task ${index + 1}`,
      description: task.description || "",
      tip: formData.showTips ? task.tip || "" : null,
      startDate: taskDates[index].startDate,
      endDate: taskDates[index].endDate,
      completed: false,
    }))

    // Create the planner object
    const planner = {
      title: formData.title,
      topic: formData.topic,
      dueDate: formData.dueDate,
      assignmentType,
      requirements: formData.requirements || "",
      deliverables: formData.deliverables || "",
      resources: formData.resources || "",
      showTips: formData.showTips,
      tasks,
      createdAt: new Date().toISOString(),
      progress: 0,
    }

    return planner
  } catch (error) {
    console.error("Error generating plan:", error)
    throw new Error(`Failed to generate assignment plan: ${error.message}`)
  }
}

// Create system prompt based on assignment type
const getSystemPrompt = (assignmentType) => {
  const basePrompt =
    "You are an expert academic and professional assistant specializing in breaking down complex assignments into manageable, actionable tasks."

  const typeSpecificPrompts = {
    coding:
      "You have extensive experience in software development, programming best practices, debugging, testing, and project management for coding assignments.",
    presentation:
      "You excel at presentation planning, content organization, visual design, public speaking preparation, and audience engagement strategies.",
    lab: "You are skilled in laboratory procedures, experimental design, data collection, analysis methods, and scientific reporting.",
    math: "You have deep expertise in mathematical problem-solving, proof techniques, computational methods, and mathematical communication.",
    design:
      "You specialize in design thinking, creative processes, prototyping, user experience, and iterative design methodologies.",
    research:
      "You are experienced in research methodologies, literature reviews, data collection, analysis techniques, and academic writing.",
    report: "You excel at technical writing, data presentation, executive summaries, and professional documentation.",
    essay: "You are skilled in academic writing, argumentation, research integration, and essay structure.",
  }

  return `${basePrompt} ${typeSpecificPrompts[assignmentType] || typeSpecificPrompts.essay}

Create detailed, practical task breakdowns that students can follow step-by-step. Each task should be:
- Specific and actionable
- Appropriately scoped for the time available
- Logically sequenced
- Include helpful tips when requested

IMPORTANT: Format all task descriptions as bullet point lists using "•" for better readability. Each step should be on a new line starting with "•".

Always respond with valid JSON in this exact format:
{
  "tasks": [
    {
      "name": "Clear, actionable task name",
      "description": "• First step or action item\\n• Second step or action item\\n• Third step or action item\\n• Additional steps as needed",
      "tip": "Helpful, specific advice for completing this task successfully"
    }
  ]
}

Ensure 4-8 tasks depending on assignment complexity. Make tasks realistic and achievable.`
}

// Create user prompt based on form data and assignment type
const createPrompt = (formData, assignmentType) => {
  const typeContext = {
    coding: "This is a programming/coding assignment.",
    presentation: "This is a presentation assignment.",
    lab: "This is a laboratory/experimental assignment.",
    math: "This is a mathematics/problem-solving assignment.",
    design: "This is a design/creative assignment.",
    research: "This is a research assignment.",
    report: "This is a report/documentation assignment.",
    essay: "This is a written essay assignment.",
  }

  const systemPrompt = getSystemPrompt(assignmentType)

  return `${systemPrompt}

${typeContext[assignmentType]} Please create a detailed task breakdown for the following assignment:

**Assignment Title:** ${formData.title}

**Assignment Description:** ${formData.topic}

**Due Date:** ${formData.dueDate}

${formData.requirements ? `**Requirements:** ${formData.requirements}` : ""}

${formData.deliverables ? `**Deliverables:** ${formData.deliverables}` : ""}

${formData.resources ? `**Resources Available:** ${formData.resources}` : ""}

**Include Tips:** ${formData.showTips ? "Yes - provide helpful tips for each task" : "No"}

Please break this down into 4-8 specific, actionable tasks that will help the student complete this assignment successfully. Consider the assignment type and provide appropriate guidance for each step.

Each task should be realistic and achievable within the timeframe available. Focus on practical steps the student can take immediately.

REMEMBER: Format all descriptions as bullet point lists using "•" and "\\n" for line breaks.`
}

// Legacy export for backward compatibility
export const generatePlanWithAI = generateAssignmentPlan
