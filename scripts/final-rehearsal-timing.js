#!/usr/bin/env node

/**
 * Final Rehearsal Timing Script - Task 10.3
 * 
 * This script provides an interactive timing tool for the final rehearsal.
 * It helps track timing for each section and validates the 10-minute target.
 * 
 * Usage: node scripts/final-rehearsal-timing.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// Rehearsal structure
const sections = [
  { name: 'Introduction', speaker: 'Yokesh', target: 60, backup: 'Abhay Harithas' },
  { name: 'Solution Overview', speaker: 'Abhay Harithas', target: 120, backup: 'Yokesh' },
  { name: 'Technical Architecture', speaker: 'Abhay Harithas', target: 120, backup: 'Yokesh' },
  { name: 'Live Demo', speaker: 'Abhay Harithas', target: 300, backup: 'Yokesh' }
];

const demoFeatures = [
  { name: 'Authentication (Google OAuth)', target: 30 },
  { name: 'AI Health Assistant - Query 1', target: 45 },
  { name: 'AI Health Assistant - Query 2', target: 45 },
  { name: 'Health Metrics Dashboard', target: 60 },
  { name: 'AI Nutrition Plan', target: 60 },
  { name: 'Community Features', target: 45 },
  { name: 'Demo Conclusion', target: 15 }
];

// Rehearsal results
const results = {
  timestamp: new Date().toISOString(),
  rehearsalNumber: null,
  sections: [],
  demoFeatures: [],
  totalTime: 0,
  targetTime: 600, // 10 minutes
  status: 'pending',
  notes: []
};

/**
 * Log colored message
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create readline interface
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask question and get answer
 */
function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Time a section
 */
async function timeSection(rl, section) {
  log(`\n${'='.repeat(60)}`, colors.bold);
  log(`SECTION: ${section.name}`, colors.bold + colors.cyan);
  log(`Speaker: ${section.speaker} (Backup: ${section.backup})`, colors.cyan);
  log(`Target Time: ${formatTime(section.target)}`, colors.yellow);
  log('='.repeat(60), colors.bold);
  
  await ask(rl, `\nPress ENTER when ${section.speaker} starts speaking...`);
  
  const startTime = Date.now();
  log(`\n⏱️  Timer started for ${section.name}...`, colors.green);
  log(`Target: ${formatTime(section.target)}`, colors.yellow);
  
  await ask(rl, `\nPress ENTER when ${section.speaker} finishes...`);
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  const difference = duration - section.target;
  
  // Determine status
  let status = 'on-target';
  let statusColor = colors.green;
  
  if (Math.abs(difference) <= 5) {
    status = 'on-target';
    statusColor = colors.green;
  } else if (Math.abs(difference) <= 15) {
    status = 'acceptable';
    statusColor = colors.yellow;
  } else {
    status = 'needs-adjustment';
    statusColor = colors.red;
  }
  
  log(`\n✓ ${section.name} completed!`, colors.green);
  log(`Actual Time: ${formatTime(duration)}`, statusColor);
  log(`Target Time: ${formatTime(section.target)}`, colors.cyan);
  log(`Difference: ${difference > 0 ? '+' : ''}${difference}s`, statusColor);
  log(`Status: ${status.toUpperCase()}`, statusColor);
  
  return {
    name: section.name,
    speaker: section.speaker,
    target: section.target,
    actual: duration,
    difference: difference,
    status: status
  };
}

/**
 * Time demo features
 */
async function timeDemoFeatures(rl) {
  log(`\n${'='.repeat(60)}`, colors.bold);
  log('DEMO FEATURE TIMING', colors.bold + colors.magenta);
  log('='.repeat(60), colors.bold);
  
  log('\nWould you like to time individual demo features? (y/n)', colors.cyan);
  const answer = await ask(rl, '> ');
  
  if (answer.toLowerCase() !== 'y') {
    log('Skipping detailed demo feature timing.', colors.yellow);
    return [];
  }
  
  const featureResults = [];
  
  for (const feature of demoFeatures) {
    log(`\n--- ${feature.name} (Target: ${formatTime(feature.target)}) ---`, colors.cyan);
    await ask(rl, 'Press ENTER to start timing...');
    
    const startTime = Date.now();
    log(`⏱️  Timing ${feature.name}...`, colors.green);
    
    await ask(rl, 'Press ENTER when complete...');
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    const difference = duration - feature.target;
    
    let status = Math.abs(difference) <= 10 ? 'on-target' : 'needs-adjustment';
    let statusColor = status === 'on-target' ? colors.green : colors.yellow;
    
    log(`✓ Actual: ${formatTime(duration)} (${difference > 0 ? '+' : ''}${difference}s)`, statusColor);
    
    featureResults.push({
      name: feature.name,
      target: feature.target,
      actual: duration,
      difference: difference,
      status: status
    });
  }
  
  return featureResults;
}

