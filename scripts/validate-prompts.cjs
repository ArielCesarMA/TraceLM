const fs = require('fs');
const path = require('path');

const promptsDir = path.join(__dirname, '..', 'src', 'prompts');
const requiredPrompts = [
  'requirement-enhancement.txt',
  'scenario-generation.txt',
  'test-case-generation.txt',
  'automation-analysis.txt'
];

const errors = [];
const warnings = [];

for (const promptFile of requiredPrompts) {
  const promptPath = path.join(promptsDir, promptFile);

  if (!fs.existsSync(promptPath)) {
    errors.push(`Missing required prompt file: ${promptFile}`);
    continue;
  }

  const content = fs.readFileSync(promptPath, 'utf8').trim();

  if (content.length < 80) {
    warnings.push(`Prompt file seems too short: ${promptFile}`);
  }

  if (!/requirement|scenario|test|automation|output|format/i.test(content)) {
    warnings.push(`Prompt may be too generic: ${promptFile}`);
  }
}

if (errors.length > 0) {
  console.error('Prompt validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('Prompt validation warnings:');
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

console.log(`Prompt validation passed for ${requiredPrompts.length} required prompt files.`);
