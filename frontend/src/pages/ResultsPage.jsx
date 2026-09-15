import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

// Level colors for badges and the chart (match the level names from the API).
const LEVEL_STYLES = {
  'Very High': { badge: 'bg-red-100 text-red-700 border-red-200', bar: '#dc2626' },
  High: { badge: 'bg-orange-100 text-orange-700 border-orange-200', bar: '#ea580c' },
  Moderate: { badge: 'bg-amber-100 text-amber-700 border-amber-200', bar: '#d97706' },
  Low: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: '#10b981' },
}

function ScoreDial({ score }) {
  // Conic-gradient ring visual (no chart lib needed for a single gauge).
  const color = score >= 85 ? '#dc2626' : score >= 70 ? '#ea580c' : score >= 40 ? '#d97706' : '#10b981'
  return (
    <div className="relative mx-auto h-44 w-44">
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0deg)` }}
      />
      <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-4xl font-extrabold" style={{ color }}>{score}%</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Semantic Similarity
        </span>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-2xl font-extrabold" style={accent ? { color: accent } : undefined}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result

  const [levelFilter, setLevelFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('desc')
  const [search, setSearch] = useState('')

  const filteredMatches = useMemo(() => {
    if (!result) return []
    let matches = [...result.matches]
    if (levelFilter !== 'All') matches = matches.filter((m) => m.level === levelFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      matches = matches.filter(
        (m) => m.sentence_a.toLowerCase().includes(q) || m.sentence_b.toLowerCase().includes(q),
      )
    }
    matches.sort((a, b) => (sortOrder === 'desc' ? b.similarity - a.similarity : a.similarity - b.similarity))
    return matches
  }, [result, levelFilter, sortOrder, search])

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">No results yet</h1>
        <p className="mt-2 text-slate-600">Run an analysis first to see the results dashboard.</p>
        <button onClick={() => navigate('/analyze')} className="btn-primary mt-6">
          Go to Analysis
        </button>
      </div>
    )
  }

  const { overall_similarity, sentence_count_a, sentence_count_b, distribution } = result
  const chartData = [
    { level: 'Low', count: distribution.low, color: LEVEL_STYLES.Low.bar },
    { level: 'Moderate', count: distribution.moderate, color: LEVEL_STYLES.Moderate.bar },
    { level: 'High', count: distribution.high, color: LEVEL_STYLES.High.bar },
    { level: 'Very High', count: distribution.very_high, color: LEVEL_STYLES['Very High'].bar },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* ---- Report header (visible in print) ---- */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">SemantiCheck — Semantic Similarity Report</h1>
        <p className="text-xs text-slate-500">
          Generated {new Date().toLocaleString()} · Model: all-MiniLM-L6-v2
        </p>
      </div>

      {/* ---- Top: score + key stats ---- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 text-center">
          <ScoreDial score={overall_similarity} />
          <p className="mt-3 text-sm text-slate-600">
            Average best-match score across all sentences in Document A.
          </p>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-slate-900">Analysis Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Sentences in A" value={sentence_count_a} />
            <StatCard label="Sentences in B" value={sentence_count_b} />
            <StatCard label="Potential Matches" value={result.matches.length} />
            <StatCard label="Very High" value={distribution.very_high} accent={LEVEL_STYLES['Very High'].bar} />
            <StatCard label="High" value={distribution.high} accent={LEVEL_STYLES.High.bar} />
            <StatCard label="Moderate" value={distribution.moderate} accent={LEVEL_STYLES.Moderate.bar} />
          </div>
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            ⚠️ Semantic similarity does not by itself prove plagiarism. Results should be reviewed by a human.
          </div>
        </div>
      </div>

      {/* ---- Chart + filters ---- */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="font-bold text-slate-900">Similarity Distribution</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.level} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2 no-print">
          <h3 className="font-bold text-slate-900">Sentence Matches</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {['All', 'Very High', 'High', 'Moderate', 'Low'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  levelFilter === lvl
                    ? 'bg-navy-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="ml-auto rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600"
            >
              <option value="desc">Highest first</option>
              <option value="asc">Lowest first</option>
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sentences..."
              className="w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-navy-400 focus:outline-none"
            />
          </div>

          {/* ---- Match cards ---- */}
          <div className="mt-4 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {filteredMatches.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No matches for this filter/search combination.
              </p>
            )}
            {filteredMatches.map((m, idx) => {
              const style = LEVEL_STYLES[m.level]
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 ${
                    m.level === 'Very High' || m.level === 'High'
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${style.badge}`}>
                      {m.level}
                    </span>
                    <span className="text-sm font-extrabold" style={{ color: style.bar }}>
                      {m.similarity}%
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-400">Document A</p>
                      <p className="mt-1 text-slate-800">{m.sentence_a}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-400">Best match in B</p>
                      <p className="mt-1 text-slate-800">{m.sentence_b}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs italic text-slate-500">{m.explanation}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ---- Disclaimer + actions ---- */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
        Semantic similarity does not by itself prove plagiarism. Results should be reviewed by a human.
        Uploaded documents are processed by this application and are not intentionally sent to third-party AI services.
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3 no-print">
        <button onClick={() => window.print()} className="btn-secondary">
          Print / Save Report (PDF)
        </button>
        <button onClick={() => navigate('/analyze')} className="btn-primary">
          New Analysis
        </button>
      </div>
    </div>
  )
}
