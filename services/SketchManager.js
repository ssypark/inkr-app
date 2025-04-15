import AsyncStorage from '@react-native-async-storage/async-storage';
import { sampleData } from '../data/sampleData';
import * as ApiService from './ApiService'; 

// we first define a key for the AsyncStorage item
// this key will be used to store and retrieve the sketch data
const STORAGE_KEY = 'SKETCH_DATA';

// Helper function to validate a date string
function isValidDate(date) {
    if (!date) return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
}

// Delete a sketch from storage by its ID
export async function deleteSketch(sketchId) {
    console.log("Deleting sketch with ID:", sketchId);
    try {
        // First try to delete from the server
        await ApiService.removeSketch(sketchId);
        
        // If successful or not, also update local storage as a backup
        let storedData = await AsyncStorage.getItem(STORAGE_KEY);
        let sketches = storedData ? JSON.parse(storedData) : [];
        const updatedSketches = sketches.filter(item => item.id !== sketchId);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSketches));
    } catch (error) {
        console.error('Error deleting sketch:', error);
        // If server fails, still try to update local storage
        try {
            let storedData = await AsyncStorage.getItem(STORAGE_KEY);
            let sketches = storedData ? JSON.parse(storedData) : [];
            const updatedSketches = sketches.filter(item => item.id !== sketchId);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSketches));
        } catch (localError) {
            console.error('Error updating local storage:', localError);
        }
    }
}

// Get sketches from storage without automatically reloading sample data
export async function getSketchData() {
    try {
        // First try to fetch from the server
        const serverSketches = await ApiService.fetchSketches();
        
        if (serverSketches && serverSketches.length > 0) {
            // Convert each date to "YYYY-MM-DD" if valid, default to today if invalid
            const formattedSketches = serverSketches.map(sketch => ({
                ...sketch,
                date: isValidDate(sketch.date)
                    ? new Date(sketch.date).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
            }));
            
            // Also update local storage as a backup
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formattedSketches));
            } catch (localError) {
                console.error('Error updating local storage:', localError);
            }
            
            return formattedSketches;
        }
        
        // If server request fails or returns no data, fall back to local storage
        let rawData = await AsyncStorage.getItem(STORAGE_KEY);
        let sketches = rawData ? JSON.parse(rawData) : [];

        // Convert each date to "YYYY-MM-DD" if valid, default to today if invalid
        sketches = sketches.map(sketch => ({
            ...sketch,
            date: isValidDate(sketch.date)
                ? new Date(sketch.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        }));

        return sketches;
    } catch (error) {
        console.log('Error loading sketches from server, falling back to local:', error);
        
        // Fall back to local storage
        try {
            let rawData = await AsyncStorage.getItem(STORAGE_KEY);
            let sketches = rawData ? JSON.parse(rawData) : [];

            // Convert each date to "YYYY-MM-DD" if valid, default to today if invalid
            sketches = sketches.map(sketch => ({
                ...sketch,
                date: isValidDate(sketch.date)
                    ? new Date(sketch.date).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
            }));

            return sketches;
        } catch (localError) {
            console.error('Error loading sketches from local storage:', localError);
            return [];
        }
    }
}

// Overwrite the full list of sketches
export async function updateSketchData(arrSketches) {
    try {
        // For each sketch in the array, save to server
        for (const sketch of arrSketches) {
            await ApiService.saveSketch(sketch);
        }
        
        // Also update local storage as a backup
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arrSketches));
    } catch (error) {
        console.log('Error updating sketches on server, falling back to local:', error);
        
        // Fall back to local storage
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arrSketches));
        } catch (localError) {
            console.error('Error updating local storage:', localError);
        }
    }
}

// Clear all sketches from storage
export async function clearAllSketches() {
    try {
        // Fetch all sketches from server or local storage
        const sketches = await getSketchData();
        
        // Delete each sketch from server
        for (const sketch of sketches) {
            await ApiService.removeSketch(sketch.id);
        }
        
        // Also clear local storage
        await AsyncStorage.removeItem(STORAGE_KEY);
        
        console.log("All sketches cleared");
        return [];
    } catch (error) {
        console.error("Error clearing sketches:", error);
        
        // Try to at least clear local storage
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (localError) {
            console.error("Error clearing local sketches:", localError);
        }
        
        return [];
    }
}

// Load sample sketches manually (avoiding duplicates)
export async function loadSampleData() {
    try {
        // Try to load samples from server
        const result = await ApiService.loadSamples();
        console.log("Sample data loaded from server:", result);
        
        // No need to manipulate local storage, the getSketchData function 
        // will handle fetching from server next time it's called
    } catch (error) {
        console.error("Error loading sample data from server, using local fallback:", error);
        
        // Fall back to local implementation
        try {
            let sketches = await getSketchData();

            // Avoid duplicates by checking IDs
            const newSketches = sampleData.filter(sample =>
                !sketches.some(userSketch => userSketch.id === sample.id)
            );

            if (newSketches.length > 0) {
                const updatedSketches = [...sketches, ...newSketches];
                await updateSketchData(updatedSketches);
                console.log("Sample Data Loaded Locally");
            } else {
                console.log("Sample Data Already Exists or is partially loaded");
            }
        } catch (localError) {
            console.error("Error loading sample data locally:", localError);
        }
    }
}

// FILTER FUNCTIONS - These will now work with data from either source
export function filterByWeek(sketches) {
    const now = new Date();
    return sketches.filter(sketch => {
        if (!isValidDate(sketch.date)) return false;
        const sketchDate = new Date(sketch.date);
        const diff = (now - sketchDate) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7; // Show sketches from last 7 days
    });
}

export function filterByMonth(sketches) {
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

export function filterAllTime(sketches) {
    return sketches; // No filtering, return everything
}