/**
 * Test emergency procedures
 */
async function testEmergencyProcedures(rl) {
  log(`\n${'='.repeat(60)}`, colors.bold);
  log('EMERGENCY PROCEDURES TEST', colors.bold + colors.red);
  log('='.repeat(60), colors.bold);
  
  const procedures = [
    {
      name: 'OpenAI API Fallback (Cached Responses)',
      description: 'Test that cached responses load when API is unavailable',
      steps: [
        '1. Navigate to AI Health Assistant',
        '2. Ask a question that has a cached response',
        '3. Verify cached response displays within 2 seconds',
        '4. Check that response is marked as cached (if applicable)'
      ]
    },
    {
      name: 'Backup Video Switching',
      description: 'Practice switching to backup video if live demo fails',
      steps: [
        '1. Have backup video ready (if created)',
        '2. Practice keyboard shortcut or quick access',
        '3. Verify video launches within 10 seconds',
        '4. Practice narrating over the video'
      ]
    },
    {
      name: 'Database Connection Failure',
      description: 'Know what to do if database connection fails',
      steps: [
        '1. Attempt page refresh once',
        '2. If still failing, switch to backup video',
        '3. Explain professionally: "Let\'s use our backup demo"',
        '4. Continue with confidence'
      ]
    }
  ];
  
  const procedureResults = [];
  
  for (const procedure of procedures) {
    log(`\n--- ${procedure.name} ---`, colors.yellow);
    log(procedure.description, colors.cyan);
    log('\nSteps:', colors.cyan);
    procedure.steps.forEach(step => log(`  ${step}`, colors.cyan));
    
    const tested = await ask(rl, '\nDid you test this procedure? (y/n): ');
    
    if (tested.toLowerCase() === 'y') {
      const success = await ask(rl, 'Was it successful? (y/n): ');
      const notes = await ask(rl, 'Any notes or issues? (press ENTER to skip): ');
      
      procedureResults.push({
        name: procedure.name,
        tested: true,
        successful: success.toLowerCase() === 'y',
        notes: notes || 'None'
      });
      
      if (success.toLowerCase() === 'y') {
        log(`✓ ${procedure.name} - PASSED`, colors.green);
      } else {
        log(`✗ ${procedure.name} - NEEDS WORK`, colors.red);
      }
    } else {
      procedureResults.push({
        name: procedure.name,
        tested: false,
        successful: false,
        notes: 'Not tested'
      });
      log(`⚠ ${procedure.name} - NOT TESTED`, colors.yellow);
    }
  }
  
  return procedureResults;
}

/**
 * Collect feedback and notes
 */
async function collectFeedback(rl) {
  log(`\n${'='.repeat(60)}`, colors.bold);
  log('REHEARSAL FEEDBACK', colors.bold + colors.cyan);
  log('='.repeat(60), colors.bold);
  
  const feedback = {
    speakerTransitions: null,
    technicalIssues: [],
    contentImprovements: [],
    overallConfidence: null,
    readyForDemo: null
  };
  
  // Speaker transitions
  log('\nHow were the speaker transitions? (1-5, where 5 is excellent)', colors.cyan);
  const transitions = await ask(rl, '> ');
  feedback.speakerTransitions = parseInt(transitions) || 0;
  
  // Technical issues
  log('\nWere there any technical issues? (y/n)', colors.cyan);
  const hadIssues = await ask(rl, '> ');
  
  if (hadIssues.toLowerCase() === 'y') {
    log('Describe the issues (one per line, empty line to finish):', colors.cyan);
    let issue = await ask(rl, '> ');
    while (issue) {
      feedback.technicalIssues.push(issue);
      issue = await ask(rl, '> ');
    }
  }
  
  // Content improvements
  log('\nAny content improvements needed? (y/n)', colors.cyan);
  const needsImprovements = await ask(rl, '> ');
  
  if (needsImprovements.toLowerCase() === 'y') {
    log('Describe improvements (one per line, empty line to finish):', colors.cyan);
    let improvement = await ask(rl, '> ');
    while (improvement) {
      feedback.contentImprovements.push(improvement);
      improvement = await ask(rl, '> ');
    }
  }
  
  // Overall confidence
  log('\nTeam confidence level for demo day? (1-5, where 5 is very confident)', colors.cyan);
  const confidence = await ask(rl, '> ');
  feedback.overallConfidence = parseInt(confidence) || 0;
  
  // Ready for demo
  log('\nIs the team ready for demo day? (y/n)', colors.cyan);
  const ready = await ask(rl, '> ');
  feedback.readyForDemo = ready.toLowerCase() === 'y';
  
  return feedback;
}

