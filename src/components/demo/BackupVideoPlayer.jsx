import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Video, AlertCircle } from 'lucide-react';

/**
 * BackupVideoPlayer Component
 * 
 * Emergency backup video player for demo day presentations.
 * Features:
 * - Quick video playback with keyboard shortcut (Ctrl+Shift+V)
 * - Full-screen video overlay
 * - Fast switching (under 10 seconds)
 * - Fallback for live demo failures
 * 
 * Requirements: 8.1, 8.2
 */
const BackupVideoPlayer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [switchTime, setSwitchTime] = useState(null);
  const videoRef = useRef(null);
  const switchStartTime = useRef(null);

  // Keyboard shortcut: Ctrl+Shift+V to toggle backup video
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl+Shift+V or Cmd+Shift+V (Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        switchStartTime.current = Date.now();
        toggleVideo();
      }
      
      // ESC to close video
      if (event.key === 'Escape' && isVisible) {
        event.preventDefault();
        closeVideo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  const toggleVideo = () => {
    setIsVisible(prev => !prev);
    if (!isVisible) {
      // Starting to show video
      setIsPlaying(true);
    } else {
      // Closing video
      setIsPlaying(false);
    }
  };

  const closeVideo = () => {
    setIsVisible(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoLoad = () => {
    if (switchStartTime.current) {
      const elapsed = Date.now() - switchStartTime.current;
      setSwitchTime(elapsed);
      console.log(`Backup video switch time: ${elapsed}ms`);
      
      // Validate switching speed (should be under 10 seconds)
      if (elapsed > 10000) {
        console.warn(`Video switch took ${elapsed}ms - exceeds 10 second requirement`);
      }
    }
    
    // Auto-play when loaded
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(err => {
        console.error('Auto-play failed:', err);
        setVideoError(true);
      });
    }
  };

  const handleVideoError = (e) => {
    console.error('Video loading error:', e);
    setVideoError(true);
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play failed:', err);
          setVideoError(true);
        });
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      {/* Emergency Button - Always visible in bottom-right corner */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          switchStartTime.current = Date.now();
          toggleVideo();
        }}
        className="fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl transition-all duration-200 group"
        title="Emergency Backup Video (Ctrl+Shift+V)"
      >
        <Video className="w-6 h-6" />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Backup Video (Ctrl+Shift+V)
        </span>
      </motion.button>

      {/* Full-screen Video Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute top-6 right-6 z-60 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200"
              title="Close (ESC)"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Container */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {videoError ? (
                <div className="text-center text-white">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <h3 className="text-2xl font-bold mb-2">Video Not Available</h3>
                  <p className="text-gray-300 mb-4">
                    The backup demo video could not be loaded.
                  </p>
                  <p className="text-sm text-gray-400">
                    Expected location: /backup/demo-video.mp4
                  </p>
                  <button
                    onClick={closeVideo}
                    className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="relative w-full max-w-7xl">
                  <video
                    ref={videoRef}
                    className="w-full h-auto rounded-lg shadow-2xl"
                    controls
                    onLoadedData={handleVideoLoad}
                    onError={handleVideoError}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src="/backup/demo-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Play/Pause Overlay Button */}
                  {!isPlaying && !videoError && (
                    <button
                      onClick={handlePlayClick}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-200 rounded-lg"
                    >
                      <div className="bg-white/90 p-6 rounded-full">
                        <Play className="w-12 h-12 text-gray-900" />
                      </div>
                    </button>
                  )}

                  {/* Switch Time Indicator (for testing) */}
                  {switchTime && process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                      Switch time: {switchTime}ms
                      {switchTime > 10000 && (
                        <span className="ml-2 text-red-400">⚠️ Exceeds 10s</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-center">
              <p className="text-sm opacity-70">
                Press <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd> to close
                {' • '}
                <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+Shift+V</kbd> to toggle
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackupVideoPlayer;
