# Inkr

A simple mobile app that provides daily drawing prompts and allows users to upload and manage their sketches – all to foster creativity in a fun, consistent way.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Technologies & Dependencies](#technologies--dependencies)
- [Team](#team)
- [License](#license)

---

## Overview

Inkr is a React Native (Expo) app designed to promote daily sketching. Users see a fresh prompt, can upload images of their sketches, and filter them by various time ranges. Sketch data is stored locally, so it persists between sessions without external servers.

---

## Features

1. **Home Screen**  
   - Displays all sketches in a grid  
   - Filter by **week**, **month**, or **all time**

2. **Prompt Screen**  
   - Shows a new drawing prompt each day  
   - Allows uploading completed sketches from the device gallery

3. **Sketch Detail Screen**  
   - Displays a larger version of a selected sketch  
   - Supports deleting sketches with one tap

4. **Help Screen**  
   - Outlines how to use Inkr  
   - Buttons for loading sample sketches or clearing existing data

---

## Installation & Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/ssypark/inkr-app.git
   cd inkr-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or, if you prefer Yarn:
   ```bash
   yarn
   ```

3. **Start the app**
   ```bash
   expo start
   ```

4. **Run on a device or emulator**
   - Press `i` for iOS Simulator (Mac only)  
   - Press `a` for Android Emulator  
   - Or scan the QR code using Expo Go on your physical device

---

## Usage

- **Browse sketches** from the Home screen  
- **Tap the filter icon** to switch between Week, Month, and All Time views  
- **Navigate to the Prompt screen** to see today’s prompt and upload your sketch  
- **Tap on a sketch** to view it in full size and delete if desired  
- **Use the Help screen** for instructions or to load sample data/reset the app

---

## Technologies & Dependencies

- **React Native (Expo)** – Core framework for the app  
- **AsyncStorage** – For local data storage  
- **Expo ImagePicker** – Allows users to select images from device gallery  
- **React Navigation** – Manages screen navigation and history

---

## Team

- **Samuel Park** – UX/UI & Frontend  
- **Kevin Lazo** – UX/UI  
- **Daniel Kolpakov** – Backend Development  
- **Vahan Vartanian** – UI & Graphic Design

---

## License

Licensed under the [MIT License](LICENSE).
