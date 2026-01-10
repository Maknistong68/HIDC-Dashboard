import React from 'react'
import { ChevronDown, ChevronRight, RotateCcw, Info } from 'lucide-react'

// Collapsible Section Container
export const SettingSection = ({
  title,
  description,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
  modifiedCount = 0,
  onReset
}) => {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon size={20} className="text-blue-600" />
            </div>
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900">{title}</h3>
              {modifiedCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                  {modifiedCount} changed
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-surface-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {modifiedCount > 0 && onReset && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReset()
              }}
              className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw size={16} />
            </button>
          )}
          {isExpanded ? (
            <ChevronDown size={20} className="text-surface-400" />
          ) : (
            <ChevronRight size={20} className="text-surface-400" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-surface-100">
          <div className="pt-4 space-y-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// Sub-section within a section
export const SubSection = ({ title, children }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-surface-700 border-b border-surface-100 pb-2">{title}</h4>
      <div className="space-y-3 pl-1">
        {children}
      </div>
    </div>
  )
}

// Individual Setting Row
export const SettingRow = ({
  label,
  description,
  children,
  isModified = false,
  tooltip
}) => {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isModified ? 'text-blue-600' : 'text-surface-700'}`}>
            {label}
          </span>
          {isModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
          {tooltip && (
            <div className="group relative">
              <Info size={14} className="text-surface-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-surface-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-surface-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  )
}

// Toggle Switch
export const Toggle = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-blue-600' : 'bg-surface-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// Dropdown Select
export const Dropdown = ({ value, onChange, options, disabled = false, className = '' }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`px-3 py-1.5 text-sm border border-surface-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// Slider with value display
export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue = (v) => v,
  showLabels = true,
  minLabel,
  maxLabel
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      {showLabels && (
        <span className="text-xs text-surface-500 w-20 text-right">{minLabel || min}</span>
      )}
      <div className="relative flex-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
      </div>
      {showLabels && (
        <span className="text-xs text-surface-500 w-20">{maxLabel || max}</span>
      )}
      <span className="text-sm font-medium text-blue-600 min-w-[50px] text-right">
        {formatValue(value)}
      </span>
    </div>
  )
}

// Number Input
export const NumberInput = ({ value, onChange, min, max, step = 1, suffix = '', className = '' }) => {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className={`w-20 px-2 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      />
      {suffix && <span className="text-sm text-surface-500">{suffix}</span>}
    </div>
  )
}

// Text Input
export const TextInput = ({ value, onChange, placeholder = '', className = '' }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  )
}

// Multi-select Chips
export const MultiSelect = ({ value = [], onChange, options }) => {
  const toggleOption = (optValue) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleOption(opt.value)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              isSelected
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-surface-100 text-surface-600 border border-surface-200 hover:bg-surface-200'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// Radio Button Group
export const RadioGroup = ({ value, onChange, options, inline = true }) => {
  return (
    <div className={`flex ${inline ? 'flex-wrap gap-4' : 'flex-col gap-2'}`}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="w-4 h-4 text-blue-600 border-surface-200 focus:ring-blue-500"
          />
          <span className="text-sm text-surface-700">{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

// Mapping Table (for type/status mappings)
export const MappingTable = ({ mappings, onChange, placeholder = { from: 'From', to: 'To' } }) => {
  const entries = Object.entries(mappings)

  const updateMapping = (oldKey, newKey, newValue) => {
    const newMappings = { ...mappings }
    if (oldKey !== newKey) {
      delete newMappings[oldKey]
    }
    if (newKey && newValue) {
      newMappings[newKey] = newValue
    }
    onChange(newMappings)
  }

  const addMapping = () => {
    onChange({ ...mappings, '': '' })
  }

  const removeMapping = (key) => {
    const newMappings = { ...mappings }
    delete newMappings[key]
    onChange(newMappings)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr,auto,1fr,auto] gap-2 text-xs text-surface-500 font-medium px-1">
        <span>{placeholder.from}</span>
        <span></span>
        <span>{placeholder.to}</span>
        <span></span>
      </div>
      {entries.map(([key, value], idx) => (
        <div key={idx} className="grid grid-cols-[1fr,auto,1fr,auto] gap-2 items-center">
          <input
            type="text"
            value={key}
            onChange={(e) => updateMapping(key, e.target.value, value)}
            placeholder="Input value"
            className="px-2 py-1 text-sm border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-surface-400">→</span>
          <input
            type="text"
            value={value}
            onChange={(e) => updateMapping(key, key, e.target.value)}
            placeholder="Maps to"
            className="px-2 py-1 text-sm border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => removeMapping(key)}
            className="p-1 text-surface-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addMapping}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + Add mapping
      </button>
    </div>
  )
}
