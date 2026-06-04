import { useState } from 'react'
import TwinklingHero from './components/TwinklingHero' // Adjust path if necessary
import Terminal from './components/Terminal'
import heroImg from './assets/hero2.jpeg'
import terminalIcon from './assets/terminal.png'

export default function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      
      {/* 1. Replaced the static img tag with the canvas component */}
      <section className="absolute inset-0 z-0 h-full w-full">
        <TwinklingHero imageUrl={heroImg} />
      </section>

      {/* 2. Added z-10 to ensure the button stays on top of the canvas */}
      <button
        type="button"
        aria-label="Open terminal"
        onClick={() => setIsTerminalOpen(true)}
        className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 p-4 shadow-lg shadow-black/40 backdrop-blur transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70"
      >
        <img
          src={terminalIcon}
          alt=""
          
          className="h-20 w-20 object-contain"
        />
      </button>

      {isTerminalOpen && (
        <Terminal onClose={() => setIsTerminalOpen(false)} />
      )}
      
    </main>
  )
}