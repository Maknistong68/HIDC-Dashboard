import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Lock } from 'lucide-react'

/**
 * Footer - App footer with legal links and privacy notice
 */
const Footer = () => {
  const currentYear = new Date().getFullYear()

  const legalLinks = [
    { to: '/legal?tab=privacy', label: 'Privacy Policy' },
    { to: '/legal?tab=terms', label: 'Terms of Use' },
    { to: '/legal?tab=disclaimer', label: 'Disclaimer' },
    { to: '/legal?tab=security', label: 'Data Security' },
  ]

  return (
    <footer className="mt-auto bg-white border-t border-surface-200 py-5 px-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col items-center gap-4 text-xs">
          {/* Privacy notice */}
          <div className="flex items-center gap-2 text-surface-600 bg-surface-50 px-4 py-2 rounded-full">
            <Lock size={14} className="text-primary-500" aria-hidden="true" />
            <span>All data is stored locally in your browser. No data is collected or sent to any server.</span>
          </div>

          {/* Legal links */}
          <nav className="flex items-center gap-1 flex-wrap justify-center" aria-label="Legal links">
            {legalLinks.map((link, index) => (
              <React.Fragment key={link.to}>
                <Link
                  to={link.to}
                  className="px-2 py-1 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-all duration-200"
                >
                  {link.label}
                </Link>
                {index < legalLinks.length - 1 && (
                  <span className="text-surface-300" aria-hidden="true">|</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Copyright */}
          <div className="flex items-center gap-1.5 text-surface-400">
            <Shield size={12} aria-hidden="true" />
            <span>Event Dashboard {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
