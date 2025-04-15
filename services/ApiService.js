// API Service to connect to the remote backend
const API_URL = 'https://inkr-backend.onrender.com';

/**
 * Fetch a daily sketch prompt from the server
 */
export const fetchDailyPrompt = async () => {
  try {
    const response = await fetch(`${API_URL}/api/prompts/daily`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data.prompt;
  } catch (error) {
    console.error('Error fetching daily prompt:', error);
    return null;
  }
};

/**
 * Fetch all sketches with optional filtering
 * @param {string} filter - Filter type: 'week', 'month', or 'all'
 */
export const fetchSketches = async (filter = 'all') => {
  try {
    const response = await fetch(`${API_URL}/api/sketches?filter=${filter}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sketches:', error);
    return [];
  }
};

/**
 * Save a new sketch or update an existing one
 * @param {Object} sketch - The sketch object to save
 */
export const saveSketch = async (sketch) => {
  try {
    const response = await fetch(`${API_URL}/api/sketches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sketch),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving sketch:', error);
    return null;
  }
};

/**
 * Delete a sketch by ID
 * @param {string} id - The ID of the sketch to delete
 */
export const removeSketch = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/sketches/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting sketch:', error);
    return null;
  }
};

/**
 * Load sample data
 */
export const loadSamples = async () => {
  try {
    const response = await fetch(`${API_URL}/api/sketches/load-samples`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading samples:', error);
    return null;
  }
};