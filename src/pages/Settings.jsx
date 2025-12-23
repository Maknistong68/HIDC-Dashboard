import React, { useState, useRef } from 'react'
import { Upload, Download, Trash2, AlertTriangle, CheckCircle, Database, FileSpreadsheet, Info, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { downloadJSON, readJSONFile } from '../utils/storage'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { format } from 'date-fns'

const Settings = () => {
  const navigate = useNavigate()
  const { projects, incidents, exportData, importData, clearData, lastImportStats } = useData()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const fileInputRef = useRef(null)

  const handleExport = () => {
    const data = exportData()
    const filename = `hse-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
    downloadJSON(data, filename)
    setImportStatus({ type: 'success', message: 'Data exported successfully!' })
    setTimeout(() => setImportStatus(null), 3000)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await readJSONFile(file)
      const result = await importData(data)

      if (result.success) {
        setImportStatus({ type: 'success', message: 'Data imported successfully!' })
      } else {
        setImportStatus({ type: 'error', message: result.error || 'Import failed' })
      }
    } catch (error) {
      setImportStatus({ type: 'error', message: error.message })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setTimeout(() => setImportStatus(null), 5000)
  }

  const handleClearData = () => {
    clearData()
    setShowClearConfirm(false)
    setImportStatus({ type: 'success', message: 'All data cleared!' })
    setTimeout(() => setImportStatus(null), 3000)
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your data and preferences</p>
      </div>

      {/* Import Status */}
      {importStatus && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            importStatus.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Data Overview Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Database size={16} />
            Data Overview
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
              <p className="text-sm text-blue-700">Projects</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{incidents.length}</p>
              <p className="text-sm text-amber-700">Observations</p>
            </div>
          </div>

          {/* Last Import Stats */}
          {lastImportStats && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Clock size={14} />
                Last Import: {format(new Date(lastImportStats.timestamp), 'MMM d, yyyy h:mm a')}
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-green-600">+{lastImportStats.added} added</span>
                <span className="text-blue-600">{lastImportStats.updated} updated</span>
                <span className="text-gray-500">{lastImportStats.skipped} skipped</span>
                {lastImportStats.warningCount > 0 && (
                  <span className="text-amber-600">{lastImportStats.warningCount} warnings</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Excel Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet size={16} />
            Import from Excel
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Import observations from your HSE system's Excel exports.
          </p>

          {/* Date Format Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Recommended Date Formats</p>
                <p>For best results, format dates as <strong>DD/MM/YYYY</strong> or <strong>YYYY-MM-DD</strong> before importing.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/import')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FileSpreadsheet size={18} />
            Import Excel File
          </button>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Download size={16} />
            Backup & Restore
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {/* Export */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Export Backup</h4>
              <p className="text-xs text-gray-500">Download all data as JSON file</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Restore Backup</h4>
              <p className="text-xs text-gray-500">Import from a previously exported JSON file</p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm font-medium cursor-pointer"
              >
                <Upload size={16} />
                Restore
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
            <AlertTriangle size={16} />
            Danger Zone
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Clear All Data</h4>
              <p className="text-xs text-gray-500">Permanently delete all projects and observations</p>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Info size={16} />
            About
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>HSE Observation Tracker</strong>
          </p>
          <p className="text-xs text-gray-500">
            A dashboard for analyzing health, safety, and environment observations.
            Import data from your HSE system and visualize trends, hazards, and team performance.
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Data is stored locally in your browser. No data is sent to any server.
          </p>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        title="Clear All Data"
        message="Are you sure you want to delete all data? This action cannot be undone. Make sure to export a backup first."
        confirmText="Clear All Data"
        variant="danger"
      />
    </div>
  )
}

export default Settings
