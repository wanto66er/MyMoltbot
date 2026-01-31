// Socket connection
const socket = io();

// DOM elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const itemsLeftSpan = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// State
let todos = [];
let currentFilter = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Load initial todos
  socket.on('initial_todos', (initialTodos) => {
    todos = initialTodos;
    renderTodos();
  });

  // Handle new todo added
  socket.on('todo_added', (todo) => {
    todos.push(todo);
    renderTodos();
  });

  // Handle todo toggled
  socket.on('todo_toggled', (data) => {
    const todo = todos.find(t => t.id === data.id);
    if (todo) {
      todo.completed = data.completed;
      renderTodos();
    }
  });

  // Handle todo deleted
  socket.on('todo_deleted', (id) => {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
  });

  // Handle todo updated
  socket.on('todo_updated', (data) => {
    const todo = todos.find(t => t.id === data.id);
    if (todo) {
      todo.text = data.text;
      renderTodos();
    }
  });

  // Event listeners
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Check if PWA features are supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
});

// Functions
function addTodo() {
  const text = todoInput.value.trim();
  if (text) {
    socket.emit('add_todo', { text });
    todoInput.value = '';
    todoInput.focus();
  }
}

function toggleTodo(id) {
  socket.emit('toggle_todo', id);
}

function deleteTodo(id) {
  socket.emit('delete_todo', id);
}

function updateTodo(id, text) {
  socket.emit('update_todo', { id, text });
}

function clearCompleted() {
  const completedIds = todos.filter(todo => todo.completed).map(todo => todo.id);
  completedIds.forEach(id => deleteTodo(id));
}

function renderTodos() {
  // Filter todos based on current filter
  let filteredTodos = [...todos];
  if (currentFilter === 'active') {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter(todo => todo.completed);
  }

  // Render todos
  todoList.innerHTML = '';
  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (todo.completed) {
      li.classList.add('completed');
    }
    
    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="edit-btn" data-id="${todo.id}" title="Edit">✎</button>
        <button class="delete-btn" data-id="${todo.id}" title="Delete">✕</button>
      </div>
    `;
    
    todoList.appendChild(li);
  });

  // Update stats
  const activeCount = todos.filter(todo => !todo.completed).length;
  itemsLeftSpan.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;

  // Add event listeners to new elements
  document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const id = parseInt(e.target.dataset.id);
      toggleTodo(id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.closest('.delete-btn').dataset.id);
      deleteTodo(id);
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.closest('.edit-btn').dataset.id);
      editTodo(id);
    });
  });
}

function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const newText = prompt('Edit your task:', todo.text);
  if (newText !== null && newText.trim() !== '') {
    updateTodo(id, newText.trim());
  }
}

// Simple HTML escaping to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add touch feedback for mobile devices
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('touchstart', function() {
    this.classList.add('pressed');
  });
  
  button.addEventListener('touchend', function() {
    setTimeout(() => {
      this.classList.remove('pressed');
    }, 150);
  });
});