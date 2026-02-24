import { generateId } from './calculations'
import { subDays, subMonths, addDays, format } from 'date-fns'

const today = new Date()

// Sample Projects
export const sampleProjects = [
  {
    id: 'proj-1',
    name: 'Marina Bay Tower',
    client: 'Skyline Developments Ltd',
    location: 'Marina Bay, Downtown',
    startDate: format(subMonths(today, 8), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 180), 'yyyy-MM-dd'),
    status: 'active',
    manHours: 450000,
    targetEngagements: { weekly: 15, monthly: 8 },
    notes: 'High-rise commercial tower, 45 floors. Critical phase: structural works.',
  },
  {
    id: 'proj-2',
    name: 'Northgate Industrial Complex',
    client: 'Industrial Holdings Corp',
    location: 'Northgate Industrial Zone',
    startDate: format(subMonths(today, 5), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 120), 'yyyy-MM-dd'),
    status: 'active',
    manHours: 280000,
    targetEngagements: { weekly: 12, monthly: 6 },
    notes: 'Warehouse and logistics facility. Heavy equipment operations ongoing.',
  },
  {
    id: 'proj-3',
    name: 'Riverside Residential',
    client: 'Urban Living Developers',
    location: 'Riverside District',
    startDate: format(subMonths(today, 10), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 90), 'yyyy-MM-dd'),
    status: 'active',
    manHours: 320000,
    targetEngagements: { weekly: 10, monthly: 5 },
    notes: 'Residential apartment complex, 3 blocks. Finishing works phase.',
  },
  {
    id: 'proj-4',
    name: 'City Center Mall Renovation',
    client: 'Metro Retail Group',
    location: 'City Center',
    startDate: format(subMonths(today, 3), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 150), 'yyyy-MM-dd'),
    status: 'active',
    manHours: 180000,
    targetEngagements: { weekly: 8, monthly: 4 },
    notes: 'Interior renovation of existing mall. Night works scheduled.',
  },
  {
    id: 'proj-5',
    name: 'Highway 7 Bridge Expansion',
    client: 'Department of Infrastructure',
    location: 'Highway 7, Section B',
    startDate: format(subMonths(today, 6), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 240), 'yyyy-MM-dd'),
    status: 'active',
    manHours: 520000,
    targetEngagements: { weekly: 18, monthly: 10 },
    notes: 'Bridge expansion and road widening. Traffic management critical.',
  },
]

