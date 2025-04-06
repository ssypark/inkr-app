const sketchImages = { // since we are using local images, we need to import them. require() is used to import images in React Native
    s1: require("../assets/sampleSketches/s1.jpg"),
    s2: require("../assets/sampleSketches/s2.jpg"),
    s3: require("../assets/sampleSketches/s3.jpg"),
    s4: require("../assets/sampleSketches/s4.jpg"),
    s5: require("../assets/sampleSketches/s5.jpg"),
    s6: require("../assets/sampleSketches/s6.jpg"),
    s7: require("../assets/sampleSketches/s7.jpg"),
    s8: require("../assets/sampleSketches/s8.jpg"),
    s9: require("../assets/sampleSketches/s9.jpg"),
    s10: require("../assets/sampleSketches/s10.jpg"),
    s11: require("../assets/sampleSketches/s11.jpg"),
    s12: require("../assets/sampleSketches/s12.jpg"),
    s13: require("../assets/sampleSketches/s13.jpg"),
    s14: require("../assets/sampleSketches/s14.jpg"),
    s15: require("../assets/sampleSketches/s15.jpg"),
    s16: require("../assets/sampleSketches/s16.jpg"),
    s17: require("../assets/sampleSketches/s17.jpg"),
    s18: require("../assets/sampleSketches/s18.jpg"),
    s19: require("../assets/sampleSketches/s19.jpg"),
    s20: require("../assets/sampleSketches/s20.jpg"),
    s21: require("../assets/sampleSketches/s21.jpg"),
    s22: require("../assets/sampleSketches/s22.jpg"),
    s23: require("../assets/sampleSketches/s23.jpg"),
    s24: require("../assets/sampleSketches/s24.jpg"),
    s25: require("../assets/sampleSketches/s25.jpg"),
    s26: require("../assets/sampleSketches/s26.jpg"),
    s27: require("../assets/sampleSketches/s27.jpg"),
    s28: require("../assets/sampleSketches/s28.jpg"),
    s29: require("../assets/sampleSketches/s29.jpg"),
    s30: require("../assets/sampleSketches/s30.jpg"),
};

// sample data for testing
// this data will be used to populate the sketch list when the app is first launched
// each item in the list is an object with the following properties:
// - id: a unique identifier for the sketch
// - date: the date the sketch was created, in the format "YYYY-MM-DD"
// - prompt: the prompt for the sketch
// - imageUri: the URI of the image for the sketch

// the imageUri is a reference to one of the images imported above
// the date is in the format "YYYY-MM-DD" so we can sort and filter sketches by date
// the sample data includes 30 sketches, one for each day of the month
// the sketches are based on the Inktober 2025 prompt list
// the images are stored locally in the assets/sampleSketches folder
// the image URIs are imported above using require()
// the user can then add new sketches or delete existing ones
// the sample data is used for testing and demonstration purposes
// the actual sketches created by the user will be stored in AsyncStorage
// and loaded when the app is launched
export const sampleData = [
    { id: "1", date: "2025-02-11", prompt: "Drift", imageUri: sketchImages.s1 },
    { id: "2", date: "2025-02-12", prompt: "Echo", imageUri: sketchImages.s2 },
    { id: "3", date: "2025-02-13", prompt: "Fragment", imageUri: sketchImages.s3 },
    { id: "4", date: "2025-02-14", prompt: "Illuminate", imageUri: sketchImages.s4 },
    { id: "5", date: "2025-02-15", prompt: "Whisper", imageUri: sketchImages.s5 },
    { id: "6", date: "2025-02-16", prompt: "Shatter", imageUri: sketchImages.s6 },
    { id: "7", date: "2025-02-17", prompt: "Horizon", imageUri: sketchImages.s7 },
    { id: "8", date: "2025-02-18", prompt: "Glimpse", imageUri: sketchImages.s8 },
    { id: "9", date: "2025-02-19", prompt: "Surge", imageUri: sketchImages.s9 },
    { id: "10", date: "2025-02-20", prompt: "Misty", imageUri: sketchImages.s10 },
    { id: "11", date: "2025-02-21", prompt: "Veil", imageUri: sketchImages.s11 },
    { id: "12", date: "2025-02-22", prompt: "Obscure", imageUri: sketchImages.s12 },
    { id: "13", date: "2025-02-23", prompt: "Crimson", imageUri: sketchImages.s13 },
    { id: "14", date: "2025-02-24", prompt: "Twilight", imageUri: sketchImages.s14 },
    { id: "15", date: "2025-02-25", prompt: "Ephemeral", imageUri: sketchImages.s15 },
    { id: "16", date: "2025-02-26", prompt: "Stillness", imageUri: sketchImages.s16 },
    { id: "17", date: "2025-02-27", prompt: "Ripple", imageUri: sketchImages.s17 },
    { id: "18", date: "2025-02-28", prompt: "Flicker", imageUri: sketchImages.s18 },
    { id: "19", date: "2025-03-01", prompt: "Awaken", imageUri: sketchImages.s19 },
    { id: "20", date: "2025-03-02", prompt: "Linger", imageUri: sketchImages.s20 },
    { id: "21", date: "2025-03-03", prompt: "Breeze", imageUri: sketchImages.s21 },
    { id: "22", date: "2025-03-04", prompt: "Solitude", imageUri: sketchImages.s22 },
    { id: "23", date: "2025-03-05", prompt: "Echoes", imageUri: sketchImages.s23 },
    { id: "24", date: "2025-03-06", prompt: "Wander", imageUri: sketchImages.s24 },
    { id: "25", date: "2025-03-07", prompt: "Stargaze", imageUri: sketchImages.s25 },
    { id: "26", date: "2025-03-08", prompt: "Frost", imageUri: sketchImages.s26 },
    { id: "27", date: "2025-03-09", prompt: "Ember", imageUri: sketchImages.s27 },
    { id: "28", date: "2025-03-10", prompt: "Flow", imageUri: sketchImages.s28 },
    { id: "29", date: "2025-03-11", prompt: "Lantern", imageUri: sketchImages.s29 },
    { id: "30", date: "2025-03-12", prompt: "Cascade", imageUri: sketchImages.s30 },
];