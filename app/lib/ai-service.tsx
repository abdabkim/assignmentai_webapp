// Real AI service for generating assignment plans using Gemini AI

// Type definitions
interface FormData {
  title: string;
  topic: string;
  dueDate: string;
  assignmentType?: string;
  requirements?: string;
  deliverables?: string;
  resources?: string;
  showTips: boolean;
}

interface TaskDate {
  startDate: string;
  endDate: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  tip: string | null;
  startDate: string;
  endDate: string;
  completed: boolean;
}

interface Planner {
  title: string;
  topic: string;
  dueDate: string;
  assignmentType: AssignmentType;
  requirements: string;
  deliverables: string;
  resources: string;
  showTips: boolean;
  tasks: Task[];
  createdAt: string;
  progress: number;
}

interface AITask {
  name: string;
  description: string;
  tip?: string;
}

interface AIResponse {
  tasks: AITask[];
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text: string;
      }[];
    };
  }[];
  error?: {
    message: string;
    code: number;
  };
}

type AssignmentType = 'coding' | 'presentation' | 'lab' | 'math' | 'design' | 'research' | 'report' | 'essay';

// Updated to use the correct Gemini API endpoint
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

// Enhanced assignment type detection
const detectAssignmentType = (title: string, topic: string, assignmentType?: string): AssignmentType => {
  // If assignmentType is provided, use it
  if (assignmentType) {
    const typeMap: Record<string, AssignmentType> = {
      'essay': 'essay',
      'coding': 'coding',
      'presentation': 'presentation',
      'lab-report': 'lab',
      'math': 'math',
      'creative': 'design',
      'music': 'design',
      'language': 'essay',
      'general': 'essay',
      'research': 'research',
      'report': 'report'
    };
    return typeMap[assignmentType] || 'essay';
  }

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
const calculateTaskDates = (dueDate: string, taskCount: number, assignmentType: AssignmentType): TaskDate[] => {
  const due = new Date(dueDate)
  const today = new Date()
  const totalDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Adjust buffer based on assignment type
  const bufferMultiplier: Record<AssignmentType, number> = {
    coding: 0.15, // More buffer for debugging
    presentation: 0.1, // Less buffer, more practice time
    lab: 0.05, // Tight schedule for lab work
    math: 0.1, // Standard buffer
    design: 0.2, // More time for iterations
    research: 0.15, // Buffer for unexpected findings
    report: 0.1, // Standard buffer
    essay: 0.1, // Standard buffer
  }

  const bufferDays = Math.max(1, Math.floor(totalDays * bufferMultiplier[assignmentType]))
  const workingDays = Math.max(1, totalDays - bufferDays)
  const daysPerTask = Math.max(1, Math.floor(workingDays / taskCount))

  const dates: TaskDate[] = []
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

// Fallback task generator when API fails
const generateFallbackTasks = (formData: FormData, assignmentType: AssignmentType): AITask[] => {
  const taskTemplates: Record<AssignmentType, AITask[]> = {
    essay: [
      {
        name: "Research and Topic Analysis",
        description: "• Research your topic using academic sources\n• Take notes on key arguments and evidence\n• Identify main themes and controversies\n• Create a bibliography of sources",
        tip: "Use academic databases like Google Scholar, JSTOR, or your library's resources"
      },
      {
        name: "Create Thesis and Outline",
        description: "• Develop a clear thesis statement\n• Create a detailed outline with main points\n• Organize evidence to support each point\n• Plan paragraph structure",
        tip: "Your thesis should be specific, arguable, and supportable with evidence"
      },
      {
        name: "Write First Draft",
        description: "• Write introduction with thesis\n• Develop body paragraphs with topic sentences\n• Include evidence and analysis\n• Write conclusion that reinforces thesis",
        tip: "Focus on getting ideas down; don't worry about perfection yet"
      },
      {
        name: "Revise and Edit",
        description: "• Review argument flow and logic\n• Strengthen transitions between paragraphs\n• Check citations and formatting\n• Proofread for grammar and clarity",
        tip: "Read your essay aloud to catch awkward phrasing and errors"
      }
    ],
    coding: [
      {
        name: "Understand Requirements",
        description: "• Read project specifications carefully\n• Identify required features and constraints\n• Set up development environment\n• Create project structure",
        tip: "Break down complex requirements into smaller, manageable tasks"
      },
      {
        name: "Design and Plan",
        description: "• Design system architecture\n• Create pseudocode or flowcharts\n• Plan data structures and algorithms\n• Set up version control",
        tip: "Spend time planning to avoid major refactoring later"
      },
      {
        name: "Implement Core Features",
        description: "• Code main functionality\n• Implement data handling\n• Create user interface if needed\n• Write unit tests",
        tip: "Start with the most critical features and test as you go"
      },
      {
        name: "Test and Debug",
        description: "• Run comprehensive tests\n• Fix bugs and edge cases\n• Optimize performance\n• Document your code",
        tip: "Test with various inputs, including edge cases and invalid data"
      }
    ],
    presentation: [
      {
        name: "Research and Content Planning",
        description: "• Research your topic thoroughly\n• Identify key points to cover\n• Gather supporting evidence\n• Know your audience",
        tip: "Focus on 3-5 main points to avoid overwhelming your audience"
      },
      {
        name: "Create Presentation Structure",
        description: "• Design slide outline\n• Create introduction and conclusion\n• Plan visual elements\n• Prepare speaker notes",
        tip: "Use the 10-20-30 rule: 10 slides, 20 minutes, 30-point font minimum"
      },
      {
        name: "Design Slides",
        description: "• Create visual slides\n• Add graphics and charts\n• Ensure consistent formatting\n• Keep text minimal",
        tip: "Use high-quality images and limit text to key points"
      },
      {
        name: "Practice and Refine",
        description: "• Practice presenting multiple times\n• Time your presentation\n• Prepare for Q&A\n• Get feedback if possible",
        tip: "Record yourself to identify areas for improvement"
      }
    ],
    lab: [
      {
        name: "Pre-lab Preparation",
        description: "• Read lab manual thoroughly\n• Understand theoretical background\n• Prepare materials list\n• Review safety procedures",
        tip: "Understanding the theory helps interpret unexpected results"
      },
      {
        name: "Conduct Experiment",
        description: "• Set up equipment carefully\n• Follow procedures precisely\n• Record all observations\n• Note any deviations",
        tip: "Document everything, including 'failed' attempts"
      },
      {
        name: "Analyze Data",
        description: "• Organize raw data\n• Perform calculations\n• Create graphs and tables\n• Identify patterns and anomalies",
        tip: "Use appropriate significant figures and error analysis"
      },
      {
        name: "Write Lab Report",
        description: "• Write abstract and introduction\n• Document methods clearly\n• Present results objectively\n• Discuss findings and conclusions",
        tip: "Focus on clarity and precision in scientific writing"
      }
    ],
    math: [
      {
        name: "Review Concepts",
        description: "• Review relevant formulas\n• Understand problem types\n• Identify solution strategies\n• Gather reference materials",
        tip: "Create a formula sheet for quick reference"
      },
      {
        name: "Practice Problems",
        description: "• Start with easier problems\n• Work through examples\n• Identify problem patterns\n• Build confidence gradually",
        tip: "Show all work to identify where errors occur"
      },
      {
        name: "Solve Assignment",
        description: "• Read problems carefully\n• Apply appropriate methods\n• Show all steps clearly\n• Check your work",
        tip: "Verify answers using different methods when possible"
      },
      {
        name: "Review and Verify",
        description: "• Double-check calculations\n• Ensure proper notation\n• Verify answer reasonableness\n• Format neatly",
        tip: "Substitute answers back into original equations to verify"
      }
    ],
    design: [
      {
        name: "Research and Inspiration",
        description: "• Research design trends\n• Gather inspiration\n• Understand requirements\n• Define project scope",
        tip: "Create a mood board to guide your design direction"
      },
      {
        name: "Conceptualize",
        description: "• Sketch initial ideas\n• Explore multiple concepts\n• Get feedback early\n• Select best direction",
        tip: "Quantity leads to quality - create many rough concepts"
      },
      {
        name: "Create Design",
        description: "• Develop chosen concept\n• Refine details\n• Apply design principles\n• Ensure consistency",
        tip: "Step back periodically to view your work objectively"
      },
      {
        name: "Finalize and Present",
        description: "• Polish final design\n• Prepare presentation materials\n• Document design decisions\n• Export in required formats",
        tip: "Get feedback before final submission when possible"
      }
    ],
    research: [
      {
        name: "Define Research Question",
        description: "• Clarify research objectives\n• Develop hypothesis if needed\n• Identify key variables\n• Define scope",
        tip: "A well-defined question guides the entire research process"
      },
      {
        name: "Literature Review",
        description: "• Search academic databases\n• Review existing research\n• Identify research gaps\n• Take detailed notes",
        tip: "Use citation management tools to organize sources"
      },
      {
        name: "Collect and Analyze Data",
        description: "• Gather data systematically\n• Apply analysis methods\n• Look for patterns\n• Validate findings",
        tip: "Keep detailed records of methodology for reproducibility"
      },
      {
        name: "Write Research Paper",
        description: "• Write methodology section\n• Present findings clearly\n• Discuss implications\n• Draw conclusions",
        tip: "Follow your field's standard format and citation style"
      }
    ],
    report: [
      {
        name: "Gather Information",
        description: "• Collect all necessary data\n• Review requirements\n• Identify key points\n• Organize materials",
        tip: "Create a checklist of required elements"
      },
      {
        name: "Create Report Outline",
        description: "• Plan report structure\n• Organize sections logically\n• Allocate content appropriately\n• Plan visuals",
        tip: "Use headings and subheadings for clarity"
      },
      {
        name: "Write Report Content",
        description: "• Write executive summary\n• Develop main sections\n• Include data and analysis\n• Add recommendations",
        tip: "Write the executive summary last when you know all content"
      },
      {
        name: "Format and Review",
        description: "• Apply formatting standards\n• Add tables and figures\n• Check for completeness\n• Proofread thoroughly",
        tip: "Have someone else review for clarity and errors"
      }
    ]
  };

  return taskTemplates[assignmentType] || taskTemplates.essay;
}

// Main function to generate assignment plan using Gemini AI
export const generateAssignmentPlan = async (formData: FormData): Promise<Planner> => {
  const assignmentType = detectAssignmentType(formData.title, formData.topic, formData.assignmentType)
  
  // Get the API key from environment variable
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  // If no API key, use fallback tasks
  if (!API_KEY) {
    console.log('No Gemini API key found, using fallback task generator')
    const fallbackTasks = generateFallbackTasks(formData, assignmentType)
    const taskDates = calculateTaskDates(formData.dueDate, fallbackTasks.length, assignmentType)
    
    const tasks: Task[] = fallbackTasks.map((task, index) => ({
      id: `task-${index}-${Date.now()}`,
      name: task.name,
      description: task.description,
      tip: formData.showTips ? task.tip || null : null,
      startDate: taskDates[index].startDate,
      endDate: taskDates[index].endDate,
      completed: false,
    }))

    return {
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
  }

  try {
    const prompt = createPrompt(formData, assignmentType)
    
    console.log('Making request to Gemini API...')
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

    const data: GeminiResponse = await response.json()
    
    if (!response.ok) {
      console.error('Gemini API error response:', data)
      
      // Check for specific error types
      if (data.error?.code === 400 || data.error?.message?.includes('API key')) {
        console.log('Invalid API key, using fallback tasks')
      } else if (data.error?.code === 429) {
        console.log('Rate limit exceeded, using fallback tasks')
      } else {
        console.log('API error, using fallback tasks')
      }
      
      // Use fallback tasks on API error
      const fallbackTasks = generateFallbackTasks(formData, assignmentType)
      const taskDates = calculateTaskDates(formData.dueDate, fallbackTasks.length, assignmentType)
      
      const tasks: Task[] = fallbackTasks.map((task, index) => ({
        id: `task-${index}-${Date.now()}`,
        name: task.name,
        description: task.description,
        tip: formData.showTips ? task.tip || null : null,
        startDate: taskDates[index].startDate,
        endDate: taskDates[index].endDate,
        completed: false,
      }))

      return {
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
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API - using fallback tasks")
    }

    const aiContent = data.candidates[0].content.parts?.[0]?.text

    if (!aiContent) {
      throw new Error("No content in AI response - using fallback tasks")
    }

    // Parse AI response
    let aiResponse: AIResponse
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in AI response")
      }
    } catch (parseError) {
      console.log("Failed to parse AI response, using fallback tasks")
      aiResponse = {
        tasks: generateFallbackTasks(formData, assignmentType)
      }
    }

    // Validate AI response structure
    if (!aiResponse.tasks || !Array.isArray(aiResponse.tasks) || aiResponse.tasks.length === 0) {
      aiResponse = {
        tasks: generateFallbackTasks(formData, assignmentType)
      }
    }

    // Calculate task dates
    const taskDates = calculateTaskDates(formData.dueDate, aiResponse.tasks.length, assignmentType)

    // Create tasks with dates and completion status
    const tasks: Task[] = aiResponse.tasks.map((task, index) => ({
      id: `task-${index}-${Date.now()}`,
      name: task.name || `Task ${index + 1}`,
      description: task.description || "",
      tip: formData.showTips ? task.tip || null : null,
      startDate: taskDates[index].startDate,
      endDate: taskDates[index].endDate,
      completed: false,
    }))

    return {
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
  } catch (error) {
    console.error("Error with Gemini API, using fallback:", error)
    
    // Always provide fallback tasks so the app still works
    const fallbackTasks = generateFallbackTasks(formData, assignmentType)
    const taskDates = calculateTaskDates(formData.dueDate, fallbackTasks.length, assignmentType)
    
    const tasks: Task[] = fallbackTasks.map((task, index) => ({
      id: `task-${index}-${Date.now()}`,
      name: task.name,
      description: task.description,
      tip: formData.showTips ? task.tip || null : null,
      startDate: taskDates[index].startDate,
      endDate: taskDates[index].endDate,
      completed: false,
    }))

    return {
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
  }
}

// Create system prompt based on assignment type
const getSystemPrompt = (assignmentType: AssignmentType): string => {
  const basePrompt =
    "You are an expert academic and professional assistant specializing in breaking down complex assignments into manageable, actionable tasks."

  const typeSpecificPrompts: Record<AssignmentType, string> = {
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

  return `${basePrompt} ${typeSpecificPrompts[assignmentType]}

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
const createPrompt = (formData: FormData, assignmentType: AssignmentType): string => {
  const typeContext: Record<AssignmentType, string> = {
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
