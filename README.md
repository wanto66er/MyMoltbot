# MyMoltbot - OpenClaw Instance

Welcome to MyMoltbot, an OpenClaw instance featuring Harley 🐾 as your AI companion.

## Overview

This repository contains a complete OpenClaw setup with a custom todo application, webpage monitoring dashboard, and AI assistant features. The system is designed to run in GitHub Codespaces and provides real-time collaboration features.

## Features

- **Harley 🐾 AI Assistant**: Personal AI companion named in honor of a beloved pet
- **Real-time Todo Application**: Modern, mobile-optimized todo list with synchronization
- **Webpage Monitoring Dashboard**: Comprehensive dashboard for managing webpage monitoring tasks
- **Customizable Monitoring Profiles**: Create different profiles with various check frequencies
- **Real-time Notifications**: Immediate alerts when webpage changes are detected
- **Cross-platform Access**: Accessible via web interface from any device
- **Mobile-optimized Interface**: Specifically designed for iOS Safari and iPhone 16 Pro

## Todo Application

The included todo application features:

- Real-time synchronization across devices
- Modern UI with clean, minimalist design
- Full CRUD operations (Create, Read, Update, Delete)
- Task filtering (All, Active, Completed)
- Stats tracking (items remaining)
- PWA functionality for mobile installation
- Offline capability with service worker
- Touch-optimized interface for mobile devices

### Access

The application is deployed at:
- **Main Interface**: https://effective-space-disco-9654gwvqj6jf99j7-3000.app.github.dev/

## Webpage Monitoring Dashboard

The comprehensive webpage monitoring dashboard allows you to:

- Create multiple monitoring profiles for different websites
- Set custom check frequencies (every 5 minutes to daily)
- View detailed change logs showing what specifically changed
- Enable/disable monitoring tasks individually
- Receive real-time notifications when changes are detected
- Track change history for each monitored page
- Manage all monitoring tasks through a user-friendly interface

### Setup

1. Navigate to the `monitoring-dashboard` directory
2. Install dependencies with `npm install`
3. Start the dashboard with `node server.js`
4. Access the dashboard at `http://localhost:3001`
5. Add URLs to monitor and set your preferred check intervals

### Features

- **Dashboard Interface**: User-friendly web interface to manage monitoring tasks
- **Multiple Profiles**: Create different monitoring profiles for various websites
- **Flexible Intervals**: Set custom check frequencies (every 5 minutes to daily)
- **Real-time Notifications**: Instant alerts when webpage changes are detected
- **Detailed Change Logs**: Track what specifically changed on each monitored page
- **Task Management**: Enable/disable tasks, view history, delete as needed
- **Change Detection**: Sophisticated content comparison to detect additions/removals

## Technologies Used

- Node.js
- Express.js
- Socket.IO (real-time communication)
- HTML5/CSS3/JavaScript
- Axios (HTTP requests)
- Crypto (hashing algorithms)
- OpenClaw Framework

## Architecture

This setup runs in GitHub Codespaces and includes:

- Server-side backend for real-time functionality
- Client-side application optimized for mobile devices
- Integrated AI assistant capabilities
- Webpage monitoring system with change detection
- Dashboard interface for task management
- Persistent storage mechanisms

## Usage

1. Access the application via the provided URL
2. Use the todo application to manage your tasks
3. Configure webpage monitoring through the dashboard
4. Set up custom profiles with different check frequencies
5. Interact with Harley 🐾 for AI-assisted functionality

## Customization

The system is designed to be extensible. Additional features and integrations can be added as needed.

## Contributing

Feel free to submit issues or pull requests to improve the application.

## License

This project is part of your personal OpenClaw instance and is configured according to your preferences.