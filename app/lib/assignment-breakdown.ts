import { Task, Planner } from "./storage"

export interface AssignmentBreakdown {
  assignmentType: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendedStartDate: Date
  timeToCompletion: number // in hours
  complexityScore: number // 1-10
  tasks: Task[]
  adaptiveRecommendations: string[]
}

export interface UrgencyMetrics {
  daysUntilDue: number
  workingDaysUntilDue: number
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  urgencyScore: number // 0-100
  recommendedHoursPerDay: number
}

// Assignment type configurations
const ASSIGNMENT_CONFIGS: Record<string, {
  baseComplexity: number
  estimatedHoursPerPage?: number
  estimatedHoursPerSource?: number
  estimatedHoursPerSlide?: number
  estimatedHoursPerFeature?: number
  estimatedHoursPerConcept?: number
  phases: { name: string; percentage: number; minHours: number }[]
}> = {
  essay: {
    baseComplexity: 6,
    estimatedHoursPerPage: 2,
    phases: [
      { name: 'Research & Planning', percentage: 30, minHours: 3 },
      { name: 'Outline Creation', percentage: 15, minHours: 2 },
      { name: 'First Draft', percentage: 35, minHours: 5 },
      { name: 'Revision & Editing', percentage: 15, minHours: 2 },
      { name: 'Final Review', percentage: 5, minHours: 1 }
    ]
  },
  research: {
    baseComplexity: 8,
    estimatedHoursPerSource: 1.5,
    phases: [
      { name: 'Topic Definition', percentage: 10, minHours: 2 },
      { name: 'Literature Review', percentage: 40, minHours: 8 },
      { name: 'Data Collection', percentage: 25, minHours: 6 },
      { name: 'Analysis', percentage: 20, minHours: 4 },
      { name: 'Report Writing', percentage: 5, minHours: 3 }
    ]
  },
  presentation: {
    baseComplexity: 5,
    estimatedHoursPerSlide: 0.5,
    phases: [
      { name: 'Content Research', percentage: 25, minHours: 3 },
      { name: 'Slide Creation', percentage: 40, minHours: 5 },
      { name: 'Design & Visuals', percentage: 20, minHours: 3 },
      { name: 'Practice & Rehearsal', percentage: 15, minHours: 2 }
    ]
  },
  coding: {
    baseComplexity: 7,
    estimatedHoursPerFeature: 4,
    phases: [
      { name: 'Planning & Design', percentage: 20, minHours: 3 },
      { name: 'Environment Setup', percentage: 10, minHours: 2 },
      { name: 'Core Development', percentage: 50, minHours: 8 },
      { name: 'Testing & Debugging', percentage: 15, minHours: 3 },
      { name: 'Documentation', percentage: 5, minHours: 1 }
    ]
  },
  design: {
    baseComplexity: 6,
    estimatedHoursPerConcept: 3,
    phases: [
      { name: 'Research & Inspiration', percentage: 20, minHours: 3 },
      { name: 'Concept Development', percentage: 30, minHours: 5 },
      { name: 'Design Creation', percentage: 35, minHours: 6 },
      { name: 'Refinement', percentage: 15, minHours: 2 }
    ]
  }
}

// Calculate working days (excluding weekends)
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let workingDays = 0
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
      workingDays++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return workingDays
}

// Calculate urgency metrics
export function calculateUrgencyMetrics(dueDate: string): UrgencyMetrics {
  const now = new Date()
  const due = new Date(dueDate)
  const timeDiff = due.getTime() - now.getTime()
  const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  const workingDaysUntilDue = calculateWorkingDays(now, due)
  
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  let urgencyScore: number
  
  if (daysUntilDue < 0) {
    urgencyLevel = 'critical'
    urgencyScore = 100
  } else if (daysUntilDue <= 1) {
    urgencyLevel = 'critical'
    urgencyScore = 95
  } else if (daysUntilDue <= 3) {
    urgencyLevel = 'high'
    urgencyScore = 80
  } else if (daysUntilDue <= 7) {
    urgencyLevel = 'high'
    urgencyScore = 65
  } else if (daysUntilDue <= 14) {
    urgencyLevel = 'medium'
    urgencyScore = 45
  } else {
    urgencyLevel = 'low'
    urgencyScore = Math.max(10, 50 - daysUntilDue)
  }
  
  // Calculate recommended hours per day
  const estimatedTotalHours = Math.max(10, daysUntilDue * 2) // Rough estimate
  const recommendedHoursPerDay = workingDaysUntilDue > 0 
    ? Math.min(8, Math.ceil(estimatedTotalHours / workingDaysUntilDue))
    : 8
  
  return {
    daysUntilDue,
    workingDaysUntilDue,
    urgencyLevel,
    urgencyScore,
    recommendedHoursPerDay
  }
}

