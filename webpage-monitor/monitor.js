const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class WebPageMonitor {
  constructor(targetUrl, checkIntervalMs = 60 * 60 * 1000, name = 'Monitored Page') { // Default: 1 hour
    this.targetUrl = targetUrl;
    this.checkIntervalMs = checkIntervalMs;
    this.name = name;
    this.storageFile = path.join(__dirname, 'page_hashes.json');
    this.intervalId = null;
  }

  async getPageHash(url) {
    try {
      const response = await axios.get(url, {
        timeout: 15000, // 15 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpenClaw Web Monitor/1.0)'
        }
      });
      
      // Create hash of the page content
      const hash = crypto.createHash('sha256').update(response.data).digest('hex');
      return {
        hash,
        content: response.data,
        timestamp: new Date().toISOString(),
        status: response.status,
        size: response.data.length
      };
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      throw error;
    }
  }

  async getStoredHash() {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return empty object
        return {};
      }
      throw error;
    }
  }

  async saveHash(url, hashData) {
    let storedHashes = await this.getStoredHash();
    storedHashes[url] = hashData;
    await fs.writeFile(this.storageFile, JSON.stringify(storedHashes, null, 2));
  }

  async checkForChanges() {
    try {
      console.log(`Checking ${this.name} (${this.targetUrl}) for changes at ${new Date().toISOString()}...`);
      const currentPage = await this.getPageHash(this.targetUrl);
      const storedHashes = await this.getStoredHash();
      const previousPage = storedHashes[this.targetUrl];

      if (!previousPage) {
        // First time checking this URL
        console.log(`First check for ${this.targetUrl}, storing baseline.`);
        await this.saveHash(this.targetUrl, currentPage);
        return false;
      }

      if (currentPage.hash !== previousPage.hash) {
        console.log(`Change detected on ${this.targetUrl}!`);
        
        // Save the new hash
        await this.saveHash(this.targetUrl, currentPage);
        
        // Send notification
        await this.sendNotification(currentPage, previousPage);
        return true;
      } else {
        console.log(`No changes detected on ${this.targetUrl}.`);
        return false;
      }
    } catch (error) {
      console.error(`Error checking ${this.targetUrl}:`, error.message);
      return false;
    }
  }

  async sendNotification(currentPage, previousPage) {
    const timeDiff = Math.floor((new Date(currentPage.timestamp) - new Date(previousPage.timestamp)) / 1000);
    const message = `🚨 Webpage Change Alert! 🚨\n\nPage: ${this.name}\nURL: ${this.targetUrl}\n\nA change was detected after approximately ${Math.floor(timeDiff/60)} minutes.\n\nPrevious check: ${new Date(previousPage.timestamp).toLocaleString()}\nCurrent check: ${new Date(currentPage.timestamp).toLocaleString()}\n\nContent size changed from ${previousPage.size} to ${currentPage.size} characters.`;
    
    console.log("ALERT:", message);
    
    // In the OpenClaw environment, we would use the message tool to send the notification
    try {
      // This is where we'd integrate with OpenClaw's messaging system
      // await message({ action: 'send', message: message });
      console.log("Notification would be sent to user via OpenClaw messaging system");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  startMonitoring() {
    console.log(`Starting to monitor ${this.name} (${this.targetUrl}) every ${this.checkIntervalMs / 1000 / 60} minutes.`);
    
    // Run an initial check
    this.checkForChanges();
    
    // Then set up the recurring interval
    this.intervalId = setInterval(() => {
      this.checkForChanges();
    }, this.checkIntervalMs);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log(`Stopped monitoring ${this.targetUrl}.`);
    }
  }
}

// Example usage:
// const monitor = new WebPageMonitor('https://example.com', 60*60*1000, 'Example Website');
// monitor.startMonitoring();

module.exports = WebPageMonitor;