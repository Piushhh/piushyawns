import { useRef, useEffect } from 'react';

export default function TwinklingHero({ imageUrl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animationFrameId;

    // The DaveOS style string: mostly empty space at the low end for a clean sky, 
    // ramping up to heavy characters for the dark areas.
    const density = '   .:-=+*#%@'; 
    const resolution = 4; // 4px gives that perfect balance of retro blockiness and detail

    const img = new Image();
    img.crossOrigin = 'Anonymous'; 
    img.src = imageUrl;

    img.onload = () => {
      const updateCanvasSize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      // Offscreen canvas to hold the static image data
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      
      offscreenCtx.fillStyle = 'black'; 
      offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      offscreenCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      
      const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const renderFrame = () => {
        // 1. CLEAR TO WHITE (The Sky)
        ctx.fillStyle = 'white'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. DRAW IN BLACK INK
        ctx.fillStyle = 'black'; 
        ctx.font = `${resolution}px monospace`;
        // Align text nicely within its block
        ctx.textBaseline = 'top'; 

        for (let y = 0; y < canvas.height; y += resolution) {
          for (let x = 0; x < canvas.width; x += resolution) {
            
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // Original Image: Sky is 0 (dark), Manhattan is 255 (bright)
            let brightness = (r + g + b) / 3; 

            // Add aggressive noise to make the white space twinkle with black dots, 
            // and make the dark spots boil slightly.
            const twinkleAmount = 60; 
            brightness += (Math.random() - 0.5) * twinkleAmount; 
            
            // Clamp strictly between 0 and 255
            brightness = Math.max(0, Math.min(255, brightness));

            // Map: Original Sky (0) -> index 0 (' ')
            // Map: Original Manhattan (255) -> index 11 ('@')
            const charIndex = Math.floor((brightness / 255) * (density.length - 1));
            const char = density[charIndex];

            // Only draw if it is NOT a space, saving immense CPU power
            if (char !== ' ') {
              ctx.fillText(char, x, y);
            }
          }
        }

        // Throttle to ~24fps for that webcam/terminal feel
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