import { useState, useRef } from 'react';

export default function DraggableTerminalButton({ onClick, icon }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const wasDragged = useRef(false);

  const playBeep = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
  };

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    wasDragged.current = false;
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;

    if (Math.abs(newX - currentPos.current.x) > 3 || Math.abs(newY - currentPos.current.y) > 3) {
      wasDragged.current = true;
    }

    currentPos.current = { x: newX, y: newY };
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    
    if (!wasDragged.current) {
      playBeep();
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      type="button"
      aria-label="Open terminal"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none' // Prevent scrolling while dragging on touch devices
      }}
      className={`absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full p-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 ${
        isDragging ? 'cursor-grabbing scale-110 drop-shadow-[0_0_15px_rgba(0,191,255,0.8)]' : 'cursor-grab hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(0,191,255,0.8)] active:scale-95 duration-300'
      }`}
    >
      <img
        src={icon}
        alt=""
        draggable={false} // Prevent default image dragging
        className="h-24 w-24 object-contain pointer-events-none mix-blend-screen rounded-full" // pointer-events-none to let pointer events hit the button instead
      />
    </button>
  );
}
