import { useState, useRef, useEffect } from 'react'

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

export default function Terminal({ onClose }) {
	const [input, setInput] = useState('')
	const [history, setHistory] = useState([])
	const [bootPhase, setBootPhase] = useState('booting') // 'booting' | 'ready'
	const [bootLines, setBootLines] = useState([])
	const [currentBootText, setCurrentBootText] = useState('')
	const inputRef = useRef(null)
	const terminalEndRef = useRef(null)
	const bootEndRef = useRef(null)
	const audioCtxRef = useRef(null)

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

	const BOOT_SEQUENCE = [
		{ text: 'PiushOS v2.1.0 — Starting...', delay: 100 },
		{ text: '[  OK  ] Establishing secure session...', delay: 140 },
		{ text: '[  OK  ] All services started.', delay: 200 },
		{ text: '', delay: 100 },
		{ text: '████████████████████████████████ 100%', delay: 300 },
		{ text: '', delay: 100 },
		{ text: 'Access granted. Welcome, visitor.', delay: 400 },
	]

	// Play a short retro beep
	const playBootBeep = (freq = 600, duration = 0.04) => {
		try {
			const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
			const osc = audioCtx.createOscillator()
			const gain = audioCtx.createGain()
			osc.connect(gain)
			gain.connect(audioCtx.destination)
			osc.type = 'square'
			osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
			gain.gain.setValueAtTime(0.03, audioCtx.currentTime)
			gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration)
			osc.start(audioCtx.currentTime)
			osc.stop(audioCtx.currentTime + duration)
		} catch { /* audio not available */ }
	}

	// Play a success chime (two ascending notes)
	const playBootComplete = () => {
		try {
			const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
			const playNote = (freq, startTime, dur) => {
				const osc = audioCtx.createOscillator()
				const gain = audioCtx.createGain()
				osc.connect(gain)
				gain.connect(audioCtx.destination)
				osc.type = 'sine'
				osc.frequency.setValueAtTime(freq, startTime)
				gain.gain.setValueAtTime(0.06, startTime)
				gain.gain.exponentialRampToValueAtTime(0.00001, startTime + dur)
				osc.start(startTime)
				osc.stop(startTime + dur)
			}
			playNote(523, audioCtx.currentTime, 0.12)        // C5
			playNote(659, audioCtx.currentTime + 0.12, 0.15) // E5
			playNote(784, audioCtx.currentTime + 0.24, 0.2)  // G5
		} catch { /* audio not available */ }
	}

	// Typewriter effect for each boot line
	const typeText = (text) => {
		return new Promise((resolve) => {
			if (!text) {
				setCurrentBootText('')
				resolve()
				return
			}
			let i = 0
			const interval = setInterval(() => {
				setCurrentBootText(text.slice(0, i + 1))
				i++
				if (i >= text.length) {
					clearInterval(interval)
					resolve()
				}
			}, 12) // typing speed: 12ms per character
		})
	}

	// Run the boot sequence
	useEffect(() => {
		let cancelled = false

		const runBoot = async () => {
			for (let i = 0; i < BOOT_SEQUENCE.length; i++) {
				if (cancelled) return
				const line = BOOT_SEQUENCE[i]

				// Type out the line
				await typeText(line.text)

				if (cancelled) return

				// Play a soft beep for OK lines
				if (line.text.includes('[  OK  ]')) {
					playBootBeep(500 + Math.random() * 200)
				}

				// Commit the typed line to the boot log
				if (line.text) {
					setBootLines((prev) => [...prev, line.text])
				}
				setCurrentBootText('')

				// Wait before next line
				await new Promise((r) => setTimeout(r, line.delay))
			}

			if (!cancelled) {
				playBootComplete()
				// Short pause then show terminal
				await new Promise((r) => setTimeout(r, 600))
				if (!cancelled) {
					setBootPhase('ready')
				}
			}
		}

		runBoot()
		return () => { cancelled = true }
	}, [])

	// Focus the input when boot completes
	useEffect(() => {
		if (bootPhase === 'ready') {
			inputRef.current?.focus()
		}
	}, [bootPhase])

	// Keep terminal scrolled to the bottom as history grows
	useEffect(() => {
		if (bootPhase === 'ready') {
			terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [history, bootPhase])

	// Keep boot log scrolled to bottom during boot
	useEffect(() => {
		bootEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [bootLines, currentBootText])

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

	const handleSubmit = (e) => {
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

		switch (cleanInput) {
			case 'help':
				output = (
					<div className="my-4 text-[#1c1c1c]">
						<pre className="font-mono text-sm leading-tight">
{`┌─[ PIUSHOS / HELP ]────────┐
| Command: help             |
| Items: 7                  |
└───────────────────────────┘

Command index for PiushOS.
7 commands available.
____________________________________________________

COMMAND           | DESCRIPTION
───────────────── | ────────────────────────────────────────
help              | Show available commands
piushos           | About PiushOS
works             | Works
contact           | Contact
clear             | Clear terminal`}
						</pre>
					</div>
				)
				break
			case 'piushos':
				output = <div className="my-2">Piush is a pre-grad student currently working on full-stack systems. He has a strong interest in Blockchain systems, Backend Development and Modern UI design.</div>
				break
			case 'works':
				output = (
					<div className="my-2">
						"CollegeSpace" coming soon...
					</div>
				)
				break
			case 'contact':
				output = (
					<div className="my-2">
						Email: <a href="mailto:[piush02jha@gmail.com]">[Piush's Email]</a><br/>
						GitHub: <a href="https://github.com/Piushhh">github.com/Piushhh</a>
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
			<div className="w-full max-w-4xl crt-power-on">
				<div className="relative overflow-hidden rounded-lg border border-[#a0a0a0] shadow-2xl shadow-black/50 bg-[#f4f5f5] crt-flicker"
					style={{ borderRadius: '8px' }}
				>
				
				{/* Classic Mac OS Title bar */}
				<div className="flex items-center justify-center relative border-b border-[#a0a0a0] bg-gradient-to-b from-[#f8f8f8] to-[#d4d4d4] px-4 py-1.5">
					<div className="absolute left-4 flex items-center gap-2">
						{/* Traffic lights */}
						<button 
							onClick={onClose} 
							className="h-3.5 w-3.5 rounded-full border border-[#d6413b] bg-[#ff5f56] shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)] active:bg-[#d6413b]" 
							aria-label="Close terminal"
						/>
						<button className="h-3.5 w-3.5 rounded-full border border-[#d2a32c] bg-[#ffbd2e] shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)]" />
						<button className="h-3.5 w-3.5 rounded-full border border-[#239c32] bg-[#27c93f] shadow-[inset_0_1px_4px_rgba(255,255,255,0.5)]" />
					</div>
					<span className="text-[14px] font-semibold text-[#333] tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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
						className="px-6 py-8 font-mono text-[15px] text-[#1c1c1c] overflow-y-auto h-[65vh] cursor-text crt-text-glow"
						style={{ backgroundColor: '#f8f9fa' }}
					>
						{bootPhase === 'booting' ? (
							<div className="space-y-1 text-[13px] text-[#444]">
								{bootLines.map((line, i) => (
									<div key={i} className="whitespace-pre">
										{line.startsWith('[  OK  ]') ? (
											<>
												<span className="text-green-700 font-bold">[  OK  ]</span>
												<span>{line.slice(8)}</span>
											</>
										) : line.includes('100%') ? (
											<span className="text-blue-600 font-bold">{line}</span>
										) : line.startsWith('Access') ? (
											<span className="text-[#1c1c1c] font-bold">{line}</span>
										) : (
											<span>{line}</span>
										)}
									</div>
								))}
								{currentBootText && (
									<div className="whitespace-pre">
										{currentBootText.startsWith('[  OK  ]') ? (
											<>
												<span className="text-green-700 font-bold">[  OK  ]</span>
												<span>{currentBootText.slice(8)}</span>
											</>
										) : (
											<span>{currentBootText}</span>
										)}
										<span className="inline-block w-2 h-4 bg-[#1c1c1c] ml-0.5 align-middle" style={{ animation: 'blink 0.6s step-end infinite' }} />
									</div>
								)}
								<div ref={bootEndRef} />
							</div>
						) : (
							<div className="animate-fade-in max-w-3xl">
								
								{/* Header */}
								<RetroMacIcon />
								<div className="border-b border-[#1c1c1c] pb-1 mb-4 inline-block pr-10">
									<h1 className="font-bold text-xl">PiushOS Terminal</h1>
								</div>
								<div className="space-y-3 mb-6">
									<p>Welcome to PiushOS terminal.</p>
									<p>Type 'help' to start.</p>
								</div>

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
							</div>
						)}
					</div>
				</div>
				</div>
			</div>
		</div>
	)
}
