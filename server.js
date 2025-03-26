// server.js
// A simple Node.js/Express backend to support your front end

// Import dependencies
const express = require('express');
const multer  = require('multer');
const path = require('path');

// Create an instance of Express
const app = express();
const port = process.env.PORT || 8080;

// Set up multer for handling file uploads (files temporarily saved in "uploads/")
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// Middleware to parse JSON bodies in requests
app.use(express.json());

// -------------------------------
// In-Memory Data Stores (Demo Purposes)
// -------------------------------
let users = [{ username: "test", password: "test" }]; // Dummy user (use a database and hash passwords in production)
let diaryEntries = [];
let memories = [];
let photos = [];

// -------------------------------
// Authentication Endpoint
// -------------------------------
// POST /api/login
// Expects JSON: { username, password }
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Returns a dummy token; in real apps, use JWT or sessions.
    res.json({ success: true, message: 'Login successful', token: "dummy-token" });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// -------------------------------
// Simple Authentication Middleware
// -------------------------------
// Checks if the request includes a header "authorization" with value "dummy-token"
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (token === "dummy-token") {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

// -------------------------------
// Diary Endpoints
// -------------------------------
// GET /api/diary - Retrieve all diary entries
app.get('/api/diary', authMiddleware, (req, res) => {
  res.json(diaryEntries);
});

// POST /api/diary - Create a new diary entry (expects JSON { title, content })
app.post('/api/diary', authMiddleware, (req, res) => {
  const { title, content } = req.body;
  const entry = { id: diaryEntries.length + 1, title, content, date: new Date() };
  diaryEntries.push(entry);
  res.json({ success: true, entry });
});

// -------------------------------
// Memories Endpoints
// -------------------------------
// GET /api/memories - Retrieve all memories
app.get('/api/memories', authMiddleware, (req, res) => {
  res.json(memories);
});

// POST /api/memories - Add a new memory (expects JSON { title, description })
app.post('/api/memories', authMiddleware, (req, res) => {
  const { title, description } = req.body;
  const memory = { id: memories.length + 1, title, description, date: new Date() };
  memories.push(memory);
  res.json({ success: true, memory });
});

// -------------------------------
// Photos Endpoints
// -------------------------------
// GET /api/photos - Retrieve all photos
app.get('/api/photos', authMiddleware, (req, res) => {
  res.json(photos);
});

// POST /api/photos - Upload a photo file using form-data key "photo"
app.post('/api/photos', authMiddleware, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No photo uploaded' });
  }
  const photoEntry = {
    id: photos.length + 1,
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    uploadDate: new Date()
  };
  photos.push(photoEntry);
  res.json({ success: true, photo: photoEntry });
});

// -------------------------------
// Serve Your Frontend
// -------------------------------
// Place your front-end files (HTML, CSS, JS) in the "public" folder.
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------
// Start the Server
// -------------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