// Generate sample incidents
export const generateSampleIncidents = () => {
  const incidents = []

  // Add historical incidents over 6 months
  const incidentData = [
    { type: 'lti', projectId: 'proj-1', daysAgo: 95, description: 'Worker fell from scaffold at level 12', bodyPart: 'Back (Lower)', rootCause: 'Inadequate Training' },
    { type: 'mti', projectId: 'proj-5', daysAgo: 82, description: 'Hand caught in machinery during concrete pour', bodyPart: 'Hand', rootCause: 'Equipment Failure' },
    { type: 'fac', projectId: 'proj-2', daysAgo: 75, description: 'Minor cut from sheet metal handling', bodyPart: 'Fingers', rootCause: 'Improper PPE Usage' },
    { type: 'near-miss', projectId: 'proj-1', daysAgo: 70, description: 'Unsecured load nearly fell from crane', rootCause: 'Unsafe Work Practice' },
    { type: 'mti', projectId: 'proj-3', daysAgo: 65, description: 'Eye injury from flying debris', bodyPart: 'Eyes', rootCause: 'Improper PPE Usage' },
    { type: 'fac', projectId: 'proj-4', daysAgo: 58, description: 'Slip on wet floor, minor bruise', bodyPart: 'Knee', rootCause: 'Poor Housekeeping' },
    { type: 'near-miss', projectId: 'proj-2', daysAgo: 52, description: 'Forklift near-collision with pedestrian', rootCause: 'Lack of Supervision' },
    { type: 'unsafe-act', projectId: 'proj-1', daysAgo: 48, description: 'Worker not wearing safety harness at height', rootCause: 'Unsafe Work Practice' },
    { type: 'unsafe-condition', projectId: 'proj-5', daysAgo: 45, description: 'Exposed electrical wiring near work area', rootCause: 'Inadequate Procedure' },
    { type: 'fac', projectId: 'proj-3', daysAgo: 40, description: 'Heat exhaustion requiring first aid', bodyPart: 'Multiple Body Parts', rootCause: 'Environmental Conditions' },
    { type: 'near-miss', projectId: 'proj-4', daysAgo: 35, description: 'Scaffolding plank dislodged, no injury', rootCause: 'Equipment Failure' },
    { type: 'mti', projectId: 'proj-2', daysAgo: 28, description: 'Back strain from improper lifting', bodyPart: 'Back (Lower)', rootCause: 'Inadequate Training' },
    { type: 'unsafe-act', projectId: 'proj-5', daysAgo: 25, description: 'Worker bypassing safety interlock', rootCause: 'Time Pressure' },
    { type: 'fac', projectId: 'proj-1', daysAgo: 20, description: 'Splinter in hand from wooden formwork', bodyPart: 'Hand', rootCause: 'Improper PPE Usage' },
    { type: 'near-miss', projectId: 'proj-3', daysAgo: 15, description: 'Tool dropped from height, hit empty area', rootCause: 'Poor Housekeeping' },
    { type: 'unsafe-condition', projectId: 'proj-2', daysAgo: 12, description: 'Missing guardrails on platform', rootCause: 'Inadequate Procedure' },
    { type: 'near-miss', projectId: 'proj-1', daysAgo: 8, description: 'Material stack nearly toppled', rootCause: 'Poor Housekeeping' },
    { type: 'fac', projectId: 'proj-5', daysAgo: 5, description: 'Minor burn from hot tar during road works', bodyPart: 'Forearm', rootCause: 'Improper PPE Usage' },
    { type: 'unsafe-act', projectId: 'proj-4', daysAgo: 3, description: 'Worker not using hearing protection', rootCause: 'Unsafe Work Practice' },
  ]

  incidentData.forEach((data, index) => {
    const incidentDate = format(subDays(today, data.daysAgo), 'yyyy-MM-dd')
    const actionDueDate = format(subDays(today, data.daysAgo - 14), 'yyyy-MM-dd')

    incidents.push({
      id: `inc-${index + 1}`,
      projectId: data.projectId,
      date: incidentDate,
      type: data.type,
      description: data.description,
      location: `Work Zone ${Math.floor(Math.random() * 5) + 1}`,
      injuredPerson: data.bodyPart ? `Worker ${Math.floor(Math.random() * 100) + 1}` : '',
      bodyPart: data.bodyPart || '',
      rootCause: data.rootCause,
      correctiveAction: `Implement corrective measures for ${data.rootCause.toLowerCase()}`,
      actionDueDate: actionDueDate,
      actionStatus: data.daysAgo > 30 ? 'closed' : (data.daysAgo > 14 ? 'in-progress' : 'open'),
      reportedBy: `Safety Officer ${Math.floor(Math.random() * 5) + 1}`,
    })
  })

  return incidents
}

// Generate sample engagements
export const generateSampleEngagements = () => {
  const engagements = []
  const projectIds = sampleProjects.map(p => p.id)
  const engagementTypes = [
    'site-inspection',
    'toolbox-talk',
    'safety-meeting',
    'internal-audit',
    'training',
    'management-walk',
    'permit-review',
    'risk-assessment',
  ]

  // Generate engagements for the past 6 months
  for (let daysAgo = 180; daysAgo >= 0; daysAgo--) {
    const date = subDays(today, daysAgo)
    const dayOfWeek = date.getDay()

    // Skip weekends for most activities
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // Generate 3-8 random engagements per day
    const numEngagements = Math.floor(Math.random() * 6) + 3

    for (let i = 0; i < numEngagements; i++) {
      const projectId = projectIds[Math.floor(Math.random() * projectIds.length)]
      const type = engagementTypes[Math.floor(Math.random() * engagementTypes.length)]

      engagements.push({
        id: generateId(),
        projectId,
        date: format(date, 'yyyy-MM-dd'),
        type,
        duration: [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)],
        attendees: Math.floor(Math.random() * 20) + 5,
        topics: getTopicsForType(type),
        findings: Math.random() > 0.7 ? `Finding noted during ${type}` : '',
        actionsRaised: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
        conductedBy: `HSE Officer ${Math.floor(Math.random() * 5) + 1}`,
      })
    }
  }

  return engagements
}

