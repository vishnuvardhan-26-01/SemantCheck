import { useRef, useState } from 'react'

const ACCEPT = '.pdf,.docx,.txt'
const MAX_MB = 10

/**
 * A dual-mode input card for one document: file upload (with drag & drop)
 * or pasted text. Controlled by the parent via value + onChange.
 * value shape: { mode: 'file'|'text', file?: File, text?: string }
 */
export default function DocumentInput({ label, hint, value, onChange }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  function validateAndSetFile(file) {
    setError('')
    if (!file) return
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
    if (!['.pdf', '.docx', '.txt'].includes(ext)) {
      setError('Unsupported file type. Please use PDF, DOCX or TXT.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large (max ${MAX_MB} MB).`)
      return
    }
    onChange({ mode: 'file', file })
  }

  function clearAll() {
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onChange({ mode: 'text', text: '' })
  }

  const isFile = value.mode === 'file' && value.file

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">{label}</h3>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-semibold text-slate-400 hover:text-red-500"
        >
          Clear
        </button>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          validateAndSetFile(e.dataTransfer.files?.[0])
        }}
        className={`mt-4 rounded-xl border-2 border-dashed p-4 text-center transition ${
          dragOver ? 'border-navy-400 bg-navy-50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {isFile ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-xl">📄</span>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-slate-800">{value.file.name}</p>
                <p className="text-xs text-slate-500">
                  {(value.file.size / 1024).toFixed(0)} KB · ready
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-navy-300 hover:text-navy-700">
                Replace
              </button>
              <button type="button" onClick={clearAll}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-red-500 hover:border-red-300">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Drag & drop a <span className="font-semibold">PDF / DOCX / TXT</span> here
            </p>
            <button type="button" onClick={() => inputRef.current?.click()}
              className="btn-secondary mt-2 px-4 py-1.5 text-sm">
              Choose file
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => validateAndSetFile(e.target.files?.[0])}
        />
      </div>

      {/* Divider */}
      <div className="my-4 flex items-center gap-3 text-xs font-semibold text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> OR PASTE TEXT <span className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Paste area */}
      <textarea
        value={isFile ? '' : value.text}
        onChange={(e) => onChange({ mode: 'text', text: e.target.value })}
        disabled={isFile}
        placeholder={
          isFile
            ? 'A file is selected — remove it to paste text instead.'
            : 'Paste document text here (at least one full sentence)...'
        }
        className="h-36 w-full flex-1 resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm
          text-slate-800 placeholder:text-slate-400 focus:border-navy-400 focus:outline-none
          focus:ring-2 focus:ring-navy-100 disabled:bg-slate-50"
      />

      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  )
}
