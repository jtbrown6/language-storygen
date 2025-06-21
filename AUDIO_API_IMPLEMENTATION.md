# Audio API Backend Implementation

## Overview
The backend audio API has been successfully implemented to support text-to-speech functionality for the language learning application.

## New Files Created

### 1. **Audio Controller** (`server/controllers/audioController.js`)
- **Purpose**: Handles audio generation using OpenAI's TTS API
- **Functions**:
  - `pronounceText`: Generates pronunciation audio for words/phrases
  - `generateStoryAudio`: Creates audio for full stories

### 2. **Audio Routes** (`server/routes/audio.js`)
- **Purpose**: Defines API endpoints for audio functionality
- **Endpoints**:
  - `POST /api/audio/pronounce`: Word/phrase pronunciation
  - `POST /api/audio/story`: Full story audio generation

## API Endpoints

### **POST /api/audio/pronounce**
**Purpose**: Generate pronunciation audio for selected text

**Request Body**:
```json
{
  "text": "hola mundo",
  "context": "greeting in a story"
}
```

**Response**:
```json
{
  "success": true,
  "original_word": "hola mundo",
  "translated_word": "hola mundo",
  "audio": "base64_encoded_mp3_data"
}
```

### **POST /api/audio/story**
**Purpose**: Generate audio for full story text

**Request Body**:
```json
{
  "text": "Era una vez...",
  "voice": "nova",
  "speed": 0.95
}
```

**Response**:
```json
{
  "success": true,
  "text": "Era una vez...",
  "audio": "base64_encoded_mp3_data",
  "voice": "nova",
  "speed": 0.95
}
```

## Technical Implementation

### **Audio Processing Flow**:
1. **Text Input**: Receive text from frontend
2. **Translation**: Ensure text is in Spanish (for pronunciation)
3. **TTS Generation**: Use OpenAI TTS API with "nova" voice
4. **File Handling**: Create temporary MP3 file
5. **Base64 Encoding**: Convert audio to base64 for transmission
6. **Cleanup**: Remove temporary files
7. **Response**: Send audio data to frontend

### **Key Features**:
- **Voice**: OpenAI "nova" voice for natural Spanish pronunciation
- **Speed**: 0.95x speed for better learning comprehension
- **Format**: MP3 audio for broad browser compatibility
- **Encoding**: Base64 for easy frontend integration
- **Cleanup**: Automatic temporary file management

### **Error Handling**:
- Input validation for empty/missing text
- OpenAI API error handling
- File system error management
- Graceful cleanup on failures

## Dependencies Added

### **New Package**:
- `uuid`: ^9.0.0 - For generating unique temporary file names

### **Updated Files**:
- `server/package.json`: Added uuid dependency
- `server/index.js`: Registered audio routes

## File Structure
```
server/
├── controllers/
│   └── audioController.js     # Audio generation logic
├── routes/
│   └── audio.js              # Audio API endpoints
├── temp/                     # Temporary audio files (auto-created)
└── package.json              # Updated with uuid dependency
```

## Integration Points

### **With Existing Systems**:
- **Translation API**: Reuses translation logic for Spanish conversion
- **OpenAI Integration**: Leverages existing OpenAI setup
- **Express Routes**: Follows existing routing patterns
- **Error Handling**: Consistent with app error handling

### **Frontend Integration Ready**:
- **Base64 Audio**: Ready for HTML5 Audio API
- **Mobile Optimized**: Works with mobile audio controls
- **Tooltip Integration**: Can be added to text selection tooltips
- **Story Audio**: Ready for full story playback controls

## Testing

### **Manual Testing Endpoints**:
```bash
# Test word pronunciation
curl -X POST http://localhost:5000/api/audio/pronounce \
  -H "Content-Type: application/json" \
  -d '{"text": "hola", "context": "greeting"}'

# Test story audio
curl -X POST http://localhost:5000/api/audio/story \
  -H "Content-Type: application/json" \
  -d '{"text": "Era una vez una historia..."}'
```

## Next Steps

### **Frontend Implementation**:
1. Create audio utilities for base64 playback
2. Add speaker icons to text selection tooltips
3. Implement full story audio controls
4. Add mobile-optimized audio interface

### **Performance Optimizations**:
1. Audio caching for frequently used words
2. Streaming for long story audio
3. Background audio processing
4. Error retry mechanisms

The backend audio API is now ready to support comprehensive audio functionality for the language learning application!
