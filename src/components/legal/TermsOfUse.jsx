import React from 'react'

const TermsOfUse = () => {
  return (
    <div className="prose prose-sm max-w-none">
      <p className="text-sm text-surface-500 mb-6">Last Updated: December 2024</p>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">1. Acceptance of Terms</h3>
        <p className="text-surface-600">
          By accessing and using the HIDC (Hazard Identification and Data Control) application, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this application.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">2. Description of Service</h3>
        <p className="text-surface-600 mb-3">
          HIDC is an internal Health, Safety, and Environment (HSE) observation tracking tool designed to help organizations:
        </p>
        <ul className="list-disc pl-6 text-surface-600 space-y-2">
          <li>Import and manage HSE observation data from Excel files</li>
          <li>Visualize safety trends and statistics through dashboards</li>
          <li>Track hazard identification and incident classifications</li>
          <li>Generate reports and export data for analysis</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">3. User Responsibilities</h3>
        <p className="text-surface-600 mb-3">As a user of this application, you agree to:</p>
        <ul className="list-disc pl-6 text-surface-600 space-y-2">
          <li><strong>Data Accuracy:</strong> Enter and maintain accurate observation data</li>
          <li><strong>Regular Backups:</strong> Export and backup your data regularly, as browser storage is not guaranteed</li>
          <li><strong>Authorized Use:</strong> Use the application only for legitimate organizational HSE purposes</li>
          <li><strong>Device Security:</strong> Maintain appropriate security on devices where the application is used</li>
          <li><strong>Compliance:</strong> Ensure your use complies with your organization's policies and applicable laws</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">4. Acceptable Use Policy</h3>
        <p className="text-surface-600 mb-3">You agree NOT to:</p>
        <ul className="list-disc pl-6 text-surface-600 space-y-2">
          <li>Use the application for any unlawful purpose</li>
          <li>Enter false or misleading safety observation data</li>
          <li>Attempt to circumvent any security features</li>
          <li>Use the application to store data unrelated to HSE observations</li>
          <li>Share access credentials or allow unauthorized users to access your data</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">5. Data Ownership</h3>
        <p className="text-surface-600">
          You and/or your organization retain full ownership of all data entered into the application. Since data is stored locally in your browser, you maintain complete control over your information. We do not claim any ownership rights to your data.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">6. No Warranty</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800">
            This application is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">7. Limitation of Liability</h3>
        <p className="text-surface-600 mb-3">
          To the maximum extent permitted by applicable law, HIDC Team shall not be liable for:
        </p>
        <ul className="list-disc pl-6 text-surface-600 space-y-2">
          <li>Any indirect, incidental, special, consequential, or punitive damages</li>
          <li>Loss of data, profits, or business opportunities</li>
          <li>Decisions made based on data or analysis from this application</li>
          <li>Any damages arising from the use or inability to use the application</li>
          <li>Any errors or inaccuracies in data processing or visualization</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">8. Data Loss Disclaimer</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 mb-2"><strong>Important Warning:</strong></p>
          <p className="text-red-700">
            Data is stored in your browser's localStorage, which can be cleared by browser updates, clearing browsing data, or system maintenance. We strongly recommend regular data exports as backups. We are not responsible for any data loss.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">9. Modifications to Terms</h3>
        <p className="text-surface-600">
          We reserve the right to modify these Terms of Use at any time. Changes will be reflected in the "Last Updated" date. Your continued use of the application after any changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">10. Governing Law</h3>
        <p className="text-surface-600">
          These Terms of Use shall be governed by and construed in accordance with the laws of your jurisdiction. Any disputes arising from the use of this application shall be resolved in accordance with applicable local laws.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">11. Severability</h3>
        <p className="text-surface-600">
          If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
        </p>
      </section>
    </div>
  )
}

export default TermsOfUse
