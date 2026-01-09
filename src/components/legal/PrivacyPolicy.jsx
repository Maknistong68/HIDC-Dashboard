import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div className="prose prose-sm max-w-none">
      <p className="text-sm text-gray-500 mb-6">Last Updated: December 2024</p>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h3>
        <p className="text-gray-600 mb-3">
          HIDC Team ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how the HIDC (Hazard Identification and Data Control) application handles your data.
        </p>
        <p className="text-gray-600">
          This application is designed for internal HSE (Health, Safety, and Environment) observation tracking within your organization.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Data We Collect</h3>
        <p className="text-gray-600 mb-3">The application collects and stores the following types of data:</p>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li><strong>Observation Records:</strong> Event IDs, dates, descriptions, status, and classifications</li>
          <li><strong>Reporter Information:</strong> Names of individuals who reported observations</li>
          <li><strong>Hazard Data:</strong> Hazard categories, types, and severity classifications</li>
          <li><strong>Organizational Data:</strong> Project names, contractor names, site locations, and company information</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">3. How Data Is Stored</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 font-medium">Important: All data is stored locally in your browser.</p>
        </div>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Data is stored using your browser's localStorage feature</li>
          <li>Data remains on your device only and is not transmitted to any external server</li>
          <li>Each user's data is isolated to their own browser and device</li>
          <li>Data is not synchronized across devices or shared between users</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Data Transmission</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <strong>No data is transmitted to any server.</strong> This application operates entirely within your browser. We do not collect, transmit, or have access to any of your data.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Data Access</h3>
        <p className="text-gray-600 mb-3">Your data can only be accessed by:</p>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>You, on the device and browser where the data was entered</li>
          <li>Anyone with physical access to your device and browser</li>
        </ul>
        <p className="text-gray-600 mt-3">
          We recommend securing your device with appropriate access controls.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Data Retention</h3>
        <p className="text-gray-600 mb-3">Your data is retained until:</p>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>You manually delete it using the "Clear Data" function</li>
          <li>You clear your browser's localStorage or browsing data</li>
          <li>Your browser's storage is cleared by the browser or operating system</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Your Rights</h3>
        <p className="text-gray-600 mb-3">You have full control over your data:</p>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li><strong>Access:</strong> View all your data within the application at any time</li>
          <li><strong>Export:</strong> Export your data as JSON files for backup or portability</li>
          <li><strong>Modify:</strong> Edit any observation records as needed</li>
          <li><strong>Delete:</strong> Remove individual records or clear all data entirely</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Third-Party Sharing</h3>
        <p className="text-gray-600">
          We do not share your data with any third parties. Since all data remains in your browser's local storage, there is no mechanism for us or any third party to access your information.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Cookies and Tracking</h3>
        <p className="text-gray-600">
          This application does not use cookies, analytics, or any tracking technologies. We do not monitor your usage patterns or collect any behavioral data.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to This Policy</h3>
        <p className="text-gray-600">
          We may update this Privacy Policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this policy. Continued use of the application after changes constitutes acceptance of the updated policy.
        </p>
      </section>
    </div>
  )
}

export default PrivacyPolicy
