// Server-side version of SketchManager using CommonJS syntax
const fs = require('fs').promises;
const path = require('path');

// Storage file path for server-side persistence
const STORAGE_FILE = path.join(__dirname, 'sketch_data.json');

// Helper function to validate a date string
function isValidDate(date) {
    if (!date) return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
}

// Load data from storage file
async function loadDataFromFile() {
    try {
        const data = await fs.readFile(STORAGE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or other error, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Error reading sketch data file:', error);
        return [];
    }
}

// Save data to storage file
async function saveDataToFile(data) {
    try {
        await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing sketch data file:', error);
        throw error;
    }
}

// Get sketches from storage
async function getSketchData() {
    try {
        const sketches = await loadDataFromFile();
        
        // Convert each date to "YYYY-MM-DD" if valid, default to today if invalid
        return sketches.map(sketch => ({
            ...sketch,
            date: isValidDate(sketch.date)
                ? new Date(sketch.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        }));
    } catch (error) {
        console.log('Error loading sketches:', error);
        return [];
    }
}

// Update sketch data
async function updateSketchData(arrSketches) {
    try {
        await saveDataToFile(arrSketches);
    } catch (error) {
        console.log('Error updating sketches:', error);
        throw error;
    }
}

// Delete a sketch by ID
async function deleteSketch(sketchId) {
    try {
        const sketches = await loadDataFromFile();
        const updatedSketches = sketches.filter(item => item.id !== sketchId);
        await saveDataToFile(updatedSketches);
    } catch (error) {
        console.error('Error deleting sketch:', error);
        throw error;
    }
}

// Clear all sketches
async function clearAllSketches() {
    try {
        await saveDataToFile([]);
        return [];
    } catch (error) {
        console.error('Error clearing sketches:', error);
        return [];
    }
}

// Load sample data
async function loadSampleData() {
    try {
        // Import sample data dynamically
        const sampleData = require('../data/sampleData').sampleData;
        
        // Get existing sketches
        const sketches = await getSketchData();
        
        // Avoid duplicates by checking IDs
        const newSketches = sampleData.filter(sample =>
            !sketches.some(sketch => sketch.id === sample.id)
        );
        
        if (newSketches.length > 0) {
            const updatedSketches = [...sketches, ...newSketches];
            await updateSketchData(updatedSketches);
            console.log("Sample Data Loaded");
        } else {
            console.log("Sample Data Already Exists or is partially loaded");
        }
    } catch (error) {
        console.error('Error loading sample data:', error);
        throw error;
    }
}

// Filter functions
function filterByWeek(sketches) {
    const now = new Date();
    return sketches.filter(sketch => {
        if (!isValidDate(sketch.date)) return false;
        const sketchDate = new Date(sketch.date);
        const diff = (now - sketchDate) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7; // Show sketches from last 7 days
    });
}

function filterByMonth(sketches) {
    const now = new Date();
    return sketches.filter(sketch => {
        if (!isValidDate(sketch.date)) return false;
        const sketchDate = new Date(sketch.date);
        return (
            sketchDate.getMonth() === now.getMonth() &&
            sketchDate.getFullYear() === now.getFullYear()
        );
    });
}

function filterAllTime(sketches) {
    return sketches; // No filtering, return everything
}

// Export functions using CommonJS syntax
module.exports = {
    getSketchData,
    updateSketchData,
    deleteSketch,
    clearAllSketches,
    loadSampleData,
    filterByWeek,
    filterByMonth,
    filterAllTime
};