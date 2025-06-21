// Audio utility functions for handling base64 audio playback

/**
 * Convert base64 audio data to a playable audio URL
 * @param {string} base64Data - Base64 encoded audio data
 * @param {string} mimeType - MIME type (default: 'audio/mpeg')
 * @returns {string} Object URL for audio playback
 */
export const createAudioUrl = (base64Data, mimeType = 'audio/mpeg') => {
  try {
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob and object URL
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating audio URL:', error);
    throw new Error('Failed to create audio URL from base64 data');
  }
};

/**
 * Play audio from base64 data with proper buffering
 * @param {string} base64Data - Base64 encoded audio data
 * @param {Object} options - Playback options
 * @returns {Promise<HTMLAudioElement>} Audio element promise
 */
export const playAudioFromBase64 = async (base64Data, options = {}) => {
  const {
    volume = 1.0,
    playbackRate = 1.0,
    bufferDelay = 300, // Add buffer delay in milliseconds
    onLoadStart = null,
    onCanPlay = null,
    onPlay = null,
    onPause = null,
    onEnded = null,
    onError = null
  } = options;

  try {
    const audioUrl = createAudioUrl(base64Data);
    const audio = new Audio(audioUrl);
    
    // Set audio properties
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.playbackRate = Math.max(0.25, Math.min(4, playbackRate));
    audio.preload = 'auto'; // Ensure full preloading
    
    // Add event listeners
    if (onLoadStart) audio.addEventListener('loadstart', onLoadStart);
    if (onCanPlay) audio.addEventListener('canplay', onCanPlay);
    if (onPlay) audio.addEventListener('play', onPlay);
    if (onPause) audio.addEventListener('pause', onPause);
    if (onEnded) audio.addEventListener('ended', onEnded);
    if (onError) audio.addEventListener('error', onError);
    
    // Clean up object URL when audio ends or errors
    const cleanup = () => {
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', cleanup);
    
    // Load audio and wait for it to be ready
    audio.load();
    
    // Wait for audio to be fully buffered
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Audio loading timeout'));
      }, 10000); // 10 second timeout
      
      const onCanPlayThrough = () => {
        clearTimeout(timeout);
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        audio.removeEventListener('error', onErrorHandler);
        resolve();
      };
      
      const onErrorHandler = (e) => {
        clearTimeout(timeout);
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        audio.removeEventListener('error', onErrorHandler);
        reject(new Error('Audio loading failed'));
      };
      
      audio.addEventListener('canplaythrough', onCanPlayThrough);
      audio.addEventListener('error', onErrorHandler);
    });
    
    // Add buffer delay to ensure smooth playback
    if (bufferDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, bufferDelay));
    }
    
    // Now play the audio
    await audio.play();
    
    return audio;
  } catch (error) {
    console.error('Error playing audio:', error);
    throw new Error(`Failed to play audio: ${error.message}`);
  }
};

/**
 * Create a reusable audio player instance
 * @param {string} base64Data - Base64 encoded audio data
 * @param {Object} options - Player options
 * @returns {Object} Audio player with control methods
 */
export const createAudioPlayer = (base64Data, options = {}) => {
  const {
    volume = 1.0,
    playbackRate = 1.0,
    loop = false,
    onLoadStart = null,
    onCanPlay = null,
    onPlay = null,
    onPause = null,
    onEnded = null,
    onError = null,
    onTimeUpdate = null
  } = options;

  let audio = null;
  let audioUrl = null;
  let isLoaded = false;

  const cleanup = () => {
    if (audio) {
      audio.pause();
      audio.removeEventListener('loadstart', onLoadStart);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }
    isLoaded = false;
  };

  const load = async () => {
    try {
      cleanup();
      
      audioUrl = createAudioUrl(base64Data);
      audio = new Audio(audioUrl);
      
      // Set properties for better buffering
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.playbackRate = Math.max(0.25, Math.min(4, playbackRate));
      audio.loop = loop;
      audio.preload = 'auto'; // Ensure full preloading
      
      // Add event listeners
      if (onLoadStart) audio.addEventListener('loadstart', onLoadStart);
      if (onCanPlay) audio.addEventListener('canplay', onCanPlay);
      if (onPlay) audio.addEventListener('play', onPlay);
      if (onPause) audio.addEventListener('pause', onPause);
      if (onEnded) audio.addEventListener('ended', onEnded);
      if (onError) audio.addEventListener('error', onError);
      if (onTimeUpdate) audio.addEventListener('timeupdate', onTimeUpdate);
      
      audio.load();
      
      // Wait for audio to be ready for smooth playback
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'));
        }, 8000); // 8 second timeout for player
        
        const onCanPlayThrough = () => {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', onCanPlayThrough);
          audio.removeEventListener('error', onErrorHandler);
          isLoaded = true;
          resolve();
        };
        
        const onErrorHandler = (e) => {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', onCanPlayThrough);
          audio.removeEventListener('error', onErrorHandler);
          reject(new Error('Audio loading failed'));
        };
        
        audio.addEventListener('canplaythrough', onCanPlayThrough);
        audio.addEventListener('error', onErrorHandler);
      });
      
      return true;
    } catch (error) {
      console.error('Error loading audio:', error);
      isLoaded = false;
      return false;
    }
  };

  return {
    // Control methods
    play: async () => {
      if (!isLoaded && !load()) {
        throw new Error('Failed to load audio');
      }
      return audio.play();
    },
    
    pause: () => {
      if (audio) audio.pause();
    },
    
    stop: () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    },
    
    // Property getters/setters
    get currentTime() {
      return audio ? audio.currentTime : 0;
    },
    
    set currentTime(time) {
      if (audio) audio.currentTime = time;
    },
    
    get duration() {
      return audio ? audio.duration : 0;
    },
    
    get paused() {
      return audio ? audio.paused : true;
    },
    
    get ended() {
      return audio ? audio.ended : false;
    },
    
    get volume() {
      return audio ? audio.volume : volume;
    },
    
    set volume(vol) {
      if (audio) audio.volume = Math.max(0, Math.min(1, vol));
    },
    
    get playbackRate() {
      return audio ? audio.playbackRate : playbackRate;
    },
    
    set playbackRate(rate) {
      if (audio) audio.playbackRate = Math.max(0.25, Math.min(4, rate));
    },
    
    // Utility methods
    isLoaded: () => isLoaded,
    cleanup: cleanup,
    reload: load
  };
};

/**
 * Check if audio is supported in the current browser
 * @returns {boolean} True if audio is supported
 */
export const isAudioSupported = () => {
  try {
    return !!(window.Audio && document.createElement('audio').canPlayType);
  } catch (error) {
    return false;
  }
};

/**
 * Get supported audio formats
 * @returns {Object} Object with format support information
 */
export const getSupportedFormats = () => {
  if (!isAudioSupported()) {
    return {};
  }
  
  const audio = document.createElement('audio');
  
  return {
    mp3: !!audio.canPlayType('audio/mpeg'),
    wav: !!audio.canPlayType('audio/wav'),
    ogg: !!audio.canPlayType('audio/ogg'),
    aac: !!audio.canPlayType('audio/aac'),
    webm: !!audio.canPlayType('audio/webm')
  };
};

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
