#!/usr/bin/env ts-node

/**
 * Comprehensive Test Runner with Time Measurement
 * Runs all test suites and provides detailed timing analysis
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  status: 'passed' | 'failed' | 'error';
}

interface TestSummary {
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalDuration: number;
  testResults: TestResult[];
  startTime: Date;
  endTime: Date;
}

const TEST_SUITES = [
  { name: 'Home Page', file: 'tests/e2e/01-home.spec.ts' },
  { name: 'Events', file: 'tests/e2e/02-events.spec.ts' },
  { name: 'Admin Features', file: 'tests/e2e/03-admin.spec.ts' },
  { name: 'Mobile Responsive', file: 'tests/e2e/04-mobile.spec.ts' },
  { name: 'Performance', file: 'tests/e2e/05-performance.spec.ts' },
  { name: 'Feedback (Old)', file: 'tests/e2e/06-feedback.spec.ts' },
  { name: 'Complaint Flow (New)', file: 'tests/e2e/07-complaint-flow.spec.ts' },
];

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(2);
  return `${minutes}m ${seconds}s`;
}

function printHeader(text: string) {
  const line = '='.repeat(80);
  console.log('\n' + line);
  console.log(text.padStart((80 + text.length) / 2).padEnd(80));
  console.log(line + '\n');
}

function printSection(text: string) {
  const line = '-'.repeat(80);
  console.log('\n' + line);
  console.log(text);
  console.log(line);
}

async function runTestSuite(suite: { name: string; file: string }): Promise<TestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log(`\n🧪 Running: ${suite.name}`);
    console.log(`   File: ${suite.file}`);

    const playwright = spawn('npx', ['playwright', 'test', suite.file, '--reporter=json'], {
      stdio: 'pipe',
      shell: true,
    });

    let outputData = '';

    playwright.stdout.on('data', (data) => {
      outputData += data.toString();
      process.stdout.write(data);
    });

    playwright.stderr.on('data', (data) => {
      outputData += data.toString();
      process.stderr.write(data);
    });

    playwright.on('close', (code) => {
      const duration = Date.now() - startTime;
      const status = code === 0 ? 'passed' : 'failed';

      // Try to parse test results from output
      let passed = 0;
      let failed = 0;
      let skipped = 0;

      // Basic parsing (Playwright usually prints results)
      const passedMatch = outputData.match(/(\d+) passed/);
      const failedMatch = outputData.match(/(\d+) failed/);
      const skippedMatch = outputData.match(/(\d+) skipped/);

      if (passedMatch) passed = parseInt(passedMatch[1]);
      if (failedMatch) failed = parseInt(failedMatch[1]);
      if (skippedMatch) skipped = parseInt(skippedMatch[1]);

      console.log(`\n${status === 'passed' ? '✅' : '❌'} ${suite.name}: ${formatDuration(duration)}`);

      resolve({
        suite: suite.name,
        passed,
        failed,
        skipped,
        duration,
        status,
      });
    });

    playwright.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.error(`\n❌ Error running ${suite.name}:`, error);
      resolve({
        suite: suite.name,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration,
        status: 'error',
      });
    });
  });
}

async function runAllTests(): Promise<TestSummary> {
  const startTime = new Date();
  printHeader('🎯 COMPREHENSIVE TEST SUITE EXECUTION');

  console.log(`Start Time: ${startTime.toLocaleString()}`);
  console.log(`Test Suites: ${TEST_SUITES.length}`);
  console.log(`Test Files:`);
  TEST_SUITES.forEach((suite, index) => {
    console.log(`  ${index + 1}. ${suite.name} (${suite.file})`);
  });

  printSection('Running Tests Sequentially');

  const testResults: TestResult[] = [];

  for (const suite of TEST_SUITES) {
    const result = await runTestSuite(suite);
    testResults.push(result);
  }

  const endTime = new Date();

  const summary: TestSummary = {
    totalTests: testResults.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0),
    totalPassed: testResults.reduce((sum, r) => sum + r.passed, 0),
    totalFailed: testResults.reduce((sum, r) => sum + r.failed, 0),
    totalSkipped: testResults.reduce((sum, r) => sum + r.skipped, 0),
    totalDuration: testResults.reduce((sum, r) => sum + r.duration, 0),
    testResults,
    startTime,
    endTime,
  };

  return summary;
}

function printSummary(summary: TestSummary) {
  printHeader('📊 TEST EXECUTION SUMMARY');

  console.log(`Start Time:     ${summary.startTime.toLocaleString()}`);
  console.log(`End Time:       ${summary.endTime.toLocaleString()}`);
  console.log(`Total Duration: ${formatDuration(summary.totalDuration)}`);
  console.log(`Wall Time:      ${formatDuration(summary.endTime.getTime() - summary.startTime.getTime())}`);

  printSection('Test Results by Suite');

  const maxNameLength = Math.max(...summary.testResults.map((r) => r.suite.length));

  summary.testResults.forEach((result) => {
    const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    const name = result.suite.padEnd(maxNameLength);
    const duration = formatDuration(result.duration).padStart(10);
    const tests = `${result.passed}/${result.passed + result.failed + result.skipped}`.padStart(8);
    console.log(`${icon} ${name} | ${duration} | ${tests} passed`);
  });

  printSection('Overall Statistics');

  console.log(`Total Test Cases:   ${summary.totalTests}`);
  console.log(`✅ Passed:          ${summary.totalPassed} (${((summary.totalPassed / summary.totalTests) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed:          ${summary.totalFailed} (${((summary.totalFailed / summary.totalTests) * 100).toFixed(1)}%)`);
  console.log(`⏭️  Skipped:         ${summary.totalSkipped} (${((summary.totalSkipped / summary.totalTests) * 100).toFixed(1)}%)`);

  printSection('Performance Analysis');

  const sortedByDuration = [...summary.testResults].sort((a, b) => b.duration - a.duration);

  console.log('\nSlowest Test Suites:');
  sortedByDuration.slice(0, 5).forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.suite}: ${formatDuration(result.duration)}`);
  });

  console.log('\nFastest Test Suites:');
  sortedByDuration
    .slice(-5)
    .reverse()
    .forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.suite}: ${formatDuration(result.duration)}`);
    });

  const avgDuration = summary.totalDuration / summary.testResults.length;
  console.log(`\nAverage Suite Duration: ${formatDuration(avgDuration)}`);

  printSection('Test Status');

  const allPassed = summary.totalFailed === 0;
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! 🎉');
  } else {
    console.log(`⚠️  ${summary.totalFailed} TEST(S) FAILED`);
    console.log('\nFailed Suites:');
    summary.testResults
      .filter((r) => r.status !== 'passed')
      .forEach((result) => {
        console.log(`  ❌ ${result.suite}: ${result.failed} failed`);
      });
  }

  printHeader('Test Execution Complete');

  // Save results to file
  const resultsPath = path.join(process.cwd(), 'test-results', 'summary.json');
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));
  console.log(`\nDetailed results saved to: ${resultsPath}\n`);
}

// Main execution
(async () => {
  try {
    const summary = await runAllTests();
    printSummary(summary);

    // Exit with error code if tests failed
    process.exit(summary.totalFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error running tests:', error);
    process.exit(1);
  }
})();
