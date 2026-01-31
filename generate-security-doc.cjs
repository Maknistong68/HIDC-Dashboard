const puppeteer = require('puppeteer');
const path = require('path');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HIDC Application - IT Security Documentation</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
        }

        .page {
            page-break-after: always;
            min-height: 100%;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        /* Cover Page */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 250mm;
            text-align: center;
        }

        .cover-logo {
            width: 100px;
            height: 100px;
            margin-bottom: 30px;
        }

        .cover-title {
            font-size: 32pt;
            font-weight: bold;
            color: #1e3a5f;
            margin-bottom: 10px;
        }

        .cover-subtitle {
            font-size: 16pt;
            color: #475569;
            margin-bottom: 40px;
        }

        .cover-info-table {
            margin-top: 60px;
            border-collapse: collapse;
        }

        .cover-info-table td {
            padding: 8px 20px;
            font-size: 11pt;
        }

        .cover-info-table td:first-child {
            text-align: right;
            color: #64748b;
        }

        .cover-info-table td:last-child {
            text-align: left;
            font-weight: 600;
            color: #1e3a5f;
        }

        /* Headers */
        h1 {
            font-size: 20pt;
            color: #1e3a5f;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 8px;
            margin-top: 0;
            margin-bottom: 20px;
        }

        h2 {
            font-size: 14pt;
            color: #1e40af;
            border-bottom: 1px solid #93c5fd;
            padding-bottom: 5px;
            margin-top: 25px;
            margin-bottom: 15px;
        }

        h3 {
            font-size: 12pt;
            color: #1e3a5f;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 9pt;
        }

        th {
            background-color: #1e40af;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
        }

        td {
            padding: 8px;
            border: 1px solid #d1d5db;
            vertical-align: top;
        }

        tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Boxes */
        .highlight-box {
            background-color: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 12px 15px;
            margin: 15px 0;
            border-radius: 0 4px 4px 0;
        }

        .success-box {
            background-color: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 12px 15px;
            margin: 15px 0;
            border-radius: 0 4px 4px 0;
        }

        .warning-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 15px;
            margin: 15px 0;
            border-radius: 0 4px 4px 0;
        }

        .disclaimer-box {
            background-color: #fef2f2;
            border: 2px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }

        .disclaimer-box .box-title {
            color: #dc2626;
            font-size: 12pt;
        }

        .box-title {
            font-weight: bold;
            margin-bottom: 5px;
        }

        /* Diagrams */
        .diagram-container {
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .diagram-title {
            font-weight: bold;
            color: #1e3a5f;
            text-align: center;
            margin-bottom: 20px;
            font-size: 12pt;
        }

        .arch-diagram {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }

        .arch-row {
            display: flex;
            justify-content: center;
            gap: 20px;
            width: 100%;
        }

        .arch-box {
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 12px 20px;
            text-align: center;
            min-width: 140px;
        }

        .arch-box-primary {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border: none;
        }

        .arch-box-secondary {
            background: #dbeafe;
            border-color: #3b82f6;
        }

        .arch-box-success {
            background: #d1fae5;
            border-color: #10b981;
        }

        .arch-box-title {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 5px;
        }

        .arch-box-content {
            font-size: 8pt;
            color: #475569;
        }

        .arch-box-primary .arch-box-content {
            color: #e0e7ff;
        }

        .arch-arrow {
            font-size: 20pt;
            color: #3b82f6;
            line-height: 1;
        }

        /* Flow diagram */
        .flow-diagram {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .flow-step {
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 8pt;
            text-align: center;
            min-width: 80px;
        }

        .flow-arrow {
            color: #3b82f6;
            font-size: 16pt;
        }

        /* Lists */
        ul, ol {
            margin: 10px 0;
            padding-left: 25px;
        }

        li {
            margin: 4px 0;
        }

        /* Status badges */
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 8pt;
            font-weight: 600;
        }

        .badge-success {
            background-color: #d1fae5;
            color: #065f46;
        }

        .badge-warning {
            background-color: #fef3c7;
            color: #92400e;
        }

        .badge-danger {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .badge-info {
            background-color: #dbeafe;
            color: #1e40af;
        }

        /* TOC */
        .toc-item {
            padding: 6px 0;
            border-bottom: 1px dotted #d1d5db;
        }

        .toc-h1 {
            font-weight: bold;
        }

        .toc-h2 {
            padding-left: 20px;
        }

        /* APPROVAL PAGE - MUST BE FULL PAGE */
        .approval-page {
            page-break-before: always;
            page-break-inside: avoid;
            min-height: 247mm;
        }

        /* Signature section */
        .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-top: 30px;
        }

        .signature-box {
            border: 1px solid #d1d5db;
            padding: 20px;
            border-radius: 4px;
            min-height: 180px;
        }

        .signature-box h4 {
            margin: 0 0 20px 0;
            font-size: 11pt;
            color: #1e3a5f;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
        }

        .signature-field {
            margin-bottom: 15px;
        }

        .signature-line {
            border-bottom: 1px solid #1a1a1a;
            margin-bottom: 5px;
            height: 25px;
        }

        .signature-label {
            font-size: 8pt;
            color: #64748b;
        }

        .decision-row {
            margin-top: 15px;
            font-size: 10pt;
        }

        /* Checklist */
        .checklist-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .checkbox {
            width: 14px;
            height: 14px;
            border: 2px solid #3b82f6;
            border-radius: 3px;
            flex-shrink: 0;
            margin-top: 2px;
        }

        /* Section number */
        .section-num {
            color: #3b82f6;
            margin-right: 10px;
        }
    </style>
</head>
<body>

<!-- COVER PAGE -->
<div class="page cover-page">
    <!-- HIDC Hexagonal Logo -->
    <div class="cover-logo">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
            <defs>
                <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3478f6"/>
                    <stop offset="50%" stop-color="#1e5aeb"/>
                    <stop offset="100%" stop-color="#1646d8"/>
                </linearGradient>
                <linearGradient id="waveGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#7db4f8"/>
                    <stop offset="100%" stop-color="#5b9cf7"/>
                </linearGradient>
                <clipPath id="hexClip">
                    <path d="M24 4C25 4 26 4.3 26.8 4.8L39.2 12.2C40.8 13.2 41.8 14.8 41.8 16.6V31.4C41.8 33.2 40.8 34.8 39.2 35.8L26.8 43.2C25.2 44.2 23.2 44.2 21.6 43.2L9.2 35.8C7.6 34.8 6.6 33.2 6.6 31.4V16.6C6.6 14.8 7.6 13.2 9.2 12.2L21.6 4.8C22.4 4.3 23.4 4 24 4Z"/>
                </clipPath>
            </defs>
            <!-- Hexagonal base -->
            <path d="M24 4C25 4 26 4.3 26.8 4.8L39.2 12.2C40.8 13.2 41.8 14.8 41.8 16.6V31.4C41.8 33.2 40.8 34.8 39.2 35.8L26.8 43.2C25.2 44.2 23.2 44.2 21.6 43.2L9.2 35.8C7.6 34.8 6.6 33.2 6.6 31.4V16.6C6.6 14.8 7.6 13.2 9.2 12.2L21.6 4.8C22.4 4.3 23.4 4 24 4Z" fill="url(#hexGradient)"/>
            <!-- Inner highlight -->
            <path d="M24 7C24.8 7 25.5 7.2 26.1 7.6L36.5 13.8C37.7 14.5 38.5 15.8 38.5 17.2V30.8C38.5 32.2 37.7 33.5 36.5 34.2L26.1 40.4C24.9 41.1 23.5 41.1 22.3 40.4L11.9 34.2C10.7 33.5 9.9 32.2 9.9 30.8V17.2C9.9 15.8 10.7 14.5 11.9 13.8L22.3 7.6C22.9 7.2 23.6 7 24 7Z" fill="white" fill-opacity="0.08"/>
            <!-- Wave curves -->
            <g clip-path="url(#hexClip)">
                <path d="M4 18C12 12 20 20 28 14C36 8 44 16 50 10" stroke="url(#waveGradient2)" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6"/>
                <path d="M-2 26C8 20 16 30 26 22C36 14 44 26 52 20" stroke="white" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.35"/>
            </g>
            <!-- Data bars -->
            <rect x="15" y="28" width="5" height="12" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="22" y="24" width="5" height="16" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="29" y="20" width="5" height="20" rx="1.5" fill="white" fill-opacity="0.9"/>
            <!-- Edge highlight -->
            <path d="M24 4C25 4 26 4.3 26.8 4.8L39.2 12.2C40.8 13.2 41.8 14.8 41.8 16.6V31.4C41.8 33.2 40.8 34.8 39.2 35.8L26.8 43.2C25.2 44.2 23.2 44.2 21.6 43.2L9.2 35.8C7.6 34.8 6.6 33.2 6.6 31.4V16.6C6.6 14.8 7.6 13.2 9.2 12.2L21.6 4.8C22.4 4.3 23.4 4 24 4Z" fill="none" stroke="white" stroke-width="0.5" stroke-opacity="0.3"/>
        </svg>
    </div>
    <div class="cover-title">HIDC APPLICATION</div>
    <div class="cover-subtitle">IT Security Whitelist Request Documentation</div>
    <div style="color: #3b82f6; font-size: 12pt; margin-bottom: 20px;">
        Hazard Identification & Data Control<br>
        HSE Observation Tracking System
    </div>

    <table class="cover-info-table">
        <tr><td>Document Version:</td><td>1.0</td></tr>
        <tr><td>Application Version:</td><td>1.0.0</td></tr>
        <tr><td>Date Prepared:</td><td>January 10, 2026</td></tr>
        <tr><td>Classification:</td><td>Internal / Confidential</td></tr>
        <tr><td>Prepared For:</td><td>NEOM Data Security & IT Team</td></tr>
    </table>
</div>

<!-- DOCUMENT CONTROL -->
<div class="page">
    <h1><span class="section-num"></span>Document Control</h1>

    <h2>Version History</h2>
    <table>
        <tr>
            <th style="width: 15%;">Version</th>
            <th style="width: 20%;">Date</th>
            <th style="width: 25%;">Author</th>
            <th style="width: 40%;">Changes</th>
        </tr>
        <tr>
            <td>1.0</td>
            <td>10-Jan-2026</td>
            <td>HSE Team</td>
            <td>Initial document creation for whitelist approval</td>
        </tr>
    </table>

    <h2>Table of Contents</h2>
    <div class="toc-item toc-h1">1. Executive Summary</div>
    <div class="toc-item toc-h1">2. Application Overview</div>
    <div class="toc-item toc-h2">2.1 Purpose and Business Justification</div>
    <div class="toc-item toc-h2">2.2 Intended Use & Limitations</div>
    <div class="toc-item toc-h2">2.3 Technology Stack</div>
    <div class="toc-item toc-h2">2.4 Key Features</div>
    <div class="toc-item toc-h1">3. Architecture Diagrams</div>
    <div class="toc-item toc-h2">3.1 High-Level Architecture</div>
    <div class="toc-item toc-h2">3.2 Data Flow Diagram</div>
    <div class="toc-item toc-h2">3.3 Component Structure</div>
    <div class="toc-item toc-h1">4. Security Documentation</div>
    <div class="toc-item toc-h2">4.1 Security Architecture</div>
    <div class="toc-item toc-h2">4.2 Authentication & Authorization</div>
    <div class="toc-item toc-h2">4.3 Vulnerability Assessment (OWASP)</div>
    <div class="toc-item toc-h1">5. Data Handling</div>
    <div class="toc-item toc-h1">6. Network Requirements</div>
    <div class="toc-item toc-h1">7. Third-Party Dependencies</div>
    <div class="toc-item toc-h1">8. Compliance</div>
    <div class="toc-item toc-h1">9. Deployment Details</div>
    <div class="toc-item toc-h1">10. Risk Assessment</div>
    <div class="toc-item toc-h1">11. Verification Procedures</div>
    <div class="toc-item toc-h1">12. Approval Checklist & Signatures</div>
</div>

<!-- SECTION 1: EXECUTIVE SUMMARY -->
<div class="page">
    <h1><span class="section-num">1.</span>Executive Summary</h1>

    <div class="success-box">
        <div class="box-title">KEY SECURITY FINDING</div>
        HIDC is an <strong>OFFLINE-FIRST, CLIENT-SIDE ONLY</strong> application with <strong>ZERO external network data transmission</strong>. All data remains on the local device in browser storage.
    </div>

    <h2>Application Summary</h2>
    <table>
        <tr><th style="width: 35%;">Attribute</th><th>Details</th></tr>
        <tr><td><strong>Application Name</strong></td><td>HIDC (Hazard Identification & Data Control)</td></tr>
        <tr><td><strong>Version</strong></td><td>1.0.0</td></tr>
        <tr><td><strong>Purpose</strong></td><td>Personal productivity tool for HSE data visualization and analysis</td></tr>
        <tr><td><strong>Architecture Type</strong></td><td>Single-Page Application (SPA) - Client-side only</td></tr>
        <tr><td><strong>Data Storage</strong></td><td>Browser localStorage (device-local only)</td></tr>
        <tr><td><strong>Network Requirements</strong></td><td>Initial page load only - NO ongoing network communication</td></tr>
        <tr><td><strong>External APIs</strong></td><td><span class="badge badge-success">NONE</span> - Fully offline capable</td></tr>
        <tr><td><strong>Authentication</strong></td><td>None required (device-local application)</td></tr>
        <tr><td><strong>Data Classification</strong></td><td>Internal / Confidential (HSE observation data)</td></tr>
        <tr><td><strong>Target Users</strong></td><td>Individual HSE professionals (personal use)</td></tr>
    </table>

    <h2>Security Highlights</h2>
    <ul>
        <li><strong>Zero Data Transmission:</strong> No data is sent to external servers during operation</li>
        <li><strong>Offline Capable:</strong> Functions without internet connection after initial load</li>
        <li><strong>No External Dependencies:</strong> All data processing occurs client-side</li>
        <li><strong>No Authentication Credentials:</strong> No passwords, tokens, or secrets stored</li>
        <li><strong>Minimal Attack Surface:</strong> Static files only, no server-side processing</li>
        <li><strong>Transparent Operation:</strong> Users can verify no data leaves their browser</li>
    </ul>

    <h2>Whitelist Request Summary</h2>
    <div class="highlight-box">
        This application requires whitelisting for deployment on internal NEOM workstations. The application:
        <ul>
            <li>Requires NO special network access or firewall rules</li>
            <li>Requires NO database server or backend infrastructure</li>
            <li>Requires NO cloud service integrations</li>
            <li>Operates entirely within the browser sandbox</li>
            <li>Stores data only in browser localStorage on the local device</li>
        </ul>
    </div>
</div>

<!-- SECTION 2: APPLICATION OVERVIEW -->
<div class="page">
    <h1><span class="section-num">2.</span>Application Overview</h1>

    <h2>2.1 Purpose and Business Justification</h2>
    <p>HIDC is designed to help individual HSE professionals:</p>
    <ul>
        <li>Visualize safety observation data for personal analysis</li>
        <li>Identify hazard trends and patterns quickly</li>
        <li>Generate reports and presentations for meetings</li>
        <li>Improve data quality awareness</li>
        <li>Support day-to-day HSE tasks with better data insights</li>
    </ul>

    <h2>2.2 Intended Use & Limitations</h2>

    <div class="disclaimer-box">
        <div class="box-title">IMPORTANT DISCLAIMER - PLEASE READ CAREFULLY</div>
        <p style="margin-top: 10px;"><strong>This application is a personal productivity tool and is NOT intended to:</strong></p>
        <ul>
            <li><strong>Replace enterprise BI systems</strong> - HIDC does not replace Power BI, Tableau, SAP, or any official enterprise business intelligence platforms</li>
            <li><strong>Serve as the official source of truth</strong> - All official HSE data and records must be maintained in approved organizational systems</li>
            <li><strong>Make critical safety decisions</strong> - Do not rely solely on this tool for safety-critical decisions; always verify with official data sources</li>
            <li><strong>Replace official reporting workflows</strong> - Continue to use approved channels for official incident reporting and documentation</li>
        </ul>
    </div>

    <h3>What This Tool IS:</h3>
    <table>
        <tr><th>Characteristic</th><th>Description</th></tr>
        <tr><td><strong>Personal Tool</strong></td><td>Designed for individual use by HSE professionals to assist with their daily tasks</td></tr>
        <tr><td><strong>Optional Use</strong></td><td>Usage is entirely voluntary; not mandatory for any work process</td></tr>
        <tr><td><strong>Supplementary Aid</strong></td><td>Supplements (not replaces) official enterprise systems and processes</td></tr>
        <tr><td><strong>Quick Visualization</strong></td><td>Provides fast, local data visualization without waiting for enterprise reports</td></tr>
        <tr><td><strong>Offline Capable</strong></td><td>Works without network access after initial load - useful in field conditions</td></tr>
    </table>

    <h3>What This Tool is NOT:</h3>
    <table>
        <tr><th>NOT This</th><th>Explanation</th></tr>
        <tr><td><strong>NOT an Enterprise BI Platform</strong></td><td>Does not connect to organizational databases or data warehouses</td></tr>
        <tr><td><strong>NOT Official Record System</strong></td><td>Data is stored locally only; not synced or backed up centrally</td></tr>
        <tr><td><strong>NOT for Regulatory Compliance</strong></td><td>Cannot be used for official compliance reporting or audits</td></tr>
        <tr><td><strong>NOT Multi-User System</strong></td><td>No collaboration, sharing, or multi-user access features</td></tr>
        <tr><td><strong>NOT Decision Authority</strong></td><td>Outputs should inform, not determine, safety decisions</td></tr>
    </table>

    <div class="warning-box">
        <div class="box-title">USER RESPONSIBILITY</div>
        <ul style="margin: 5px 0;">
            <li>Users are responsible for verifying any insights from this tool against official data sources</li>
            <li>This tool processes data provided by the user; accuracy depends on input data quality</li>
            <li>Always cross-reference with enterprise systems before making important decisions</li>
            <li>The hazard auto-classification is based on pattern matching and may require manual verification</li>
        </ul>
    </div>
</div>

<!-- TECHNOLOGY STACK -->
<div class="page">
    <h2>2.3 Technology Stack</h2>
    <table>
        <tr>
            <th>Component</th>
            <th>Technology</th>
            <th>Version</th>
            <th>Purpose</th>
        </tr>
        <tr><td>Frontend Framework</td><td>React</td><td>18.3.1</td><td>User interface components</td></tr>
        <tr><td>Routing</td><td>React Router</td><td>6.28.0</td><td>Client-side navigation</td></tr>
        <tr><td>Styling</td><td>Tailwind CSS</td><td>3.4.16</td><td>UI styling and design</td></tr>
        <tr><td>Charts</td><td>Recharts</td><td>2.13.3</td><td>Data visualization</td></tr>
        <tr><td>Excel Processing</td><td>SheetJS (XLSX)</td><td>0.18.5</td><td>Excel file parsing (client-side)</td></tr>
        <tr><td>PDF Export</td><td>jsPDF</td><td>3.0.4</td><td>PDF report generation</td></tr>
        <tr><td>PowerPoint Export</td><td>PptxGenJS</td><td>4.0.1</td><td>Presentation generation</td></tr>
        <tr><td>Date Utilities</td><td>date-fns</td><td>4.1.0</td><td>Date parsing and formatting</td></tr>
        <tr><td>Icons</td><td>Lucide React</td><td>0.468.0</td><td>UI icons</td></tr>
        <tr><td>Build Tool</td><td>Vite</td><td>6.0.3</td><td>Development and build</td></tr>
    </table>

    <h2>2.4 Key Features</h2>
    <table>
        <tr><th>Feature</th><th>Description</th></tr>
        <tr><td><strong>Dashboard & Analytics</strong></td><td>Incident pyramid, trend charts, hazard rankings, heatmaps, KPI cards</td></tr>
        <tr><td><strong>Data Import</strong></td><td>Excel import with auto-column detection, hazard classification, duplicate detection</td></tr>
        <tr><td><strong>Data Quality</strong></td><td>Quality scoring, spell checker (800+ words), coverage metrics</td></tr>
        <tr><td><strong>Export</strong></td><td>PDF reports, PowerPoint presentations, JSON backup</td></tr>
        <tr><td><strong>Filtering</strong></td><td>Contractor, site, date range filters with drill-down capability</td></tr>
    </table>

    <div class="highlight-box">
        <div class="box-title">AUTO-CLASSIFICATION NOTE</div>
        The hazard auto-classification feature uses pattern matching algorithms (not AI/ML) to suggest hazard categories. These suggestions should be reviewed and verified by the user, especially for safety-critical assessments.
    </div>
</div>

<!-- SECTION 3: ARCHITECTURE DIAGRAMS -->
<div class="page">
    <h1><span class="section-num">3.</span>Architecture Diagrams</h1>

    <h2>3.1 High-Level Architecture</h2>

    <div class="diagram-container">
        <div class="diagram-title">HIDC APPLICATION ARCHITECTURE</div>
        <div class="arch-diagram">
            <div class="arch-row">
                <div class="arch-box arch-box-primary">
                    <div class="arch-box-title">USER BROWSER</div>
                    <div class="arch-box-content">Chrome / Edge / Firefox</div>
                </div>
            </div>

            <div class="arch-arrow">&#8595;</div>

            <div class="arch-row">
                <div class="arch-box">
                    <div class="arch-box-title">Static Files</div>
                    <div class="arch-box-content">HTML, JS, CSS<br>(Initial Load)</div>
                </div>
                <div class="arch-box">
                    <div class="arch-box-title">User Actions</div>
                    <div class="arch-box-content">View, Filter,<br>Import, Export</div>
                </div>
                <div class="arch-box">
                    <div class="arch-box-title">File Access</div>
                    <div class="arch-box-content">Excel Import<br>PDF/PPTX Export</div>
                </div>
            </div>

            <div class="arch-arrow">&#8595;</div>

            <div class="arch-row">
                <div class="arch-box arch-box-secondary" style="min-width: 400px;">
                    <div class="arch-box-title">REACT APPLICATION (Client-Side)</div>
                    <div class="arch-box-content">Pages | Components | State Management | Utilities</div>
                </div>
            </div>

            <div class="arch-arrow">&#8595;</div>

            <div class="arch-row">
                <div class="arch-box arch-box-secondary" style="min-width: 400px;">
                    <div class="arch-box-title">BROWSER localStorage</div>
                    <div class="arch-box-content">hse_incidents | hse_projects | hse_settings | hse_engagements</div>
                </div>
            </div>

            <div class="arch-arrow">&#8595;</div>

            <div class="arch-row">
                <div class="arch-box arch-box-success" style="min-width: 400px;">
                    <div class="arch-box-title">NETWORK: NONE</div>
                    <div class="arch-box-content">Zero outgoing data transmission after initial page load</div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- DATA FLOW DIAGRAM -->
<div class="page">
    <h2>3.2 Data Flow Diagram</h2>

    <div class="diagram-container">
        <div class="diagram-title">DATA IMPORT FLOW</div>
        <div class="flow-diagram">
            <div class="flow-step" style="background: #dbeafe;">Excel File</div>
            <div class="flow-arrow">&#8594;</div>
            <div class="flow-step">File Reader<br>(Browser API)</div>
            <div class="flow-arrow">&#8594;</div>
            <div class="flow-step">XLSX Parser<br>(SheetJS)</div>
            <div class="flow-arrow">&#8594;</div>
            <div class="flow-step">Transform &<br>Validate</div>
            <div class="flow-arrow">&#8594;</div>
            <div class="flow-step" style="background: #d1fae5;">localStorage</div>
        </div>
    </div>

    <div class="diagram-container">
        <div class="diagram-title">DATA PROCESSING PIPELINE</div>
        <table style="margin: 0;">
            <tr>
                <th>Step</th>
                <th>Process</th>
                <th>Description</th>
            </tr>
            <tr>
                <td><strong>1. Cleanup</strong></td>
                <td>Text Normalization</td>
                <td>Remove extra spaces, fix line breaks, normalize capitalization</td>
            </tr>
            <tr>
                <td><strong>2. Classification</strong></td>
                <td>7-Step Hazard Algorithm</td>
                <td>Context redirect > Validate category > Phrase matching > Keyword matching > Default</td>
            </tr>
            <tr>
                <td><strong>3. Validation</strong></td>
                <td>Quality Check</td>
                <td>Required fields, date validation, quality scoring</td>
            </tr>
            <tr>
                <td><strong>4. Normalization</strong></td>
                <td>Name Matching</td>
                <td>Contractor name fuzzy matching (85%+ similarity)</td>
            </tr>
            <tr>
                <td><strong>5. Deduplication</strong></td>
                <td>Duplicate Detection</td>
                <td>Exact ID matching, fuzzy duplicate checking</td>
            </tr>
        </table>
    </div>

    <h2>3.3 Component Structure</h2>
    <table>
        <tr><th>Directory</th><th>Contents</th><th>Purpose</th></tr>
        <tr><td>src/pages/</td><td>9 page components</td><td>Dashboard, DataQuality, Settings, Legal, etc.</td></tr>
        <tr><td>src/components/</td><td>34 components</td><td>UI components organized by feature</td></tr>
        <tr><td>src/context/</td><td>DataContext</td><td>Central state management</td></tr>
        <tr><td>src/hooks/</td><td>2 custom hooks</td><td>useSettings, useExport</td></tr>
        <tr><td>src/utils/</td><td>Utility modules</td><td>Excel parsing, calculations, storage, export</td></tr>
    </table>
</div>

<!-- SECTION 4: SECURITY DOCUMENTATION -->
<div class="page">
    <h1><span class="section-num">4.</span>Security Documentation</h1>

    <h2>4.1 Security Architecture</h2>

    <div class="success-box">
        <div class="box-title">SECURITY MODEL</div>
        This application implements a "Zero Trust Network" architecture by design - it trusts NO external networks because it makes NO external network connections.
    </div>

    <h3>Attack Surface Analysis</h3>
    <table>
        <tr>
            <th>Attack Vector</th>
            <th>Risk Level</th>
            <th>Mitigation</th>
        </tr>
        <tr>
            <td>Network Interception</td>
            <td><span class="badge badge-success">NONE</span></td>
            <td>No data transmitted over network during operation</td>
        </tr>
        <tr>
            <td>Server Compromise</td>
            <td><span class="badge badge-success">NONE</span></td>
            <td>No server component exists</td>
        </tr>
        <tr>
            <td>Database Breach</td>
            <td><span class="badge badge-success">NONE</span></td>
            <td>No database - localStorage only</td>
        </tr>
        <tr>
            <td>API Exploitation</td>
            <td><span class="badge badge-success">NONE</span></td>
            <td>No external APIs used</td>
        </tr>
        <tr>
            <td>Local Device Access</td>
            <td><span class="badge badge-warning">LOW</span></td>
            <td>Device-level security controls (OS login, encryption)</td>
        </tr>
        <tr>
            <td>Malicious File Import</td>
            <td><span class="badge badge-warning">LOW</span></td>
            <td>XLSX parsing sandboxed in browser</td>
        </tr>
    </table>

    <h2>4.2 Authentication & Authorization</h2>

    <div class="highlight-box">
        <div class="box-title">AUTHENTICATION STATUS: NONE REQUIRED</div>
        The application does not implement authentication because:
        <ul>
            <li>All data is stored locally on the user's device</li>
            <li>No multi-user access or collaboration features</li>
            <li>No server-side resources to protect</li>
            <li>Device-level access control is sufficient</li>
        </ul>
    </div>

    <h2>4.3 OWASP Top 10 Vulnerability Assessment</h2>
    <table>
        <tr><th>Vulnerability</th><th>Risk</th><th>Assessment</th></tr>
        <tr><td>A01: Broken Access Control</td><td><span class="badge badge-success">N/A</span></td><td>No server-side access control needed</td></tr>
        <tr><td>A02: Cryptographic Failures</td><td><span class="badge badge-warning">LOW</span></td><td>No sensitive data transmitted</td></tr>
        <tr><td>A03: Injection</td><td><span class="badge badge-success">N/A</span></td><td>No server-side code; no SQL database</td></tr>
        <tr><td>A04: Insecure Design</td><td><span class="badge badge-success">LOW</span></td><td>Offline-first design minimizes attack surface</td></tr>
        <tr><td>A05: Security Misconfiguration</td><td><span class="badge badge-warning">LOW</span></td><td>Minimal configuration required</td></tr>
        <tr><td>A06: Vulnerable Components</td><td><span class="badge badge-warning">LOW</span></td><td>Modern, maintained dependencies</td></tr>
        <tr><td>A07: Auth Failures</td><td><span class="badge badge-success">N/A</span></td><td>No authentication system</td></tr>
        <tr><td>A08: Data Integrity Failures</td><td><span class="badge badge-success">LOW</span></td><td>Input validation implemented</td></tr>
        <tr><td>A09: Logging Failures</td><td><span class="badge badge-success">N/A</span></td><td>No security events to log</td></tr>
        <tr><td>A10: SSRF</td><td><span class="badge badge-success">N/A</span></td><td>No server-side requests made</td></tr>
    </table>
</div>

<!-- SECTION 5: DATA HANDLING -->
<div class="page">
    <h1><span class="section-num">5.</span>Data Handling</h1>

    <h2>5.1 Data Classification</h2>
    <table>
        <tr><th>Data Type</th><th>Classification</th><th>Description</th></tr>
        <tr><td>HSE Observations</td><td>Internal / Confidential</td><td>Safety observation records, hazard descriptions</td></tr>
        <tr><td>Contractor Names</td><td>Internal</td><td>Names of contractor organizations</td></tr>
        <tr><td>Site Locations</td><td>Internal</td><td>Project site identifiers</td></tr>
        <tr><td>Observer Names</td><td>Internal / PII</td><td>Names of individuals reporting observations</td></tr>
        <tr><td>Application Settings</td><td>Non-sensitive</td><td>User preferences and configuration</td></tr>
    </table>

    <h2>5.2 Data Storage</h2>
    <table>
        <tr><th>Storage Key</th><th>Content</th><th>Typical Size</th></tr>
        <tr><td>hse_incidents</td><td>All observation records (main data)</td><td>Variable</td></tr>
        <tr><td>hse_projects</td><td>Project metadata</td><td>&lt; 10 KB</td></tr>
        <tr><td>hse_settings</td><td>User configuration</td><td>&lt; 50 KB</td></tr>
        <tr><td>hse_engagements</td><td>Engagement tracking data</td><td>Variable</td></tr>
        <tr><td>hse_compliance</td><td>Compliance records</td><td>Variable</td></tr>
    </table>

    <div class="highlight-box">
        <div class="box-title">STORAGE LOCATION</div>
        <strong>Chrome/Edge:</strong> %LocalAppData%\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb\\<br>
        <strong>Firefox:</strong> %AppData%\\Mozilla\\Firefox\\Profiles\\[profile]\\webappsstore.sqlite
    </div>

    <h2>5.3 Data Retention & Backup</h2>
    <table>
        <tr><th>Aspect</th><th>Policy</th></tr>
        <tr><td>Default Retention</td><td>Indefinite (until manually cleared)</td></tr>
        <tr><td>Automatic Expiration</td><td>None</td></tr>
        <tr><td>User-Initiated Deletion</td><td>Available via Settings > Clear Data</td></tr>
        <tr><td>Backup Method</td><td>JSON export via Settings > Export Data</td></tr>
        <tr><td>Recovery Method</td><td>JSON import via Settings > Import Data</td></tr>
    </table>

    <div class="warning-box">
        <div class="box-title">BACKUP RECOMMENDATION</div>
        Since this is a personal tool with local-only storage, users should implement a regular backup schedule by exporting data to JSON. Data is NOT backed up automatically or centrally.
    </div>
</div>

<!-- SECTION 6: NETWORK REQUIREMENTS -->
<div class="page">
    <h1><span class="section-num">6.</span>Network Requirements</h1>

    <div class="success-box">
        <div class="box-title">MINIMAL NETWORK REQUIREMENTS</div>
        This application requires network access ONLY for the initial page load. During normal operation, NO network communication occurs.
    </div>

    <h2>6.1 Ports and Protocols</h2>
    <table>
        <tr><th>Purpose</th><th>Protocol</th><th>Port</th><th>Direction</th><th>Frequency</th></tr>
        <tr><td>Initial Page Load</td><td>HTTPS</td><td>443</td><td>Outbound</td><td>Once per session</td></tr>
        <tr><td>Data Operations</td><td colspan="4" style="text-align: center; background: #d1fae5;"><strong>NONE REQUIRED</strong></td></tr>
    </table>

    <h2>6.2 External Connections</h2>
    <table>
        <tr><th>Service Type</th><th>Status</th></tr>
        <tr><td>Cloud Storage (AWS, Azure, GCP)</td><td><span class="badge badge-danger">NOT USED</span></td></tr>
        <tr><td>Analytics Services</td><td><span class="badge badge-danger">NOT USED</span></td></tr>
        <tr><td>CDN Services</td><td><span class="badge badge-danger">NOT USED</span></td></tr>
        <tr><td>Authentication Services</td><td><span class="badge badge-danger">NOT USED</span></td></tr>
        <tr><td>Database Services</td><td><span class="badge badge-danger">NOT USED</span></td></tr>
        <tr><td>Third-Party APIs</td><td><span class="badge badge-danger">NOT USED</span></td></tr>
    </table>

    <h2>6.3 Firewall Rules</h2>
    <div class="highlight-box">
        <div class="box-title">FIREWALL CONFIGURATION</div>
        No special firewall rules required. Standard web browsing rules are sufficient.
    </div>

    <table>
        <tr><th>Rule</th><th>Source</th><th>Destination</th><th>Port</th><th>Action</th></tr>
        <tr><td>Allow HTTPS</td><td>User workstation</td><td>Internal web server</td><td>443</td><td>ALLOW</td></tr>
    </table>
</div>

<!-- SECTION 7: THIRD-PARTY DEPENDENCIES -->
<div class="page">
    <h1><span class="section-num">7.</span>Third-Party Dependencies</h1>

    <h2>7.1 Production Dependencies Audit</h2>
    <table>
        <tr><th>Package</th><th>Version</th><th>Purpose</th><th>License</th><th>Security</th></tr>
        <tr><td>react</td><td>18.3.1</td><td>UI framework</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>react-dom</td><td>18.3.1</td><td>React DOM rendering</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>react-router-dom</td><td>6.28.0</td><td>Client-side routing</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>recharts</td><td>2.13.3</td><td>Data visualization</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>xlsx (SheetJS)</td><td>0.18.5</td><td>Excel file parsing</td><td>Apache-2.0</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>jspdf</td><td>3.0.4</td><td>PDF generation</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>pptxgenjs</td><td>4.0.1</td><td>PowerPoint generation</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>date-fns</td><td>4.1.0</td><td>Date utilities</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>lucide-react</td><td>0.468.0</td><td>Icons</td><td>ISC</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>tailwind-merge</td><td>2.6.0</td><td>CSS utilities</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>clsx</td><td>2.1.1</td><td>Class utilities</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
        <tr><td>html-to-image</td><td>1.11.13</td><td>Chart capture</td><td>MIT</td><td><span class="badge badge-success">Clean</span></td></tr>
    </table>

    <h2>7.2 License Compliance</h2>
    <table>
        <tr><th>License Type</th><th>Count</th><th>Commercial Use</th><th>Status</th></tr>
        <tr><td>MIT</td><td>10</td><td>Allowed</td><td><span class="badge badge-success">Compliant</span></td></tr>
        <tr><td>Apache-2.0</td><td>1</td><td>Allowed</td><td><span class="badge badge-success">Compliant</span></td></tr>
        <tr><td>ISC</td><td>1</td><td>Allowed</td><td><span class="badge badge-success">Compliant</span></td></tr>
    </table>

    <div class="success-box">
        <div class="box-title">LICENSE COMPLIANCE: FULLY COMPLIANT</div>
        All dependencies use permissive open-source licenses that allow commercial and internal use.
    </div>
</div>

<!-- SECTION 8: COMPLIANCE -->
<div class="page">
    <h1><span class="section-num">8.</span>Compliance</h1>

    <h2>8.1 Regulatory Compliance</h2>
    <table>
        <tr><th>Regulation</th><th>Applicability</th><th>Compliance Status</th></tr>
        <tr>
            <td><strong>GDPR</strong><br>(EU Data Protection)</td>
            <td>Limited - if processing EU personal data</td>
            <td>
                <ul style="margin: 0; padding-left: 15px;">
                    <li>No data transmitted to third parties</li>
                    <li>User controls all data locally</li>
                    <li>Data deletion available</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><strong>Saudi PDPL</strong><br>(Personal Data Protection Law)</td>
            <td>Applicable for personal data</td>
            <td>
                <ul style="margin: 0; padding-left: 15px;">
                    <li>Data remains on local device</li>
                    <li>No cross-border transfer</li>
                    <li>User has full data control</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><strong>ISO 45001</strong><br>(HSE Management)</td>
            <td>Supports compliance</td>
            <td>
                <ul style="margin: 0; padding-left: 15px;">
                    <li>Hazard tracking capabilities</li>
                    <li>Incident recording</li>
                    <li>Trend analysis</li>
                </ul>
            </td>
        </tr>
    </table>

    <h2>8.2 Security Standards Alignment</h2>
    <table>
        <tr><th>Standard</th><th>Relevance</th><th>Alignment</th></tr>
        <tr>
            <td><strong>ISO 27001</strong></td>
            <td>Information Security</td>
            <td>Access control via device/network; Data integrity maintained locally</td>
        </tr>
        <tr>
            <td><strong>OWASP ASVS</strong></td>
            <td>Application Security</td>
            <td>Input validation implemented; No injection vulnerabilities</td>
        </tr>
        <tr>
            <td><strong>NIST Framework</strong></td>
            <td>Security Best Practices</td>
            <td>Identify, Protect, Detect capabilities aligned</td>
        </tr>
    </table>
</div>

<!-- SECTION 9: DEPLOYMENT DETAILS -->
<div class="page">
    <h1><span class="section-num">9.</span>Deployment Details</h1>

    <h2>9.1 Recommended Deployment Options</h2>
    <table>
        <tr><th>Option</th><th>Description</th><th>Suitability</th></tr>
        <tr><td>Internal Web Server</td><td>Host on IIS/nginx/Apache on internal network</td><td><span class="badge badge-success">RECOMMENDED</span></td></tr>
        <tr><td>SharePoint</td><td>Deploy as SharePoint-hosted app</td><td><span class="badge badge-success">Suitable</span></td></tr>
        <tr><td>Local File System</td><td>Run directly from local files</td><td><span class="badge badge-warning">Dev Only</span></td></tr>
        <tr><td>Public Cloud</td><td>AWS/Azure/GCP hosting</td><td><span class="badge badge-danger">Not Recommended</span></td></tr>
    </table>

    <h2>9.2 System Requirements</h2>
    <table>
        <tr><th>Component</th><th>Minimum</th><th>Recommended</th></tr>
        <tr><td>Browser</td><td>Chrome 90+, Edge 90+, Firefox 90+</td><td>Latest stable version</td></tr>
        <tr><td>RAM</td><td>4 GB</td><td>8 GB</td></tr>
        <tr><td>Storage</td><td>50 MB (app) + data</td><td>100 MB</td></tr>
        <tr><td>Network</td><td>Initial load only</td><td>Intranet access</td></tr>
    </table>

    <h2>9.3 Recommended HTTP Security Headers</h2>
    <div class="highlight-box" style="font-family: monospace; font-size: 9pt;">
        X-Content-Type-Options: nosniff<br>
        X-Frame-Options: SAMEORIGIN<br>
        X-XSS-Protection: 1; mode=block<br>
        Strict-Transport-Security: max-age=31536000; includeSubDomains<br>
        Content-Security-Policy: default-src 'self'
    </div>
</div>

<!-- SECTION 10: RISK ASSESSMENT -->
<div class="page">
    <h1><span class="section-num">10.</span>Risk Assessment</h1>

    <h2>Risk Matrix</h2>
    <table>
        <tr><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Overall</th><th>Mitigation</th></tr>
        <tr>
            <td>Data exfiltration via network</td>
            <td>None</td>
            <td>N/A</td>
            <td><span class="badge badge-success">NONE</span></td>
            <td>No network data transmission</td>
        </tr>
        <tr>
            <td>Unauthorized data access</td>
            <td>Low</td>
            <td>Medium</td>
            <td><span class="badge badge-warning">LOW</span></td>
            <td>Device-level access control</td>
        </tr>
        <tr>
            <td>Data loss (device failure)</td>
            <td>Low</td>
            <td>High</td>
            <td><span class="badge badge-warning">MEDIUM</span></td>
            <td>Regular JSON backups recommended</td>
        </tr>
        <tr>
            <td>Malicious file import</td>
            <td>Low</td>
            <td>Low</td>
            <td><span class="badge badge-success">LOW</span></td>
            <td>XLSX parsing sandboxed</td>
        </tr>
        <tr>
            <td>Browser vulnerability exploit</td>
            <td>Low</td>
            <td>Medium</td>
            <td><span class="badge badge-warning">LOW</span></td>
            <td>Keep browsers updated</td>
        </tr>
        <tr>
            <td>Dependency vulnerability</td>
            <td>Low</td>
            <td>Low</td>
            <td><span class="badge badge-success">LOW</span></td>
            <td>Regular npm audit</td>
        </tr>
    </table>

    <div class="success-box">
        <div class="box-title">OVERALL RISK LEVEL: LOW</div>
        The application's offline-first, client-side architecture significantly reduces security risks compared to traditional web applications. Primary risks relate to physical device security, which should be managed through standard IT policies.
    </div>

    <h1 style="margin-top: 40px;"><span class="section-num">11.</span>Verification Procedures</h1>

    <h2>How to Verify No Data Leaves the Browser</h2>

    <h3>Method 1: Network Tab Inspection</h3>
    <ol>
        <li>Open the application in browser</li>
        <li>Press F12 to open Developer Tools</li>
        <li>Navigate to the "Network" tab</li>
        <li>Perform various operations (import data, filter, export)</li>
        <li>Observe that NO outgoing data requests are made</li>
    </ol>

    <h3>Method 2: localStorage Inspection</h3>
    <ol>
        <li>Open Developer Tools (F12)</li>
        <li>Go to "Application" tab</li>
        <li>Expand "Local Storage" in left panel</li>
        <li>View all stored data (hse_incidents, hse_settings, etc.)</li>
    </ol>

    <h3>Method 3: Offline Test</h3>
    <ol>
        <li>Load the application normally</li>
        <li>Disconnect from network</li>
        <li>Continue using the application</li>
        <li>Verify all features work offline</li>
    </ol>
</div>

<!-- SECTION 12: APPROVAL PAGE - FULL PAGE -->
<div class="approval-page">
    <h1><span class="section-num">12.</span>Approval Checklist & Signatures</h1>

    <h2>IT Security Review Checklist</h2>

    <div class="checklist-item"><div class="checkbox"></div><div>Application architecture documented</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>Data flow diagram provided</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>External API connections verified: NONE</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>Network requirements documented</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>Data classification defined</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>Data storage location documented</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>Authentication mechanism verified: N/A (local app)</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>Third-party dependencies audited</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>License compliance verified</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>OWASP Top 10 assessment completed</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>Risk assessment completed</div></div>
    <div class="checklist-item"><div class="checkbox"></div><div>Intended use & limitations documented (personal tool, not enterprise BI replacement)</div></div>

    <h2 style="margin-top: 30px;">Approval Signatures</h2>

    <div class="signature-grid">
        <div class="signature-box">
            <h4>IT Security Reviewer</h4>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Name</div>
            </div>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Signature</div>
            </div>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Date</div>
            </div>
            <div class="decision-row">Decision: [ ] APPROVED &nbsp;&nbsp; [ ] REJECTED</div>
        </div>

        <div class="signature-box">
            <h4>Data Security Approver</h4>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Name</div>
            </div>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Signature</div>
            </div>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Date</div>
            </div>
            <div class="decision-row">Decision: [ ] APPROVED &nbsp;&nbsp; [ ] REJECTED</div>
        </div>

        <div class="signature-box">
            <h4>Line Manager</h4>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Name</div>
            </div>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Signature</div>
            </div>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Date</div>
            </div>
            <div class="decision-row">Decision: [ ] APPROVED &nbsp;&nbsp; [ ] REJECTED</div>
        </div>

        <div class="signature-box">
            <h4>Application Owner</h4>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Name</div>
            </div>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Signature</div>
            </div>
            <div class="signature-field">
                <div class="signature-line"></div>
                <div class="signature-label">Date</div>
            </div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 9pt;">
        <p><strong>HIDC Application - IT Security Whitelist Request Documentation</strong></p>
        <p>Version 1.0 | January 10, 2026 | Classification: Internal / Confidential</p>
    </div>
</div>

</body>
</html>
`;

async function generatePDF() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Creating page...');
    const page = await browser.newPage();

    console.log('Setting content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const desktopPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop');
    const outputPath = path.join(desktopPath, 'HIDC_Security_Documentation_v2.pdf');

    console.log('Generating PDF...');
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
        },
        displayHeaderFooter: false
    });

    console.log('Closing browser...');
    await browser.close();

    console.log('\\n========================================');
    console.log('PDF generated successfully!');
    console.log('Location: ' + outputPath);
    console.log('========================================\\n');
}

generatePDF().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
