import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DocumentInput from '../components/DocumentInput.jsx'
import { analyzeDocuments } from '../services/api.js'

// Demo documents: deliberately paraphrased so the real model shows a spread
// of similarity levels. No expected percentages are hard-coded anywhere.
const DEMO_A = `Artificial intelligence is increasingly being used in healthcare to assist doctors in diagnosing diseases.
Machine learning models require large amounts of high-quality training data before they can make reliable predictions.
Researchers must carefully validate their experimental results before publishing them in academic journals.
Solar panels convert sunlight directly into electrical power for homes and businesses.
The quarterly financial report showed a modest increase in overall company revenue.`

const DEMO_B = `AI technology is becoming common in medicine because it helps medical professionals identify illnesses.
Training modern neural networks depends on vast collections of well-prepared datasets.
Scholars need to thoroughly check the outcomes of their studies prior to releasing papers for peer review.
Photovoltaic cells transform solar radiation into usable electricity for buildings.
My neighbour grows tomatoes and fresh herbs in a small garden behind his house.`

const EMPTY_INPUT = { mode: 'text', text: '' }

export default function AnalysisPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [docA, setDocA] = useState(EMPTY_INPUT)
  const [docB, setDocB] = useState(EMPTY_INPUT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Demo mode: pre-fill both documents, then run a real analysis immediately.
  useEffect(() => {
    if (location.state?.demo) {
      const a = { mode: 'text', text: DEMO_A }
      const b = { mode: 'text', text: DEMO_B }
      setDocA(a)
      setDocB(b)
      runAnalysis(a, b)
      // Clear the state so refresh doesn't re-trigger.
      navigate('/analyze', { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  async function runAnalysis(a = docA, b = docB) {
    setError('')

    const hasA = (a.mode === 'file' && a.file) || (a.mode === 'text' && a.text.trim())
    const hasB = (b.mode === 'file' && b.file) || (b.mode === 'text' && b.text.trim())
    if (!hasA || !hasB) {
      setError('Please provide both Document A and Document B (upload a file or paste text).')
      return
    }

    setLoading(true)
    try {
      const result = await analyzeDocuments(
        a.mode === 'file' ? { type: 'file', file: a.file } : { type: 'text', text: a.text },
        b.mode === 'file' ? { type: 'file', file: b.file } : { type: 'text', text: b.text },
      )
      navigate('/results', { state: { result } })
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function loadDemoOnly() {
    setDocA({ mode: 'text', text: DEMO_A })
    setDocB({ mode: 'text', text: DEMO_B })
    setError('')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Analyze Documents</h1>
          <p className="mt-1 text-slate-600">
            Provide two documents — upload files or paste text for either side.
          </p>
        </div>
        <button onClick={loadDemoOnly} className="btn-secondary text-sm">
          Load Demo Texts
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DocumentInput
          label="Document A"
          hint="PDF, DOCX or TXT · max 10 MB"
          value={docA}
          onChange={setDocA}
        />
        <DocumentInput
          label="Document B"
          hint="PDF, DOCX or TXT · max 10 MB"
          value={docB}
          onChange={setDocB}
        />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 text-center">
        <button onClick={() => runAnalysis()} disabled={loading} className="btn-primary px-8 py-3 text-base">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Analyzing document meaning...
            </>
          ) : (
            'Analyze Documents'
          )}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          The first analysis may take a few seconds while the local NLP model warms up.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
        🔒 Your documents are processed locally by this application and are not intentionally sent to
        third-party AI services.
      </div>
    </div>
  )
}
