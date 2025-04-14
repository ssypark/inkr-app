const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable or default to 3001

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for requests from your app
app.use(express.json()); // Enable parsing of JSON request bodies

// --- In-memory Data (Replace with Database later) ---
// Simple list of prompts for the daily endpoint
const dailyPrompts = [
  "A lone tree on a hill",
  "City skyline at sunset",
  "A curious cat",
  "Abstract shapes and lines",
  "Your favorite food",
  "Something you see right now",
  "A dream you had",
  "Under the sea",
  "In the clouds",
  "Portrait of a friend"
];

// Placeholder for sketches (replace with database interaction)
let sketches = []; // In-memory store for now

// --- API Routes ---

// GET Daily Prompt
app.get('/api/prompts/daily', (req, res) => {
  console.log('GET /api/prompts/daily');
  const randomIndex = Math.floor(Math.random() * dailyPrompts.length);
  res.json({ prompt: dailyPrompts[randomIndex] });
});

// GET All Sketches (Placeholder)
app.get('/api/sketches', (req, res) => {
  console.log('GET /api/sketches');
  // In a real app, fetch from database here
  res.json(sketches);
});

// POST Add a new Sketch (Placeholder)
// Note: For simplicity, this adds one sketch. You might adapt it
// or create a separate /batch endpoint if needed.
app.post('/api/sketches', (req, res) => {
  console.log('POST /api/sketches', req.body);
  const newSketch = req.body;
  // Basic validation (add more robust validation later)
  if (!newSketch || !newSketch.id || !newSketch.uri || !newSketch.date) {
    return res.status(400).json({ message: 'Invalid sketch data provided.' });
  }
  // Add ID generation if not provided by client (e.g., using uuid)
  // Check for duplicate IDs if necessary
  const existingIndex = sketches.findIndex(s => s.id === newSketch.id);
  if (existingIndex !== -1) {
      // Update existing sketch
      sketches[existingIndex] = newSketch;
      console.log('Updated sketch:', newSketch.id);
      res.status(200).json(newSketch);
  } else {
      // Add new sketch
      sketches.push(newSketch);
      console.log('Added new sketch:', newSketch.id);
      res.status(201).json(newSketch); // 201 Created
  }

});

// DELETE a Sketch (Placeholder)
app.delete('/api/sketches/:id', (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/sketches/${id}`);
  const initialLength = sketches.length;
  sketches = sketches.filter(sketch => sketch.id !== id);

  if (sketches.length < initialLength) {
    console.log(`Deleted sketch: ${id}`);
    res.status(200).json({ message: `Sketch ${id} deleted successfully.` }); // Or 204 No Content
  } else {
    console.log(`Sketch not found: ${id}`);
    res.status(404).json({ message: `Sketch ${id} not found.` });
  }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Inkr backend server running on http://localhost:${PORT}`);
});
