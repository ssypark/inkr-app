import AsyncStorage from '@react-native-async-storage/async-storage';
import { sampleData } from '../data/sampleData';

// we first define a key for the AsyncStorage item
// this key will be used to store and retrieve the sketch data
const STORAGE_KEY = 'SKETCH_DATA';

// I was having difficulty with the date format, so I created a helper function to convert the date to a string
// Helper function to validate a date string
// we need to check if the date is valid before storing it in AsyncStorage
// the format should be "YYYY-MM-DD" so we can sort and filter sketches by date
function isValidDate(date) {
    if (!date) return false;
    const parsedDate = new Date(date); // paredDate is a Date object that will be invalid if the date string is not in a valid format
    return !isNaN(parsedDate.getTime()); // getTime() returns NaN for invalid dates
}

// this function deletes a sketch from storage by its ID
export async function deleteSketch(sketchId) {
    console.log("Deleting sketch with ID:", sketchId);
    try {
        // Fetch existing sketches
        let storedData = await AsyncStorage.getItem(STORAGE_KEY);
        let sketches = storedData ? JSON.parse(storedData) : [];

        // Filter out the item
        const updatedSketches = sketches.filter(item => item.id !== sketchId);

        // console.log("Updated sketches after removal:", updatedSketches);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSketches));
    } catch (error) {
        console.error('Error deleting sketch:', error);
    }
}

// Get sketches from storage without automatically reloading sample data
export async function getSketchData() {
    try {
        // Fetch existing sketches
        let rawData = await AsyncStorage.getItem(STORAGE_KEY);
        let sketches = rawData ? JSON.parse(rawData) : [];

        // Convert each date to "YYYY-MM-DD" if valid, default to today if invalid
        sketches = sketches.map(sketch => ({
            ...sketch,
            date: isValidDate(sketch.date)
                ? new Date(sketch.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        }));

        // Return sketches sorted by date (newest first)
        return sketches;
    } catch (error) {
        console.log('Error loading sketches:', error);
        return [];
    }
}

// Overwrite the full list of sketches
// this function will be used to update the sketch data in AsyncStorage when a new sketch is added or an existing sketch is deleted
export async function updateSketchData(arrSketches) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arrSketches));
    } catch (error) {
        console.log('Error updating sketches:', error);
    }
}

// Clear all sketches from storage
export async function clearAllSketches() {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY); // Remove stored sketches
        console.log("All sketches cleared");
        return []; // Return empty array so UI can update
    } catch (error) {
        console.error("Error clearing sketches:", error);
        return [];
    }
}

// Load sample sketches manually (avoiding duplicates)
export async function loadSampleData() {
    try {
        let sketches = await getSketchData();

        // Avoid duplicates by checking IDs
        const newSketches = sampleData.filter(sample =>
            !sketches.some(userSketch => userSketch.id === sample.id)
        );

        if (newSketches.length > 0) {
            const updatedSketches = [...sketches, ...newSketches];
            await updateSketchData(updatedSketches);
            console.log("Sample Data Loaded");
        } else {
            console.log("Sample Data Already Exists or is partially loaded");
        }
    } catch (error) {
        console.error("Error loading sample data:", error);
    }
}

// FILTER FUNCTIONS
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