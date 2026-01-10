import React from 'react'
import { Building2, CheckCircle } from 'lucide-react'

const ProjectSelector = ({ projects, selectedProjectId, onProjectSelect }) => {
  const activeProjects = projects.filter(p => p.status === 'active')

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Select the project that this data belongs to. All imported records will be associated with this project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectSelect(project.id)}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedProjectId === project.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-surface-200 hover:border-surface-300 bg-white'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${selectedProjectId === project.id ? 'bg-primary-100' : 'bg-surface-100'}
                `}>
                  <Building2 className={`w-5 h-5 ${selectedProjectId === project.id ? 'text-primary-600' : 'text-surface-500'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-surface-900">{project.name}</h4>
                  <p className="text-sm text-surface-500">{project.client}</p>
                </div>
              </div>
              {selectedProjectId === project.id && (
                <CheckCircle className="w-5 h-5 text-primary-600" />
              )}
            </div>
            <p className="text-sm text-surface-500 mt-3">{project.location}</p>
          </div>
        ))}
      </div>

      {activeProjects.length === 0 && (
        <div className="text-center py-8 bg-surface-50 rounded-lg border border-surface-200">
          <Building2 className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-600">No active projects found</p>
          <p className="text-sm text-surface-500 mt-1">Please create a project first before importing data</p>
        </div>
      )}
    </div>
  )
}

export default ProjectSelector
