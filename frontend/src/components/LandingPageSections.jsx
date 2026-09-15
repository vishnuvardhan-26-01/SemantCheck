import { Link, useNavigate } from 'react-router-dom'

// The hero sentence pair shown in the "Why SemantiCheck?" section. Results
// percentages on the landing page are illustrative examples only; real
// numbers always come from the model via the dashboard.
const HERO_PAIR = {
  a: 'Artificial intelligence helps doctors identify diseases.',
  b: 'AI assists medical professionals in detecting illnesses.',
}

function FeatureCard({ icon, title, children }) {
  return (
    <div className="card p-5 transition hover:shadow-md">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
  )
}

export default function LandingPageSections() {
  const navigate = useNavigate()

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="bg-gradient-to-b from-navy-50 to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
          <span className="inline-block rounded-full border border-navy-200 bg-white px-4 py-1 text-xs font-semibold text-navy-700">
            AI-Powered Semantic Plagiarism Detection
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
            Detect Similarity <span className="text-navy-600">Beyond Words</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            SemantiCheck uses sentence embeddings to understand meaning, uncovering
            potentially similar content even when every word has been rewritten.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/analyze" className="btn-primary px-7 py-3 text-base">
              Analyze Documents
            </Link>
            <Link
              to="/analyze"
              state={{ demo: true }}
              className="btn-secondary px-7 py-3 text-base"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Why SemantiCheck (judge-facing) ---- */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
          Why SemantiCheck?
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Traditional tools compare words. SemantiCheck compares meaning.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900">Traditional plagiarism detection</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg bg-slate-100 p-3 font-mono text-slate-700">"{HERO_PAIR.a}"</div>
              <div className="rounded-lg bg-slate-100 p-3 font-mono text-slate-700">"{HERO_PAIR.b}"</div>
            </div>
            <div className="mt-4 flex items-center gap-2 font-semibold text-red-600">
              <span className="text-xl">✗</span> Exact word matching: MISS
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Almost no words overlap, so classic systems may pass it as original.
            </p>
          </div>

          <div className="card border-navy-200 p-6 ring-1 ring-navy-100">
            <h3 className="font-bold text-navy-800">SemantiCheck</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg bg-navy-50 p-3 font-mono text-navy-900">"{HERO_PAIR.a}"</div>
              <div className="rounded-lg bg-navy-50 p-3 font-mono text-navy-900">"{HERO_PAIR.b}"</div>
            </div>
            <div className="mt-4 flex items-center gap-2 font-semibold text-emerald-600">
              <span className="text-xl">✓</span> Meaning comparison: High Semantic Similarity
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Sentence embeddings place these sentences close together — same meaning,
              different words.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">Features</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon="🧠" title="Semantic sentence comparison">
              Real AI embeddings (all-MiniLM-L6-v2) measure how close sentence meanings are.
            </FeatureCard>
            <FeatureCard icon="🔍" title="Paraphrase detection">
              Finds rewritten content that exact-match systems miss.
            </FeatureCard>
            <FeatureCard icon="📄" title="PDF / DOCX / TXT support">
              Upload documents or paste text directly — both work.
            </FeatureCard>
            <FeatureCard icon="🔒" title="Privacy-focused processing">
              Analysis runs locally; nothing is sent to external AI services.
            </FeatureCard>
            <FeatureCard icon="📊" title="Visual analysis">
              Score, distribution chart, and sentence-level matches at a glance.
            </FeatureCard>
            <FeatureCard icon="⚙️" title="Sentence-level matches">
              Every suspicious sentence paired with its best semantic counterpart.
            </FeatureCard>
            <FeatureCard icon="🧾" title="Downloadable report">
              Print or save a shareable summary with a disclaimer included.
            </FeatureCard>
            <FeatureCard icon="🚀" title="Lightweight & local">
              Runs on a normal laptop — no GPU, no paid APIs, no API keys.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">How It Works</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['1', 'Upload or paste documents', 'Provide Document A and Document B as files or pasted text.'],
            ['2', 'Extract & clean text', 'Text is pulled from PDF/DOCX/TXT and normalized.'],
            ['3', 'Split into sentences', 'Documents are broken into meaningful sentences.'],
            ['4', 'Generate AI embeddings', 'Each sentence becomes a numeric meaning vector.'],
            ['5', 'Compare sentence meanings', 'Cosine similarity finds the best match for every sentence.'],
            ['6', 'Review results', 'Inspect scores, levels, and potential matches.'],
          ].map(([num, title, body]) => (
            <div key={num} className="card flex gap-4 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-600 font-bold text-white">
                {num}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-0.5 text-sm text-slate-600">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="bg-navy-700 py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Ready to look beyond words?</h2>
          <p className="mt-2 text-navy-100">
            Semantic similarity does not by itself prove plagiarism — it highlights content worth a human review.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/analyze" className="btn-primary bg-white !text-navy-700 hover:bg-navy-50">
              Analyze Documents
            </Link>
            <button
              onClick={() => navigate('/analyze', { state: { demo: true } })}
              className="btn-secondary border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Try Demo
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
