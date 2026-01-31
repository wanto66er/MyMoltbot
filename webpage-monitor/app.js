#!/usr/bin/env node

// Webpage Change Monitor for OpenClaw
// This script monitors webpages for changes and sends notifications

const WebPageMonitor = require('./monitor.js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG_FILE = path.join(__dirname, 'config.json');

async function loadConfig() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Config file not found. Creating default config...');
      const defaultConfig = {
        "monitoredPages": [
          {
            "url": "https://example.com",  // Replace with the URL you want to monitor
            "checkIntervalMs": 3600000,     // 1 hour in milliseconds
            "name": "Example Website"
          }
        ],
        "notificationSettings": {
          "enabled": true
        }
      };
      
      await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
      console.log('Default config created at config.json');
      console.log('Please edit config.json to add the webpage URL you want to monitor, then restart.');
      return defaultConfig;
    }
    throw error;
  }
}

async function initializeMonitors() {
  const config = await loadConfig();
  const monitors = [];

  for (const page of config.monitoredPages) {
    const monitor = new WebPageMonitor(page.url, page.checkIntervalMs, page.name);
    monitor.startMonitoring();
    monitors.push(monitor);
    
    console.log(`Started monitoring: ${page.name} (${page.url}) every ${(page.checkIntervalMs / (1000 * 60 * 60)).toFixed(2)} hours`);
  }

  return monitors;
}

// Initialize monitors when the script runs
async function startMonitoring() {
  try {
    const monitors = await initializeMonitors();
    console.log(`\nWebpage monitoring started for ${monitors.length} pages.`);
    console.log('Monitoring will continue in the background.');
    
    // Keep the process running
    process.stdin.resume();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down webpage monitors...');
      for (const monitor of monitors) {
        monitor.stopMonitoring();
      }
      console.log('All monitors stopped. Goodbye!');
      process.exit(0);
    });
    
    // Handle other termination signals
    process.on('SIGTERM', async () => {
      console.log('\nTermination signal received. Stopping monitors...');
      for (const monitor of monitors) {
        monitor.stopMonitoring();
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Error initializing monitors:', error);
    process.exit(1);
  }
}

// Start the monitoring
startMonitoring();