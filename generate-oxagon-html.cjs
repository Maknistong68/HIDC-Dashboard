const fs = require('fs');
const path = require('path');

// OXAGON Brand Colors
const COLORS = {
  primary: '#009CBD',
  primaryDark: '#007B9A',
  dark: '#13100D',
  white: '#FFFFFF',
  darkGray: '#37424A',
  lightGray: '#D1D4D3',
  lightBg: '#F5F5F5',
  green: '#006B44',
  orange: '#F18825',
  red: '#E0403F',
};

// Slide content
const slides = [
  {
    id: 1,
    title: 'HIDC Dashboard',
    subtitle: 'Hazard Intelligence & Data Control',
    content: 'Transforming EHSS Data into Actionable Safety Intelligence',
    type: 'title',
  },
  {
    id: 2,
    title: 'The Challenge',
    content: [
      'Manual tracking of 1000s of EHSS observations',
      'Delayed hazard identification and response',
      'Disconnected data across multiple systems',
      'No real-time visibility into safety trends',
      'Time-consuming report generation',
    ],
    type: 'bullets',
  },
  {
    id: 3,
    title: 'Solution Overview',
    content: [
      '<strong>Hazard Intelligence</strong> - AI-powered trend analysis and risk prediction',
      '<strong>Data Control</strong> - Unified data management with quality assurance',
      '<strong>Smart Settings</strong> - Customizable risk thresholds and alerts',
      '<strong>Export Center</strong> - One-click professional reports',
    ],
    type: 'bullets',
  },
  {
    id: 4,
    title: 'Dashboard at a Glance',
    content: 'Real-time KPIs, interactive charts, and actionable insights all in one view',
    features: [
      'Incident Pyramid with Heinrich Ratios',
      'Trend Analysis with Smart Forecasting',
      'Category Breakdown Charts',
      'Severity Distribution Metrics',
    ],
    type: 'feature',
  },
  {
    id: 5,
    title: 'Hazard Intelligence',
    subtitle: 'Star Feature',
    content: [
      'Predictive trend analysis using statistical modeling',
      'Automatic pattern detection across categories',
      'Risk scoring with customizable thresholds',
      'Smart alerts for emerging hazard patterns',
      'Heinrich ratio compliance monitoring',
    ],
    type: 'star',
  },
  {
    id: 6,
    title: 'Interactive Analytics',
    content: [
      'Click any chart element to drill down',
      'Dynamic filtering across all visualizations',
      'Time-based comparisons (day, week, month, year)',
      'Export individual charts or full reports',
    ],
    type: 'bullets',
  },
  {
    id: 7,
    title: 'Data Control',
    subtitle: 'Star Feature',
    content: [
      'Spell-check with 800+ industry terms dictionary',
      'Duplicate detection and resolution',
      'Missing data identification',
      'Category validation and standardization',
      'Quality score tracking over time',
    ],
    type: 'star',
  },
  {
    id: 8,
    title: 'Smart Settings',
    content: [
      'Customize Heinrich pyramid ratios',
      'Set severity color thresholds',
      'Configure alert triggers',
      'Manage data sources and refresh rates',
      'User role and permission management',
    ],
    type: 'bullets',
  },
  {
    id: 9,
    title: 'Export & Mobile',
    content: [
      'PDF reports with professional formatting',
      'Excel exports for further analysis',
      'Mobile-responsive design',
      'Offline capability (PWA)',
      'Scheduled automated reports',
    ],
    type: 'bullets',
  },
  {
    id: 10,
    title: 'Why Choose HIDC?',
    comparison: [
      { feature: 'Real-time Analytics', hidc: true, manual: false },
      { feature: 'Predictive Insights', hidc: true, manual: false },
      { feature: 'Data Quality Checks', hidc: true, manual: false },
      { feature: 'One-click Reports', hidc: true, manual: false },
      { feature: 'Mobile Access', hidc: true, manual: false },
      { feature: 'Setup Time', hidc: 'Minutes', manual: 'Weeks' },
    ],
    type: 'comparison',
  },
  {
    id: 11,
    title: 'Why Approve?',
    content: [
      '<strong>Reduce Incidents</strong> - Early hazard detection prevents accidents',
      '<strong>Save Time</strong> - Automated reporting saves 10+ hours/week',
      '<strong>Ensure Compliance</strong> - Built-in regulatory alignment',
      '<strong>Data-Driven Decisions</strong> - Real insights, not guesswork',
    ],
    type: 'bullets',
  },
  {
    id: 12,
    title: 'Ready to Transform EHSS?',
    subtitle: 'Next Steps',
    content: [
      'Approve dashboard deployment',
      'Connect existing data sources',
      'Configure team access',
      'Start seeing insights immediately',
    ],
    cta: 'Let\'s Make Safety Smarter',
    type: 'cta',
  },
];

