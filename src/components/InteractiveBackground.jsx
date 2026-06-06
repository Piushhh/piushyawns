import { useEffect, useRef } from 'react'

export default function InteractiveBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let mouse = { x: -9999, y: -9999 }

    const PARTICLE_COUNT = 120
    const CONNECTION_DISTANCE = 140
    const MOUSE_RADIUS = 180
    const particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.5 + 0.3,
        // Give each particle a subtle color variation
        hue: 200 + Math.random() * 40, // blue-cyan range
      })
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse interaction — gentle push away
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS
          const angle = Math.atan2(dy, dx)
          p.vx += Math.cos(angle) * force * 0.4
          p.vy += Math.sin(angle) * force * 0.4
        }

        // Apply velocity with friction
        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        // Glow intensity based on mouse proximity
        let glowAlpha = p.baseAlpha
        if (dist < MOUSE_RADIUS) {
          glowAlpha = p.baseAlpha + (1 - p.baseAlpha) * ((MOUSE_RADIUS - dist) / MOUSE_RADIUS)
        }

        // Draw particle with glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${glowAlpha})`
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, ${glowAlpha * 0.8})`
        ctx.shadowBlur = dist < MOUSE_RADIUS ? 12 : 4
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.25

            // Brighter lines near mouse
            const midX = (a.x + b.x) / 2
            const midY = (a.y + b.y) / 2
            const mouseDist = Math.sqrt(
              (midX - mouse.x) ** 2 + (midY - mouse.y) ** 2
            )
            const mouseBoost = mouseDist < MOUSE_RADIUS
              ? (1 - mouseDist / MOUSE_RADIUS) * 0.4
              : 0

            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `hsla(210, 70%, 65%, ${alpha + mouseBoost})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Draw a subtle glow ring around the mouse cursor
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, MOUSE_RADIUS
        )
        gradient.addColorStop(0, 'hsla(210, 80%, 60%, 0.06)')
        gradient.addColorStop(0.5, 'hsla(210, 80%, 60%, 0.02)')
        gradient.addColorStop(1, 'hsla(210, 80%, 60%, 0)')
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1]"
      style={{ pointerEvents: 'none' }}
    />
  )
}
