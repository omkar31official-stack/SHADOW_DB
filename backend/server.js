const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection, setSocketIO } = require('./db/connection');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Share Socket.IO instance with DB connection module
setSocketIO(io);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/criminals', require('./routes/criminals'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/officers', require('./routes/officers'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/db', require('./routes/dbOperations'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', system: 'ShadowDB', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.emit('system:welcome', {
    message: 'Connected to ShadowDB System',
    timestamp: new Date().toISOString()
  });

  socket.on('simulate_operation', (data) => {
    // Broadcast as a real DB operation to trigger the visualization panel
    io.emit('db:operation', {
      ...data,
      is_simulation: true
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function start() {
  const dbConnected = await testConnection();
  
  server.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║        SHADOWDB SYSTEM - ONLINE          ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Server:    http://localhost:${PORT}         ║`);
    console.log(`║  Database:  ${dbConnected ? '✅ Connected' : '❌ Disconnected'}              ║`);
    console.log(`║  WebSocket: ✅ Active                     ║`);
    console.log('╚══════════════════════════════════════════╝\n');
  });
}

start();
