
import React, { useEffect, useRef } from "react";
import { ScannerViewportProps } from "./types";

const ScannerViewport: React.FC<ScannerViewportProps> = ({
  videoRef,
  canvasRef,
  detectedVehicle,
  isFlashingRed,
  textDetected
}) => {
  // Create a local ref to track playback attempts
  const playAttemptsRef = useRef(0);
  
  // Function to handle video playback with retry logic
  const attemptPlayback = async () => {
    if (!videoRef.current) return;
    
    // Increase attempt counter
    playAttemptsRef.current++;
    console.log(`Attempting playback (attempt ${playAttemptsRef.current})`);
    
    try {
      await videoRef.current.play();
      console.log("Video playback started successfully");
    } catch (err) {
      console.error("Video play error:", err);
      
      // Retry with a delay, up to 5 times
      if (playAttemptsRef.current < 5) {
        setTimeout(attemptPlayback, 500);
      }
    }
  };
  
  useEffect(() => {
    // Reset counter on each mount
    playAttemptsRef.current = 0;
    
    if (videoRef.current) {
      // Set essential properties
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = true;
      
      // Watch for loadedmetadata event to start playback
      const handleMetadata = () => {
        console.log("Video metadata loaded, attempting playback");
        attemptPlayback();
      };
      
      // Watch for visible viewport changes
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && videoRef.current?.paused) {
          console.log("Page visible, attempting playback");
          attemptPlayback();
        }
      };
      
      // Set up event listeners
      videoRef.current.addEventListener('loadedmetadata', handleMetadata);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleMetadata);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [videoRef]);

  return (
    <div 
      className={`relative w-full rounded-lg overflow-hidden aspect-video border-2 ${
        isFlashingRed 
          ? "border-red-500 animate-pulse" 
          : textDetected 
            ? "border-green-500" 
            : "border-neutral-200"
      }`}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: "none" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {!detectedVehicle && (
          <div className="w-4/5 h-12 border-2 border-primary rounded-lg flex items-center justify-center">
            <div className="text-xs text-primary font-medium px-2 text-center">
              Align VIN in this box
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerViewport;
