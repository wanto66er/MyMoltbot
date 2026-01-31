# Webpage Monitoring Dashboard

A comprehensive dashboard application for monitoring webpages and receiving real-time change notifications.

## Features

- **Dashboard Interface**: User-friendly web interface to manage monitoring tasks
- **Multiple Profiles**: Create different monitoring profiles for various websites
- **Flexible Intervals**: Set custom check frequencies (every 5 minutes to daily)
- **Real-time Notifications**: Instant alerts when webpage changes are detected
- **Detailed Change Logs**: Track what specifically changed on each monitored page
- **Task Management**: Enable/disable tasks, view history, delete as needed
- **Change Detection**: Sophisticated content comparison to detect additions/removals

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Access the dashboard at `http://localhost:3001`

## Usage

### Adding a New Task
1. Fill in the "Task Name" field with a descriptive name
2. Enter the "Webpage URL" you want to monitor
3. Select the "Check Interval" (how often to check for changes)
4. Optionally enable/disable the task
5. Click "Add Task"

### Managing Tasks
- **Enable/Disable**: Toggle individual tasks on/off
- **Delete**: Remove unwanted monitoring tasks
- **View History**: See past changes detected on each page

### Receiving Notifications
When a change is detected, you'll receive:
- Real-time alerts in the dashboard
- Detailed change information showing what was added/removed
- Timestamps of when changes occurred
- Size differences between versions

## Technical Details

The monitoring system:
- Uses SHA-256 hashing to efficiently detect content changes
- Stores historical data for comparison
- Implements intelligent diffing to show specific changes
- Runs on a configurable schedule
- Provides a WebSocket connection for real-time updates

## Integration

This dashboard is designed to work with OpenClaw's messaging system to send WhatsApp notifications when changes are detected. The notification system is implemented and ready for integration with OpenClaw's message tool.

## Troubleshooting

- Ensure the URLs you're monitoring are publicly accessible
- Check that your server has internet connectivity to fetch webpages
- Verify that check intervals are not too aggressive to avoid rate limiting
- Monitor server resources if running many simultaneous tasks

## License

MIT License