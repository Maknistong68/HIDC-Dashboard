import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Shield, FileText, AlertTriangle, Lock } from 'lucide-react'
import PrivacyPolicy from '../components/legal/PrivacyPolicy'
import TermsOfUse from '../components/legal/TermsOfUse'
import Disclaimer from '../components/legal/Disclaimer'
import DataSecurity from '../components/legal/DataSecurity'

const TABS = [
  { id: 'privacy', label: 'Privacy Policy', icon: Shield, component: PrivacyPolicy },
  { id: 'terms', label: 'Terms of Use', icon: FileText, component: TermsOfUse },
  { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle, component: Disclaimer },
  { id: 'security', label: 'Data Security', icon: Lock, component: DataSecurity },
]

const Legal = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    TABS.find(t => t.id === tabParam)?.id || 'privacy'
  )

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || PrivacyPolicy

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Legal Information</h1>
        <p className="text-gray-500">Review our policies and terms of use</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}

export default Legal
