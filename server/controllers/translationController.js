const OpenAI = require('openai');

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Controllers
exports.translateInline = async (req, res) => {
  try {
    const { text, context } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text to translate is required' });
    }
    
    // Create prompt for translating with context
    const prompt = `Translate the following Spanish word or phrase to English:
"${text}"
${context ? `Context: "${context}"` : ''}
Provide just the direct translation, no explanations. If the phrase contains multiple words, translate the entire phrase, not just individual words.`;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that translates Spanish text to English. Provide only the translation, no additional explanations." },
        { role: "user", content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.3,
    });
    
    const translation = response.choices[0].message.content.trim();
    
    res.json({
      success: true,
      original: text,
      translation: translation
    });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text', details: error.message });
  }
};

exports.translateFull = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text to translate is required' });
    }
    
    // Create prompt for full text translation
    const prompt = `Translate the following Spanish text to English, maintaining the original tone and style:
${text}
Provide a natural, accurate translation.`;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that translates Spanish text to English. Provide only the translation, no additional explanations." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });
    
    const translation = response.choices[0].message.content.trim();
    
    res.json({
      success: true,
      original: text,
      translation: translation
    });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text', details: error.message });
  }
};