// Estimate assignment complexity based on requirements
export function estimateComplexity(
  assignmentType: string, 
  requirements: string, 
  deliverables: string
): number {
  const config = ASSIGNMENT_CONFIGS[assignmentType] || ASSIGNMENT_CONFIGS.essay
  let complexity = config.baseComplexity
  
  // Analyze requirements text for complexity indicators
  const text = `${requirements} ${deliverables}`.toLowerCase()
  
  // Word count complexity
  const wordCount = text.split(/\s+/).length
  if (wordCount > 200) complexity += 1
  if (wordCount > 500) complexity += 1
  
  // Complexity keywords
  const complexityKeywords = [
    'analysis', 'critical', 'compare', 'contrast', 'evaluate', 'synthesis',
    'research', 'methodology', 'statistical', 'empirical', 'theoretical',
    'multiple sources', 'peer review', 'citation', 'bibliography',
    'advanced', 'comprehensive', 'detailed', 'extensive'
  ]
  
  const foundKeywords = complexityKeywords.filter(keyword => text.includes(keyword))
  complexity += Math.min(2, foundKeywords.length * 0.3)
  
  // Page/length requirements
  if (text.includes('page')) {
    const pageMatches = text.match(/(\d+)\s*page/g)
    if (pageMatches) {
      const pages = Math.max(...pageMatches.map(match => parseInt(match)))
      if (pages > 10) complexity += 1
      if (pages > 20) complexity += 1
    }
  }
  
  return Math.min(10, Math.max(1, Math.round(complexity)))
}

// Generate smart breakdown for assignment
export function generateSmartBreakdown(planner: Planner): AssignmentBreakdown {
  const urgencyMetrics = calculateUrgencyMetrics(planner.dueDate)
  const complexity = estimateComplexity(
    planner.assignmentType || 'essay',
    planner.requirements || '',
    planner.deliverables || ''
  )
  
  const assignmentType = planner.assignmentType || 'essay'
  const config = ASSIGNMENT_CONFIGS[assignmentType as keyof typeof ASSIGNMENT_CONFIGS] || ASSIGNMENT_CONFIGS.essay
  
  // Calculate total estimated hours
  let totalHours = complexity * 3 // Base calculation
  
  // Adjust based on assignment type specifics
  if (planner.assignmentType === 'essay') {
    const wordCount = extractWordCount(planner.requirements || planner.deliverables || '')
    if (wordCount && config.estimatedHoursPerPage) {
      totalHours = Math.max(totalHours, (wordCount / 500) * config.estimatedHoursPerPage)
    }
  }
  
  totalHours = Math.max(8, Math.min(100, totalHours)) // Reasonable bounds
  
  // Generate tasks based on phases
  const tasks: Task[] = config.phases.map((phase, index) => {
    const phaseHours = Math.max(phase.minHours, (totalHours * phase.percentage) / 100)
    const phaseDays = Math.ceil(phaseHours / urgencyMetrics.recommendedHoursPerDay)
    
    // Calculate start and end dates for each phase
    const phaseStartDate = new Date()
    if (index > 0) {
      // Start after previous phases
      const previousPhaseDays = config.phases
        .slice(0, index)
        .reduce((total, p) => {
          const prevHours = Math.max(p.minHours, (totalHours * p.percentage) / 100)
          return total + Math.ceil(prevHours / urgencyMetrics.recommendedHoursPerDay)
        }, 0)
      phaseStartDate.setDate(phaseStartDate.getDate() + previousPhaseDays)
    }
    
    const phaseEndDate = new Date(phaseStartDate)
    phaseEndDate.setDate(phaseEndDate.getDate() + phaseDays - 1)
    
    // Determine priority based on urgency and phase importance
    let priority: 'low' | 'medium' | 'high' = 'medium'
    if (urgencyMetrics.urgencyLevel === 'critical' || urgencyMetrics.urgencyLevel === 'high') {
      priority = 'high'
    } else if (phase.percentage > 30) {
      priority = 'high'
    } else if (phase.percentage < 15) {
      priority = 'low'
    }
    
    return {
      id: `task-${index + 1}`,
      name: phase.name,
      description: generatePhaseDescription(phase.name, planner.assignmentType || 'essay'),
      tip: generatePhaseTip(phase.name, planner.assignmentType || 'essay'),
      startDate: phaseStartDate.toISOString().split('T')[0],
      endDate: phaseEndDate.toISOString().split('T')[0],
      completed: false,
      priority,
      estimatedHours: Math.round(phaseHours)
    }
  })
  
  // Generate adaptive recommendations
  const recommendations = generateAdaptiveRecommendations(urgencyMetrics, complexity, planner.assignmentType || 'essay')
  
  return {
    assignmentType: planner.assignmentType || 'essay',
    urgencyLevel: urgencyMetrics.urgencyLevel,
    recommendedStartDate: new Date(),
    timeToCompletion: totalHours,
    complexityScore: complexity,
    tasks,
    adaptiveRecommendations: recommendations
  }
}

