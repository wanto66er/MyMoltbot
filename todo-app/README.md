# Harley's Todo List Application

A modern, responsive todo list application built for OpenClaw with real-time synchronization and mobile optimization.

## Features

- ✅ Real-time todo synchronization across devices
- 🎨 Modern UI with clean, minimalist design
- 📱 Fully responsive for mobile devices (iPhone 16 Pro optimized)
- ⚡ Fast performance with WebSocket connections
- 🔔 Interactive notifications
- 🎯 Filter todos (All, Active, Completed)
- 📥 Add, edit, delete, and mark todos as complete
- 📊 Stats tracking (items remaining)
- 📲 PWA support (can be installed on mobile devices)
- 💾 Offline capability with service worker
- 🍏 Optimized for iOS Safari

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wanto66er/MyMoltbot.git
   cd MyMoltbot/todo-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Visit the application at `http://localhost:3000`

## Mobile Usage

To use on your iPhone 16 Pro:

1. Access the application via the public URL: 
   `https://effective-space-disco-9654gwvqj6jf99j7-18789.app.github.dev/chat?session=main`

2. For the best experience, add the application to your home screen:
   - Open Safari and navigate to the app
   - Tap the Share button
   - Select "Add to Home Screen"
   - This will install the PWA for quick access

## Technologies Used

- Node.js
- Express.js
- Socket.IO (real-time communication)
- HTML5
- CSS3 (modern styling)
- JavaScript (ES6+)
- Service Workers (offline capability)
- Web Manifest (PWA features)

## Architecture

The application uses a client-server architecture with real-time synchronization:

- Server: Node.js/Express handles API requests and WebSocket connections
- Client: Modern JavaScript with WebSocket connections for real-time updates
- Storage: In-memory (for demo purposes; can be extended with a database)

## Customization

To customize the application:

1. Modify the CSS in `public/styles.css` to adjust colors and styling
2. Update the manifest in `public/manifest.json` to change app metadata
3. Edit the JavaScript in `public/script.js` to modify functionality
4. Change the server logic in `server.js` to add new features

## Security

- Input sanitization to prevent XSS attacks
- WebSocket connections for secure real-time communication
- Content Security Policy protection

## Performance

- Optimized for mobile devices
- Efficient rendering of todo items
- Caching strategies for faster loading
- Lightweight JavaScript bundle

## Contributing

Feel free to submit issues or pull requests to improve the application.