const getTopicsForType = (type) => {
  const topicsByType = {
    'site-inspection': ['Housekeeping', 'PPE Compliance', 'Work at Height', 'Scaffolding'],
    'toolbox-talk': ['Manual Handling', 'Heat Stress', 'Emergency Procedures', 'Electrical Safety'],
    'safety-meeting': ['Incident Review', 'Safety Performance', 'Upcoming Works', 'HSE Updates'],
    'internal-audit': ['Documentation Review', 'Procedure Compliance', 'Training Records', 'Permit System'],
    'training': ['Induction', 'Fire Safety', 'First Aid', 'Working at Height'],
    'management-walk': ['Leadership Visibility', 'Worker Engagement', 'Site Conditions', 'Best Practices'],
    'permit-review': ['Hot Work', 'Confined Space', 'Excavation', 'Lifting Operations'],
    'risk-assessment': ['Task Analysis', 'Hazard Identification', 'Control Measures', 'Method Statement'],
  }

  const topics = topicsByType[type] || ['General Safety']
  const numTopics = Math.floor(Math.random() * 2) + 1
  return topics.slice(0, numTopics)
}

// Generate sample compliance items
export const generateSampleCompliance = () => {
  const compliance = []
  const projectIds = sampleProjects.map(p => p.id)

  const complianceItems = [
    { type: 'crane-inspection', itemName: 'Tower Crane TC-001', category: 'equipment' },
    { type: 'crane-inspection', itemName: 'Mobile Crane MC-002', category: 'equipment' },
    { type: 'scaffold-inspection', itemName: 'Main Scaffolding Zone A', category: 'equipment' },
    { type: 'fire-extinguisher', itemName: 'Fire Extinguishers Set 1', category: 'equipment' },
    { type: 'rigger-cert', itemName: 'Ahmad Hassan - Rigger', category: 'certifications' },
    { type: 'rigger-cert', itemName: 'John Smith - Rigger', category: 'certifications' },
    { type: 'scaffolder-cert', itemName: 'Mike Chen - Scaffolder', category: 'certifications' },
    { type: 'crane-operator', itemName: 'David Lee - Crane Operator', category: 'certifications' },
    { type: 'first-aid', itemName: 'Sarah Johnson - First Aider', category: 'certifications' },
    { type: 'hot-work', itemName: 'Welding Operations Permit', category: 'permits' },
    { type: 'confined-space', itemName: 'Tank Entry Permit', category: 'permits' },
    { type: 'height-work', itemName: 'Roof Access Permit', category: 'permits' },
    { type: 'insurance', itemName: 'Public Liability Insurance', category: 'documents' },
    { type: 'license', itemName: 'Construction License', category: 'documents' },
  ]

  projectIds.forEach(projectId => {
    // Add 8-12 compliance items per project
    const numItems = Math.floor(Math.random() * 5) + 8
    const shuffled = [...complianceItems].sort(() => 0.5 - Math.random())

    shuffled.slice(0, numItems).forEach((item, index) => {
      const issueDate = subDays(today, Math.floor(Math.random() * 180) + 30)
      const validDays = item.category === 'permits' ? 30 : (item.category === 'equipment' ? 90 : 365)
      const expiryDate = addDays(issueDate, validDays)

      compliance.push({
        id: generateId(),
        projectId,
        type: item.type,
        itemName: item.itemName,
        category: item.category,
        issueDate: format(issueDate, 'yyyy-MM-dd'),
        expiryDate: format(expiryDate, 'yyyy-MM-dd'),
        responsiblePerson: `Manager ${Math.floor(Math.random() * 5) + 1}`,
        documentRef: `DOC-${projectId.toUpperCase()}-${(index + 1).toString().padStart(3, '0')}`,
        notes: '',
      })
    })
  })

  return compliance
}

// Initialize all sample data
export const initializeSampleData = () => {
  return {
    projects: sampleProjects,
    incidents: generateSampleIncidents(),
    engagements: generateSampleEngagements(),
    compliance: generateSampleCompliance(),
  }
}
