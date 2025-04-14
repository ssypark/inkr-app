const express = require('express');
const cors = require('cors');
// Import SketchManager functions from the server-compatible version
const { 
  getSketchData, 
  updateSketchData, 
  deleteSketch, 
  loadSampleData,
  filterByWeek,
  filterByMonth,
  filterAllTime
} = require('./sketchManager.server');

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

// --- API Routes ---

// GET Daily Prompt
app.get('/api/prompts/daily', (req, res) => {
  console.log('GET /api/prompts/daily');
  const randomIndex = Math.floor(Math.random() * dailyPrompts.length);
  res.json({ prompt: dailyPrompts[randomIndex] });
});

// GET All Sketches (Now using SketchManager)
app.get('/api/sketches', async (req, res) => {
  console.log('GET /api/sketches');
  try {
    // Get filter type from query params if provided
    const filterType = req.query.filter || 'all';
    
    // Get sketches from file storage
    let sketches = await getSketchData();
    
    // Apply filters if needed
    switch(filterType) {
      case 'week':
        sketches = filterByWeek(sketches);
        break;
      case 'month':
        sketches = filterByMonth(sketches);
        break;
      case 'all':
      default:
        sketches = filterAllTime(sketches);
    }
    
    res.json(sketches);
  } catch (error) {
    console.error('Error fetching sketches:', error);
    res.status(500).json({ message: 'Failed to fetch sketches' });
  }
});

// POST Add a new Sketch (Now using SketchManager)
app.post('/api/sketches', async (req, res) => {
  console.log('POST /api/sketches', req.body);
  const newSketch = req.body;
  
  // Basic validation
  if (!newSketch || !newSketch.id || !newSketch.uri || !newSketch.date) {
    return res.status(400).json({ message: 'Invalid sketch data provided.' });
  }
  
  try {
    // Get current sketches
    const sketches = await getSketchData();
    
    // Check for duplicates
    const existingIndex = sketches.findIndex(s => s.id === newSketch.id);
    if (existingIndex !== -1) {
      // Update existing sketch
      sketches[existingIndex] = newSketch;
      await updateSketchData(sketches);
      console.log('Updated sketch:', newSketch.id);
      res.status(200).json(newSketch);
    } else {
      // Add new sketch
      const updatedSketches = [...sketches, newSketch];
      await updateSketchData(updatedSketches);
      console.log('Added new sketch:', newSketch.id);
      res.status(201).json(newSketch); // 201 Created
    }
  } catch (error) {
    console.error('Error saving sketch:', error);
    res.status(500).json({ message: 'Failed to save sketch' });
  }
});

// DELETE a Sketch (Now using SketchManager)
app.delete('/api/sketches/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/sketches/${id}`);
  
  try {
    // Get current sketches to check if the ID exists
    const sketches = await getSketchData();
    const initialLength = sketches.length;
    
    // Use the SketchManager deleteSketch function
    await deleteSketch(id);
    
    // Verify deletion was successful by getting updated list
    const updatedSketches = await getSketchData();
    
    if (updatedSketches.length < initialLength) {
      console.log(`Deleted sketch: ${id}`);
      res.status(200).json({ message: `Sketch ${id} deleted successfully.` });
    } else {
      console.log(`Sketch not found: ${id}`);
      res.status(404).json({ message: `Sketch ${id} not found.` });
    }
  } catch (error) {
    console.error('Error deleting sketch:', error);
    res.status(500).json({ message: 'Failed to delete sketch' });
  }
});

// NEW: Load sample data endpoint
app.post('/api/sketches/load-samples', async (req, res) => {
  console.log('POST /api/sketches/load-samples');
  try {
    await loadSampleData();
    const sketches = await getSketchData();
    res.status(200).json({ 
      message: 'Sample data loaded successfully',
      count: sketches.length
    });
  } catch (error) {
    console.error('Error loading sample data:', error);
    res.status(500).json({ message: 'Failed to load sample data' });
  }
});

// --- Start Server ---
// Listen on the port, and if there's an error (like port already in use),
// try a different port
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Inkr backend server running on http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use, trying port ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

// Start the server
startServer(PORT);
