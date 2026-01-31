# MyMoltbot - OpenClaw Instance

Welcome to MyMoltbot, an OpenClaw instance featuring Harley 🐾 as your AI companion.

## Overview

This repository contains a complete OpenClaw setup with a custom todo application, webpage monitoring capabilities, and AI assistant features. The system is designed to run in GitHub Codespaces and provides real-time collaboration features.

## Features

- **Harley 🐾 AI Assistant**: Personal AI companion named in honor of a beloved pet
- **Real-time Todo Application**: Modern, mobile-optimized todo list with synchronization
- **Webpage Change Monitoring**: Automated monitoring of webpages with change notifications
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

## Webpage Monitoring

The included webpage monitoring feature allows you to:

- Monitor specified webpages for content changes
- Receive immediate notifications when changes occur
- Configure monitoring intervals (default: every hour)
- Track changes to multiple webpages simultaneously
- Store historical data about webpage states

### Setup

1. Navigate to the `webpage-monitor` directory
2. Edit the `config.json` file to specify the URLs you want to monitor
3. Start the monitoring service with `node app.js`

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
- Persistent storage mechanisms

## Usage

1. Access the application via the provided URL
2. Use the todo application to manage your tasks
3. Configure webpage monitoring to track changes
4. Interact with Harley 🐾 for AI-assisted functionality

## Customization

The system is designed to be extensible. Additional features and integrations can be added as needed.

## Contributing

Feel free to submit issues or pull requests to improve the application.

## License

This project is part of your personal OpenClaw instance and is configured according to your preferences.