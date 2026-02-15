# Event Dashboard

> **"Ensuring hazards are properly identified through data accuracy"**

Event Dashboard is an internal HSE (Health, Safety, and Environment) observation tracking tool with two core functions:

1. **Hazard Identification** - Properly categorize and track safety observations
2. **Data Control** - Ensure data quality and accuracy for meaningful insights

---

## Features

### Hazard Identification
- **Incident Pyramid Visualization** - View observations by severity (LTI, MTI, FAC, Near Miss, Unsafe Act/Condition, Positive)
- **Trend Analysis** - Monthly observation trends with open/closed breakdown
- **Top Hazards & Observers** - Ranked lists with drill-down capability
- **Hazards Heatmap** - Visual matrix of hazard types by month
- **All Records Table** - Searchable, sortable list of all observations

### Data Control
- **Data Quality Score** - Overall rating (0-100) based on multiple metrics
- **Quality KPIs** - Categorization rate, description quality, near miss rate, coverage, active reporters
- **Quality Trend Chart** - Track improvement over time with target lines
- **Records Needing Attention** - Flagged items: short descriptions, duplicates, misclassified hazards
- **Reporter & Contractor Analytics** - Performance comparison and drill-down
- **Import Functionality** - Import Excel data directly from the Data Control page

### Export Capabilities
- **PDF Export** - A3 format report with summary and charts
- **PowerPoint Export** - Presentation-ready slides for HSE meetings

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

---

## Usage

### Importing Data
1. Prepare your Excel file with observation data (Event report format)
2. Click "Import" from either the Hazard Identification or Data Control page
3. Map columns as needed (auto-mapping is available for common headers)
4. Review and confirm the import

### Navigating the App
- **Hazard Identification** - Main dashboard with visualizations and all records
- **Data Control** - Quality metrics, flagged items, and import functionality

### Filtering Data
- Use the filter bar to narrow by Contractor, Site, and Date Range
- Click "This Month" for quick current month filtering
- Use "Clear Data" to remove all imported data

---

## Data Storage

All data is stored locally in your browser's localStorage:
- `hidc_incidents` - Observation records
- `hidc_projects` - Project information
- `hidc_settings` - Application preferences

**No data is transmitted to any external server.** The application works fully offline.

---

## Vision

Event Dashboard was built to solve a common problem in HSE management: poor data quality leads to poor insights. By combining hazard identification with data control, organizations can:

1. Ensure every observation has proper categorization
2. Identify patterns through quality data
3. Track and improve data quality over time
4. Make informed safety decisions based on accurate information

---

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **xlsx** - Excel file parsing
- **jsPDF** - PDF generation
- **PptxGenJS** - PowerPoint generation

---

## License

Internal use only. All rights reserved.

---

## Support

For questions or issues, contact the Event Dashboard development team.
