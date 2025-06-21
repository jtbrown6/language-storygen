import { useState, useRef, useCallback, useEffect } from 'react';
import { createAudioPlayer, isAudioSupported } from '../utils/audioUtils';
import audioService from '../services/audioService';

/**
 * Custom hook for managing audio playback state and controls
 * @param {Object} options - Hook options
 * @returns {Object} Audio state and control functions
 */
export const useAudio = (options = {}) => {
  const {
    volume = 1.0,
    playbackRate = 1.0,
    loop = false,
    autoCleanup = true
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSupported, setAudioSupported] = useState(true);

  const playerRef = useRef(null);
  const audioDataRef = useRef(null);

  // Check audio support on mount
  useEffect(() => {
    setAudioSupported(isAudioSupported());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCleanup && playerRef.current) {
        playerRef.current.cleanup();
      }
    };
  }, [autoCleanup]);

  // Create audio player from base64 data
  const loadAudio = useCallback((base64Data) => {
    try {
      setError(null);
      
      if (!audioSupported) {
        throw new Error('Audio is not supported in this browser');
      }

      if (!base64Data) {
        throw new Error('No audio data provided');
      }

      // Clean up previous player
      if (playerRef.current) {
        playerRef.current.cleanup();
      }

      // Store audio data
      audioDataRef.current = base64Data;

      // Create new player
      playerRef.current = createAudioPlayer(base64Data, {
        volume,
        playbackRate,
        loop,
        onLoadStart: () => setIsLoading(true),
        onCanPlay: () => {
          setIsLoading(false);
          if (playerRef.current) {
            setDuration(playerRef.current.duration || 0);
          }
        },
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        onEnded: () => {
          setIsPlaying(false);
          setCurrentTime(0);
        },
        onError: (event) => {
          setIsLoading(false);
          setIsPlaying(false);
          setError('Failed to play audio');
          console.error('Audio error:', event);
        },
        onTimeUpdate: () => {
          if (playerRef.current) {
            setCurrentTime(playerRef.current.currentTime || 0);
          }
        }
      });

      return true;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  }, [audioSupported, volume, playbackRate, loop]);

  // Play audio
  const play = useCallback(async () => {
    try {
      if (!playerRef.current) {
        throw new Error('No audio loaded');
      }

      setError(null);
      await playerRef.current.play();
    } catch (err) {
      setError(`Failed to play audio: ${err.message}`);
      setIsPlaying(false);
    }
  }, []);

  // Pause audio
  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      setCurrentTime(0);
    }
  }, []);

  // Seek to specific time
  const seekTo = useCallback((time) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Set volume
  const setVolume = useCallback((vol) => {
    if (playerRef.current) {
      playerRef.current.volume = vol;
    }
  }, []);

  // Set playback rate
  const setPlaybackRate = useCallback((rate) => {
    if (playerRef.current) {
      playerRef.current.playbackRate = rate;
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.cleanup();
      playerRef.current = null;
    }
    audioDataRef.current = null;
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, []);

  return {
    // State
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    audioSupported,
    hasAudio: !!playerRef.current,

    // Controls
    loadAudio,
    play,
    pause,
    stop,
    togglePlayPause,
    seekTo,
    setVolume,
    setPlaybackRate,
    cleanup,

    // Computed values
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
    remainingTime: duration - currentTime
  };
};

/**
 * Hook for pronunciation audio (word/phrase audio)
 * @param {Object} options - Hook options
 * @returns {Object} Pronunciation audio state and functions
 */
export const usePronunciationAudio = (options = {}) => {
  const audioHook = useAudio(options);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastText, setLastText] = useState('');

  // Generate and play pronunciation with proper buffering
  const playPronunciation = useCallback(async (text, context = '') => {
    try {
      setIsGenerating(true);
      audioHook.cleanup();

      const result = await audioService.getPronunciation(text, context);
      
      if (result.success && result.audioData) {
        // Load audio and wait for it to be ready
        const loadSuccess = audioHook.loadAudio(result.audioData);
        
        if (loadSuccess) {
          // Add a small delay to ensure proper buffering
          await new Promise(resolve => setTimeout(resolve, 250));
          
          // Now play the audio
          await audioHook.play();
          setLastText(text);
        } else {
          throw new Error('Failed to load pronunciation audio');
        }
      } else {
        throw new Error('Failed to generate pronunciation audio');
      }
    } catch (error) {
      console.error('Pronunciation error:', error);
      // Don't set error in audioHook to avoid conflicts
    } finally {
      setIsGenerating(false);
    }
  }, [audioHook]);

  return {
    ...audioHook,
    isGenerating,
    lastText,
    playPronunciation
  };
};

/**
 * Hook for story audio (full story audio)
 * @param {Object} options - Hook options
 * @returns {Object} Story audio state and functions
 */
export const useStoryAudio = (options = {}) => {
  const audioHook = useAudio({ ...options, autoCleanup: false });
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyText, setStoryText] = useState('');

  // Generate and load story audio
  const generateStoryAudio = useCallback(async (text, voice = 'nova', speed = 0.95) => {
    try {
      setIsGenerating(true);
      audioHook.cleanup();

      const result = await audioService.getStoryAudio(text, voice, speed);
      
      if (result.success && result.audioData) {
        audioHook.loadAudio(result.audioData);
        setStoryText(text);
        return true;
      } else {
        throw new Error('Failed to generate story audio');
      }
    } catch (error) {
      console.error('Story audio error:', error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [audioHook]);

  return {
    ...audioHook,
    isGenerating,
    storyText,
    generateStoryAudio
  };
};

export default useAudio;
