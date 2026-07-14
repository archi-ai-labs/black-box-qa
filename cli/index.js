#!/usr/bin/env node

const { Command } = require('commander');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .name('black-box-qa')
  .description('AI Agent Workspace for Black-box QA Testing')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new QA workspace in the current directory')
  .action(() => {
    console.log('🚀 Initializing Black-box QA Workspace...');
    const targetDir = process.cwd();
    // In a real CLI, this would clone a template or create files.
    // For now, if run inside the repo, just setup .env
    
    if (!fs.existsSync(path.join(targetDir, '.env'))) {
      if (fs.existsSync(path.join(targetDir, '.env.example'))) {
        fs.copyFileSync(path.join(targetDir, '.env.example'), path.join(targetDir, '.env'));
        console.log('✅ Created .env file.');
      } else {
        console.log('⚠️ .env.example not found. Please create .env manually.');
      }
    } else {
      console.log('✅ .env already exists.');
    }
    
    console.log('🎉 Initialization complete!');
    console.log('👉 Run `black-box-qa start` to launch the dashboard.');
  });

program
  .command('start')
  .description('Start the Next.js QA Dashboard')
  .action(() => {
    console.log('🚀 Starting Dashboard...');
    try {
      execSync('npm run dev', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to start dashboard. Ensure dependencies are installed.');
    }
  });

program
  .command('test <projectId>')
  .description('Trigger a test run for a specific project')
  .action((projectId) => {
    console.log(`🤖 Triggering test run for project: ${projectId}`);
    try {
      execSync(`npm run run-tests -- --project=${projectId}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`❌ Test run failed for ${projectId}`);
    }
  });

program.parse(process.argv);
