import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// in order to deploy to HEROKU
if(process.env.NODE_ENV !== 'production'){
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/.*/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

//require('dotenv').config(); // needed to read our environment variables

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: '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' });


// Endpoint to generate text
app.post('/api/generator', async (req, res) => {
///v1/chat/completions
//app.post('/v1/chat/completions', async (req, res) => {

  //Check if the API key is set
//   if (!process.env.OPENAI_API_KEY) {
//     res.status(500).json({
//         error: {
//             message: "OpenAI API key not configured, please follow instructions in README.md",
//         }
//     });
//     return;
//   }

  const animal = req.body.animal || '';
  if (animal.trim().length === 0) {
    res.status(400).json({
        error: {
            message: "Please enter a valid animal",
        }
    });
    return;
  }

  try {
    // Call to OpenAI API
    const completion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: generatePrompt(animal),
        temperature: 0.6,
    });
    if (completion && Array.isArray(completion.choices)) {
        // Now it's safe to access completion.data.
        console.log("Get a Result from Open AI API");
        console.log("Complete data", completion.choices[0]);
        res.status(200).json({ result: completion.choices[0].text });
      } else {
        // Handle the case where the structure is not as expected
        console.error("Unexpected response structure:", completion.choices[0].text);
        res.status(500).json({
          error: {
            message: 'Unexpected response structure from OpenAI API.',
          }
        });
      }

    //res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Error handling
    if (error.response) {
        console.error(error.response.status, error.response.data);
        res.status(error.response.status).json(error.response.data);
    } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        res.status(500).json({
            error: {
            message: 'An error occurred during your request.',
            }
        });
    }
  }
});

// Helper function to generate the prompt
function generatePrompt(animal) {
  const capitalizedAnimal = animal.charAt(0).toUpperCase() + animal.slice(1).toLowerCase();
  return `Suggest three names for an animal that is a superhero.

  Animal: Cat
  Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
  Animal: Dog
  Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
  Animal: ${capitalizedAnimal}
  Names:`;
}

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
