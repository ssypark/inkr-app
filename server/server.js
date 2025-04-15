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
} = require('./sketchManager.server'); // Remove the 'w' typo here

// Define the prompts list directly in the server file
const prompts = [
    "Drift",
    "Echo",
    "Fragment",
    "Lush",
    "Obscure",
    "Weightless",
    "Horizon",
    "Stillness",
    "Twist",
    "Hollow",
    "Surge",
    "Veil",
    "Balance",
    "Tangle",
    "Illuminate",
    "Threshold",
    "Flicker",
    "Wander",
    "Glimpse",
    "Ethereal",
    "Chasm",
    "Resonance",
    "Frost",
    "Crackle",
    "Nest",
    "Bloom",
    "Shatter",
    "Ember",
    "Pulse",
    "Ripple",
    "Decay",
    "Flutter",
    "Gravity",
    "Gossamer",
    "Echoes of Time"
];

const app = express();
const PORT = process.env.PORT || 10000; // Use environment variable or default to 3001

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for requests from your app
app.use(express.json({ 
  limit: '10mb' // Increase payload size limit to 10MB
})); 
app.use(express.urlencoded({
  limit: '10mb',
  extended: true
})); // Configure URL-encoded bodies with increased limits too

// --- API Routes ---

// UPDATED: GET Daily Prompt - One prompt per day of year
app.get('/api/prompts/daily', (req, res) => {
  console.log('GET /api/prompts/daily');
  
  // Get the current date
  const today = new Date();
  
  // Calculate day of year (0-365)
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Use day of year to select a prompt, cycling through the list as needed
  const promptIndex = dayOfYear % prompts.length;
  const todaysPrompt = prompts[promptIndex];
  
  const formattedDate = today.toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  });
  
  console.log(`Serving prompt "${todaysPrompt}" for ${formattedDate} (Day ${dayOfYear} of year)`);
  
  res.json({ 
    prompt: todaysPrompt,
    date: formattedDate
  });
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
