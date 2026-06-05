import { useState, useRef, useEffect } from 'react'

export default function Terminal({ onClose }) {
	const [input, setInput] = useState('')
	const [history, setHistory] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [loadingText, setLoadingText] = useState('')
	const inputRef = useRef(null)
	const terminalEndRef = useRef(null)

	// Boot sequence effect
	useEffect(() => {
		const bootSequence = [
			"Initializing PiushOS kernel...",
			"Loading drivers...",
			"[OK] File system mounted.",
			"[OK] Network connected.",
			"Starting CLI interface...",
			"Access granted."
		]
		
		let step = 0
		const interval = setInterval(() => {
			if (step < bootSequence.length) {
				setLoadingText(prev => prev + (prev ? '\n' : '') + bootSequence[step])
				step++
			} else {
				clearInterval(interval)
				setTimeout(() => setIsLoading(false), 300)
			}
		}, 150)

		return () => clearInterval(interval)
	}, [])

	// Focus the input when the terminal is opened (and finished loading)
	useEffect(() => {
		if (!isLoading) {
			inputRef.current?.focus()
		}
	}, [isLoading])

	// Keep terminal scrolled to the bottom as history grows
	useEffect(() => {
		if (!isLoading) {
			terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [history, isLoading, loadingText])

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
					<div className="my-2 border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-4 max-w-lg space-y-2 shadow-inner">
						<div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
							<span className="text-white font-semibold flex items-center gap-1.5">
								<span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
								Command: <span className="text-emerald-300 font-mono">help</span>
							</span>
							<span className="text-xs text-emerald-400/60 font-mono">Status: active</span>
						</div>
						<div className="text-xs text-emerald-300/80 space-y-1 pt-1">
							<p className="font-semibold text-white">Total Commands Available: 6</p>
							<div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 font-mono text-emerald-400">
								<div>• <span className="text-white font-bold">help</span> - Show this help menu</div>
								<div>• <span className="text-white font-bold">about</span> - Who is Piush?</div>
								<div>• <span className="text-white font-bold">projects</span> - Showcase of works</div>
								<div>• <span className="text-white font-bold">skills</span> - Technology stack</div>
								<div>• <span className="text-white font-bold">contact</span> - Reach out to me</div>
								<div>• <span className="text-white font-bold">clear</span> - Clear output log</div>
							</div>
						</div>
					</div>
				)
				break
			case 'about':
				output = (
					<div className="my-2 text-emerald-300/90 space-y-2 max-w-xl">
						<p className="text-white font-bold">About Piush</p>
						<p>Hey there! I am Piush, a passionate full-stack developer who loves creating interactive, modern, and beautiful web experiences.</p>
						<p>I enjoy merging design aesthetics with robust engineering to build web apps that leave a lasting impression.</p>
					</div>
				)
				break
			case 'projects':
				output = (
					<div className="my-2 text-emerald-300/90 space-y-2 max-w-xl">
						<p className="text-white font-bold">Projects</p>
						<ul className="list-disc pl-4 space-y-1">
							<li>
								<span className="text-white font-semibold">DaveOS Style CLI Portfolio</span> - An interactive terminal website powered by React and Tailwind CSS.
							</li>
							<li>
								<span className="text-white font-semibold">Creative Canvas Animation</span> - An optimized 2D/3D canvas processing engine for real-time visual conversions.
							</li>
						</ul>
					</div>
				)
				break
			case 'skills':
				output = (
					<div className="my-2 text-emerald-300/90 space-y-2">
						<p className="text-white font-bold">Skills</p>
						<p><span className="text-emerald-400">Frontend:</span> React, JavaScript (ES6+), Tailwind CSS, HTML5, CSS3, Vite</p>
						<p><span className="text-emerald-400">Backend:</span> Node.js, Express, REST APIs</p>
						<p><span className="text-emerald-400">Developer Tools:</span> Git, GitHub, VS Code, Vite, PostCSS</p>
					</div>
				)
				break
			case 'contact':
				output = (
					<div className="my-2 text-emerald-300/90 space-y-1">
						<p className="text-white font-bold">Get In Touch</p>
						<p>• <span className="text-emerald-400">Email:</span> <a href="mailto:piush@example.com" className="underline hover:text-white transition">piush@example.com</a></p>
						<p>• <span className="text-emerald-400">GitHub:</span> <a href="https://github.com/Piushhh" target="_blank" rel="noreferrer" className="underline hover:text-white transition">github.com/Piushhh</a></p>
					</div>
				)
				break
			default:
				output = (
					<div className="my-1 text-red-400 font-mono">
						sh: command not found: {trimmedInput}. Type <span className="text-white font-bold">help</span> to view available commands.
					</div>
				)
				break
		}

		setHistory((prev) => [...prev, { command: trimmedInput, output }])
		setInput('')
	}

	return (
		<div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
			<div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/60">
				<div className="flex items-center justify-between border-b border-white/10 bg-[#111] px-4 py-3">
					<div className="flex items-center gap-2">
						<span className="h-3 w-3 rounded-full bg-red-500" />
						<span className="h-3 w-3 rounded-full bg-yellow-400" />
						<span className="h-3 w-3 rounded-full bg-green-500" />
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md px-2 py-1 text-xs font-semibold text-white/70 transition hover:text-white"
						aria-label="Close terminal"
					>
						Close
					</button>
				</div>
				
				<div 
					onClick={handleTerminalClick}
					className="px-5 py-6 font-mono text-sm text-emerald-200 overflow-y-auto max-h-[60vh] h-[60vh] space-y-2 cursor-text"
				>
					{isLoading ? (
						<div className="whitespace-pre-line text-emerald-400 font-mono">
							{loadingText}
							<span className="inline-block h-4 w-2 bg-emerald-400 animate-pulse align-middle ml-1" />
							<div ref={terminalEndRef} />
						</div>
					) : (
						<>
							<div className="space-y-1 animate-fade-in">
								<p className="font-bold text-white text-base">Piush's Terminal</p>
								<p>Welcome to Piush's terminal.</p>
								<p className="opacity-60">type 'help' to start</p>
							</div>

							{/* Command history */}
							<div className="space-y-3 pt-2">
								{history.map((entry, idx) => (
									<div key={idx} className="space-y-1">
										<p className="opacity-85">
											piush@macbook ~ % <span className="text-white">{entry.command}</span>
										</p>
										<div>{entry.output}</div>
									</div>
								))}
							</div>

							{/* Current Input prompt */}
							<form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
								<span className="opacity-85 shrink-0">piush@macbook ~ %</span>
								<div className="relative flex-grow flex items-center">
									<input
										ref={inputRef}
										type="text"
										value={input}
										onChange={(e) => setInput(e.target.value)}
										className="w-full bg-transparent text-emerald-200 focus:outline-none border-none p-0 font-mono caret-emerald-400 select-text"
										aria-label="Terminal input"
									/>
									{input.length === 0 && (
										<span className="absolute left-0 pointer-events-none inline-block h-4 w-1.5 bg-emerald-400 animate-pulse" />
									)}
								</div>
							</form>
							<div ref={terminalEndRef} />
						</>
					)}
				</div>
			</div>
		</div>
	)
}
