// Test file for sentence parser
import {
  parseSentence,
  analyzeForRootCause,
  extractActor,
  extractObject,
  extractAction,
  GRAMMATICAL_WEIGHTS
} from './src/utils/sentenceParser.js';

import {
  HAZARD_PATTERNS,
  HAZARD_PHRASES,
  CATEGORY_PRIORITY,
  MAJOR_HAZARDS
} from './src/utils/constants.js';

// Simple classification function for testing
const classifyWithSentenceAwareness = (text) => {
  if (!text || text.length < 5) {
    return { category: null, confidence: 0, isMainSubject: false };
  }

  const parsed = parseSentence(text);
  const matches = [];

  for (const kwPart of parsed.keywords) {
    const partText = kwPart.text.toLowerCase();

    for (const category of CATEGORY_PRIORITY) {
      const patterns = HAZARD_PATTERNS[category] || [];
      const phrases = HAZARD_PHRASES[category] || [];

      for (const phrase of phrases) {
        if (partText.includes(phrase.toLowerCase())) {
          matches.push({
            keyword: phrase,
            category,
            role: kwPart.role,
            weight: kwPart.weight,
            confidence: parsed.confidence * kwPart.weight,
            isMainSubject: kwPart.role === 'SUBJECT',
            isLocation: kwPart.role === 'LOCATION',
            matchType: 'phrase'
          });
        }
      }

      for (const keyword of patterns) {
        if (partText.includes(keyword.toLowerCase())) {
          matches.push({
            keyword,
            category,
            role: kwPart.role,
            weight: kwPart.weight,
            confidence: parsed.confidence * kwPart.weight,
            isMainSubject: kwPart.role === 'SUBJECT',
            isLocation: kwPart.role === 'LOCATION',
            matchType: 'keyword'
          });
        }
      }
    }
  }

  if (matches.length === 0) {
    return { category: null, confidence: 0, isMainSubject: false, parsed };
  }

  matches.sort((a, b) => {
    if (a.matchType === 'phrase' && b.matchType !== 'phrase') return -1;
    if (b.matchType === 'phrase' && a.matchType !== 'phrase') return 1;
    return b.confidence - a.confidence;
  });

  const bestMatch = matches[0];
  const hasConflict = matches.length > 1 &&
    matches[0].category !== matches[1].category &&
    Math.abs(matches[0].confidence - matches[1].confidence) < 0.2;

  if (hasConflict) {
    const subjectMatch = matches.find(m => m.isMainSubject);
    if (subjectMatch) {
      return {
        category: subjectMatch.category,
        confidence: subjectMatch.confidence,
        isMainSubject: true,
        keyword: subjectMatch.keyword,
        role: subjectMatch.role,
        alternativeCategory: matches.find(m => m !== subjectMatch)?.category,
        parsed
      };
    }
  }

  return {
    category: bestMatch.category,
    confidence: bestMatch.confidence,
    isMainSubject: bestMatch.isMainSubject,
    keyword: bestMatch.keyword,
    role: bestMatch.role,
    parsed
  };
};

const examples = [
  'poor housekeeping on a welfare',
  'worker fell from scaffold due to missing harness',
  'exposed rebar at excavation site',
  'operator struck by falling object',
  'no drinking water at welfare facility',
  'dust observed during excavation work',
  'electrician working on live panel without isolation',
  'forklift operator reversing without banksman',
  'scaffolder working at height without harness',
  'damaged ladder found near the canteen',
  'oil spill on the workshop floor causing slip hazard',
  'caught in between rotating machinery',
  'worker crushed by falling load',
  'missing guard on conveyor belt',
];

console.log('='.repeat(90));
console.log('SENTENCE-AWARE HAZARD CLASSIFICATION TEST');
console.log('='.repeat(90));

examples.forEach((text, i) => {
  console.log('\n' + '-'.repeat(90));
  console.log(`Example ${i+1}: "${text}"`);
  console.log('-'.repeat(90));

  const parsed = parseSentence(text);
  const classification = classifyWithSentenceAwareness(text.toLowerCase());

  console.log('');
  console.log('SENTENCE BREAKDOWN:');
  console.log(`  WHO (Actor):    ${parsed.actor || '(none)'} ${parsed.actorType ? `[${parsed.actorType}]` : ''}`);
  console.log(`  WHAT (Object):  ${parsed.object || '(none)'} ${parsed.objectType ? `[${parsed.objectType}]` : ''}`);
  console.log(`  ACTION:         ${parsed.action || '(none)'} ${parsed.actionType ? `[${parsed.actionType}]` : ''}`);
  console.log(`  WHERE:          ${parsed.location || '(none)'}`);
  console.log(`  MAIN SUBJECT:   ${parsed.mainSubject || '(none)'}`);

  console.log('');
  console.log('KEYWORD WEIGHTS:');
  parsed.keywords.forEach(k => {
    console.log(`  - "${k.text}" [${k.role}] = ${Math.round(k.weight * 100)}%`);
  });

  console.log('');
  console.log('CLASSIFICATION RESULT:');
  console.log(`  Category:       ${classification.category || 'Work Environment'}`);
  console.log(`  Matched:        "${classification.keyword || '(none)'}"`);
  console.log(`  Role:           ${classification.role || '(none)'}`);
  console.log(`  Confidence:     ${classification.confidence ? Math.round(classification.confidence * 100) + '%' : '0%'}`);
  console.log(`  Is Subject:     ${classification.isMainSubject ? 'YES (high priority)' : 'NO'}`);
  if (classification.alternativeCategory) {
    console.log(`  Alternative:    ${classification.alternativeCategory} (lower weight, rejected)`);
  }

  console.log('');
  console.log(`  >>> FINAL: ${classification.category || 'Work Environment'} <<<`);
});

console.log('\n' + '='.repeat(90));
console.log('TEST COMPLETE');
console.log('='.repeat(90));
