import React from 'react'
import { Shield, HardDrive, Wifi, WifiOff, Eye, Database, Monitor, Chrome, Search, Lock } from 'lucide-react'

const DataSecurity = () => {
  return (
    <div className="prose prose-sm max-w-none">
      <p className="text-sm text-surface-500 mb-6">Technical Documentation for IT & Management Review</p>

      {/* Summary Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-semibold mb-1">Data Security Certification</p>
            <p className="text-green-700 text-sm">
              This application stores ALL data locally in your browser. Zero data is transmitted to external servers. This page explains how to verify this claim.
            </p>
          </div>
        </div>
      </div>

      {/* What is localStorage */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
          <HardDrive size={20} className="text-blue-600" />
          What is localStorage?
        </h3>
        <p className="text-surface-600 mb-3">
          localStorage is a web browser feature that allows websites to store data directly on your device. Key characteristics:
        </p>
        <div className="grid gap-3">
          <div className="bg-surface-50 rounded-lg p-3 flex items-start gap-3">
            <Monitor className="w-5 h-5 text-surface-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-surface-800">Device-Only Storage</p>
              <p className="text-sm text-surface-600">Data exists only on YOUR computer/device, not on any server</p>
            </div>
          </div>
          <div className="bg-surface-50 rounded-lg p-3 flex items-start gap-3">
            <Lock className="w-5 h-5 text-surface-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-surface-800">Browser-Isolated</p>
              <p className="text-sm text-surface-600">Each browser has separate storage - Chrome data isn't visible in Firefox</p>
            </div>
          </div>
          <div className="bg-surface-50 rounded-lg p-3 flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-surface-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-surface-800">Works Offline</p>
              <p className="text-sm text-surface-600">Data is accessible even without internet connection</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Verify - Network Tab */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
          <Wifi size={20} className="text-blue-600" />
          How to Verify: No Data Leaves Your Browser
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 font-medium mb-2">Step-by-Step Instructions:</p>
          <ol className="list-decimal pl-5 text-blue-700 space-y-2 text-sm">
            <li>Open HIDC application in your browser</li>
            <li>Press <kbd className="px-2 py-0.5 bg-blue-100 rounded text-blue-800 font-mono">F12</kbd> to open Developer Tools</li>
            <li>Click the <strong>"Network"</strong> tab</li>
            <li>Import an Excel file or use the app normally</li>
            <li>Observe the Network tab - you will see <strong>NO outgoing data requests</strong></li>
          </ol>
        </div>

        <div className="border border-surface-200 rounded-lg overflow-hidden">
          <div className="bg-surface-100 px-3 py-2 border-b border-surface-200">
            <p className="text-xs font-mono text-surface-600">Developer Tools → Network Tab</p>
          </div>
          <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm">
            <p className="mb-2"># What you should see:</p>
            <p className="text-surface-500">- Initial page load files (JS, CSS) ✓</p>
            <p className="text-surface-500">- Local file operations only ✓</p>
            <p className="mb-2"></p>
            <p className="mb-2"># What you will NOT see:</p>
            <p className="text-red-400">- POST requests to external servers ✗</p>
            <p className="text-red-400">- API calls to cloud services ✗</p>
            <p className="text-red-400">- Data upload requests ✗</p>
          </div>
        </div>
      </section>

      {/* How to View Your Stored Data */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
          <Database size={20} className="text-blue-600" />
          How to View Your Stored Data
        </h3>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-amber-800 font-medium mb-2">Step-by-Step Instructions:</p>
          <ol className="list-decimal pl-5 text-amber-700 space-y-2 text-sm">
            <li>Open HIDC application in your browser</li>
            <li>Press <kbd className="px-2 py-0.5 bg-amber-100 rounded text-amber-800 font-mono">F12</kbd> to open Developer Tools</li>
            <li>Click the <strong>"Application"</strong> tab (Chrome) or <strong>"Storage"</strong> tab (Firefox)</li>
            <li>In the left sidebar, expand <strong>"Local Storage"</strong></li>
            <li>Click on the website URL</li>
            <li>You will see all stored data with these keys:</li>
          </ol>
        </div>

        <div className="border border-surface-200 rounded-lg overflow-hidden">
          <div className="bg-surface-100 px-3 py-2 border-b border-surface-200">
            <p className="text-xs font-mono text-surface-600">Developer Tools → Application → Local Storage</p>
          </div>
          <div className="p-4 bg-gray-900 font-mono text-sm">
            <table className="w-full">
              <thead>
                <tr className="text-surface-400 text-left">
                  <th className="pb-2">Key</th>
                  <th className="pb-2">Contains</th>
                </tr>
              </thead>
              <tbody className="text-green-400">
                <tr>
                  <td className="py-1">hidc_incidents</td>
                  <td className="text-surface-400">Your observation records</td>
                </tr>
                <tr>
                  <td className="py-1">hidc_projects</td>
                  <td className="text-surface-400">Project information</td>
                </tr>
                <tr>
                  <td className="py-1">hidc_settings</td>
                  <td className="text-surface-400">App preferences</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-surface-500 mt-3">
          You can click on any key to see the exact data stored. This is YOUR data on YOUR device.
        </p>
      </section>

      {/* Technical Architecture */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
          <Search size={20} className="text-blue-600" />
          Technical Architecture
        </h3>

        <div className="bg-surface-50 rounded-lg p-4">
          <div className="flex flex-col items-center">
            {/* Your Device Box */}
            <div className="border-2 border-green-500 rounded-lg p-4 w-full max-w-md bg-green-50">
              <p className="text-center text-green-700 font-semibold mb-3">YOUR DEVICE</p>

              <div className="space-y-2">
                <div className="bg-white rounded p-2 border border-green-300 text-center text-sm">
                  <Chrome size={16} className="inline mr-2" />
                  Browser (Chrome/Firefox/Edge)
                </div>
                <div className="text-center text-green-600">↓</div>
                <div className="bg-white rounded p-2 border border-green-300 text-center text-sm">
                  HIDC Application (JavaScript)
                </div>
                <div className="text-center text-green-600">↓</div>
                <div className="bg-green-200 rounded p-2 border border-green-400 text-center text-sm font-medium">
                  localStorage (Your Data Here)
                </div>
              </div>
            </div>

            {/* No Connection Arrow */}
            <div className="my-4 flex items-center gap-2 text-red-500">
              <WifiOff size={20} />
              <span className="text-sm font-medium">NO CONNECTION</span>
              <WifiOff size={20} />
            </div>

            {/* External Servers Box */}
            <div className="border-2 border-red-300 border-dashed rounded-lg p-4 w-full max-w-md bg-red-50 opacity-50">
              <p className="text-center text-red-400 font-semibold mb-2">EXTERNAL SERVERS</p>
              <p className="text-center text-red-400 text-sm">Not Used - No Connection</p>
              <div className="flex justify-center gap-4 mt-2 text-red-300 text-xs">
                <span>No Cloud ✗</span>
                <span>No API ✗</span>
                <span>No Database ✗</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Audit Summary */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
          <Eye size={20} className="text-blue-600" />
          Code Audit Summary
        </h3>

        <p className="text-surface-600 mb-3">
          The application source code has been reviewed for data transmission. Results:
        </p>

        <div className="border border-surface-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="px-4 py-2 text-left text-surface-600">Check</th>
                <th className="px-4 py-2 text-left text-surface-600">Result</th>
                <th className="px-4 py-2 text-left text-surface-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-surface-200">
                <td className="px-4 py-2">fetch() API calls</td>
                <td className="px-4 py-2 text-surface-500">None found</td>
                <td className="px-4 py-2 text-green-600 font-medium">✓ PASS</td>
              </tr>
              <tr className="border-t border-surface-200">
                <td className="px-4 py-2">axios HTTP library</td>
                <td className="px-4 py-2 text-surface-500">Not installed</td>
                <td className="px-4 py-2 text-green-600 font-medium">✓ PASS</td>
              </tr>
              <tr className="border-t border-surface-200">
                <td className="px-4 py-2">External API endpoints</td>
                <td className="px-4 py-2 text-surface-500">None found</td>
                <td className="px-4 py-2 text-green-600 font-medium">✓ PASS</td>
              </tr>
              <tr className="border-t border-surface-200">
                <td className="px-4 py-2">Google Analytics</td>
                <td className="px-4 py-2 text-surface-500">Not installed</td>
                <td className="px-4 py-2 text-green-600 font-medium">✓ PASS</td>
              </tr>
              <tr className="border-t border-surface-200">
                <td className="px-4 py-2">Tracking scripts</td>
                <td className="px-4 py-2 text-surface-500">None found</td>
                <td className="px-4 py-2 text-green-600 font-medium">✓ PASS</td>
              </tr>
              <tr className="border-t border-surface-200">
                <td className="px-4 py-2">Cookie usage</td>
                <td className="px-4 py-2 text-surface-500">None used</td>
                <td className="px-4 py-2 text-green-600 font-medium">✓ PASS</td>
              </tr>
              <tr className="border-t border-surface-200">
                <td className="px-4 py-2">WebSocket connections</td>
                <td className="px-4 py-2 text-surface-500">None found</td>
                <td className="px-4 py-2 text-green-600 font-medium">✓ PASS</td>
              </tr>
              <tr className="border-t border-surface-200 bg-green-50">
                <td className="px-4 py-2 font-semibold">Data Storage Method</td>
                <td className="px-4 py-2 text-surface-700">localStorage only</td>
                <td className="px-4 py-2 text-green-600 font-bold">✓ LOCAL ONLY</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* For IT Department */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-surface-900 mb-3">For IT Department</h3>

        <div className="bg-surface-50 border border-surface-200 rounded-lg p-4">
          <p className="text-surface-700 mb-3">To independently verify these claims, IT can:</p>
          <ol className="list-decimal pl-5 text-surface-600 space-y-2 text-sm">
            <li>Review the source code in the <code className="bg-surface-200 px-1 rounded">/src</code> directory</li>
            <li>Search for network-related keywords: <code className="bg-surface-200 px-1 rounded">fetch</code>, <code className="bg-surface-200 px-1 rounded">axios</code>, <code className="bg-surface-200 px-1 rounded">XMLHttpRequest</code></li>
            <li>Monitor network traffic using browser DevTools or Wireshark</li>
            <li>Check <code className="bg-surface-200 px-1 rounded">package.json</code> for dependencies - no backend/API libraries</li>
            <li>Run the application in airplane mode - it works fully offline</li>
          </ol>
        </div>
      </section>

      {/* Certification Statement */}
      <section className="mb-8">
        <div className="bg-blue-900 text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <h3 className="text-xl font-bold">Data Security Certification</h3>
          </div>
          <p className="mb-4">
            This application has been designed with privacy-first architecture. We certify that:
          </p>
          <ul className="space-y-2 text-blue-100">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              All data is stored exclusively in the user's browser localStorage
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              No data is transmitted to any external server
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              No analytics or tracking is implemented
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              No user accounts or authentication with external services
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Application functions fully offline
            </li>
          </ul>
          <p className="mt-4 text-sm text-blue-200">
            HIDC Team - December 2024
          </p>
        </div>
      </section>
    </div>
  )
}

export default DataSecurity
