import { useState } from 'react'
import Terminal from './components/Terminal'
import DraggableTerminalButton from './components/DraggableTerminalButton'
import InteractiveBackground from './components/InteractiveBackground'
import heroImg from './assets/hero2.jpeg'
import terminalIcon from './assets/custom_terminal_icon.png'

export default function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      
      {/* Static Background Image */}
      <section className="absolute inset-0 z-0 h-full w-full">
        <img src={heroImg} alt="Background" className="h-full w-full object-cover" />
      </section>

      {/* Interactive Particle Canvas */}
      <InteractiveBackground />

      {/* Floating Draggable Action Button to toggle Terminal */}
      {!isTerminalOpen && (
        <DraggableTerminalButton
          icon={terminalIcon}
          onClick={() => setIsTerminalOpen(true)}
        />
      )}

      {/* Interactive CLI Terminal Panel */}
      {isTerminalOpen && (
        <Terminal onClose={() => setIsTerminalOpen(false)} />
      )}
      
    </main>
  )
}