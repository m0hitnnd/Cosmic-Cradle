// Import the Express library
const express = require('express');
// Import the cors middleware
const cors = require('cors');

// Create an Express application instance
const app = express();

// Define the port the server will listen on
// Use the environment variable PORT if available, otherwise default to 3000
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Enable All CORS Requests (for development)
app.use(cors());

// Enable parsing of JSON bodies in requests
app.use(express.json());

// --- Routes ---

// Define the POST endpoint for /generate-story
app.post('/generate-story', (req, res) => {
    console.log('Received request on /generate-story');
    console.log('Request Body:', req.body);

    // --- Destructure expected data from request body ---
    const { babyName, birthDate, birthTime, birthCity, approximateTime } = req.body;

    // --- Basic Validation ---
    const errors = [];
    if (!babyName || typeof babyName !== 'string' || babyName.trim() === '') {
        errors.push('Missing or invalid babyName');
    }
    if (!birthDate || typeof birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        // Basic check for YYYY-MM-DD format
        errors.push('Missing or invalid birthDate (expected YYYY-MM-DD)');
    }
    if (!birthTime || typeof birthTime !== 'string' || !/^\d{2}:\d{2}$/.test(birthTime)) {
        // Basic check for HH:MM format
        errors.push('Missing or invalid birthTime (expected HH:MM)');
    }
    if (!birthCity || typeof birthCity !== 'string' || birthCity.trim() === '') {
        errors.push('Missing or invalid birthCity');
    }
    // approximateTime is boolean, presence check might be enough or type check
    if (typeof approximateTime !== 'boolean') {
        errors.push('Invalid approximateTime (expected boolean)');
    }


    // --- Handle Validation Results ---
    if (errors.length > 0) {
        console.error('Validation failed:', errors);
        // If validation fails, send a 400 Bad Request response
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors,
            error: `Validation failed: ${errors.join(', ')}` // Added combined error string
        });
    }

    // --- If validation passes (for now) ---
    console.log('Validation successful for:', babyName);

    // TODO: Add logic here to:
    // 1. Calculate/Fetch additional data (Astrology, Numerology, History)
    // 2. Construct OpenAI prompt(s)
    // 3. Call OpenAI API
    // 4. Parse response
    // 5. Structure final JSON response

    // Send a temporary success response indicating data was received and validated
    res.status(200).json({
        message: 'Data received and validated successfully.',
        // Echo back the received data (optional, useful for debugging)
        receivedData: req.body,
        // Placeholder for the actual story data later
        storyResult: {
            babyName: babyName,
            zodiac: { /* Placeholder */ },
            milestones: [ /* Placeholder */],
            numerology: { /* Placeholder */ },
            guide: [ /* Placeholder */],
            conclusion: { /* Placeholder */ }
        }
    });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 