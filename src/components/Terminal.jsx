export default function Terminal({ onClose }) {
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
				<div className="px-5 py-6 font-mono text-sm text-emerald-200">
					<p className="opacity-80">piush@macbook ~ %</p>
					<p>Welcome to the terminal.</p>
				</div>
			</div>
		</div>
	)
}
