export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white no-print">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-700">SemantiCheck — AI-Powered Semantic Plagiarism Detection</p>
        <p className="mt-1">
          Semantic similarity does not by itself prove plagiarism. Results should be reviewed by a human.
        </p>
        <p className="mt-1">
          Uploaded documents are processed by this application and are not intentionally sent to third-party AI services.
        </p>
      </div>
    </footer>
  )
}