// Extract word count from text
function extractWordCount(text: string): number | null {
  const wordMatches = text.match(/(\d+)\s*word/i)
  if (wordMatches) {
    return parseInt(wordMatches[1])
  }
  return null
}

// Generate phase description
function generatePhaseDescription(phaseName: string, assignmentType: string): string {
  const descriptions = {
    'Research & Planning': {
      essay: 'Gather sources, analyze the assignment prompt, and develop your thesis statement.',
      research: 'Define research scope, identify key literature, and establish methodology.',
      presentation: 'Research topic thoroughly and identify key points to present.',
      coding: 'Analyze requirements, choose technology stack, and plan architecture.',
      design: 'Research target audience, analyze competitors, and gather inspiration.'
    },
    'Literature Review': {
      research: 'Systematically review existing literature and identify research gaps.',
    },
    'Topic Definition': {
      research: 'Clearly define research question and establish scope of investigation.',
    },
    'Outline Creation': {
      essay: 'Create detailed outline with main points and supporting evidence.',
    },
    'Slide Creation': {
      presentation: 'Develop slide content with clear structure and compelling narrative.',
    },
    'Content Research': {
      presentation: 'Research and organize information for presentation content.',
    },
    'First Draft': {
      essay: 'Write complete first draft focusing on content over perfection.',
    },
    'Core Development': {
      coding: 'Implement main features and core functionality of the application.',
    },
    'Concept Development': {
      design: 'Develop multiple design concepts and explore different approaches.',
    },
    'Data Collection': {
      research: 'Gather primary and secondary data according to methodology.',
    },
    'Design Creation': {
      design: 'Create final designs with attention to visual hierarchy and usability.',
    },
    'Analysis': {
      research: 'Analyze collected data and derive meaningful insights.',
    },
    'Testing & Debugging': {
      coding: 'Thoroughly test functionality and fix any identified issues.',
    },
    'Design & Visuals': {
      presentation: 'Create compelling visuals and ensure consistent design.',
    },
    'Environment Setup': {
      coding: 'Set up development environment and initialize project structure.',
    },
    'Planning & Design': {
      coding: 'Create technical specifications and design system architecture.',
    },
    'Revision & Editing': {
      essay: 'Review content, improve clarity, and refine arguments.',
    },
    'Practice & Rehearsal': {
      presentation: 'Practice delivery and refine presentation timing.',
    },
    'Refinement': {
      design: 'Polish designs based on feedback and ensure quality standards.',
    },
    'Report Writing': {
      research: 'Compile findings into comprehensive research report.',
    },
    'Documentation': {
      coding: 'Create user documentation and code comments.',
    },
    'Final Review': {
      essay: 'Proofread for grammar, formatting, and citation accuracy.',
    }
  }
  
  return (descriptions as any)[phaseName]?.[assignmentType] || 
         (descriptions as any)[phaseName]?.essay || 
         `Complete the ${phaseName.toLowerCase()} phase of your ${assignmentType} assignment.`
}

