import { useRef, useEffect } from 'react';

export default function TwinklingHero({ imageUrl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animationFrameId;

    // The DaveOS style density mapping
    const density = '   .:-=+*#%@'; 
    const resolution = 4; // 4px block resolution

    const img = new Image();
    img.crossOrigin = 'Anonymous'; 
    img.src = imageUrl;

    img.onload = () => {
      let scaledWidth = 0;
      let scaledHeight = 0;
      let offsetX = 0;
      let offsetY = 0;
      let data = null;

      const updateCanvasSize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        scaledWidth = img.width * scale;
        scaledHeight = img.height * scale;
        offsetX = (canvas.width - scaledWidth) / 2;
        offsetY = (canvas.height - scaledHeight) / 2;

        // Draw image to offscreen canvas to capture pixel data at the current scale
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        
        offscreenCtx.fillStyle = 'black'; 
        offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        offscreenCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        
        const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
        data = imageData.data;
      };

      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);

      const renderFrame = () => {
        if (!data) {
          animationFrameId = requestAnimationFrame(renderFrame);
          return;
        }

        // 1. CLEAR TO WHITE (The Sky background)
        ctx.fillStyle = 'white'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. DRAW IN BLACK INK
        ctx.fillStyle = 'black'; 
        ctx.font = `${resolution}px monospace`;
        ctx.textBaseline = 'top'; 

        const time = Date.now();

        for (let y = 0; y < canvas.height; y += resolution) {
          for (let x = 0; x < canvas.width; x += resolution) {
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            let brightness = (r + g + b) / 3; 

            // Convert canvas coordinate x/y to relative position on the source image [0.0 - 1.0]
            const imgX = (x - offsetX) / scaledWidth;
            const imgY = (y - offsetY) / scaledHeight;

            // Coordinates for Watchmen panel speech bubble containing "TOTALLY INDIFFERENT."
            const isSpeechBubble = (imgX > 0.52 && imgX < 0.72 && imgY > 0.07 && imgY < 0.20);
            
            // Sky background area (excluding Dr. Manhattan on the left and the ground at the bottom)
            const isSky = (imgY < 0.8) && !(imgX < 0.38);

            // A star is identified as a bright pixel within the sky boundary, avoiding the speech bubble
            const isStar = isSky && !isSpeechBubble && (brightness > 150);

            if (isStar) {
              // Staggered delay phase for each star based on its position
              const phase = (x * 17.3 + y * 37.7) % (2 * Math.PI);
              
              // Double sine wave animation (slow glow + fast shimmer) for natural twinkling
              const slowCycle = Math.sin(time / 450 + phase);
              const fastCycle = Math.sin(time / 80 + phase);
              
              const sparkleFactor = 0.35 + 0.65 * (slowCycle * 0.75 + fastCycle * 0.25);
              brightness = brightness * Math.max(0, Math.min(1, sparkleFactor));
            } else {
              // Apply a very subtle organic wobble to Manhattan and speech bubble to make them feel hand-sketched
              const boilAmount = 10;
              brightness += (Math.random() - 0.5) * boilAmount;
            }

            // Clamp strictly between 0 and 255
            brightness = Math.max(0, Math.min(255, brightness));

            const charIndex = Math.floor((brightness / 255) * (density.length - 1));
            const char = density[charIndex];

            // Render characters (skip space character to save rendering cycles)
            if (char !== ' ') {
              ctx.fillText(char, x, y);
            }
          }
        }

        // Throttle to 24fps for that distinct retro/webcam look
        setTimeout(() => {
          animationFrameId = requestAnimationFrame(renderFrame);
        }, 1000 / 24); 
      };

      renderFrame();

      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        cancelAnimationFrame(animationFrameId);
      };
    };
  }, [imageUrl]);

  return (
    <canvas 
      ref={canvasRef} 
      className="h-full w-full object-cover"
    />
  );
}