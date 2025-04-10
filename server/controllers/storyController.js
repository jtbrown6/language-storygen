const OpenAI = require('openai');
const Story = require('../models/Story');

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate a GPT prompt based on parameters
const generatePrompt = (params) => {
  const { 
    scenario, 
    contentType, 
    verbs, 
    indirectObjectLevel, 
    reflexiveVerbLevel, 
    idiomaticExpressions, 
    level 
  } = params;

  // Define level descriptions
  const levelDescriptions = {
    A1: "very simple language, basic vocabulary, present tense, short sentences, 100-150 words",
    A2: "simple language, common vocabulary, present and past tense, short-medium sentences, 150-200 words",
    B1: "intermediate language, expanded vocabulary, varied tenses, medium sentences, 200-250 words",
    B2: "advanced language, rich vocabulary, all tenses, complex sentences, 250-300 words"
  };

  // Build the prompt
  let prompt = `Generate a Spanish ${contentType === 'story' ? 'story' : 'conversation between two people'} about "${scenario}". `;
  
  // Add language level requirements
  prompt += `Use ${levelDescriptions[level]} appropriate for ${level} Spanish level. `;
  
  // Add verb requirements
  if (verbs && verbs.length > 0) {
    prompt += `Include the following Spanish verbs naturally in the ${contentType}: ${verbs.join(', ')}. `;
  }
  
  // Add indirect object requirements
  if (indirectObjectLevel) {
    const indirectObjectDesc = {
      1: "minimal indirect objects (only 1-2)",
      2: "moderate indirect objects (3-5)",
      3: "many indirect objects (6+)"
    };
    prompt += `Use ${indirectObjectDesc[indirectObjectLevel]}. `;
  }
  
  // Add reflexive verb requirements
  if (reflexiveVerbLevel) {
    const reflexiveVerbDesc = {
      1: "minimal reflexive verbs (only 1-2)",
      2: "moderate reflexive verbs (3-5)",
      3: "many reflexive verbs (6+)"
    };
    prompt += `Use ${reflexiveVerbDesc[reflexiveVerbLevel]}. `;
  }
  
  // Add idiomatic expressions requirements
  if (idiomaticExpressions) {
    prompt += "Include common Spanish idiomatic expressions with their context. ";
  }
  
  // Add final instructions for context and quality
  prompt += "Ensure the content is culturally appropriate, engaging, and demonstrates natural Spanish usage. The story should be coherent and make sense regardless of the requirements.";
  
  return prompt;
};

// Random scenarios for the random scenario generator
const randomScenarios = [
  "Un viaje a Barcelona",
  "Una cena con amigos en un restaurante",
  "Un día en la playa",
  "Una aventura en las montañas",
  "El primer día de universidad",
  "Una fiesta de cumpleaños sorpresa",
  "Un encuentro inesperado en el parque",
  "Una visita al museo de arte",
  "Perdido en una ciudad desconocida",
  "Preparando una receta tradicional",
  "Un día de compras en el mercado",
  "Una entrevista de trabajo importante",
  "Un concierto de música favorita",
  "Un viaje en tren por el campo",
  "Buscando un apartamento nuevo"
];

// Controllers
exports.generateStory = async (req, res) => {
  try {
    const params = req.body;
    
    // Validate required parameters
    if (!params.scenario || !params.level) {
      return res.status(400).json({ error: 'Scenario and level are required' });
    }
    
    const prompt = generatePrompt(params);
    
    // Create system message based on content type
    let systemMessage;
    if (params.contentType === 'conversation') {
      systemMessage = "You are a helpful assistant that generates Spanish conversations with proper formatting. For conversations, use speaker names followed by colons (e.g., 'María: Hola, ¿cómo estás?'). Format each speaker's dialogue on a new line.";
    } else {
      systemMessage = "You are a helpful assistant that generates Spanish stories based on specific requirements.";
    }
    
    // Add details about formatting requirements
    systemMessage += " Important: Your response must be a JSON object with the following structure: " +
      "{ 'text': 'the full story/conversation text', " +
      "'markup': [ " +
      "{ 'type': 'selected-verb', 'start': number, 'end': number, 'text': 'verb text' }, " +
      "{ 'type': 'reflexive-verb', 'start': number, 'end': number, 'text': 'verb text' }, " +
      "{ 'type': 'idiom', 'start': number, 'end': number, 'text': 'idiom text' }, " +
      "{ 'type': 'verb', 'start': number, 'end': number, 'text': 'verb text' } " +
      "] }. " +
      "For each verb in the story, add an entry in the markup array. " +
      "For each user-specified verb, add an entry with type 'selected-verb'. " +
      "For reflexive verbs, add entries with type 'reflexive-verb'. " +
      "For idiomatic expressions, add entries with type 'idiom'. " +
      "For other verbs, add entries with type 'verb'. " +
      "The 'start' and 'end' fields should be character indices in the text.";
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    let jsonResponse;
    try {
      // Parse the response as JSON
      const rawContent = response.choices[0].message.content.trim();
      jsonResponse = JSON.parse(rawContent);
      
      if (!jsonResponse.text || !jsonResponse.markup) {
        throw new Error("Response does not contain required fields");
      }
      
      // Return the generated story with markup
      res.json({
        success: true,
        story: jsonResponse.text,
        markup: jsonResponse.markup,
        parameters: params
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback to sending the raw text
      const storyText = response.choices[0].message.content.trim();
      res.json({
        success: true,
        story: storyText,
        markup: [],
        parameters: params
      });
    }
  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({ error: 'Failed to generate story', details: error.message });
  }
};

exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ dateCreated: -1 });
    console.log(`[MongoDB] Retrieved ${stories.length} stories from database`);
    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

exports.getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
};

exports.saveStory = async (req, res) => {
  try {
    const { story, parameters, markup } = req.body;
    
    if (!story) {
      return res.status(400).json({ error: 'Story content is required' });
    }
    
    const newStory = new Story({
      story,
      parameters,
      markup: markup || [],
      translation: null // Will be populated when translation is requested
    });
    
    const savedStory = await newStory.save();
    console.log(`[MongoDB] Story saved successfully with ID: ${savedStory._id}`);
    console.log(`[MongoDB] Story details: ${savedStory.parameters?.scenario || 'No scenario'}, Level: ${savedStory.parameters?.level || 'Unknown'}`);
    res.status(201).json(savedStory);
  } catch (error) {
    console.error('Error saving story:', error);
    res.status(500).json({ error: 'Failed to save story' });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const story = await Story.findByIdAndDelete(storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    console.log(`[MongoDB] Story deleted successfully: ID ${storyId}`);
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
};

exports.getRandomScenario = (req, res) => {
  try {
    const randomIndex = Math.floor(Math.random() * randomScenarios.length);
    const scenario = randomScenarios[randomIndex];
    console.log(`[MongoDB] Random scenario generated: "${scenario}"`);
    res.json({ scenario });
  } catch (error) {
    console.error('Error generating random scenario:', error);
    res.status(500).json({ 
      error: 'Failed to generate random scenario',
      fallback: 'Un día en la playa'
    });
  }
};
