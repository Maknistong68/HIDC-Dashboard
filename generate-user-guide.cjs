/**
 * Safety Observation Dashboard - User Guide PDF Generator
 *
 * Generates a comprehensive, non-technical user guide with diagrams and flows
 * Formatted for A4 paper
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Safety Observation Dashboard - User Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      page-break-after: always;
      position: relative;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Cover Page */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%);
      color: white;
    }

    .cover-logo {
      width: 120px;
      height: 120px;
      background: white;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .cover-logo svg {
      width: 70px;
      height: 70px;
    }

    .cover h1 {
      font-size: 42pt;
      font-weight: 800;
      margin-bottom: 16px;
      text-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    .cover h2 {
      font-size: 18pt;
      font-weight: 400;
      opacity: 0.9;
      margin-bottom: 60px;
    }

    .cover-meta {
      margin-top: auto;
      padding-top: 60px;
      font-size: 10pt;
      opacity: 0.8;
    }

    /* Table of Contents */
    .toc h2 {
      font-size: 24pt;
      color: #3b82f6;
      margin-bottom: 30px;
      padding-bottom: 10px;
      border-bottom: 3px solid #3b82f6;
    }

    .toc-item {
      display: flex;
      align-items: baseline;
      padding: 12px 0;
      border-bottom: 1px dashed #e2e8f0;
    }

    .toc-number {
      font-weight: 700;
      color: #3b82f6;
      width: 40px;
      flex-shrink: 0;
    }

    .toc-title {
      flex: 1;
      font-weight: 500;
    }

    .toc-page {
      color: #64748b;
      font-weight: 500;
    }

    .toc-sub {
      padding-left: 40px;
      font-size: 10pt;
      color: #64748b;
    }

    /* Section Headers */
    .section-header {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      padding: 30px;
      margin: -20mm -20mm 30px -20mm;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .section-number {
      font-size: 48pt;
      font-weight: 800;
      opacity: 0.3;
    }

    .section-title {
      font-size: 28pt;
      font-weight: 700;
    }

    .section-subtitle {
      font-size: 12pt;
      opacity: 0.9;
      margin-top: 8px;
    }

    /* Content Styles */
    h3 {
      font-size: 16pt;
      color: #1e40af;
      margin: 25px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e7ff;
    }

    h4 {
      font-size: 13pt;
      color: #3b82f6;
      margin: 20px 0 10px 0;
    }

    p {
      margin-bottom: 12px;
      text-align: justify;
    }

    /* Info Boxes */
    .info-box {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }

    .info-box.tip {
      background: #ecfdf5;
      border-color: #10b981;
    }

    .info-box.warning {
      background: #fefce8;
      border-color: #f59e0b;
    }

    .info-box-title {
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Diagrams */
    .diagram {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
    }

    .diagram-title {
      font-weight: 700;
      color: #475569;
      margin-bottom: 20px;
      text-align: center;
      font-size: 12pt;
    }

    /* Flow Diagram */
    .flow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .flow-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .flow-box {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 10pt;
      text-align: center;
      min-width: 120px;
    }

    .flow-box.green {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .flow-box.orange {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .flow-box.purple {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .flow-box.red {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .flow-box.gray {
      background: #64748b;
    }

    .flow-arrow {
      color: #94a3b8;
      font-size: 18pt;
      font-weight: bold;
    }

    .flow-arrow-down {
      font-size: 24pt;
    }

    /* Feature Grid */
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }

    .feature-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .feature-card-icon {
      width: 40px;
      height: 40px;
      background: #eff6ff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      color: #3b82f6;
    }

    .feature-card h5 {
      font-size: 11pt;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .feature-card p {
      font-size: 9pt;
      color: #64748b;
      margin: 0;
    }

    /* KPI Card Example */
    .kpi-example {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
    }

    .kpi-card {
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border: 1px solid #bae6fd;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }

    .kpi-card.green {
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border-color: #86efac;
    }

    .kpi-card.amber {
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      border-color: #fcd34d;
    }

    .kpi-card.red {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border-color: #fca5a5;
    }

    .kpi-value {
      font-size: 22pt;
      font-weight: 800;
      color: #1e293b;
    }

    .kpi-label {
      font-size: 8pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Lists */
    ul, ol {
      margin: 15px 0;
      padding-left: 25px;
    }

    li {
      margin-bottom: 8px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10pt;
    }

    th {
      background: #f1f5f9;
      padding: 12px 15px;
      text-align: left;
      font-weight: 700;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }

    td {
      padding: 10px 15px;
      border-bottom: 1px solid #e2e8f0;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Status Badges */
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 600;
    }

    .badge.green { background: #dcfce7; color: #166534; }
    .badge.amber { background: #fef3c7; color: #92400e; }
    .badge.red { background: #fee2e2; color: #991b1b; }
    .badge.blue { background: #dbeafe; color: #1e40af; }

    /* Screenshot placeholder */
    .screenshot {
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      color: #64748b;
      margin: 20px 0;
    }

    /* Footer */
    .page-footer {
      position: absolute;
      bottom: 15mm;
      left: 20mm;
      right: 20mm;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }

    /* Pyramid Diagram */
    .pyramid {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .pyramid-level {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 9pt;
      padding: 10px;
      text-align: center;
    }

    .pyramid-1 { width: 120px; background: #dc2626; border-radius: 8px 8px 0 0; }
    .pyramid-2 { width: 160px; background: #f97316; }
    .pyramid-3 { width: 200px; background: #eab308; }
    .pyramid-4 { width: 240px; background: #22c55e; }
    .pyramid-5 { width: 280px; background: #3b82f6; border-radius: 0 0 8px 8px; }

    /* Process Steps */
    .process-steps {
      display: flex;
      justify-content: space-between;
      margin: 25px 0;
      position: relative;
    }

    .process-steps::before {
      content: '';
      position: absolute;
      top: 25px;
      left: 50px;
      right: 50px;
      height: 3px;
      background: #e2e8f0;
      z-index: 0;
    }

    .process-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 1;
      flex: 1;
    }

    .process-step-number {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18pt;
      margin-bottom: 12px;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .process-step-title {
      font-weight: 700;
      font-size: 10pt;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .process-step-desc {
      font-size: 8pt;
      color: #64748b;
      max-width: 100px;
    }

    /* Cycle Diagram */
    .cycle {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 15px;
      margin: 20px 0;
    }

    .cycle-item {
      width: 140px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 15px;
      text-align: center;
    }

    .cycle-item.active {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .cycle-icon {
      font-size: 24pt;
      margin-bottom: 8px;
    }

    .cycle-title {
      font-weight: 700;
      font-size: 10pt;
      color: #1e293b;
    }

    /* Two Column Layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
    }

    /* Checklist */
    .checklist {
      list-style: none;
      padding: 0;
    }

    .checklist li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
    }

    .checklist li::before {
      content: '✓';
      color: #10b981;
      font-weight: bold;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10pt;
    }

    @media print {
      .page {
        margin: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover">
    <div class="cover-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    </div>
    <h1>Safety Dashboard</h1>
    <h2>Complete User Guide</h2>
    <p style="max-width: 400px; opacity: 0.9; line-height: 1.8;">
      Your comprehensive guide to managing safety observations, tracking incidents,
      and building a proactive safety culture with data-driven insights.
    </p>
    <div class="cover-meta">
      <p>Version 1.0 | January 2026</p>
      <p>Enterprise Safety Observation Management System</p>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="page toc">
    <h2>Table of Contents</h2>

    <div class="toc-item">
      <span class="toc-number">1</span>
      <span class="toc-title">Introduction & Overview</span>
      <span class="toc-page">3</span>
    </div>
    <div class="toc-item toc-sub">
      <span class="toc-title">What is this app? | Who is it for? | Key Benefits</span>
    </div>

    <div class="toc-item">
      <span class="toc-number">2</span>
      <span class="toc-title">Getting Started</span>
      <span class="toc-page">4</span>
    </div>
    <div class="toc-item toc-sub">
      <span class="toc-title">Importing Your Data | Navigation | First Steps</span>
    </div>

    <div class="toc-item">
      <span class="toc-number">3</span>
      <span class="toc-title">Dashboard - Your Safety Command Center</span>
      <span class="toc-page">5</span>
    </div>
    <div class="toc-item toc-sub">
      <span class="toc-title">KPIs | Charts | Filtering | Drill-Down</span>
    </div>

    <div class="toc-item">
      <span class="toc-number">4</span>
      <span class="toc-title">Data Quality - Ensuring Accurate Data</span>
      <span class="toc-page">7</span>
    </div>
    <div class="toc-item toc-sub">
      <span class="toc-title">Quality Score | Issues Detection | Improvements</span>
    </div>

    <div class="toc-item">
      <span class="toc-number">5</span>
      <span class="toc-title">Safety Outlook - Trends & Root Causes</span>
      <span class="toc-page">8</span>
    </div>
    <div class="toc-item toc-sub">
      <span class="toc-title">Hazard Trends | Contributing Factors</span>
    </div>

    <div class="toc-item">
      <span class="toc-number">6</span>
      <span class="toc-title">Predictive Analytics - Smart Insights</span>
      <span class="toc-page">9</span>
    </div>
    <div class="toc-item toc-sub">
      <span class="toc-title">Forecasting | Risk Scoring | What-If Simulator</span>
    </div>

    <div class="toc-item">
      <span class="toc-number">7</span>
      <span class="toc-title">File Management</span>
      <span class="toc-page">10</span>
    </div>
    <div class="toc-item toc-sub">
      <span class="toc-title">Viewing Files | Deleting | Replacing | Timeline</span>
    </div>

    <div class="toc-item">
      <span class="toc-number">8</span>
      <span class="toc-title">Reports & Export</span>
      <span class="toc-page">11</span>
    </div>
    <div class="toc-item toc-sub">
      <span class="toc-title">PDF Export | PowerPoint | Data Backup</span>
    </div>

    <div class="toc-item">
      <span class="toc-number">9</span>
      <span class="toc-title">Quick Reference Card</span>
      <span class="toc-page">12</span>
    </div>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 2</span>
    </div>
  </div>

  <!-- Section 1: Introduction -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">01</span>
      <div>
        <div class="section-title">Introduction</div>
        <div class="section-subtitle">Understanding Your Safety Dashboard</div>
      </div>
    </div>

    <h3>What is this Application?</h3>
    <p>
      The <strong>Safety Observation Dashboard</strong> is an enterprise-grade tool designed to help safety managers,
      supervisors, and teams track, analyze, and improve workplace safety. It transforms raw observation data
      from Excel spreadsheets into actionable insights through powerful visualizations and analytics.
    </p>

    <div class="info-box">
      <div class="info-box-title">Key Purpose</div>
      <p>Move from <strong>reactive incident response</strong> to <strong>proactive safety culture building</strong> through data-driven decision making.</p>
    </div>

    <h3>Who Is It For?</h3>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-card-icon">👷</div>
        <h5>Safety Managers</h5>
        <p>Monitor overall safety performance, identify trends, and make strategic decisions.</p>
      </div>
      <div class="feature-card">
        <div class="feature-card-icon">📊</div>
        <h5>Project Directors</h5>
        <p>Review project-specific metrics and contractor performance comparisons.</p>
      </div>
      <div class="feature-card">
        <div class="feature-card-icon">📋</div>
        <h5>HSE Officers</h5>
        <p>Track observations, ensure compliance, and manage corrective actions.</p>
      </div>
      <div class="feature-card">
        <div class="feature-card-icon">📈</div>
        <h5>Analysts</h5>
        <p>Deep-dive into data quality, patterns, and predictive insights.</p>
      </div>
    </div>

    <h3>Key Benefits</h3>
    <ul class="checklist">
      <li>Visualize safety trends at a glance with interactive charts</li>
      <li>Identify problem areas before incidents occur</li>
      <li>Track contractor and site performance</li>
      <li>Ensure data quality with automatic detection of issues</li>
      <li>Generate reports for management and compliance</li>
      <li>Predict future trends with built-in forecasting</li>
    </ul>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 3</span>
    </div>
  </div>

  <!-- Section 2: Getting Started -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">02</span>
      <div>
        <div class="section-title">Getting Started</div>
        <div class="section-subtitle">Your First Steps with the Dashboard</div>
      </div>
    </div>

    <h3>How Data Gets Into the System</h3>
    <p>The dashboard works with your existing Excel observation data. Here's the simple process:</p>

    <div class="process-steps">
      <div class="process-step">
        <div class="process-step-number">1</div>
        <div class="process-step-title">Upload</div>
        <div class="process-step-desc">Select your Excel file</div>
      </div>
      <div class="process-step">
        <div class="process-step-number">2</div>
        <div class="process-step-title">Map</div>
        <div class="process-step-desc">Match columns to fields</div>
      </div>
      <div class="process-step">
        <div class="process-step-number">3</div>
        <div class="process-step-title">Review</div>
        <div class="process-step-desc">Check for duplicates</div>
      </div>
      <div class="process-step">
        <div class="process-step-number">4</div>
        <div class="process-step-title">Import</div>
        <div class="process-step-desc">Data is ready!</div>
      </div>
    </div>

    <div class="info-box tip">
      <div class="info-box-title">Tip: Excel File Requirements</div>
      <p>Your Excel file should have columns for: Date, Description, Type (Incident/Near-Miss/etc.), Location/Hazard, Reporter Name, Contractor, Site, and Status.</p>
    </div>

    <h3>Navigation Overview</h3>
    <p>The app has a simple sidebar menu on the left. Here's what each section does:</p>

    <table>
      <tr>
        <th>Menu Item</th>
        <th>What It Does</th>
      </tr>
      <tr>
        <td><strong>Dashboard</strong></td>
        <td>Main overview with KPIs and charts - your starting point</td>
      </tr>
      <tr>
        <td><strong>Data Quality</strong></td>
        <td>Check and improve the accuracy of your data</td>
      </tr>
      <tr>
        <td><strong>Safety Outlook</strong></td>
        <td>Analyze hazard trends and root causes</td>
      </tr>
      <tr>
        <td><strong>Predictive Analytics</strong></td>
        <td>AI-powered forecasts and recommendations</td>
      </tr>
      <tr>
        <td><strong>File Manager</strong></td>
        <td>Manage your imported Excel files</td>
      </tr>
      <tr>
        <td><strong>Import</strong></td>
        <td>Upload new observation data</td>
      </tr>
    </table>

    <h3>First Things to Do</h3>
    <ol>
      <li><strong>Import your data</strong> - Go to Import and upload your Excel file</li>
      <li><strong>Check the Dashboard</strong> - See your safety overview</li>
      <li><strong>Review Data Quality</strong> - Fix any issues the system detects</li>
      <li><strong>Explore Trends</strong> - Use Safety Outlook to find patterns</li>
    </ol>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 4</span>
    </div>
  </div>

  <!-- Section 3: Dashboard -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">03</span>
      <div>
        <div class="section-title">Dashboard</div>
        <div class="section-subtitle">Your Safety Command Center</div>
      </div>
    </div>

    <h3>Key Performance Indicators (KPIs)</h3>
    <p>At the top of the dashboard, you'll see cards showing your most important metrics:</p>

    <div class="kpi-example">
      <div class="kpi-card">
        <div class="kpi-value">1,234</div>
        <div class="kpi-label">Total Observations</div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-value">85%</div>
        <div class="kpi-label">Close Out Rate</div>
      </div>
      <div class="kpi-card amber">
        <div class="kpi-value">28%</div>
        <div class="kpi-label">Positive Rate</div>
      </div>
      <div class="kpi-card red">
        <div class="kpi-value">12</div>
        <div class="kpi-label">Open > 1 Month</div>
      </div>
    </div>

    <div class="two-col">
      <div>
        <h4>What Each KPI Means</h4>
        <ul>
          <li><strong>Total Observations</strong> - All records imported</li>
          <li><strong>Close Out Rate</strong> - % of issues resolved (target: 80%+)</li>
          <li><strong>Positive Rate</strong> - % of proactive observations (target: 30%+)</li>
          <li><strong>Open > 1 Month</strong> - Overdue items needing attention</li>
        </ul>
      </div>
      <div>
        <h4>Color Coding</h4>
        <ul>
          <li><span class="badge green">Green</span> = Good performance</li>
          <li><span class="badge amber">Amber</span> = Needs attention</li>
          <li><span class="badge red">Red</span> = Critical issue</li>
        </ul>
      </div>
    </div>

    <h3>The Incident Pyramid</h3>
    <p>Shows the distribution of observation types following the safety pyramid principle:</p>

    <div class="diagram">
      <div class="diagram-title">Safety Observation Pyramid</div>
      <div class="pyramid">
        <div class="pyramid-level pyramid-1">Incidents (LTI/MTI)</div>
        <div class="pyramid-level pyramid-2">Near Misses</div>
        <div class="pyramid-level pyramid-3">Unsafe Acts</div>
        <div class="pyramid-level pyramid-4">Unsafe Conditions</div>
        <div class="pyramid-level pyramid-5">Positive Observations</div>
      </div>
    </div>

    <p><strong>Healthy ratios:</strong> You want more observations at the bottom (positive, conditions) than at the top (incidents). A tall, narrow top indicates good safety culture.</p>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 5</span>
    </div>
  </div>

  <!-- Section 3 continued: Dashboard Charts & Drill-Down -->
  <div class="page">
    <h3>Charts & Visualizations</h3>

    <div class="feature-grid">
      <div class="feature-card">
        <h5>12-Month Trend Line</h5>
        <p>See observation volume over time. Rising line = more reporting activity. Look for spikes that indicate incidents.</p>
      </div>
      <div class="feature-card">
        <h5>Top Hazards</h5>
        <p>Bar chart of the 10 most reported hazard categories. Focus improvement efforts on the tallest bars.</p>
      </div>
      <div class="feature-card">
        <h5>By Day of Week</h5>
        <p>Which days have most observations? Useful for scheduling safety activities.</p>
      </div>
      <div class="feature-card">
        <h5>By Hour of Day</h5>
        <p>Heatmap showing observation times. Identifies shift patterns and coverage gaps.</p>
      </div>
    </div>

    <h3>Filtering Your View</h3>
    <p>Use the filter bar at the top to focus on specific data:</p>

    <div class="diagram">
      <div class="flow-row">
        <div class="flow-box gray">Time Period</div>
        <div class="flow-arrow">+</div>
        <div class="flow-box gray">Contractor</div>
        <div class="flow-arrow">+</div>
        <div class="flow-box gray">Site</div>
        <div class="flow-arrow">=</div>
        <div class="flow-box green">Filtered View</div>
      </div>
    </div>

    <p><strong>Time periods:</strong> All Data | Last Week | Last Month | 3 Months | 6 Months | 1 Year</p>

    <h3>Drill-Down: Going Deeper</h3>
    <p>Click on any chart element to see more details. The system supports 3 levels of drill-down:</p>

    <div class="diagram">
      <div class="diagram-title">Drill-Down Navigation Flow</div>
      <div class="flow">
        <div class="flow-row">
          <div class="flow-box">Click Chart Bar</div>
        </div>
        <div class="flow-arrow flow-arrow-down">↓</div>
        <div class="flow-row">
          <div class="flow-box purple">Level 2: Monthly Breakdown</div>
        </div>
        <div class="flow-arrow flow-arrow-down">↓</div>
        <div class="flow-row">
          <div class="flow-box orange">Level 3: All Records for Selection</div>
        </div>
        <div class="flow-arrow flow-arrow-down">↓</div>
        <div class="flow-row">
          <div class="flow-box green">Click Row: Full Report Details</div>
        </div>
      </div>
    </div>

    <div class="info-box tip">
      <div class="info-box-title">Navigation Tip</div>
      <p>Use the breadcrumbs at the top of the drill-down modal to go back to previous levels, or click outside the modal to close it.</p>
    </div>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 6</span>
    </div>
  </div>

  <!-- Section 4: Data Quality -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">04</span>
      <div>
        <div class="section-title">Data Quality</div>
        <div class="section-subtitle">Ensuring Accurate & Reliable Data</div>
      </div>
    </div>

    <h3>Why Data Quality Matters</h3>
    <p>Your insights are only as good as your data. The Data Quality page helps you identify and fix issues that could affect your analysis.</p>

    <div class="diagram">
      <div class="diagram-title">Data Quality Score Components</div>
      <table>
        <tr>
          <th>Component</th>
          <th>Weight</th>
          <th>What It Measures</th>
        </tr>
        <tr>
          <td>Categorization</td>
          <td>25%</td>
          <td>% of records with proper hazard categories</td>
        </tr>
        <tr>
          <td>Description Quality</td>
          <td>25%</td>
          <td>% of records with adequate detail (16-30 words)</td>
        </tr>
        <tr>
          <td>Near Miss Rate</td>
          <td>20%</td>
          <td>Ratio of near-misses to total observations</td>
        </tr>
        <tr>
          <td>Coverage</td>
          <td>20%</td>
          <td>% of days with at least one observation</td>
        </tr>
        <tr>
          <td>Reporter Engagement</td>
          <td>10%</td>
          <td>Diversity of people submitting reports</td>
        </tr>
      </table>
    </div>

    <h3>Issues the System Detects</h3>

    <div class="feature-grid">
      <div class="feature-card">
        <h5>Missing Categories</h5>
        <p>Records without a hazard category assigned. Click to review and assign.</p>
      </div>
      <div class="feature-card">
        <h5>Short Descriptions</h5>
        <p>Vague reports with too few details. Need more context for proper analysis.</p>
      </div>
      <div class="feature-card">
        <h5>Duplicate Records</h5>
        <p>Same observation entered multiple times. Can be merged or deleted.</p>
      </div>
      <div class="feature-card">
        <h5>Spelling Errors</h5>
        <p>Common misspellings detected. Suggests corrections.</p>
      </div>
    </div>

    <h3>Fixing Data Quality Issues</h3>

    <div class="diagram">
      <div class="diagram-title">Quality Improvement Workflow</div>
      <div class="flow">
        <div class="flow-row">
          <div class="flow-box">View Quality Score</div>
          <div class="flow-arrow">→</div>
          <div class="flow-box orange">Identify Issues</div>
          <div class="flow-arrow">→</div>
          <div class="flow-box purple">Drill Down</div>
          <div class="flow-arrow">→</div>
          <div class="flow-box green">Fix Records</div>
        </div>
      </div>
    </div>

    <p>Each issue card shows a count. Click to drill down into affected records, then update them individually through the report modal.</p>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 7</span>
    </div>
  </div>

  <!-- Section 5: Safety Outlook -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">05</span>
      <div>
        <div class="section-title">Safety Outlook</div>
        <div class="section-subtitle">Understanding Trends & Root Causes</div>
      </div>
    </div>

    <h3>Two Ways to Analyze</h3>
    <p>The Safety Outlook page offers two perspectives on your data:</p>

    <div class="two-col">
      <div class="feature-card" style="border: 2px solid #3b82f6;">
        <h5>View 1: Hazards</h5>
        <p>See which hazard types are trending up or down. Helps prioritize where to focus safety efforts.</p>
        <p style="margin-top: 10px;">
          <span class="badge red">Rising</span>
          <span class="badge amber">Stable</span>
          <span class="badge green">Declining</span>
        </p>
      </div>
      <div class="feature-card" style="border: 2px solid #8b5cf6;">
        <h5>View 2: Factors</h5>
        <p>Understand WHY observations are happening. Shows contributing factors like training gaps, PPE issues, etc.</p>
      </div>
    </div>

    <h3>Reading Hazard Trends</h3>

    <div class="diagram">
      <div class="diagram-title">Trend Indicators Explained</div>
      <table>
        <tr>
          <th>Indicator</th>
          <th>Color</th>
          <th>What It Means</th>
          <th>Action</th>
        </tr>
        <tr>
          <td>Significant Rise</td>
          <td><span class="badge red">Red</span></td>
          <td>Major increase in observations</td>
          <td>Immediate investigation needed</td>
        </tr>
        <tr>
          <td>Rising</td>
          <td><span class="badge amber">Amber</span></td>
          <td>Gradual increase</td>
          <td>Monitor closely</td>
        </tr>
        <tr>
          <td>Stable</td>
          <td><span class="badge blue">Gray</span></td>
          <td>No significant change</td>
          <td>Continue current controls</td>
        </tr>
        <tr>
          <td>Declining</td>
          <td><span class="badge green">Green</span></td>
          <td>Decreasing observations</td>
          <td>Controls are working!</td>
        </tr>
      </table>
    </div>

    <h3>Contributing Factors</h3>
    <p>The Factors view extracts common themes from observation descriptions:</p>

    <ul>
      <li><strong>PPE Issues</strong> - Missing or improper personal protective equipment</li>
      <li><strong>Training Gaps</strong> - Lack of proper training or certification</li>
      <li><strong>Communication Failure</strong> - Poor handoff or unclear instructions</li>
      <li><strong>Housekeeping</strong> - Untidy work areas creating hazards</li>
      <li><strong>Procedure Violation</strong> - Not following established safety rules</li>
    </ul>

    <div class="info-box">
      <div class="info-box-title">How to Use This</div>
      <p>If "Training Gaps" appears frequently for electrical hazards, consider additional electrical safety training. Address the root cause, not just the symptom.</p>
    </div>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 8</span>
    </div>
  </div>

  <!-- Section 6: Predictive Analytics -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">06</span>
      <div>
        <div class="section-title">Predictive Analytics</div>
        <div class="section-subtitle">AI-Powered Insights & Forecasting</div>
      </div>
    </div>

    <h3>What the System Predicts</h3>
    <p>Using your historical data, the system can forecast future trends and identify potential issues before they become problems.</p>

    <div class="feature-grid">
      <div class="feature-card">
        <h5>30/60/90 Day Forecast</h5>
        <p>Predicted observation volume for the next 1-3 months based on historical patterns.</p>
      </div>
      <div class="feature-card">
        <h5>Anomaly Detection</h5>
        <p>Automatically flags unusual spikes or drops that may need investigation.</p>
      </div>
      <div class="feature-card">
        <h5>Risk Score</h5>
        <p>Overall safety risk assessment (0-100%) based on multiple factors.</p>
      </div>
      <div class="feature-card">
        <h5>Recommendations</h5>
        <p>Prioritized list of suggested actions to improve safety performance.</p>
      </div>
    </div>

    <h3>Understanding the Risk Score</h3>

    <div class="diagram">
      <div class="diagram-title">Risk Score Breakdown</div>
      <div class="flow-row" style="justify-content: space-around;">
        <div style="text-align: center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(#22c55e 0% 62%, #e2e8f0 62% 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
            <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18pt;">62%</div>
          </div>
          <p style="margin-top: 10px; font-weight: 600;">Current Risk</p>
        </div>
        <div style="flex: 1; max-width: 300px;">
          <p><strong>Factors included:</strong></p>
          <ul style="font-size: 10pt;">
            <li>Overdue actions count</li>
            <li>Near-miss reporting rate</li>
            <li>Trend direction (rising/falling)</li>
            <li>Close-out rate</li>
            <li>Reporter engagement</li>
          </ul>
        </div>
      </div>
    </div>

    <h3>What-If Simulator</h3>
    <p>Test different scenarios to see how changes would affect your risk score:</p>

    <div class="diagram">
      <div class="diagram-title">Simulation Example</div>
      <div class="flow">
        <div class="flow-row">
          <div class="flow-box gray">Current: 5 Overdue Actions</div>
          <div class="flow-arrow">→</div>
          <div class="flow-box orange">Simulate: Close All Overdue</div>
          <div class="flow-arrow">→</div>
          <div class="flow-box green">Risk: 62% → 48%</div>
        </div>
      </div>
    </div>

    <p>Use this to prioritize actions that will have the biggest impact on safety performance.</p>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 9</span>
    </div>
  </div>

  <!-- Section 7: File Management -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">07</span>
      <div>
        <div class="section-title">File Management</div>
        <div class="section-subtitle">Managing Your Imported Data</div>
      </div>
    </div>

    <h3>File Manager Overview</h3>
    <p>The File Manager shows all Excel files you've imported, with options to manage them.</p>

    <div class="diagram">
      <div class="diagram-title">File Information Displayed</div>
      <table>
        <tr>
          <th>Field</th>
          <th>Description</th>
        </tr>
        <tr>
          <td>File Name</td>
          <td>Original name of the Excel file</td>
        </tr>
        <tr>
          <td>Records</td>
          <td>Number of observations from this file</td>
        </tr>
        <tr>
          <td>Imported</td>
          <td>Date and time the file was uploaded</td>
        </tr>
        <tr>
          <td>Size</td>
          <td>File size (KB or MB)</td>
        </tr>
      </table>
    </div>

    <h3>Actions You Can Take</h3>

    <div class="feature-grid">
      <div class="feature-card">
        <h5>Replace File</h5>
        <p>Upload an updated version of the same file. Old records are removed and replaced with new ones.</p>
      </div>
      <div class="feature-card">
        <h5>Delete File</h5>
        <p>Remove a file and all its records. Useful for cleaning up test imports.</p>
      </div>
      <div class="feature-card">
        <h5>View Timeline</h5>
        <p>Visual chart showing when each file was imported and how much data it contains.</p>
      </div>
      <div class="feature-card">
        <h5>Batch Import</h5>
        <p>Upload multiple files at once to quickly load historical data.</p>
      </div>
    </div>

    <h3>Data Timeline Visualization</h3>
    <p>The Timeline tab shows your imported files as horizontal bars:</p>

    <ul>
      <li><strong>Bar length</strong> = Date range of observations in that file</li>
      <li><strong>Bar color</strong> = Record density (darker = more records per day)</li>
      <li><strong>Green dot</strong> = When the file was imported</li>
    </ul>

    <div class="info-box warning">
      <div class="info-box-title">Warning: Deleting Files</div>
      <p>When you delete a file, ALL observations from that file are permanently removed. This cannot be undone. Export your data first if you need a backup.</p>
    </div>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 10</span>
    </div>
  </div>

  <!-- Section 8: Reports & Export -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">08</span>
      <div>
        <div class="section-title">Reports & Export</div>
        <div class="section-subtitle">Sharing Your Safety Data</div>
      </div>
    </div>

    <h3>Export Options</h3>
    <p>Share your safety insights with stakeholders in various formats:</p>

    <div class="diagram">
      <div class="diagram-title">Available Export Formats</div>
      <div class="flow-row" style="justify-content: space-around;">
        <div class="flow-box" style="flex-direction: column; padding: 20px;">
          <span style="font-size: 24pt; margin-bottom: 8px;">📄</span>
          <span>PDF Report</span>
        </div>
        <div class="flow-box purple" style="flex-direction: column; padding: 20px;">
          <span style="font-size: 24pt; margin-bottom: 8px;">📊</span>
          <span>PowerPoint</span>
        </div>
        <div class="flow-box green" style="flex-direction: column; padding: 20px;">
          <span style="font-size: 24pt; margin-bottom: 8px;">💾</span>
          <span>JSON Backup</span>
        </div>
      </div>
    </div>

    <h3>PDF Export</h3>
    <p>Creates a multi-page PDF of the entire dashboard, including:</p>
    <ul>
      <li>All KPI cards with current values</li>
      <li>Charts and visualizations</li>
      <li>Current filter settings noted</li>
    </ul>

    <h3>PowerPoint Export</h3>
    <p>Generates a presentation with individual slides for:</p>
    <ul>
      <li>Executive summary slide</li>
      <li>Each chart as a separate slide</li>
      <li>Ready for management presentations</li>
    </ul>

    <h3>JSON Data Backup</h3>
    <p>Downloads all your data as a JSON file for:</p>
    <ul>
      <li>Backup before making changes</li>
      <li>Migration to another system</li>
      <li>Data analysis in other tools</li>
    </ul>

    <div class="info-box tip">
      <div class="info-box-title">Best Practice</div>
      <p>Export a JSON backup regularly (weekly or monthly) to ensure you don't lose data. Store backups in a safe location.</p>
    </div>

    <h3>How to Export</h3>
    <ol>
      <li>Go to the <strong>Dashboard</strong> page</li>
      <li>Click the <strong>Export</strong> button (top right)</li>
      <li>Choose your format (PDF or PowerPoint)</li>
      <li>Wait for the file to generate</li>
      <li>File will automatically download</li>
    </ol>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 11</span>
    </div>
  </div>

  <!-- Section 9: Quick Reference -->
  <div class="page">
    <div class="section-header">
      <span class="section-number">09</span>
      <div>
        <div class="section-title">Quick Reference</div>
        <div class="section-subtitle">At-a-Glance Guide</div>
      </div>
    </div>

    <h3>Navigation Map</h3>

    <div class="diagram">
      <div class="diagram-title">Application Structure</div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; font-size: 9pt;">
        <div class="flow-box" style="min-width: auto;">Dashboard<br><span style="opacity: 0.7; font-size: 8pt;">Main Overview</span></div>
        <div class="flow-box purple" style="min-width: auto;">Data Quality<br><span style="opacity: 0.7; font-size: 8pt;">Fix Issues</span></div>
        <div class="flow-box orange" style="min-width: auto;">Safety Outlook<br><span style="opacity: 0.7; font-size: 8pt;">Trends</span></div>
        <div class="flow-box green" style="min-width: auto;">Predictive<br><span style="opacity: 0.7; font-size: 8pt;">AI Insights</span></div>
        <div class="flow-box gray" style="min-width: auto;">File Manager<br><span style="opacity: 0.7; font-size: 8pt;">Manage Data</span></div>
        <div class="flow-box" style="min-width: auto; background: #475569;">Import<br><span style="opacity: 0.7; font-size: 8pt;">Upload Excel</span></div>
      </div>
    </div>

    <h3>Common Tasks</h3>

    <table>
      <tr>
        <th>I Want To...</th>
        <th>Go To...</th>
        <th>Then...</th>
      </tr>
      <tr>
        <td>See overall safety status</td>
        <td>Dashboard</td>
        <td>Review KPI cards at top</td>
      </tr>
      <tr>
        <td>Upload new data</td>
        <td>Import</td>
        <td>Follow the 4-step wizard</td>
      </tr>
      <tr>
        <td>Find data problems</td>
        <td>Data Quality</td>
        <td>Click issue cards to drill down</td>
      </tr>
      <tr>
        <td>See what's trending</td>
        <td>Safety Outlook</td>
        <td>Select Hazards view</td>
      </tr>
      <tr>
        <td>Get recommendations</td>
        <td>Predictive Analytics</td>
        <td>Expand Recommendations section</td>
      </tr>
      <tr>
        <td>Delete old data</td>
        <td>File Manager</td>
        <td>Click trash icon on file row</td>
      </tr>
      <tr>
        <td>Export a report</td>
        <td>Dashboard</td>
        <td>Click Export button</td>
      </tr>
      <tr>
        <td>Filter by contractor</td>
        <td>Any page</td>
        <td>Use filter bar at top</td>
      </tr>
    </table>

    <h3>Status Colors</h3>
    <div class="flow-row" style="justify-content: flex-start; gap: 20px; flex-wrap: wrap;">
      <span><span class="badge green">Green</span> = Good / On Target</span>
      <span><span class="badge amber">Amber</span> = Warning / Attention</span>
      <span><span class="badge red">Red</span> = Critical / Urgent</span>
      <span><span class="badge blue">Blue</span> = Info / Neutral</span>
    </div>

    <h3>Keyboard Shortcuts</h3>
    <table>
      <tr>
        <td><strong>Esc</strong></td>
        <td>Close any open modal/popup</td>
      </tr>
      <tr>
        <td><strong>Click outside modal</strong></td>
        <td>Close the modal</td>
      </tr>
      <tr>
        <td><strong>Scroll</strong></td>
        <td>Navigate long tables and charts</td>
      </tr>
    </table>

    <div class="info-box" style="margin-top: 30px;">
      <div class="info-box-title">Need Help?</div>
      <p>Contact your system administrator or refer to the technical documentation for advanced features and troubleshooting.</p>
    </div>

    <div class="page-footer">
      <span>Safety Observation Dashboard</span>
      <span>Page 12</span>
    </div>
  </div>

  <!-- Back Cover -->
  <div class="page cover" style="justify-content: flex-end; padding-bottom: 60px;">
    <div style="text-align: center;">
      <div class="cover-logo" style="margin-bottom: 30px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <h2 style="font-size: 24pt; margin-bottom: 20px;">Safety Observation Dashboard</h2>
      <p style="opacity: 0.8; font-size: 12pt; max-width: 350px; margin: 0 auto; line-height: 1.8;">
        Building a proactive safety culture through data-driven insights and continuous improvement.
      </p>
    </div>
    <div class="cover-meta" style="padding-top: 40px;">
      <p>Enterprise Safety Management System</p>
      <p style="opacity: 0.6;">Document Version 1.0 | January 2026</p>
    </div>
  </div>
</body>
</html>
`;

async function generatePDF() {
  console.log('Starting PDF generation...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set content
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0'
  });

  // Generate PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });

  // Save PDF
  const outputPath = path.join(__dirname, 'Safety-Dashboard-User-Guide.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`PDF generated successfully: ${outputPath}`);

  await browser.close();
}

generatePDF().catch(console.error);
