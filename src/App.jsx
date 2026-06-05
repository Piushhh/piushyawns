import { useState } from 'react'
import Terminal from './components/Terminal'
import heroImg from './assets/hero2.jpeg'
import terminalIcon from './assets/terminal.png'

export default function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      
      {/* Static Background Image */}
      <section className="absolute inset-0 z-0 h-full w-full">
        <img src={heroImg} alt="Background" className="h-full w-full object-cover" />
      </section>
      {/* Floating Action Button to toggle Terminal */}
      {!isTerminalOpen && (
        <button
          type="button"
          aria-label="Open terminal"
          onClick={() => setIsTerminalOpen(true)}
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 p-4 shadow-lg shadow-black/40 backdrop-blur transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 hover:scale-105 active:scale-95 duration-200"
        >
          <img
            src={terminalIcon}
            alt=""
            className="h-20 w-20 object-contain"
          />
        </button>
      )}

      {/* Interactive CLI Terminal Panel */}
      {isTerminalOpen && (
        <Terminal onClose={() => setIsTerminalOpen(false)} />
      )}
      
    </main>
  )
}