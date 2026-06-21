import { useState, useRef, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000'

const RetroMacIcon = () => (
	<svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
		<g transform="translate(10, 10)">
			{/* Base mac body with dithering/shading simulation using a pattern */}
			<defs>
				<pattern id="dither" patternUnits="userSpaceOnUse" width="4" height="4">
					<rect width="2" height="2" fill="#000" fillOpacity="0.3" />
					<rect x="2" y="2" width="2" height="2" fill="#000" fillOpacity="0.3" />
				</pattern>
			</defs>
			<rect x="0" y="0" width="70" height="60" fill="url(#dither)" stroke="#000" strokeWidth="2" />
			<rect x="8" y="8" width="54" height="38" fill="#fff" stroke="#000" strokeWidth="2" />
			{/* Face line */}
			<path d="M 35 8 L 35 46" stroke="#000" strokeWidth="2" />
			{/* Eyes */}
			<rect x="22" y="18" width="4" height="6" fill="#000" />
			<rect x="46" y="18" width="4" height="6" fill="#000" />
			{/* Smile */}
			<path d="M 22 35 Q 35 42 46 35" stroke="#000" strokeWidth="2" fill="none" />
			{/* Nose */}
			<path d="M 35 25 L 30 30" stroke="#000" strokeWidth="2" fill="none" />
		</g>
	</svg>
)

// ── Theme Definitions ──
const THEMES = {
	mac: {
		name: 'Mac Classic',
		bg: '#f8f9fa',
		text: '#1c1c1c',
		textMuted: '#444',
		titleBarFrom: '#f8f8f8',
		titleBarTo: '#d4d4d4',
		titleText: '#333',
		border: '#a0a0a0',
		cardBg: '#f4f5f5',
		prompt: '#1c1c1c',
		cursor: '#1c1c1c',
		bootOk: '#15803d',
		bootProgress: '#2563eb',
	},
	hacker: {
		name: 'Hacker',
		bg: '#0a0a0a',
		text: '#00ff41',
		textMuted: '#00cc33',
		titleBarFrom: '#111111',
		titleBarTo: '#1a1a1a',
		titleText: '#00ff41',
		border: '#00ff4133',
		cardBg: '#0a0a0a',
		prompt: '#00ff41',
		cursor: '#00ff41',
		bootOk: '#00ff41',
		bootProgress: '#00cc33',
	},
	retro: {
		name: 'Retro Amber',
		bg: '#1a1000',
		text: '#ffb000',
		textMuted: '#cc8800',
		titleBarFrom: '#2a1a00',
		titleBarTo: '#1a1000',
		titleText: '#ffb000',
		border: '#ffb00033',
		cardBg: '#1a1000',
		prompt: '#ffb000',
		cursor: '#ffb000',
		bootOk: '#ffb000',
		bootProgress: '#ff8800',
	},
	dracula: {
		name: 'Dracula',
		bg: '#282a36',
		text: '#f8f8f2',
		textMuted: '#6272a4',
		titleBarFrom: '#44475a',
		titleBarTo: '#282a36',
		titleText: '#f8f8f2',
		border: '#6272a4',
		cardBg: '#282a36',
		prompt: '#50fa7b',
		cursor: '#f8f8f2',
		bootOk: '#50fa7b',
		bootProgress: '#bd93f9',
	},
}

export default function Terminal({ onClose }) {
	const [input, setInput] = useState('')
	const [history, setHistory] = useState([])
	const [themeName, setThemeName] = useState('mac')
	const [welcomeLines, setWelcomeLines] = useState([])
	const [currentLineText, setCurrentLineText] = useState('')
	const [showPrompt, setShowPrompt] = useState(false)
	const inputRef = useRef(null)
	const terminalEndRef = useRef(null)
	const audioCtxRef = useRef(null)

	// Drag state for the window
	const [windowPos, setWindowPos] = useState({ x: 0, y: 0 })
	const [isDraggingWindow, setIsDraggingWindow] = useState(false)
	const dragStartRef = useRef({ x: 0, y: 0 })

	const theme = THEMES[themeName]

	// Lazily get or create a shared AudioContext
	const getAudioCtx = () => {
		if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
			audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
		}
		// Resume if suspended (browser autoplay policy)
		if (audioCtxRef.current.state === 'suspended') {
			audioCtxRef.current.resume()
		}
		return audioCtxRef.current
	}

	const WELCOME_LINES = [
		"Welcome to PiushOS terminal.",
		"Type 'help' to start."
	]

	useEffect(() => {
		let cancelled = false
		const typeLines = async () => {
			await new Promise(r => setTimeout(r, 300)) // initial delay
			for (let i = 0; i < WELCOME_LINES.length; i++) {
				if (cancelled) return
				const line = WELCOME_LINES[i]
				
				for (let j = 0; j <= line.length; j++) {
					if (cancelled) return
					setCurrentLineText(line.slice(0, j))
					await new Promise(r => setTimeout(r, 20)) // typing speed
				}
				
				if (cancelled) return
				setWelcomeLines(prev => [...prev, line])
				setCurrentLineText('')
				await new Promise(r => setTimeout(r, 150)) // delay between lines
			}
			if (!cancelled) {
				setShowPrompt(true)
			}
		}
		typeLines()
		return () => { cancelled = true }
	}, [])

	// Focus the input when prompt appears
	useEffect(() => {
		if (showPrompt) {
			inputRef.current?.focus()
		}
	}, [showPrompt])

	// Keep terminal scrolled to the bottom as history grows
	useEffect(() => {
		terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [history])

	// Mechanical keyboard click sound
	const playKeyClick = () => {
		try {
			const ctx = getAudioCtx()
			const now = ctx.currentTime

			// Short noise burst for the click
			const bufferSize = ctx.sampleRate * 0.015 // 15ms
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
			const data = buffer.getChannelData(0)
			for (let i = 0; i < bufferSize; i++) {
				data[i] = (Math.random() * 2 - 1) * 0.15
			}

			const noise = ctx.createBufferSource()
			noise.buffer = buffer

			// Bandpass filter to shape the click tone
			const filter = ctx.createBiquadFilter()
			filter.type = 'bandpass'
			filter.frequency.value = 3000 + Math.random() * 2000 // randomize pitch slightly
			filter.Q.value = 1.5

			const gain = ctx.createGain()
			gain.gain.setValueAtTime(0.08 + Math.random() * 0.04, now) // subtle volume variation
			gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012)

			noise.connect(filter)
			filter.connect(gain)
			gain.connect(ctx.destination)

			noise.start(now)
			noise.stop(now + 0.015)
		} catch { /* audio not available */ }
	}

	// Enter / carriage return sound (deeper, slightly longer)
	const playEnterSound = () => {
		try {
			const ctx = getAudioCtx()
			const now = ctx.currentTime

			// Slightly longer noise burst
			const bufferSize = ctx.sampleRate * 0.04 // 40ms
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
			const data = buffer.getChannelData(0)
			for (let i = 0; i < bufferSize; i++) {
				data[i] = (Math.random() * 2 - 1) * 0.2
			}

			const noise = ctx.createBufferSource()
			noise.buffer = buffer

			// Lower frequency for a heavier "thunk"
			const filter = ctx.createBiquadFilter()
			filter.type = 'bandpass'
			filter.frequency.value = 1200
			filter.Q.value = 0.8

			const gain = ctx.createGain()
			gain.gain.setValueAtTime(0.12, now)
			gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)

			noise.connect(filter)
			filter.connect(gain)
			gain.connect(ctx.destination)

			noise.start(now)
			noise.stop(now + 0.04)
		} catch { /* audio not available */ }
	}

	const handleInputChange = (e) => {
		setInput(e.target.value)
		playKeyClick()
	}

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			playEnterSound()
		}
	}

	const handleTerminalClick = () => {
		inputRef.current?.focus()
	}

	// ── Window drag handlers (title bar only) ──
	const handleTitleBarPointerDown = (e) => {
		// Don't start drag if clicking on traffic light buttons
		if (e.target.closest('button')) return
		e.currentTarget.setPointerCapture(e.pointerId)
		setIsDraggingWindow(true)
		dragStartRef.current = {
			x: e.clientX - windowPos.x,
			y: e.clientY - windowPos.y,
		}
	}

	const handleTitleBarPointerMove = (e) => {
		if (!isDraggingWindow) return
		setWindowPos({
			x: e.clientX - dragStartRef.current.x,
			y: e.clientY - dragStartRef.current.y,
		})
	}

	const handleTitleBarPointerUp = (e) => {
		if (!isDraggingWindow) return
		e.currentTarget.releasePointerCapture(e.pointerId)
		setIsDraggingWindow(false)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		const trimmedInput = input.trim()
		const cleanInput = trimmedInput.toLowerCase()

		if (!trimmedInput) return

		let output = null

		if (cleanInput === 'clear') {
			setHistory([])
			setInput('')
			return
		}

		// Handle theme command
		if (cleanInput.startsWith('theme')) {
			const parts = cleanInput.split(/\s+/)
			const requested = parts[1]

			if (!requested) {
				// Show available themes
				output = (
					<div className="my-2 space-y-1">
						<div className="font-bold">Available themes:</div>
						{Object.entries(THEMES).map(([key, t]) => (
							<div key={key}>
								<span className="font-bold">{key}</span>
								{' — '}{t.name}
								{key === themeName ? ' ✓ (active)' : ''}
							</div>
						))}
						<div className="pt-1" style={{ color: theme.textMuted }}>Usage: theme &lt;name&gt;</div>
					</div>
				)
			} else if (THEMES[requested]) {
				setThemeName(requested)
				output = (
					<div className="my-2">
						🎨 Theme switched to <span className="font-bold">{THEMES[requested].name}</span>
					</div>
				)
			} else {
				output = (
					<div className="my-2">
						Unknown theme: '{requested}'. Type <span className="font-bold">theme</span> to see available options.
					</div>
				)
			}

			setHistory((prev) => [...prev, { command: trimmedInput, output }])
			setInput('')
			return
		}

		// Handle send command
		if (cleanInput.startsWith('send')) {
			const message = trimmedInput.slice(4).trim()
			
			if (!message) {
				output = (
					<div className="my-2">
						Usage: <span className="font-bold">send &lt;message&gt;</span>
					</div>
				)
				setHistory((prev) => [...prev, { command: trimmedInput, output }])
			} else {
				setHistory((prev) => [...prev, { command: trimmedInput, output: <div className="my-2 italic text-gray-500">Sending message...</div> }])
				setInput('')
				
				try {
					const res = await fetch(`${API_BASE_URL}/api/contact`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ message, name: 'Visitor' })
					})
					
					const data = await res.json()
					
					setHistory((prev) => {
						const newHistory = [...prev]
						if (res.ok) {
							newHistory[newHistory.length - 1].output = <div className="my-2 text-green-500">{data.message || 'Message sent successfully!'}</div>
						} else {
							newHistory[newHistory.length - 1].output = <div className="my-2 text-red-500">Error: {data.error || 'Failed to send message.'}</div>
						}
						return newHistory
					})
				} catch (err) {
					setHistory((prev) => {
						const newHistory = [...prev]
						newHistory[newHistory.length - 1].output = <div className="my-2 text-red-500">Network error: Could not reach the server.</div>
						return newHistory
					})
				}
			}
			setInput('')
			return
		}

		// Handle blog command
		if (cleanInput === 'blog' || cleanInput.startsWith('blog ')) {
			const slug = trimmedInput.slice(4).trim()
			
			setHistory((prev) => [...prev, { command: trimmedInput, output: <div className="my-2 italic text-gray-500">Fetching...</div> }])
			setInput('')
			
			try {
				if (!slug) {
					// List all blogs
					const res = await fetch(`${API_BASE_URL}/api/blogs`)
					const blogs = await res.json()
					
					if (!res.ok) throw new Error(blogs.error)
					
					const blogOutput = blogs.length === 0 ? (
						<div className="my-2">No blog posts yet. Check back soon!</div>
					) : (
						<div className="my-3">
							<pre className="font-mono text-sm leading-tight">
{`┌─[ PIUSHOS / BLOG ]────────┐
| Posts: ${String(blogs.length).padEnd(19)}|
└───────────────────────────┘\n`}
							</pre>
							<div className="space-y-2 mt-2">
								{blogs.map((b, i) => (
									<div key={b._id}>
										<span className="font-bold">{i + 1}.</span>{' '}
										<span className="font-bold">{b.title}</span>
										<span className="text-gray-500 ml-2">[{b.tags?.join(', ')}]</span>
										<div className="text-gray-500 text-xs ml-4">→ blog {b.slug}</div>
									</div>
								))}
							</div>
							<div className="mt-3 text-gray-500 text-xs">Type blog &lt;slug&gt; to read a post.</div>
						</div>
					)
					
					setHistory((prev) => {
						const h = [...prev]
						h[h.length - 1].output = blogOutput
						return h
					})
				} else {
					// Fetch single blog by slug
					const res = await fetch(`${API_BASE_URL}/api/blogs/${slug}`)
					const blog = await res.json()
					
					if (!res.ok) {
						setHistory((prev) => {
							const h = [...prev]
							h[h.length - 1].output = <div className="my-2 text-red-500">Blog post not found: '{slug}'. Type <span className="font-bold">blog</span> to see available posts.</div>
							return h
						})
					} else {
						const postOutput = (
							<div className="my-3">
								<div className="font-bold text-lg mb-1">{blog.title}</div>
								<div className="text-gray-500 text-xs mb-3">[{blog.tags?.join(', ')}] — {new Date(blog.createdAt).toLocaleDateString()}</div>
								<div className="whitespace-pre-wrap leading-relaxed">{blog.content}</div>
							</div>
						)
						setHistory((prev) => {
							const h = [...prev]
							h[h.length - 1].output = postOutput
							return h
						})
					}
				}
			} catch (err) {
				setHistory((prev) => {
					const h = [...prev]
					h[h.length - 1].output = <div className="my-2 text-red-500">Network error: Could not reach the server.</div>
					return h
				})
			}
			return
		}

		switch (cleanInput) {
			case 'help':
				output = (
					<div className="my-4">
						<pre className="font-mono text-sm leading-tight">
{`┌─[ PIUSHOS / HELP ]────────┐
| Command: help             |
| Items: 9                  |
└───────────────────────────┘

Command index for PiushOS.
9 commands available.
____________________________________________________

COMMAND           | DESCRIPTION
───────────────── | ────────────────────────────────────────
help              | Show available commands
piushos           | About PiushOS
works             | Projects & works
blog              | Read blog posts
contact           | Contact
send <msg>        | Directly message Piush
theme             | Change terminal theme
clear             | Clear the terminal`}
						</pre>
					</div>
				)
				break
			case 'piushos':
				output = <div className="my-2">Piush is a pre-grad student currently working on full-stack systems. He is keenly interested in Blockchain, Backend Development and Modern UI design.</div>
				break
			case 'works': {
				// Fetch projects from API
				setHistory((prev) => [...prev, { command: trimmedInput, output: <div className="my-2 italic text-gray-500">Loading projects...</div> }])
				setInput('')
				
				try {
					const res = await fetch(`${API_BASE_URL}/api/projects`)
					const projects = await res.json()
					
					if (!res.ok) throw new Error(projects.error)
					
					const statusIcon = { live: '🟢', wip: '🟡', 'coming-soon': '🔵' }
					const statusLabel = { live: 'LIVE', wip: 'WIP', 'coming-soon': 'SOON' }
					
					const worksOutput = projects.length === 0 ? (
						<div className="my-2">Projects under development. Check back soon!</div>
					) : (
						<div className="my-3">
							<pre className="font-mono text-sm leading-tight">
{`┌─[ PIUSHOS / WORKS ]───────┐
| Projects: ${String(projects.length).padEnd(16)}|
└───────────────────────────┘`}
							</pre>
							<div className="space-y-3 mt-3">
								{projects.map((p, i) => (
									<div key={p._id} className="border-l-2 border-gray-600 pl-3">
										<div className="font-bold">
											{statusIcon[p.status] || '⚪'} {p.title}
											<span className="text-xs text-gray-500 ml-2">[{statusLabel[p.status] || p.status}]</span>
										</div>
										<div className="text-sm mt-0.5">{p.description}</div>
										<div className="text-xs text-gray-500 mt-0.5">Tech: {p.tech?.join(' · ')}</div>
										{p.link && <div className="text-xs mt-0.5">🔗 <a href={p.link} target="_blank" rel="noopener noreferrer" className="underline">{p.link}</a></div>}
									</div>
								))}
							</div>
						</div>
					)
					
					setHistory((prev) => {
						const h = [...prev]
						h[h.length - 1].output = worksOutput
						return h
					})
				} catch (err) {
					setHistory((prev) => {
						const h = [...prev]
						h[h.length - 1].output = <div className="my-2 text-red-500">Could not load projects. Backend may be offline.</div>
						return h
					})
				}
				return
			}
			case 'contact':
				output = (
					<div className="my-2">
						Email: <a href="mailto:[piush02jha@gmail.com]">[Piush's Email]</a><br/>
						GitHub: <a href="https://github.com/Piushhh">github.com/Piushhh</a>
					</div>
				)
				break

			// ── Easter Egg Commands (hidden from help) ──

			case 'sudo':
				output = (
					<div className="my-2">
						<span className="text-red-600 font-bold">[sudo]</span> piush is not in the sudoers file. This incident will be reported. 🚨
					</div>
				)
				break

			case 'matrix':
				output = (
					<div className="my-3 font-mono text-[11px] leading-none text-green-600 overflow-hidden whitespace-pre" style={{ animation: 'fadeIn 0.3s ease-out' }}>
{`
 ╔══════════════════════════════════════════════╗
 ║  Wake up, Neo...                            ║
 ║  The Matrix has you...                      ║
 ║  Follow the white rabbit. 🐇               ║
 ╚══════════════════════════════════════════════╝

 01001000 01100101 01101100 01101100 01101111
 ░▒▓█ ▓▒░ █▓▒░ ░▒▓█ ▓▒░ █▓▒░ ░▒▓█ ▓▒░ █▓▒░
 There is no spoon. 🥄`}
					</div>
				)
				break

			case 'gui':
				output = (
					<div className="my-2">
						<pre className="font-mono text-sm leading-tight">
{`┌─────────────────────────────────┐
│  ERROR: gui module was not found    │
│                                 │
│  Real developers use the CLI.   │
│  This is the way. ⌨️            │
└─────────────────────────────────┘`}
						</pre>
					</div>
				)
				break

			case 'date':
				output = (
					<div className="my-2">
						{new Date().toLocaleString('en-US', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
							timeZoneName: 'short'
						})}
					</div>
				)
				break

			case '42':
				output = (
					<div className="my-2">
						The Answer to the Ultimate Question of Life, the Universe, and Everything. 🌌
					</div>
				)
				break

			case 'coffee':
				output = (
					<div className="my-3 font-mono text-[12px] leading-tight whitespace-pre">
{`
        ( (
         ) )
      ._______.
      |       |]
      \\       /
       \`-----'

  Brewing coffee... ☕
  [██████████████] 100%
  Here you go! Cream or sugar??`}
					</div>
				)
				break

			case 'rm -rf /':
			case 'rm -rf':
				output = (
					<div className="my-2 space-y-1">
						<div className="text-red-600 font-bold">⚠️  CRITICAL WARNING ⚠️</div>
						<div>Deleting system files...</div>
						<div>Removing /sys/piush/core.bin... <span className="text-red-600">FAILED</span></div>
						<div>Removing /usr/bin/humor... <span className="text-red-600">FAILED</span></div>
						<div>Removing /etc/good-vibes... <span className="text-red-600">PERMISSION DENIED</span></div>
						<div className="pt-1 font-bold">Nice try. 😏 PiushOS is indestructible.</div>
					</div>
				)
				break

			case 'whoami':
				output = (
					<div className="my-2">
						visitor@piushos — You're a curious one, aren't you? 👀
					</div>
				)
				break

			case 'exit':
				output = (
					<div className="my-2">
						There is no escape. You're stuck here forever. Just kidding — click the red button. 🔴
					</div>
				)
				break

			default:
				output = (
					<div className="my-1">
						sh: command not found: {trimmedInput}. Type 'help' to view available commands.
					</div>
				)
				break
		}

		setHistory((prev) => [...prev, { command: trimmedInput, output }])
		setInput('')
	}

	return (
		<div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
			{/* CRT Power-on animation wrapper */}
			<div
				className="w-full max-w-4xl crt-power-on"
				style={{
					transform: `translate(${windowPos.x}px, ${windowPos.y}px)`,
					transition: isDraggingWindow ? 'none' : 'transform 0.15s ease-out',
				}}
			>
				<div className="relative overflow-hidden rounded-lg shadow-2xl shadow-black/50 crt-flicker"
					style={{ borderRadius: '8px', borderColor: theme.border, borderWidth: '1px', borderStyle: 'solid', backgroundColor: theme.cardBg, transition: 'background-color 0.4s, border-color 0.4s' }}
				>
				
				{/* Classic Mac OS Title bar — draggable */}
				<div
					className={`flex items-center justify-center relative px-4 py-1.5 select-none ${isDraggingWindow ? 'cursor-grabbing' : 'cursor-grab'}`}
					style={{ borderBottom: `1px solid ${theme.border}`, background: `linear-gradient(to bottom, ${theme.titleBarFrom}, ${theme.titleBarTo})`, transition: 'background 0.4s, border-color 0.4s', touchAction: 'none' }}
					onPointerDown={handleTitleBarPointerDown}
					onPointerMove={handleTitleBarPointerMove}
					onPointerUp={handleTitleBarPointerUp}

				>
					<div className="absolute left-4 flex items-center gap-2">
						{/* Traffic lights */}
						<button 
							onClick={onClose} 
							className="h-3.5 w-3.5 rounded-full border border-[#d6413b] bg-[#ff5f56] shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)] active:bg-[#d6413b] cursor-pointer" 
							aria-label="Close terminal"
						/>
						<button className="h-3.5 w-3.5 rounded-full border border-[#d2a32c] bg-[#ffbd2e] shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)] cursor-default" />
						<button className="h-3.5 w-3.5 rounded-full border border-[#239c32] bg-[#27c93f] shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)] cursor-default" />
					</div>
					<span className="text-[14px] font-semibold tracking-wide pointer-events-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: theme.titleText, transition: 'color 0.4s' }}>
						PiushOS Terminal
					</span>
				</div>
				
				{/* Content Area with CRT effects */}
				<div className="relative">
					{/* Animated scanline sweep */}
					<div
						className="pointer-events-none absolute inset-0 z-10"
						style={{
							background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.04) 50%, transparent 100%)',
							height: '30%',
							animation: 'crt-scanline 6s linear infinite',
						}}
					/>

					{/* Static scanline texture */}
					<div
						className="pointer-events-none absolute inset-0 z-10"
						style={{
							backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)',
						}}
					/>

					{/* Vignette overlay — darkens the corners */}
					<div
						className="pointer-events-none absolute inset-0 z-10"
						style={{
							background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.12) 100%)',
						}}
					/>

					<div 
						onClick={handleTerminalClick}
						className="px-6 py-8 font-mono text-[15px] overflow-y-auto h-[65vh] cursor-text crt-text-glow"
						style={{ backgroundColor: theme.bg, color: theme.text, transition: 'background-color 0.4s, color 0.4s' }}
					>
							<div className="animate-fade-in max-w-3xl">
								
								{/* Header */}
								<RetroMacIcon />
								<div className="border-b border-[#1c1c1c] pb-1 mb-4 inline-block pr-10">
									<h1 className="font-bold text-xl">PiushOS Terminal</h1>
								</div>
								
								<div className="space-y-1 mb-6">
									{welcomeLines.map((line, idx) => (
										<p key={idx}>{line}</p>
									))}
									{!showPrompt && (
										<p>
											{currentLineText}
											<span className="inline-block w-2 h-4 ml-0.5 align-middle" style={{ backgroundColor: theme.cursor, animation: 'blink 0.6s step-end infinite' }} />
										</p>
									)}
								</div>

								{showPrompt && (
									<>
										{/* Command history */}
										<div className="space-y-4">
											{history.map((entry, idx) => (
												<div key={idx} className="space-y-1">
													<p>
														$ {entry.command}
													</p>
													<div>{entry.output}</div>
												</div>
											))}
										</div>

										{/* Current Input prompt */}
										<form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4">
											<span className="shrink-0">$</span>
											<div className="relative flex-grow flex items-center">
												<input
													ref={inputRef}
													type="text"
													value={input}
													onChange={handleInputChange}
													onKeyDown={handleKeyDown}
													className="w-full bg-transparent text-[#1c1c1c] focus:outline-none border-none p-0 font-mono select-text"
													aria-label="Terminal input"
													spellCheck="false"
													autoComplete="off"
												/>
											</div>
										</form>
										<div ref={terminalEndRef} className="h-4" />
									</>
								)}
							</div>
					</div>
				</div>
				</div>
			</div>
		</div>
	)
}
