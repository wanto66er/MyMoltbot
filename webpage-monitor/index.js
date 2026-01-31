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
            "url": "https://example.com",
            "checkIntervalMs": 3600000,
            "name": "Example Site"
          }
        ],
        "notificationSettings": {
          "enabled": true,
          "method": "openclaw"
        }
      };
      
      await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
      console.log('Default config created. Please update the URL in config.json and restart.');
      return defaultConfig;
    }
    throw error;
  }
}

async function initializeMonitors() {
  const config = await loadConfig();
  const monitors = [];

  for (const page of config.monitoredPages) {
    const monitor = new WebPageMonitor(page.url, page.checkIntervalMs);
    monitor.startMonitoring();
    monitors.push(monitor);
    
    console.log(`Started monitoring: ${page.name} (${page.url})`);
  }

  return monitors;
}

// Initialize monitors when the script runs
initializeMonitors()
  .then(monitors => {
    console.log(`Webpage monitoring started for ${monitors.length} pages.`);
    
    // Keep the process running
    process.stdin.resume();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down monitors...');
      for (const monitor of monitors) {
        monitor.stopMonitoring();
      }
      process.exit(0);
    });
  })
  .catch(error => {
    console.error('Error initializing monitors:', error);
    process.exit(1);
  });

module.exports = { initializeMonitors, loadConfig };