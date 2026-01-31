# Webpage Change Monitor

A module for OpenClaw that monitors webpages for changes and sends notifications when changes are detected.

## Features

- Monitors specified webpages at regular intervals (default: every hour)
- Detects any changes in the webpage content
- Sends immediate notifications when changes are detected
- Stores content hashes to efficiently detect changes
- Configurable monitoring intervals
- Handles network errors gracefully

## Setup

1. The monitor is already installed in your OpenClaw instance
2. Configure the pages you want to monitor in `config.json`
3. Start the monitoring service

## Configuration

Edit the `config.json` file to specify which pages to monitor:

```json
{
  "monitoredPages": [
    {
      "url": "https://example.com",
      "checkIntervalMs": 3600000,
      "name": "Example Website"
    }
  ],
  "notificationSettings": {
    "enabled": true
  }
}
```

Parameters:
- `url`: The URL of the webpage to monitor
- `checkIntervalMs`: Interval between checks in milliseconds (3600000 ms = 1 hour)
- `name`: A friendly name for the monitored page

## Usage

To start monitoring:

```bash
cd webpage-monitor
node app.js
```

The monitor will:
1. Check each specified webpage at the defined interval
2. Compare the current content with the previously stored version
3. Send you an immediate notification if any changes are detected

## Notifications

When a change is detected, you'll receive a notification containing:
- The name and URL of the monitored page
- Timestamps of previous and current checks
- Information about the change

## Integration with OpenClaw

The monitor is designed to work seamlessly with OpenClaw's messaging system, sending notifications directly to your configured communication channels.

## Troubleshooting

- Ensure the URLs you're trying to monitor are publicly accessible
- Check that the interval is not too frequent to avoid being rate-limited
- Verify that the node process has sufficient permissions to run continuously