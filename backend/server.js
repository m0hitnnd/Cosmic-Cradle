// Import the Express library
const express = require('express');
// Import the cors middleware
const cors = require('cors');
// Import the OpenAI library
const OpenAI = require('openai');
// Load environment variables from .env file
require('dotenv').config();

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

// --- OpenAI Client Initialization ---
// Check if the API key is loaded
if (!process.env.OPENAI_API_KEY) {
    console.error('FATAL ERROR: OPENAI_API_KEY is not defined in the environment variables.');
    process.exit(1); // Exit if the key is missing
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Routes ---

// Define the POST endpoint for /generate-story
app.post('/generate-story', async (req, res) => {
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

    try {
        // --- Construct the Comprehensive OpenAI Prompt for JSON Output ---
        // Note: Calculating zodiac, numerology, and finding historical events would ideally
        // happen *before* this prompt, feeding the results *into* the prompt.
        // For now, we'll ask the AI to generate placeholders or derive them imaginatively.

        const prompt = `
        Generate a personalized and uplifting narrative for a baby based on the following details:
        - Baby Name: ${babyName}
        - Birth Date: ${birthDate}
        - Birth Time: ${birthTime} (${approximateTime ? 'approximate' : 'exact'})
        - Birth City: ${birthCity}

        Please return the output STRICTLY as a JSON object matching the following structure. 
        Populate each field with creative, positive, and concise text suitable for parents.
        Use emojis appropriately to add warmth and visual appeal.

        JSON Structure:
        {
          "babyName": "${babyName}",
          "introduction": {
            "title": "string (e.g., 'Hello, proud parents of ${babyName}! ✨')",
            "subtitle": "string (e.g., 'Let's uncover the magical story...')",
            "mainParagraph": "string (A short welcoming paragraph mentioning the baby's name, birth date, and city, setting a magical tone)"
          },
          "cosmicBlueprint": {
            "title": "string (e.g., '${babyName}\'s Cosmic Blueprint ✨')",
            "sunSign": {
              "sign": "string (Astrological Sun Sign based on ${birthDate}, e.g., 'Aquarius')",
              "icon": "string (Emoji for the sign, e.g., '♒')",
              "description": "string (Short, positive trait, e.g., 'Forward-thinking and inventive!')"
            },
            "moonSign": {
              "sign": "string (Astrological Moon Sign - be imaginative if exact time is unknown, e.g., 'Aries')",
              "icon": "string (Emoji for the sign, e.g., '♈')",
              "description": "string (Short, positive trait, e.g., 'Emotionally bold and energetic.')"
            },
            "risingSign": {
              "sign": "string (Astrological Rising Sign - be imaginative if exact time is unknown, e.g., 'Gemini')",
              "icon": "string (Emoji for the sign, e.g., '♊')",
              "description": "string (Short, positive trait, e.g., 'Communicative and curious!')"
            },
            "actionTip": "string (A short, actionable parenting tip related to the signs, e.g., 'Nurture their curiosity...')"
          },
          "milestones": {
            "title": "string (e.g., 'Born on a day of milestones 📜')",
            "event1": {
              "icon": "string (Relevant emoji, e.g., '🏺')",
              "title": "string (A notable positive historical event or discovery happening on ${birthDate} [day and month], potentially different year, e.g., 'KV5 Tomb Discovery (Egypt, 1995)')",
              "description": "string (Short description connecting the event to a positive trait for ${babyName}, mentioning their name)"
            },
            "event2": {
              "icon": "string (Relevant emoji, e.g., '🏏')",
              "title": "string (Another notable positive event from the same day/month, e.g., 'Zimbabwe\'s First Cricket Victory (1995)')",
              "description": "string (Short description connecting the event to another trait for ${babyName}, mentioning their name)"
            },
            "funFact": {
              "icon": "string (Relevant emoji, e.g., '🧩')",
              "text": "string (A concluding fun fact summarizing the theme of the day for ${babyName}, mentioning their name)"
            }
          },
          "numberMagic": {
            "title": "string (e.g., '${babyName}\'s Number Magic 🔢')",
            "lifePathNumber": "number (Calculated Life Path Number from ${birthDate}, e.g., 3)",
            "personalityDesc": "string (Short, positive description based on the Life Path Number, e.g., 'Creative communicator, expressive and charismatic.')",
            "actionTip": "string (A short, actionable parenting tip related to the number, e.g., 'Encourage creative hobbies...')"
          },
          "guide": {
            "title": "string (e.g., 'Guide for ${babyName}\'s Bright Journey 🌟')",
            "item1": {
              "icon": "string (Relevant emoji, e.g., '🧩')",
              "text": "string (Short parenting tip 1)"
            },
            "item2": {
              "icon": "string (Relevant emoji, e.g., '👥')",
              "text": "string (Short parenting tip 2, mentioning ${babyName})"
            },
            "item3": {
              "icon": "string (Relevant emoji, e.g., '🔎')",
              "text": "string (Short parenting tip 3)"
            }
          },
          "conclusion": {
            "title": "string (e.g., 'Your little star\'s journey is just beginning 🌈')"
          }
        }
        Ensure the entire output is a single, valid JSON object starting with { and ending with }.
        `;

        console.log('Sending comprehensive prompt to OpenAI for JSON...');
        // --- Call OpenAI API --- 
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo-1106', // Use a model that supports JSON mode reliably
            response_format: { type: "json_object" }, // Request JSON output
            // temperature: 0.7 // Adjust temperature for creativity if needed
        });

        console.log('Received JSON response from OpenAI.');
        // --- Parse the JSON Response --- 
        let generatedStoryData;
        try {
            // The content should already be a JSON string because of response_format
            const jsonString = completion.choices[0]?.message?.content;
            if (!jsonString) {
                throw new Error('OpenAI response content is empty.');
            }
            generatedStoryData = JSON.parse(jsonString);
            console.log("--- Parsed OpenAI JSON Response: ---", JSON.stringify(generatedStoryData, null, 2)); // Log the parsed JSON
        } catch (parseError) {
            console.error('Error parsing JSON response from OpenAI:', parseError);
            console.error('Raw OpenAI response:', completion.choices[0]?.message?.content); // Log the raw response for debugging
            throw new Error('Failed to parse the story data received from AI.');
        }

        // --- Validate the Structure (Basic Check) ---
        if (!generatedStoryData || typeof generatedStoryData !== 'object' || !generatedStoryData.introduction || !generatedStoryData.cosmicBlueprint) {
            console.error('Parsed JSON data is missing expected top-level keys:', generatedStoryData);
            throw new Error('Received incomplete or malformed story data structure from AI.');
        }

        // --- Send Structured JSON Response --- 
        res.status(200).json({
            message: 'Story generated successfully.',
            // Send the entire parsed JSON object from OpenAI
            storyResult: generatedStoryData,
            error: null
        });

    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({
            message: 'An error occurred while generating the story.',
            error: error.message
        });
    }
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 