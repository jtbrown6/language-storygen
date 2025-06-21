const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to create temporary file path
const createTempFilePath = () => {
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return path.join(tempDir, `speech_${uuidv4()}.mp3`);
};

// Helper function to clean up temporary file
const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

// Controller for pronouncing words/phrases
exports.pronounceText = async (req, res) => {
  try {
    const { text, context } = req.body;
    
    if (!text || text.trim() === '') {
      console.log("Received empty text for pronunciation.");
      return res.status(400).json({ error: 'Missing or empty text in request' });
    }

    const word = text.trim();
    console.log(`Processing pronunciation for: "${word}"`);

    // Step 1: Translate the word to Spanish if necessary
    const translationPrompt = `Translate the word '${word}' to Spanish. If it's already Spanish, return it unchanged, but ONLY provide the translated word, do not mention that the word is in spanish or not.`;
    
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a translator proficient in Spanish." },
        { role: "user", content: translationPrompt }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const translatedWord = translationResponse.choices[0].message.content.trim();
    console.log(`Translated word: ${translatedWord}`);

    // Step 2: Generate Spanish pronunciation using OpenAI TTS API
    const tempFilePath = createTempFilePath();
    
    try {
      // Add silence padding and slower speech for better pronunciation learning
      const enhancedInput = `<break time="300ms"/>${translatedWord}<break time="200ms"/>`;
      
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: enhancedInput,
        speed: 0.90 // Slightly slower for better learning
      });

      // Convert the response to a buffer and save to temp file
      const buffer = Buffer.from(await mp3.arrayBuffer());
      fs.writeFileSync(tempFilePath, buffer);

      // Read the file and convert to base64
      const audioContent = fs.readFileSync(tempFilePath, { encoding: 'base64' });
      
      // Clean up the temporary file
      cleanupTempFile(tempFilePath);

      console.log("Generated audio content successfully.");

      // Return the original word, translation, and audio as a response
      return res.json({
        success: true,
        original_word: word,
        translated_word: translatedWord,
        audio: audioContent
      });

    } catch (ttsError) {
      // Clean up temp file in case of error
      cleanupTempFile(tempFilePath);
      throw ttsError;
    }

  } catch (error) {
    console.error(`Error generating text-to-speech: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to generate pronunciation', 
      details: error.message 
    });
  }
};

// Controller for generating full story audio
exports.generateStoryAudio = async (req, res) => {
  try {
    const { text, voice = "nova", speed = 0.95 } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty text for story audio' });
    }

    console.log(`Generating story audio for text length: ${text.length} characters`);

    // Generate audio for the full story
    const tempFilePath = createTempFilePath();
    
    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
        speed: speed
      });

      // Convert the response to a buffer and save to temp file
      const buffer = Buffer.from(await mp3.arrayBuffer());
      fs.writeFileSync(tempFilePath, buffer);

      // Read the file and convert to base64
      const audioContent = fs.readFileSync(tempFilePath, { encoding: 'base64' });
      
      // Clean up the temporary file
      cleanupTempFile(tempFilePath);

      console.log("Generated story audio content successfully.");

      return res.json({
        success: true,
        text: text,
        audio: audioContent,
        voice: voice,
        speed: speed
      });

    } catch (ttsError) {
      // Clean up temp file in case of error
      cleanupTempFile(tempFilePath);
      throw ttsError;
    }

  } catch (error) {
    console.error(`Error generating story audio: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to generate story audio', 
      details: error.message 
    });
  }
};
