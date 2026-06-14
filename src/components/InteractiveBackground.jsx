import { useEffect, useRef } from 'react'

export default function InteractiveBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let animId

    const mouse = { x: width / 2, y: height / 2, active: false }

    // ── Particle system ──────────────────────────────────────────────────────
    const PARTICLE_COUNT = 120
    const particles = []

    function randomBetween(a, b) {
      return a + Math.random() * (b - a)
    }

    class Particle {
      constructor() {
        this.reset(true)
      }

      reset(initial = false) {
        this.x = randomBetween(0, width)
        this.y = initial ? randomBetween(0, height) : height + randomBetween(10, 60)
        this.vx = randomBetween(-0.3, 0.3)
        this.vy = randomBetween(-0.4, -1.2)
        this.size = randomBetween(1, 3.5)
        this.alpha = 0
        this.maxAlpha = randomBetween(0.4, 0.85)
        this.life = 0
        this.maxLife = randomBetween(180, 400)
        // Hue cycles through cool aurora palette: cyan → violet → green
        this.hue = randomBetween(140, 320)
        this.saturation = randomBetween(70, 100)
        this.lightness = randomBetween(55, 80)
      }

      update(mx, my) {
        this.life++
        // Fade in / fade out
        const t = this.life / this.maxLife
        this.alpha = t < 0.2
          ? (t / 0.2) * this.maxAlpha
          : t > 0.75
            ? ((1 - t) / 0.25) * this.maxAlpha
            : this.maxAlpha

        // Gentle mouse repulsion
        const dx = this.x - mx
        const dy = this.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140) {
          const force = (140 - dist) / 140
          this.vx += (dx / dist) * force * 0.08
          this.vy += (dy / dist) * force * 0.08
        }

        // Damping
        this.vx *= 0.98
        this.vy *= 0.98

        // Slow drift toward mouse X for a pulled-ribbon feel
        this.vx += (mx - this.x) * 0.00008

        this.x += this.vx
        this.y += this.vy

        // Slowly shift hue for colour breathing
        this.hue += 0.15

        if (this.life >= this.maxLife) this.reset()
      }

      draw(ctx) {
        ctx.save()
        ctx.globalAlpha = this.alpha
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 4
        )
        const col = `hsl(${this.hue},${this.saturation}%,${this.lightness}%)`
        gradient.addColorStop(0, col)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle())
    }

    // ── Aurora wave layers ───────────────────────────────────────────────────
    let tick = 0

    function drawAurora() {
      // Three overlapping sinusoidal ribbons
      const layers = [
        { hue: 160, alpha: 0.04, amp: 90,  speed: 0.0008, offset: 0 },
        { hue: 230, alpha: 0.035, amp: 70, speed: 0.0012, offset: Math.PI * 0.7 },
        { hue: 290, alpha: 0.04, amp: 60,  speed: 0.001,  offset: Math.PI * 1.4 },
      ]

      layers.forEach(({ hue, alpha, amp, speed, offset }) => {
        const pull = (mouse.x / width - 0.5) * 60
        ctx.beginPath()
        for (let x = 0; x <= width; x += 4) {
          const baseY = height * 0.42
          const wave =
            Math.sin((x / width) * Math.PI * 3 + tick * speed * 1000 + offset) * amp +
            Math.sin((x / width) * Math.PI * 5 + tick * speed * 800 + offset * 0.5) * (amp * 0.4)
          const y = baseY + wave + pull * Math.sin((x / width) * Math.PI)
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()

        const grad = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.9)
        grad.addColorStop(0, `hsla(${hue},90%,65%,${alpha})`)
        grad.addColorStop(0.5, `hsla(${hue + 30},80%,55%,${alpha * 0.6})`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fill()
      })
    }

    // ── Mouse trail orbs ─────────────────────────────────────────────────────
    const trail = []
    const MAX_TRAIL = 28

    function pushTrail(x, y) {
      trail.push({ x, y, age: 0 })
      if (trail.length > MAX_TRAIL) trail.shift()
    }

    function drawTrail() {
      trail.forEach((pt, i) => {
        pt.age++
        const ratio = 1 - pt.age / 60
        if (ratio <= 0) return
        const r = 18 * ratio
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r)
        const hue = 170 + i * 4
        g.addColorStop(0, `hsla(${hue},100%,75%,${0.35 * ratio})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
        ctx.fill()
      })
      // Prune stale
      for (let i = trail.length - 1; i >= 0; i--) {
        if (trail[i].age > 60) trail.splice(i, 1)
      }
    }

    // ── Nebula blobs (static large glow clouds) ──────────────────────────────
    const nebulae = [
      { cx: 0.15, cy: 0.3,  r: 260, hue: 200 },
      { cx: 0.75, cy: 0.6,  r: 300, hue: 270 },
      { cx: 0.5,  cy: 0.85, r: 220, hue: 160 },
    ]

    function drawNebulae() {
      nebulae.forEach(({ cx, cy, r, hue }) => {
        // Very slow drift
        const ox = Math.sin(tick * 0.0003 + hue) * 18
        const oy = Math.cos(tick * 0.0004 + hue) * 14
        const x = cx * width + ox
        const y = cy * height + oy
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, `hsla(${hue},80%,60%,0.055)`)
        g.addColorStop(0.5, `hsla(${hue + 20},70%,50%,0.025)`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // ── Render loop ──────────────────────────────────────────────────────────
    function render() {
      tick++

      // Semi-transparent clear for motion blur / trailing effect
      ctx.fillStyle = 'rgba(2, 3, 12, 0.18)'
      ctx.fillRect(0, 0, width, height)

      drawNebulae()
      drawAurora()
      drawTrail()
      particles.forEach(p => {
        p.update(mouse.x, mouse.y)
        p.draw(ctx)
      })

      animId = requestAnimationFrame(render)
    }

    render()

    // ── Event listeners ──────────────────────────────────────────────────────
    function onMouseMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
      pushTrail(e.clientX, e.clientY)
    }

    function onResize() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  )
}
