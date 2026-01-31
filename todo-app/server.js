const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// In-memory storage for todos (in production, you'd use a database)
let todos = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send initial todos
  socket.emit('initial_todos', todos);

  // Handle adding a new todo
  socket.on('add_todo', (data) => {
    const newTodo = {
      id: Date.now(),
      text: data.text,
      completed: false,
      createdAt: new Date()
    };
    todos.push(newTodo);
    io.emit('todo_added', newTodo); // Broadcast to all clients
  });

  // Handle toggling todo completion
  socket.on('toggle_todo', (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      io.emit('todo_toggled', { id, completed: todo.completed });
    }
  });

  // Handle deleting a todo
  socket.on('delete_todo', (id) => {
    todos = todos.filter(t => t.id !== id);
    io.emit('todo_deleted', id);
  });

  // Handle updating a todo
  socket.on('update_todo', (data) => {
    const todo = todos.find(t => t.id === data.id);
    if (todo) {
      todo.text = data.text;
      io.emit('todo_updated', { id: data.id, text: data.text });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Todo app listening on port ${PORT}`);
});