/**
 * Shared status color utilities
 * Used across DataTable, DrillDownModal, and other components for consistent status styling
 */

/**
 * Get Tailwind classes for action status badge styling
 * @param {string} status - The action status ('closed', 'in-progress', 'open', etc.)
 * @returns {string} Tailwind CSS classes for bg, text, and border colors
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'closed':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'in-progress':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    default:
      return 'bg-red-100 text-red-700 border-red-200'
  }
}

/**
 * Get status color for observation types
 * @param {string} type - The observation type
 * @returns {string} Tailwind CSS classes
 */
export const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'positive':
    case 'positive observation':
      return 'bg-green-100 text-green-700'
    case 'negative':
    case 'unsafe act':
    case 'unsafe-act':
    case 'unsafe condition':
    case 'unsafe-condition':
      return 'bg-red-100 text-red-700'
    case 'near miss':
    case 'near-miss':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-blue-100 text-blue-700'
  }
}
