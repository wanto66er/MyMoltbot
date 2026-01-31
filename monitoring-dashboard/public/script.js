// Socket connection
const socket = io();

// DOM elements
const addTaskForm = document.getElementById('add-task-form');
const tasksContainer = document.getElementById('tasks-container');

// State
let tasks = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Load initial tasks
  socket.on('tasks_update', (receivedTasks) => {
    tasks = receivedTasks;
    renderTasks();
  });

  // Handle change detections
  socket.on('change_detected', (data) => {
    console.log('Change detected:', data);
    // Update the task in the list to show the change
    const task = tasks.find(t => t.id === data.taskId);
    if (task) {
      task.lastChange = data.change;
      renderTasks();
    }
    
    // Show a visual notification
    showNotification(`${data.taskName} has changed!`);
  });

  // Form submission
  addTaskForm.addEventListener('submit', handleAddTask);
});

// Functions
function handleAddTask(e) {
  e.preventDefault();
  
  const name = document.getElementById('task-name').value;
  const url = document.getElementById('task-url').value;
  const intervalMinutes = document.getElementById('check-interval').value;
  const enabled = document.getElementById('task-enabled').checked;
  
  const checkInterval = parseInt(intervalMinutes) * 60 * 1000; // Convert to milliseconds
  
  // Send the new task to the server
  fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      url,
      checkInterval,
      enabled
    })
  })
  .then(response => response.json())
  .then(task => {
    // Reset form
    addTaskForm.reset();
    document.getElementById('task-enabled').checked = true;
    
    // The server will emit an updated task list, so we don't need to manually add it
  })
  .catch(error => {
    console.error('Error adding task:', error);
    alert('Error adding task: ' + error.message);
  });
}

function handleDeleteTask(taskId) {
  if (confirm('Are you sure you want to delete this monitoring task?')) {
    fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.status === 204) {
        // The server will emit an updated task list, so we don't need to manually remove it
      }
    })
    .catch(error => {
      console.error('Error deleting task:', error);
      alert('Error deleting task: ' + error.message);
    });
  }
}

function handleToggleTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      enabled: !task.enabled
    })
  })
  .then(response => response.json())
  .then(updatedTask => {
    // The server will emit an updated task list
  })
  .catch(error => {
    console.error('Error updating task:', error);
    alert('Error updating task: ' + error.message);
  });
}

function showNotification(message) {
  // Create a temporary notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#fef3c7';
  notification.style.color = '#92400e';
  notification.style.padding = '1rem';
  notification.style.borderRadius = '0.5rem';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  notification.style.border = '1px solid #fbbf24';
  
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 5000);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function renderTasks() {
  if (tasks.length === 0) {
    tasksContainer.innerHTML = '<div class="no-tasks"><p>No monitoring tasks yet. Add your first task above!</p></div>';
    return;
  }
  
  tasksContainer.innerHTML = tasks.map(task => {
    const lastChecked = task.lastChecked ? formatDate(task.lastChecked) : 'Never';
    const lastChange = task.lastChange ? formatDate(task.lastChange.timestamp) : 'None';
    
    return `
      <div class="task-card">
        <div class="task-header">
          <div>
            <span class="status-indicator ${task.enabled ? 'status-active' : 'status-inactive'}"></span>
            <span class="task-name">${task.name}</span>
          </div>
          <div>
            <button class="btn-${task.enabled ? 'disable' : 'enable'}" onclick="handleToggleTask('${task.id}')">
              ${task.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
        
        <div class="task-url">${task.url}</div>
        
        <div class="task-meta">
          <div class="meta-item">
            <span>.Interval:</span>
            <span>${Math.round(task.checkInterval / 60000)} min</span>
          </div>
          <div class="meta-item">
            <span>Last checked:</span>
            <span>${lastChecked}</span>
          </div>
          <div class="meta-item">
            <span>Last change:</span>
            <span>${lastChange}</span>
          </div>
        </div>
        
        ${task.lastChange ? `
        <div class="change-alert">
          <h4>Recent Change Detected!</h4>
          <div class="change-details">
            <p><strong>When:</strong> ${formatDate(task.lastChange.timestamp)}</p>
            <p><strong>Size:</strong> ${task.lastChange.sizeBefore} → ${task.lastChange.sizeAfter} chars</p>
            ${task.lastChange.changes ? `
            <p><strong>Changes:</strong> +${task.lastChange.changes.totalAdded} added, -${task.lastChange.changes.totalRemoved} removed</p>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <div class="task-actions">
          <button class="btn-delete" onclick="handleDeleteTask('${task.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// Make functions available globally for inline onclick handlers
window.handleDeleteTask = handleDeleteTask;
window.handleToggleTask = handleToggleTask;