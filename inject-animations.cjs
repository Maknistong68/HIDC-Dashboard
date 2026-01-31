/**
 * PPTX Animation Injection Script
 *
 * This script post-processes a PPTX file to add:
 * - Fade transitions between slides
 * - Entrance animations for key elements
 *
 * Since pptxgenjs doesn't support animations natively,
 * we inject the XML directly into the slide files.
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Configuration
const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
const INPUT_FILE = `C:\\Users\\Mark Ronnel Nieva\\Desktop\\HIDC-OXAGON-Enhanced-${timestamp}.pptx`;
const OUTPUT_FILE = `C:\\Users\\Mark Ronnel Nieva\\Desktop\\HIDC-OXAGON-Final-${timestamp}.pptx`;
const TEMP_DIR = path.join(__dirname, 'temp-pptx-extract');

// Transition XML for fade effect (250ms)
const TRANSITION_XML = `<p:transition spd="med" advTm="0" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:fade/></p:transition>`;

// Animation timing XML template for entrance animations
function createAnimationXml(shapeId, delay = 0, type = 'fade') {
  const animations = {
    fade: `
      <p:anim calcmode="lin" valueType="num">
        <p:cBhvr>
          <p:cTn id="1" dur="500" fill="hold">
            <p:stCondLst>
              <p:cond delay="${delay}"/>
            </p:stCondLst>
          </p:cTn>
          <p:tgtEl>
            <p:spTgt spid="${shapeId}"/>
          </p:tgtEl>
          <p:attrNameLst>
            <p:attrName>style.opacity</p:attrName>
          </p:attrNameLst>
        </p:cBhvr>
        <p:tavLst>
          <p:tav tm="0">
            <p:val><p:fltVal val="0"/></p:val>
          </p:tav>
          <p:tav tm="100000">
            <p:val><p:fltVal val="1"/></p:val>
          </p:tav>
        </p:tavLst>
      </p:anim>`,
    flyIn: `
      <p:anim calcmode="lin" valueType="num">
        <p:cBhvr>
          <p:cTn id="1" dur="400" fill="hold">
            <p:stCondLst>
              <p:cond delay="${delay}"/>
            </p:stCondLst>
          </p:cTn>
          <p:tgtEl>
            <p:spTgt spid="${shapeId}"/>
          </p:tgtEl>
          <p:attrNameLst>
            <p:attrName>ppt_y</p:attrName>
          </p:attrNameLst>
        </p:cBhvr>
        <p:tavLst>
          <p:tav tm="0">
            <p:val><p:strVal val="#ppt_y+0.1"/></p:val>
          </p:tav>
          <p:tav tm="100000">
            <p:val><p:strVal val="#ppt_y"/></p:val>
          </p:tav>
        </p:tavLst>
      </p:anim>`,
  };
  return animations[type] || animations.fade;
}

// Clean up temp directory
function cleanup() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

// Add transition to slide XML
function addTransitionToSlide(slideXml) {
  // Check if transition already exists
  if (slideXml.includes('<p:transition')) {
    return slideXml;
  }

  // Find the closing </p:sld> tag and insert transition before it
  // Also need to handle </p:cSld> for the content slide part

  // Insert after <p:cSld> closing but before </p:sld>
  const cSldCloseIndex = slideXml.lastIndexOf('</p:cSld>');
  if (cSldCloseIndex !== -1) {
    const insertPosition = cSldCloseIndex + '</p:cSld>'.length;
    const beforeInsert = slideXml.substring(0, insertPosition);
    const afterInsert = slideXml.substring(insertPosition);

    // Simplified transition XML that should work
    const simpleTransition = '\n  <p:transition spd="med"><p:fade/></p:transition>';

    return beforeInsert + simpleTransition + afterInsert;
  }

  return slideXml;
}

// Main injection function
async function injectAnimations() {
  console.log('');
  console.log('  ================================================================');
  console.log('  PPTX ANIMATION INJECTION');
  console.log('  ================================================================');
  console.log('');

  // Check if input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    console.log(`  ERROR: Input file not found: ${INPUT_FILE}`);
    console.log('  Please run generate-oxagon-final.cjs first to create the presentation.');
    return;
  }

  try {
    cleanup();

    console.log('  [1/4] Extracting PPTX...');
    const zip = new AdmZip(INPUT_FILE);
    zip.extractAllTo(TEMP_DIR, true);

    console.log('  [2/4] Injecting transitions...');
    const slidesDir = path.join(TEMP_DIR, 'ppt', 'slides');
    const slideFiles = fs.readdirSync(slidesDir).filter(f => f.startsWith('slide') && f.endsWith('.xml'));

    let modifiedCount = 0;
    for (const slideFile of slideFiles) {
      const slidePath = path.join(slidesDir, slideFile);
      let slideXml = fs.readFileSync(slidePath, 'utf8');

      const originalLength = slideXml.length;
      slideXml = addTransitionToSlide(slideXml);

      if (slideXml.length !== originalLength) {
        fs.writeFileSync(slidePath, slideXml, 'utf8');
        modifiedCount++;
        console.log(`       + Added fade transition to ${slideFile}`);
      }
    }

    console.log(`  [3/4] Modified ${modifiedCount} slides`);

    console.log('  [4/4] Repackaging PPTX...');
    const outputZip = new AdmZip();

    // Add all files from temp directory maintaining structure
    function addFolderToZip(folderPath, zipPath = '') {
      const items = fs.readdirSync(folderPath);
      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const itemZipPath = zipPath ? `${zipPath}/${item}` : item;

        if (fs.statSync(itemPath).isDirectory()) {
          addFolderToZip(itemPath, itemZipPath);
        } else {
          const content = fs.readFileSync(itemPath);
          outputZip.addFile(itemZipPath.replace(/\\/g, '/'), content);
        }
      }
    }

    addFolderToZip(TEMP_DIR);
    outputZip.writeZip(OUTPUT_FILE);

    cleanup();

    console.log('');
    console.log('  ================================================================');
    console.log('  ANIMATION INJECTION COMPLETE');
    console.log('  ================================================================');
    console.log('');
    console.log(`  Input:  HIDC-OXAGON-Presentation.pptx`);
    console.log(`  Output: HIDC-OXAGON-Animated.pptx`);
    console.log(`  Location: Desktop`);
    console.log('');
    console.log('  Enhancements added:');
    console.log('    + Fade transitions between all slides');
    console.log('');
    console.log('  Note: Open in PowerPoint to see transitions in Slideshow mode.');
    console.log('');

  } catch (err) {
    console.error('  ERROR:', err.message);
    cleanup();
  }
}

injectAnimations();
