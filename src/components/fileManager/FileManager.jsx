import React, { useState, useMemo } from 'react'
import { format, differenceInDays } from 'date-fns'
import {
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  Upload,
  Search,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Calendar,
  List,
  Database,
  HardDrive,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Card } from '../ui'
import FileDeleteConfirm from './FileDeleteConfirm'
import FileReplaceModal from './FileReplaceModal'
import BatchImportModal from './BatchImportModal'
import DataTimeline from './DataTimeline'
import ContractorClassificationPanel from './ContractorClassificationPanel'

/**
 * FileManager - Enterprise file management for imported data
 *
 * Features:
 * - View all imported files with record counts
 * - Delete individual files (with confirmation)
 * - Replace files with updated versions
 * - Batch import multiple files
 * - Data timeline visualization
 */
const FileManager = () => {
  const { files, incidents, deleteFile, isLoading } = useData()

  const [activeTab, setActiveTab] = useState('files')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'importedAt', direction: 'desc' })
  const [deleteModalFile, setDeleteModalFile] = useState(null)
  const [replaceModalFile, setReplaceModalFile] = useState(null)
  const [showBatchImport, setShowBatchImport] = useState(false)

  // Calculate file record counts from incidents
  const fileRecordCounts = useMemo(() => {
    const counts = new Map()
    for (const incident of incidents) {
      if (incident.fileId) {
        counts.set(incident.fileId, (counts.get(incident.fileId) || 0) + 1)
      }
    }
    return counts
  }, [incidents])

  // Enrich files with actual record counts
  const enrichedFiles = useMemo(() => {
    return files.map(file => ({
      ...file,
      actualRecordCount: fileRecordCounts.get(file.id) || 0
    }))
  }, [files, fileRecordCounts])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalRecords = enrichedFiles.reduce((sum, f) => sum + f.actualRecordCount, 0)
    const totalSize = enrichedFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0)

    // Calculate date range from incidents
    let earliestDate = null
    let latestDate = null
    for (const incident of incidents) {
      if (incident.date) {
        const d = new Date(incident.date)
        if (!earliestDate || d < earliestDate) earliestDate = d
        if (!latestDate || d > latestDate) latestDate = d
      }
    }

    const coverageDays = earliestDate && latestDate
      ? differenceInDays(latestDate, earliestDate) + 1
      : 0

    return {
      totalFiles: enrichedFiles.length,
      totalRecords,
      totalSize,
      coverageDays,
      avgRecordsPerFile: enrichedFiles.length > 0
        ? Math.round(totalRecords / enrichedFiles.length)
        : 0
    }
  }, [enrichedFiles, incidents])

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...enrichedFiles]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(file =>
        file.fileName.toLowerCase().includes(search)
      )
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      // Handle dates
      if (sortConfig.key === 'importedAt') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [enrichedFiles, searchTerm, sortConfig])

  // Handle sort toggle
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Handle file deletion
  const handleDeleteConfirm = async () => {
    if (!deleteModalFile) return

    try {
      await deleteFile(deleteModalFile.id)
      setDeleteModalFile(null)
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file: ' + error.message)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  // Sort indicator
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ?
      <ChevronUp size={14} /> :
      <ChevronDown size={14} />
  }

  // Tab configuration
  const tabs = [
    { id: 'files', label: 'Files', icon: List },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'contractors', label: 'Contractors', icon: Users }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">File Manager</h1>
          <p className="text-surface-500 mt-1">Manage imported observation files</p>
        </div>
        <button
          onClick={() => setShowBatchImport(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <Upload size={18} />
          Import Files
        </button>
      </div>

      {/* Summary Stats */}
      {summaryStats.totalFiles > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Database size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {summaryStats.totalFiles}
                </p>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Total Files
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {summaryStats.totalRecords.toLocaleString()}
                </p>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Total Records
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {summaryStats.coverageDays}
                </p>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Days Coverage
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <HardDrive size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {formatFileSize(summaryStats.totalSize)}
                </p>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Total Size
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-surface-50/50 rounded-xl p-1.5 inline-flex gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all
                ${isActive
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-white/50'
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'files' && (
        <Card className="overflow-hidden border-0 shadow-lg" padding="none">
          {/* Search */}
          <div className="p-5 bg-gradient-to-r from-surface-50 to-white border-b border-surface-100">
            <div className="relative max-w-md">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-surface-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 shadow-sm"
              />
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="p-16 text-center bg-gradient-to-b from-white to-surface-50">
              <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 rounded-2xl flex items-center justify-center">
                <FolderOpen size={36} className="text-surface-400" />
              </div>
              <h3 className="text-xl font-semibold text-surface-800 mb-2">
                {files.length === 0 ? 'No files imported yet' : 'No files match your search'}
              </h3>
              <p className="text-surface-500 mb-8 max-w-sm mx-auto">
                {files.length === 0 ?
                  'Import Excel files containing observation data to get started' :
                  'Try adjusting your search term'
                }
              </p>
              {files.length === 0 && (
                <button
                  onClick={() => setShowBatchImport(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <Upload size={18} />
                  Import Your First File
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-surface-50 to-surface-100/50">
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-surface-600 uppercase tracking-wider cursor-pointer hover:bg-surface-100/80 transition-colors"
                      onClick={() => handleSort('fileName')}
                    >
                      <div className="flex items-center gap-1.5">
                        File Name
                        <SortIndicator columnKey="fileName" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-surface-600 uppercase tracking-wider cursor-pointer hover:bg-surface-100/80 transition-colors"
                      onClick={() => handleSort('actualRecordCount')}
                    >
                      <div className="flex items-center gap-1.5">
                        Records
                        <SortIndicator columnKey="actualRecordCount" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-surface-600 uppercase tracking-wider cursor-pointer hover:bg-surface-100/80 transition-colors"
                      onClick={() => handleSort('importedAt')}
                    >
                      <div className="flex items-center gap-1.5">
                        Imported
                        <SortIndicator columnKey="importedAt" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-surface-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-surface-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredFiles.map((file, idx) => (
                    <tr
                      key={file.id}
                      className={`hover:bg-primary-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50/30'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <FileSpreadsheet size={20} className="text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-surface-800 truncate max-w-xs" title={file.fileName}>
                              {file.fileName}
                            </p>
                            {file.migratedFrom && (
                              <p className="text-xs text-surface-500 mt-0.5">Migrated data</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                            {file.actualRecordCount.toLocaleString()}
                          </span>
                          {file.actualRecordCount !== file.recordCount && file.recordCount && (
                            <span className="text-xs text-surface-400">
                              (was {file.recordCount?.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-surface-600 text-sm">
                          {file.importedAt ? (
                            <>
                              <p className="font-medium">{format(new Date(file.importedAt), 'MMM d, yyyy')}</p>
                              <p className="text-xs text-surface-400">{format(new Date(file.importedAt), 'HH:mm')}</p>
                            </>
                          ) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-surface-600 text-sm font-medium">
                          {formatFileSize(file.fileSize)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setReplaceModalFile(file)}
                            className="p-2.5 text-surface-400 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-all"
                            title="Replace file"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteModalFile(file)}
                            className="p-2.5 text-surface-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            title="Delete file"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary footer */}
          {filteredFiles.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-surface-50 to-white border-t border-surface-100 text-sm text-surface-600 flex items-center justify-between">
              <span>
                Showing <span className="font-semibold text-surface-800">{filteredFiles.length}</span> of {files.length} files
              </span>
              <span className="font-medium text-surface-700">
                {filteredFiles.reduce((sum, f) => sum + f.actualRecordCount, 0).toLocaleString()} total records
              </span>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'timeline' && (
        <DataTimeline files={enrichedFiles} incidents={incidents} />
      )}

      {activeTab === 'contractors' && (
        <ContractorClassificationPanel />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalFile && (
        <FileDeleteConfirm
          file={deleteModalFile}
          recordCount={deleteModalFile.actualRecordCount}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalFile(null)}
        />
      )}

      {/* Replace File Modal */}
      {replaceModalFile && (
        <FileReplaceModal
          file={replaceModalFile}
          onClose={() => setReplaceModalFile(null)}
        />
      )}

      {/* Batch Import Modal */}
      {showBatchImport && (
        <BatchImportModal
          onClose={() => setShowBatchImport(false)}
        />
      )}
    </div>
  )
}

export default FileManager