// Generate phase tip
function generatePhaseTip(phaseName: string, assignmentType: string): string {
  const tips = {
    'Research & Planning': {
      essay: 'Use academic databases and create a bibliography as you research.',
      research: 'Start with recent systematic reviews to understand the current state.',
      presentation: 'Focus on your audience\'s needs and interests.',
      coding: 'Document your decisions and consider scalability early.',
      design: 'Create a mood board to establish visual direction.'
    },
    'Outline Creation': {
      essay: 'Each main point should support your thesis with specific evidence.',
    },
    'First Draft': {
      essay: 'Focus on getting ideas down first; worry about perfection later.',
    },
    'Core Development': {
      coding: 'Write clean, readable code and commit changes frequently.',
    },
    'Testing & Debugging': {
      coding: 'Test edge cases and document any known limitations.',
    },
    'Revision & Editing': {
      essay: 'Read your work aloud to catch awkward phrasing.',
    },
    'Practice & Rehearsal': {
      presentation: 'Time your presentation and prepare for potential questions.',
    },
    'Final Review': {
      essay: 'Use spell-check but also manually review for context errors.',
    }
  }
  
  return (tips as any)[phaseName]?.[assignmentType] || 
         (tips as any)[phaseName]?.essay || 
         'Stay focused and take regular breaks to maintain productivity.'
}

// Generate adaptive recommendations
function generateAdaptiveRecommendations(
  urgencyMetrics: UrgencyMetrics,
  complexity: number,
  assignmentType: string
): string[] {
  const recommendations: string[] = []
  
  // Urgency-based recommendations
  if (urgencyMetrics.urgencyLevel === 'critical') {
    recommendations.push('⚠️ Critical Timeline: Focus on core requirements only and consider seeking help.')
    recommendations.push('🎯 Prioritize essential tasks and be prepared to work extended hours.')
  } else if (urgencyMetrics.urgencyLevel === 'high') {
    recommendations.push('⏰ High Priority: Plan focused work sessions and minimize distractions.')
    recommendations.push('📅 Work daily to stay on track, including weekends if necessary.')
  } else if (urgencyMetrics.urgencyLevel === 'medium') {
    recommendations.push('📋 Moderate Timeline: Maintain steady progress with regular work sessions.')
    recommendations.push('🔄 Review progress weekly and adjust schedule as needed.')
  } else {
    recommendations.push('✅ Comfortable Timeline: Use this time to do quality work and thorough research.')
    recommendations.push('📚 Consider going beyond minimum requirements for better results.')
  }
  
  // Complexity-based recommendations
  if (complexity >= 8) {
    recommendations.push('🧠 High Complexity: Break tasks into smaller chunks and seek expert guidance.')
    recommendations.push('👥 Consider forming a study group or finding a research partner.')
  } else if (complexity >= 6) {
    recommendations.push('📝 Moderate Complexity: Plan extra time for revision and quality checks.')
  } else {
    recommendations.push('⚡ Straightforward Assignment: Focus on clear execution and good organization.')
  }
  
  // Assignment type-specific recommendations
  const typeRecommendations = {
    essay: [
      '📖 Use library databases for credible sources.',
      '✍️ Start with a strong thesis statement.',
      '🔍 Cite sources properly from the beginning.'
    ],
    research: [
      '🔬 Follow a systematic methodology.',
      '📊 Keep detailed records of all data.',
      '📚 Stay current with recent publications.'
    ],
    presentation: [
      '🎤 Practice speaking clearly and confidently.',
      '📺 Test all technology beforehand.',
      '👀 Make eye contact with your audience.'
    ],
    coding: [
      '💻 Use version control from day one.',
      '🧪 Write tests alongside your code.',
      '📖 Comment your code for future reference.'
    ],
    design: [
      '🎨 Create multiple concept variations.',
      '👤 Get feedback from target users early.',
      '📱 Consider accessibility in your designs.'
    ]
  }
  
  const typeSpecific = (typeRecommendations as any)[assignmentType] || typeRecommendations.essay
  recommendations.push(...typeSpecific.slice(0, 2)) // Add 2 type-specific tips
  
  // Working hours recommendation
  recommendations.push(
    `⏱️ Recommended: ${urgencyMetrics.recommendedHoursPerDay} hours per day over ${urgencyMetrics.workingDaysUntilDue} working days.`
  )
  
  return recommendations
}