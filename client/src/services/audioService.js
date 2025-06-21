// Audio API service for communicating with backend audio endpoints

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class AudioService {
  /**
   * Generate pronunciation audio for a word or phrase
   * @param {string} text - The text to pronounce
   * @param {string} context - Optional context for better translation
   * @returns {Promise<Object>} Audio data with base64 encoded MP3
   */
  async getPronunciation(text, context = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/pronounce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          context: context.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate pronunciation');
      }

      return {
        success: true,
        originalWord: data.original_word,
        translatedWord: data.translated_word,
        audioData: data.audio
      };
    } catch (error) {
      console.error('Error getting pronunciation:', error);
      throw new Error(`Failed to get pronunciation: ${error.message}`);
    }
  }

  /**
   * Generate audio for a full story
   * @param {string} text - The story text to convert to audio
   * @param {string} voice - Voice to use (default: 'nova')
   * @param {number} speed - Speech speed (default: 0.95)
   * @returns {Promise<Object>} Audio data with base64 encoded MP3
   */
  async getStoryAudio(text, voice = 'nova', speed = 0.95) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          speed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate story audio');
      }

      return {
        success: true,
        text: data.text,
        audioData: data.audio,
        voice: data.voice,
        speed: data.speed
      };
    } catch (error) {
      console.error('Error getting story audio:', error);
      throw new Error(`Failed to get story audio: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const audioService = new AudioService();
export default audioService;
