import React from 'react'
import { Settings, Shield, User, CheckCircle, Zap } from 'lucide-react'
import { QUICK_ACTION_PRESETS } from '../../utils/constants'

// Icon mapping for quick actions
const ICON_MAP = {
  Settings,
  Shield,
  User,
  CheckCircle
}

// Color mapping for quick actions
const COLOR_MAP = {
  blue: {
    active: 'bg-blue-600 text-white border-blue-600 shadow-md',
    inactive: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-100'
  },
  indigo: {
    active: 'bg-indigo-600 text-white border-indigo-600 shadow-md',
    inactive: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100'
  },
  amber: {
    active: 'bg-amber-600 text-white border-amber-600 shadow-md',
    inactive: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-100'
  },
  green: {
    active: 'bg-green-600 text-white border-green-600 shadow-md',
    inactive: 'bg-green-50 text-green-700 border-green-200 hover:border-green-400 hover:bg-green-100'
  }
}

/**
 * QuickActionPanel - 2x2 grid of quick action toggle buttons
 *
 * Pre-configured intervention bundles with estimated impact shown on each button.
 * Click to activate, click again to deactivate.
 */
const QuickActionPanel = ({
  activeAction,
  onToggleAction,
  openActionsCount = 0,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-amber-500" />
        <span className="text-xs font-medium text-surface-600">Quick Actions</span>
        <span className="text-2xs text-surface-400">Click to apply</span>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTION_PRESETS.map(action => {
          const Icon = ICON_MAP[action.icon] || Settings
          const colors = COLOR_MAP[action.color] || COLOR_MAP.blue
          const isActive = activeAction === action.id

          // For "close-actions", show actual count
          const showActionCount = action.id === 'close-actions' && openActionsCount > 0
          const estimatedImpact = showActionCount
            ? Math.round(Math.min(20, openActionsCount * 2.5) * -1)
            : action.estimatedImpact

          const isDisabled = disabled || (action.id === 'close-actions' && openActionsCount === 0)

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => !isDisabled && onToggleAction(action.id)}
              disabled={isDisabled}
              className={`relative flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed bg-surface-100 border-surface-200 text-surface-400'
                  : isActive
                    ? colors.active
                    : colors.inactive
              }`}
              title={action.description}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}

              {/* Icon */}
              <Icon size={20} className={isActive ? 'text-white' : ''} />

              {/* Label */}
              <span className="text-xs font-semibold">
                {action.label}
              </span>

              {/* Impact Badge */}
              <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-100 text-surface-600'
              }`}>
                {estimatedImpact}%
              </span>

              {/* Action count for close-actions */}
              {showActionCount && !isActive && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-2xs font-bold bg-amber-500 text-white rounded-full">
                  {openActionsCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active Action Description */}
      {activeAction && (
        <div className="p-2 bg-surface-50 rounded-lg border border-surface-200">
          <p className="text-xs text-surface-600">
            <span className="font-medium">Active: </span>
            {QUICK_ACTION_PRESETS.find(a => a.id === activeAction)?.description}
          </p>
        </div>
      )}
    </div>
  )
}

export default React.memo(QuickActionPanel)
