import heroImg from './assets/hero.png'
import terminalIcon from './assets/terminal.png'

export default function App() {
  return (
    <main className="relative h-screen w-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-black">
      <section className="h-full w-full">
        <img
          src={heroImg}
          alt="Hero"
          className="h-full w-full object-cover"
        />
      </section>
      <button
        type="button"
        aria-label="Open terminal"
        className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-black/60 p-3 shadow-lg shadow-black/40 backdrop-blur transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70" 
      >
        <img src={terminalIcon} alt="" className="h-8 w-8" />
      </button>
    </main>
  )
}