// Hexagon position transforms for each slide (40% smaller)
const hexPositions = [
  'translate(-50%, -50%) scale(0.8)',           // 1: Center
  'translate(-30%, -60%) scale(0.8) rotate(5deg)', // 2: Top-left area
  'translate(-70%, -60%) scale(0.8) rotate(-5deg)', // 3: Top-right area
  'translate(-20%, -50%) scale(0.8)',            // 4: Center-left
  'translate(-80%, -50%) scale(0.8)',           // 5: Center-right
  'translate(-30%, -40%) scale(0.8) rotate(10deg)', // 6: Bottom-left
  'translate(-70%, -40%) scale(0.8) rotate(-10deg)', // 7: Bottom-right
  'translate(-50%, -70%) scale(0.8)',           // 8: Top-center
  'translate(-50%, -30%) scale(0.8)',            // 9: Bottom-center
  'translate(-50%, -50%) scale(1) rotate(15deg)', // 10: Rotated
  'translate(-50%, -50%) scale(1) rotate(-15deg)', // 11: Opposite rotation
  'translate(-50%, -50%) scale(1.2)',           // 12: Zoomed center
];

function generateSlideContent(slide) {
  switch (slide.type) {
    case 'title':
      return `
        <div class="slide-content title-slide">
          <h1>${slide.title}</h1>
          <h2>${slide.subtitle}</h2>
          <p class="tagline">${slide.content}</p>
          <div class="brand">OXAGON EHSS</div>
        </div>
      `;

    case 'bullets':
      return `
        <div class="slide-content">
          <h1>${slide.title}</h1>
          ${slide.subtitle ? `<h2>${slide.subtitle}</h2>` : ''}
          <ul class="bullet-list">
            ${slide.content.map(item => `<li>${item}</li>`).join('\n            ')}
          </ul>
        </div>
      `;

    case 'star':
      return `
        <div class="slide-content star-slide">
          <div class="star-badge">★ STAR FEATURE</div>
          <h1>${slide.title}</h1>
          <ul class="bullet-list">
            ${slide.content.map(item => `<li>${item}</li>`).join('\n            ')}
          </ul>
        </div>
      `;

    case 'feature':
      return `
        <div class="slide-content">
          <h1>${slide.title}</h1>
          <p class="description">${slide.content}</p>
          <div class="feature-grid">
            ${slide.features.map(f => `<div class="feature-item">${f}</div>`).join('\n            ')}
          </div>
        </div>
      `;

    case 'comparison':
      return `
        <div class="slide-content">
          <h1>${slide.title}</h1>
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>HIDC Dashboard</th>
                <th>Manual Process</th>
              </tr>
            </thead>
            <tbody>
              ${slide.comparison.map(row => `
              <tr>
                <td>${row.feature}</td>
                <td class="${row.hidc === true ? 'yes' : ''}">${row.hidc === true ? '✓' : row.hidc}</td>
                <td class="${row.manual === false ? 'no' : ''}">${row.manual === false ? '✗' : row.manual}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;

    case 'cta':
      return `
        <div class="slide-content cta-slide">
          <h1>${slide.title}</h1>
          <h2>${slide.subtitle}</h2>
          <ol class="step-list">
            ${slide.content.map((item, i) => `<li><span class="step-num">${i + 1}</span>${item}</li>`).join('\n            ')}
          </ol>
          <div class="cta-button">${slide.cta}</div>
        </div>
      `;

    default:
      return `<div class="slide-content"><h1>${slide.title}</h1></div>`;
  }
}

function generateHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HIDC Dashboard - OXAGON EHSS</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${COLORS.dark};
      color: ${COLORS.white};
      overflow: hidden;
    }

    .presentation {
      width: 100vw;
      height: 100vh;
      position: relative;
    }

    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      overflow: hidden;
      background: ${COLORS.dark};
    }

    .slide.active {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Hexagon Background Container */
    .hexagon-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    }

    /* The hexagon SVG - 40% of original size */
    .hexagon-bg {
      position: absolute;
      width: 60vmax;
      height: 60vmax;
      top: 50%;
      left: 50%;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Position variations */
    ${hexPositions.map((pos, i) => `
    .slide-${i + 1} .hexagon-bg {
      transform: ${pos};
    }`).join('')}

    /* Slide Content */
    .slide-content {
      position: relative;
      z-index: 10;
      max-width: 900px;
      padding: 60px;
      text-align: center;
    }

    h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 20px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    h2 {
      font-size: 1.8rem;
      font-weight: 400;
      color: ${COLORS.primary};
      margin-bottom: 30px;
    }

    /* Title Slide */
    .title-slide h1 {
      font-size: 5rem;
      background: linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.primary} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .title-slide .tagline {
      font-size: 1.5rem;
      color: ${COLORS.lightGray};
      margin: 30px 0;
    }

    .title-slide .brand {
      font-size: 1.2rem;
      letter-spacing: 4px;
      color: ${COLORS.primary};
      margin-top: 60px;
      font-weight: 600;
    }

    /* Bullet Lists */
    .bullet-list {
      list-style: none;
      text-align: left;
      margin: 30px 0;
    }

    .bullet-list li {
      font-size: 1.4rem;
      padding: 15px 0 15px 40px;
      position: relative;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .bullet-list li:last-child {
      border-bottom: none;
    }

    .bullet-list li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 12px;
      background: ${COLORS.primary};
      border-radius: 3px;
      transform: translateY(-50%) rotate(45deg);
    }

    /* Star Feature */
    .star-slide .star-badge {
      display: inline-block;
      background: linear-gradient(135deg, ${COLORS.orange}, ${COLORS.red});
      color: white;
      padding: 8px 24px;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 2px;
      margin-bottom: 30px;
    }

    /* Feature Grid */
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 40px;
    }

    .feature-item {
      background: rgba(0, 156, 189, 0.15);
      border: 1px solid rgba(0, 156, 189, 0.3);
      padding: 25px;
      border-radius: 12px;
      font-size: 1.1rem;
      backdrop-filter: blur(10px);
    }

    .description {
      font-size: 1.3rem;
      color: ${COLORS.lightGray};
      line-height: 1.6;
    }

    /* Comparison Table */
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
      font-size: 1.1rem;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 18px 25px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .comparison-table th {
      background: rgba(0, 156, 189, 0.2);
      font-weight: 600;
    }

    .comparison-table th:first-child,
    .comparison-table td:first-child {
      text-align: left;
    }

    .comparison-table .yes {
      color: ${COLORS.green};
      font-size: 1.5rem;
    }

    .comparison-table .no {
      color: ${COLORS.red};
      font-size: 1.5rem;
    }

    /* CTA Slide */
    .cta-slide .step-list {
      list-style: none;
      text-align: left;
      margin: 40px 0;
    }

    .cta-slide .step-list li {
      display: flex;
      align-items: center;
      font-size: 1.3rem;
      padding: 15px 0;
    }

    .cta-slide .step-num {
      width: 40px;
      height: 40px;
      background: ${COLORS.primary};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      font-weight: 600;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark});
      color: white;
      padding: 20px 50px;
      border-radius: 50px;
      font-size: 1.3rem;
      font-weight: 600;
      margin-top: 30px;
      box-shadow: 0 10px 40px rgba(0, 156, 189, 0.4);
    }

    /* Navigation */
    .nav-controls {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
      z-index: 100;
    }

    .nav-btn {
      width: 50px;
      height: 50px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      backdrop-filter: blur(10px);
    }

    .nav-btn:hover {
      background: ${COLORS.primary};
      border-color: ${COLORS.primary};
    }

    /* Slide Counter */
    .slide-counter {
      position: fixed;
      bottom: 30px;
      right: 30px;
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.5);
      z-index: 100;
    }

    /* Progress Bar */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: ${COLORS.primary};
      transition: width 0.3s ease;
      z-index: 100;
    }

    /* Keyboard hints */
    .keyboard-hints {
      position: fixed;
      bottom: 30px;
      left: 30px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.3);
      z-index: 100;
    }

    .keyboard-hints span {
      margin-right: 15px;
    }

    .keyboard-hints kbd {
      background: rgba(255, 255, 255, 0.1);
      padding: 3px 8px;
      border-radius: 4px;
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <div class="presentation">
    <div class="progress-bar" id="progressBar"></div>

    ${slides.map((slide, index) => `
    <section class="slide slide-${index + 1}${index === 0 ? ' active' : ''}" data-slide="${index + 1}">
      <div class="hexagon-container">
        <svg class="hexagon-bg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <!-- Main gradient for hexagon fill -->
            <linearGradient id="hexGradient${index + 1}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:0.25" />
              <stop offset="50%" style="stop-color:${COLORS.primaryDark};stop-opacity:0.18" />
              <stop offset="100%" style="stop-color:${COLORS.primary};stop-opacity:0.12" />
            </linearGradient>

            <!-- Glare gradient overlay -->
            <linearGradient id="glareGradient${index + 1}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:white;stop-opacity:0" />
              <stop offset="35%" style="stop-color:white;stop-opacity:0.03" />
              <stop offset="50%" style="stop-color:white;stop-opacity:0.12" />
              <stop offset="65%" style="stop-color:white;stop-opacity:0.03" />
              <stop offset="100%" style="stop-color:white;stop-opacity:0" />
            </linearGradient>

            <!-- Edge highlight -->
            <linearGradient id="edgeGlow${index + 1}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:0.5" />
              <stop offset="50%" style="stop-color:${COLORS.primary};stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:${COLORS.primary};stop-opacity:0.5" />
            </linearGradient>

            <!-- Blur filter for frosted effect -->
            <filter id="frost${index + 1}" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>

            <!-- Glow filter -->
            <filter id="glow${index + 1}" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- Main hexagon with rounded corners (OXAGON style) -->
          <path
            d="M50 2
               L91 24
               Q96 27 96 33
               L96 67
               Q96 73 91 76
               L50 98
               L9 76
               Q4 73 4 67
               L4 33
               Q4 27 9 24
               Z"
            fill="url(#hexGradient${index + 1})"
            stroke="url(#edgeGlow${index + 1})"
            stroke-width="0.3"
            filter="url(#glow${index + 1})"
          />

          <!-- Glare/shine overlay -->
          <path
            d="M50 2
               L91 24
               Q96 27 96 33
               L96 67
               Q96 73 91 76
               L50 98
               L9 76
               Q4 73 4 67
               L4 33
               Q4 27 9 24
               Z"
            fill="url(#glareGradient${index + 1})"
          />

          <!-- Inner subtle border -->
          <path
            d="M50 5
               L88 25.5
               Q92 28 92 33
               L92 67
               Q92 72 88 74.5
               L50 95
               L12 74.5
               Q8 72 8 67
               L8 33
               Q8 28 12 25.5
               Z"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            stroke-width="0.2"
          />
        </svg>
      </div>
      ${generateSlideContent(slide)}
    </section>`).join('')}

    <div class="nav-controls">
      <button class="nav-btn" id="prevBtn" onclick="prevSlide()">&#8592;</button>
      <button class="nav-btn" id="nextBtn" onclick="nextSlide()">&#8594;</button>
      <button class="nav-btn" id="fullscreenBtn" onclick="toggleFullscreen()">&#9974;</button>
    </div>

    <div class="slide-counter">
      <span id="currentSlide">1</span> / ${slides.length}
    </div>

    <div class="keyboard-hints">
      <span><kbd>&#8592;</kbd><kbd>&#8594;</kbd> Navigate</span>
      <span><kbd>F</kbd> Fullscreen</span>
      <span><kbd>1-9</kbd> Jump to slide</span>
    </div>
  </div>

  <script>
    let currentSlide = 1;
    const totalSlides = ${slides.length};

    function showSlide(n) {
      // Wrap around
      if (n > totalSlides) n = 1;
      if (n < 1) n = totalSlides;

      // Hide all slides
      document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active');
      });

      // Show target slide
      document.querySelector('.slide-' + n).classList.add('active');
      currentSlide = n;

      // Update counter
      document.getElementById('currentSlide').textContent = n;

      // Update progress bar
      const progress = ((n - 1) / (totalSlides - 1)) * 100;
      document.getElementById('progressBar').style.width = progress + '%';
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
        case 'Home':
          showSlide(1);
          break;
        case 'End':
          showSlide(totalSlides);
          break;
        default:
          // Number keys 1-9 for direct slide access
          if (e.key >= '1' && e.key <= '9') {
            const num = parseInt(e.key);
            if (num <= totalSlides) {
              showSlide(num);
            }
          }
          // 0 key for slide 10, - for 11, = for 12
          if (e.key === '0' && totalSlides >= 10) showSlide(10);
          if (e.key === '-' && totalSlides >= 11) showSlide(11);
          if (e.key === '=' && totalSlides >= 12) showSlide(12);
      }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSlide(); // Swipe left = next
        } else {
          prevSlide(); // Swipe right = prev
        }
      }
    }

    // Click to advance (except on buttons)
    document.querySelector('.presentation').addEventListener('click', (e) => {
      if (!e.target.closest('.nav-controls')) {
        const x = e.clientX;
        const width = window.innerWidth;
        if (x > width / 2) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    });

    // Initialize
    showSlide(1);
  </script>
</body>
</html>`;
}

// Generate and save the HTML file
const htmlContent = generateHTML();
const outputPath = 'C:\\Users\\Mark Ronnel Nieva\\Desktop\\HIDC-OXAGON-Presentation.html';

fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log('HIDC OXAGON HTML Presentation generated successfully!');
console.log('Output: ' + outputPath);
console.log('');
console.log('Features:');
console.log('  - 12 slides with frosted hexagon backgrounds');
console.log('  - Each slide shows different hexagon position/angle');
console.log('  - OXAGON-style rounded hexagon with glare effect');
console.log('  - Keyboard navigation (arrows, F for fullscreen, 1-9 for slides)');
console.log('  - Touch/swipe support for mobile');
console.log('  - Click left/right side to navigate');
console.log('  - Progress bar at top');
console.log('');
console.log('Open the HTML file in a browser to view the presentation.');