/**
 * Generate final report
 */
function generateReport(results) {
  log(`\n${'='.repeat(60)}`, colors.bold);
  log('FINAL REHEARSAL REPORT', colors.bold + colors.cyan);
  log('='.repeat(60), colors.bold);
  
  // Timing summary
  log('\n📊 TIMING SUMMARY', colors.blue + colors.bold);
  log('-'.repeat(60), colors.blue);
  
  results.sections.forEach(section => {
    const statusColor = section.status === 'on-target' ? colors.green :
                       section.status === 'acceptable' ? colors.yellow : colors.red;
    
    log(`\n${section.name}:`, colors.cyan);
    log(`  Speaker: ${section.speaker}`, colors.cyan);
    log(`  Target: ${formatTime(section.target)}`, colors.cyan);
    log(`  Actual: ${formatTime(section.actual)}`, statusColor);
    log(`  Difference: ${section.difference > 0 ? '+' : ''}${section.difference}s`, statusColor);
    log(`  Status: ${section.status.toUpperCase()}`, statusColor);
  });
  
  log(`\n${'─'.repeat(60)}`, colors.cyan);
  log(`TOTAL TIME: ${formatTime(results.totalTime)}`, colors.bold + colors.cyan);
  log(`TARGET TIME: ${formatTime(results.targetTime)}`, colors.cyan);
  log(`DIFFERENCE: ${results.totalTime - results.targetTime > 0 ? '+' : ''}${results.totalTime - results.targetTime}s`, 
    results.status === 'on-target' ? colors.green : colors.yellow);
  log(`STATUS: ${results.status.toUpperCase()}`, 
    results.status === 'on-target' ? colors.green : colors.yellow);
  
  // Demo features (if timed)
  if (results.demoFeatures.length > 0) {
    log('\n🎬 DEMO FEATURES TIMING', colors.blue + colors.bold);
    log('-'.repeat(60), colors.blue);
    
    results.demoFeatures.forEach(feature => {
      const statusColor = feature.status === 'on-target' ? colors.green : colors.yellow;
      log(`${feature.name}: ${formatTime(feature.actual)} (${feature.difference > 0 ? '+' : ''}${feature.difference}s)`, statusColor);
    });
  }
  
  // Emergency procedures
  if (results.emergencyProcedures && results.emergencyProcedures.length > 0) {
    log('\n🚨 EMERGENCY PROCEDURES', colors.blue + colors.bold);
    log('-'.repeat(60), colors.blue);
    
    results.emergencyProcedures.forEach(proc => {
      if (proc.tested) {
        const statusColor = proc.successful ? colors.green : colors.red;
        const statusIcon = proc.successful ? '✓' : '✗';
        log(`${statusIcon} ${proc.name}: ${proc.successful ? 'PASSED' : 'NEEDS WORK'}`, statusColor);
        if (proc.notes !== 'None') {
          log(`  Notes: ${proc.notes}`, colors.cyan);
        }
      } else {
        log(`⚠ ${proc.name}: NOT TESTED`, colors.yellow);
      }
    });
  }
  
  // Feedback
  if (results.feedback) {
    log('\n💬 FEEDBACK', colors.blue + colors.bold);
    log('-'.repeat(60), colors.blue);
    
    log(`\nSpeaker Transitions: ${results.feedback.speakerTransitions}/5`, colors.cyan);
    
    if (results.feedback.technicalIssues.length > 0) {
      log('\nTechnical Issues:', colors.yellow);
      results.feedback.technicalIssues.forEach(issue => log(`  • ${issue}`, colors.yellow));
    } else {
      log('\nTechnical Issues: None', colors.green);
    }
    
    if (results.feedback.contentImprovements.length > 0) {
      log('\nContent Improvements:', colors.yellow);
      results.feedback.contentImprovements.forEach(imp => log(`  • ${imp}`, colors.yellow));
    } else {
      log('\nContent Improvements: None', colors.green);
    }
    
    log(`\nTeam Confidence: ${results.feedback.overallConfidence}/5`, colors.cyan);
    log(`Ready for Demo Day: ${results.feedback.readyForDemo ? 'YES' : 'NO'}`, 
      results.feedback.readyForDemo ? colors.green : colors.red);
  }
  
  // Recommendations
  log(`\n${'='.repeat(60)}`, colors.bold);
  log('RECOMMENDATIONS', colors.bold + colors.cyan);
  log('='.repeat(60), colors.bold);
  
  if (results.status === 'on-target' && results.feedback?.readyForDemo) {
    log('\n✅ EXCELLENT! Team is ready for demo day!', colors.green + colors.bold);
    log('\nNext steps:', colors.green);
    log('  • Review and address any minor feedback', colors.green);
    log('  • Get good rest before demo day', colors.green);
    log('  • Arrive early for final system check', colors.green);
    log('  • Stay confident and enthusiastic!', colors.green);
  } else if (results.status === 'acceptable') {
    log('\n⚠️  GOOD, but timing needs minor adjustment', colors.yellow + colors.bold);
    
    const needsAdjustment = results.sections.filter(s => s.status === 'needs-adjustment');
    if (needsAdjustment.length > 0) {
      log('\nSections to adjust:', colors.yellow);
      needsAdjustment.forEach(section => {
        if (section.difference > 0) {
          log(`  • ${section.name}: Trim by ${section.difference}s`, colors.yellow);
        } else {
          log(`  • ${section.name}: Can expand by ${Math.abs(section.difference)}s`, colors.yellow);
        }
      });
    }
    
    log('\nConsider one more quick rehearsal to fine-tune timing.', colors.yellow);
  } else {
    log('\n❌ TIMING NEEDS SIGNIFICANT ADJUSTMENT', colors.red + colors.bold);
    log('\nThe presentation is significantly over/under the 10-minute target.', colors.red);
    log('Schedule another rehearsal after making adjustments.', colors.red);
  }
  
  log(`\n${'='.repeat(60)}\n`, colors.bold);
}

