import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-600 text-sm font-bold text-white">SC</span>
          <span className="text-lg font-bold text-slate-900">
            Semanti<span className="text-navy-600">Check</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/" className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:text-navy-700">Home</Link>
          <Link to="/analyze" className="btn-primary !px-4 !py-2 text-sm">Analyze Documents</Link>
        </nav>
      </div>
    </header>
  )
}
