import heroImg from './assets/hero.png'

export default function App() {
  return (
    <main className="h-screen w-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-black">
      <section className="h-full w-full">
        <img
          src={heroImg}
          alt="Hero"
          className="h-full w-full object-cover"
        />
      </section>
    </main>
  )
}