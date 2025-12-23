import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-3 text-xs text-gray-500">
          <p>All data is stored locally in your browser. No data is collected or sent to any server.</p>

          <div className="flex items-center gap-4">
            <Link
              to="/legal?tab=privacy"
              className="hover:text-gray-700 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/legal?tab=terms"
              className="hover:text-gray-700 hover:underline transition-colors"
            >
              Terms of Use
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/legal?tab=disclaimer"
              className="hover:text-gray-700 hover:underline transition-colors"
            >
              Disclaimer
            </Link>
          </div>

          <p className="text-gray-400">HIDC {currentYear}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