/**
 * Save report to file
 */
function saveReport(results) {
  const reportDir = path.join(__dirname, 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  
  const reportPath = path.join(reportDir, `final-rehearsal-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  log(`Report saved: ${reportPath}`, colors.cyan);
  
  // Also save as latest
  const latestPath = path.join(reportDir, 'final-rehearsal-latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(results, null, 2));
  log(`Latest report: ${latestPath}`, colors.cyan);
}

/**
 * Main function
 */
async function main() {
  const rl = createInterface();
  
  try {
    log('\n' + '='.repeat(60), colors.bold);
    log('FINAL REHEARSAL TIMING TOOL - TASK 10.3', colors.bold + colors.cyan);
    log('='.repeat(60) + '\n', colors.bold);
    
    log('This tool will help you time your final rehearsal and ensure', colors.cyan);
    log('the presentation stays within the 10-minute target.', colors.cyan);
    log('\nTarget: 10 minutes (600 seconds)', colors.yellow);
    log('Acceptable range: 9:30 - 10:00', colors.yellow);
    
    // Get rehearsal number
    const rehearsalNum = await ask(rl, '\nRehersal number (1, 2, 3, etc.): ');
    results.rehearsalNumber = parseInt(rehearsalNum) || 1;
    
    log('\nReady to begin timing? Press ENTER to start...', colors.green);
    await ask(rl, '');
    
    // Time each section
    for (const section of sections) {
      const sectionResult = await timeSection(rl, section);
      results.sections.push(sectionResult);
      results.totalTime += sectionResult.actual;
    }
    
    // Determine overall status
    const difference = results.totalTime - results.targetTime;
    if (results.totalTime >= 570 && results.totalTime <= 600) {
      results.status = 'on-target';
    } else if (results.totalTime >= 540 && results.totalTime <= 630) {
      results.status = 'acceptable';
    } else {
      results.status = 'needs-adjustment';
    }
    
    // Time demo features (optional)
    results.demoFeatures = await timeDemoFeatures(rl);
    
    // Test emergency procedures
    results.emergencyProcedures = await testEmergencyProcedures(rl);
    
    // Collect feedback
    results.feedback = await collectFeedback(rl);
    
    // Generate and display report
    generateReport(results);
    
    // Save report
    saveReport(results);
    
    log('\nRehersal timing complete! 🎉\n', colors.green + colors.bold);
    
  } catch (error) {
    log(`\nError: ${error.message}`, colors.red);
  } finally {
    rl.close();
  }
}

// Run the tool
main();
