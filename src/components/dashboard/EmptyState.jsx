import React, { memo } from 'react'
import { FileSpreadsheet, Lightbulb } from 'lucide-react'
import ImportWizard from '../import/ImportWizard'
import { Card } from '../ui'

/**
 * EmptyState - Dashboard placeholder when no data is loaded
 * Wrapped in React.memo to prevent unnecessary re-renders
 */
const EmptyState = memo(({ onImportComplete }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Helpful Tip */}
      <div className="flex items-center gap-3 text-sm text-surface-600 bg-primary-50/50 border border-primary-100 px-4 py-3 rounded-lg">
        <div className="flex-shrink-0 p-1.5 bg-primary-100 rounded-full">
          <Lightbulb size={16} className="text-primary-600" aria-hidden="true" />
        </div>
        <p>
          <span className="font-medium">Tip:</span> Format dates as{' '}
          <code className="px-1.5 py-0.5 bg-white rounded text-primary-700 font-mono text-xs">
            DD/MM/YYYY
          </code>{' '}
          before importing for best results
        </p>
      </div>

      {/* Import Card */}
      <Card padding="large" className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-surface-200">
          <div className="p-2.5 bg-primary-50 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-800">Import Excel Data</h2>
            <p className="text-sm text-surface-500">Upload your HSE observation data to get started</p>
          </div>
        </div>

        <ImportWizard
          mode="inline"
          showHeader={false}
          onComplete={onImportComplete}
          onCancel={null}
        />
      </Card>
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

export default EmptyState
