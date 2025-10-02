#!/usr/bin/env node
/**
 * Extract all Hebrew strings from source files
 * Generates organized translation keys
 */

const fs = require('fs');
const path = require('path');

// Hebrew character regex
const HEBREW_REGEX = /[\u0590-\u05FF]/;

// Directories to scan
const SRC_DIR = path.join(process.cwd(), 'src');

// Files to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'i18n',
  'messages',
];

// Store extracted strings
const extractedStrings = new Map();

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function extractStringsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const strings = [];

  lines.forEach((line, lineNumber) => {
    // Match string literals with Hebrew
    const stringMatches = [
      ...line.matchAll(/["'`]([^"'`]*[\u0590-\u05FF][^"'`]*)["'`]/g),
      ...line.matchAll(/{["']([^"']*[\u0590-\u05FF][^"']*)["']}/g),
    ];

    stringMatches.forEach(match => {
      const hebrewString = match[1].trim();
      if (hebrewString && HEBREW_REGEX.test(hebrewString)) {
        strings.push({
          text: hebrewString,
          line: lineNumber + 1,
          context: line.trim(),
        });
      }
    });
  });

  return strings;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    if (shouldIgnore(filePath)) return;

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (
      file.endsWith('.tsx') ||
      file.endsWith('.ts') ||
      file.endsWith('.jsx') ||
      file.endsWith('.js')
    ) {
      const strings = extractStringsFromFile(filePath);

      if (strings.length > 0) {
        const relativePath = path.relative(process.cwd(), filePath);
        extractedStrings.set(relativePath, strings);
      }
    }
  });
}

function generateTranslationKey(text, category) {
  // Remove special characters and convert to camelCase
  const cleaned = text
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('_');

  return cleaned || 'untitled';
}

function categorizeByFile(filePath) {
  if (filePath.includes('components/features/')) {
    const match = filePath.match(/features\/([^\/]+)/);
    return match ? match[1] : 'features';
  }
  if (filePath.includes('components/layout/')) return 'layout';
  if (filePath.includes('components/ui/')) return 'ui';
  if (filePath.includes('app/')) return 'pages';
  return 'common';
}

function main() {
  console.log('🔍 Scanning for Hebrew strings...\n');

  scanDirectory(SRC_DIR);

  console.log(`📊 Found Hebrew strings in ${extractedStrings.size} files\n`);

  // Group by category
  const categories = {};
  let totalStrings = 0;

  extractedStrings.forEach((strings, filePath) => {
    const category = categorizeByFile(filePath);

    if (!categories[category]) {
      categories[category] = [];
    }

    strings.forEach(str => {
      categories[category].push({
        ...str,
        file: filePath,
      });
      totalStrings++;
    });
  });

  // Print summary
  console.log('📈 Summary by category:\n');
  Object.entries(categories).forEach(([category, strings]) => {
    console.log(`  ${category}: ${strings.length} strings`);
  });

  console.log(`\n📝 Total strings: ${totalStrings}\n`);

  // Save detailed report
  const report = {
    totalFiles: extractedStrings.size,
    totalStrings,
    categories,
    timestamp: new Date().toISOString(),
  };

  const reportPath = path.join(process.cwd(), 'translation-extraction-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ Report saved: ${reportPath}\n`);

  // Print sample of strings
  console.log('📝 Sample extracted strings:\n');
  Object.entries(categories)
    .slice(0, 3)
    .forEach(([category, strings]) => {
      console.log(`\n${category.toUpperCase()}:`);
      strings.slice(0, 5).forEach(str => {
        console.log(`  - "${str.text}" (${str.file}:${str.line})`);
      });
    });
}

main();
