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
	const [isLoading, setIsLoading] = useState(false)
	const inputRef = useRef(null)
	const terminalEndRef = useRef(null)

	// Focus the input when the terminal is opened
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
	}, [history, isLoading])

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
bio               | Biography
works             | Works
hobbies           | Hobbies
contact           | Contact
clear             | Clear terminal`}
						</pre>
					</div>
				)
				break
			case 'piushos':
				output = <div className="my-2">Piush is a pre-grad student currently working on full-stack systems. He has a strong interest in blockchain backend development and modern UI design.</div>
				break
			case 'bio':
				output = <div className="my-2">Just a passionate developer crafting digital experiences.</div>
				break
			case 'works':
				output = (
					<div className="my-2">
						1. PiushOS Style CLI Portfolio<br/>
						2. Creative Canvas Animation<br/>
					</div>
				)
				break
			case 'hobbies':
				output = <div className="my-2">Coding, Designing, and drinking coffee.</div>
				break
			case 'contact':
				output = (
					<div className="my-2">
						Email: piush@example.com<br/>
						GitHub: github.com/Piushhh
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
			<div className="w-full max-w-4xl overflow-hidden rounded-t-lg border border-[#a0a0a0] shadow-2xl shadow-black/50 bg-[#f4f5f5]">
				
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
				
				{/* Content Area with scanlines */}
				<div 
					onClick={handleTerminalClick}
					className="px-6 py-8 font-mono text-[15px] text-[#1c1c1c] overflow-y-auto h-[65vh] cursor-text"
					style={{
						backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)',
						backgroundColor: '#f8f9fa'
					}}
				>
					{isLoading ? (
						<div className="whitespace-pre-line text-[#1c1c1c]">
							Booting PiushOS...
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
										onChange={(e) => setInput(e.target.value)}
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
	)
}
