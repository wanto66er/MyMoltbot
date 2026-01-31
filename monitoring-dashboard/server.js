const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Store monitoring tasks
let monitoringTasks = [];
let taskStatuses = {}; // Track status of each task

// Load tasks from file if it exists
async function loadTasks() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'tasks.json'), 'utf8');
    monitoringTasks = JSON.parse(data);
    console.log('Loaded monitoring tasks from file');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error loading tasks:', error);
    }
  }
}

// Save tasks to file
async function saveTasks() {
  try {
    await fs.writeFile(path.join(__dirname, 'tasks.json'), JSON.stringify(monitoringTasks, null, 2));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

// Initialize tasks
loadTasks();

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API routes
app.get('/api/tasks', (req, res) => {
  res.json(monitoringTasks);
});

app.post('/api/tasks', async (req, res) => {
  const { name, url, checkInterval, enabled = true } = req.body;
  
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  const newTask = {
    id: Date.now().toString(),
    name,
    url,
    checkInterval: parseInt(checkInterval) || 3600000, // Default to 1 hour
    enabled,
    createdAt: new Date().toISOString(),
    lastChecked: null,
    lastChange: null,
    changeHistory: []
  };
  
  monitoringTasks.push(newTask);
  await saveTasks();
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { name, url, checkInterval, enabled } = req.body;
  
  const taskIndex = monitoringTasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Validate URL if provided
  if (url) {
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
  }
  
  monitoringTasks[taskIndex] = {
    ...monitoringTasks[taskIndex],
    ...(name !== undefined && { name }),
    ...(url !== undefined && { url }),
    ...(checkInterval !== undefined && { checkInterval: parseInt(checkInterval) }),
    ...(enabled !== undefined && { enabled })
  };
  
  await saveTasks();
  res.json(monitoringTasks[taskIndex]);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const taskIndex = monitoringTasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Clear any existing interval for this task
  if (taskStatuses[id]) {
    clearInterval(taskStatuses[id].intervalId);
    delete taskStatuses[id];
  }
  
  monitoringTasks.splice(taskIndex, 1);
  await saveTasks();
  res.status(204).send();
});

// Function to get page content hash
async function getPageHash(url) {
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

// Function to compare content and detect changes
function detectChanges(oldContent, newContent) {
  // Simple comparison - in a real implementation, you might want more sophisticated diffing
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  
  const added = newLines.filter(line => !oldLines.includes(line));
  const removed = oldLines.filter(line => !newLines.includes(line));
  
  return {
    added: added.slice(0, 10), // Limit to first 10 changes
    removed: removed.slice(0, 10),
    totalAdded: added.length,
    totalRemoved: removed.length
  };
}

// Function to start monitoring a task
async function startMonitoring(task) {
  if (taskStatuses[task.id]) {
    // Already monitoring, clear the old interval
    clearInterval(taskStatuses[task.id].intervalId);
  }
  
  // Run initial check
  await checkTask(task);
  
  // Set up interval for periodic checks
  const intervalId = setInterval(async () => {
    await checkTask(task);
  }, task.checkInterval);
  
  taskStatuses[task.id] = { intervalId, task };
  console.log(`Started monitoring task: ${task.name} (${task.url})`);
}

// Function to stop monitoring a task
function stopMonitoring(taskId) {
  if (taskStatuses[taskId]) {
    clearInterval(taskStatuses[taskId].intervalId);
    delete taskStatuses[taskId];
    console.log(`Stopped monitoring task ID: ${taskId}`);
  }
}

// Function to check a single task
async function checkTask(task) {
  if (!task.enabled) {
    return;
  }
  
  try {
    console.log(`Checking ${task.name} (${task.url}) at ${new Date().toISOString()}`);
    const currentPage = await getPageHash(task.url);
    
    // Update last checked time
    task.lastChecked = new Date().toISOString();
    
    // Find the last stored version of this page
    const lastVersion = task.changeHistory.length > 0 
      ? task.changeHistory[task.changeHistory.length - 1] 
      : null;
    
    if (!lastVersion) {
      // First check - store the version
      task.changeHistory.push({
        hash: currentPage.hash,
        timestamp: currentPage.timestamp,
        size: currentPage.size
      });
      await saveTasks();
      return;
    }
    
    if (currentPage.hash !== lastVersion.hash) {
      console.log(`Change detected on ${task.name} (${task.url})!`);
      
      // Detect what specifically changed
      const changes = lastVersion.content 
        ? detectChanges(lastVersion.content, currentPage.content) 
        : { added: [], removed: [], totalAdded: 0, totalRemoved: 0 };
      
      // Record the change
      const changeRecord = {
        id: Date.now().toString(),
        fromHash: lastVersion.hash,
        toHash: currentPage.hash,
        timestamp: currentPage.timestamp,
        sizeBefore: lastVersion.size,
        sizeAfter: currentPage.size,
        changes: changes
      };
      
      task.lastChange = changeRecord;
      task.changeHistory.push({
        hash: currentPage.hash,
        timestamp: currentPage.timestamp,
        size: currentPage.size,
        content: currentPage.content // Store content for change detection
      });
      
      await saveTasks();
      
      // Emit the change to connected clients
      io.emit('change_detected', {
        taskId: task.id,
        taskName: task.name,
        change: changeRecord
      });
      
      // Send notification to the user (this would be integrated with OpenClaw's messaging)
      console.log(`Sending notification for change on ${task.name}`);
      
      // In a real OpenClaw integration, this would call the message tool
      // to send a WhatsApp notification
      sendNotification(task, changeRecord);
    }
  } catch (error) {
    console.error(`Error checking task ${task.name}:`, error.message);
  }
}

// Function to send notification
function sendNotification(task, changeRecord) {
  const message = `🚨 Webpage Change Alert! 🚨\n\n`;
  message += `Task: ${task.name}\n`;
  message += `URL: ${task.url}\n`;
  message += `Changed at: ${new Date(changeRecord.timestamp).toLocaleString()}\n\n`;
  
  if (changeRecord.changes.totalAdded > 0 || changeRecord.changes.totalRemoved > 0) {
    message += `Changes detected:\n`;
    message += `- Lines added: ${changeRecord.changes.totalAdded}\n`;
    message += `- Lines removed: ${changeRecord.changes.totalRemoved}\n\n`;
    
    if (changeRecord.changes.added.length > 0) {
      message += `Sample additions:\n${changeRecord.changes.added.slice(0, 3).join('\n')}\n\n`;
    }
    
    if (changeRecord.changes.removed.length > 0) {
      message += `Sample removals:\n${changeRecord.changes.removed.slice(0, 3).join('\n')}\n\n`;
    }
  }
  
  message += `Content size changed from ${changeRecord.sizeBefore} to ${changeRecord.sizeAfter} characters.`;
  
  console.log("NOTIFICATION WOULD BE SENT:", message);
  
  // In actual OpenClaw integration, this would send the message via WhatsApp
  // message({ action: 'send', message: message });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send current tasks to newly connected client
  socket.emit('tasks_update', monitoringTasks);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start monitoring all enabled tasks
async function startAllMonitoring() {
  for (const task of monitoringTasks) {
    if (task.enabled) {
      await startMonitoring(task);
    }
  }
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Monitoring Dashboard server running on port ${PORT}`);
  startAllMonitoring(); // Start monitoring all enabled tasks
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down monitoring dashboard...');
  
  // Stop all monitoring intervals
  for (const taskId in taskStatuses) {
    clearInterval(taskStatuses[taskId].intervalId);
  }
  
  process.exit(0);
});