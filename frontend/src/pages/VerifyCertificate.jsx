import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { certificateApi } from '../services/api'
import { cleanCourseTitle } from './Certificates'
import {
  ShieldCheck, CheckCircle2, AlertCircle, Search,
  Award, Brain, Calendar, Hash, ArrowRight, Loader2
} from 'lucide-react'

export default function VerifyCertificate() {
  const { code: routeCode } = useParams()
  const navigate = useNavigate()
  const [inputCode, setInputCode] = useState(routeCode || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)

  const performVerification = async (targetCode) => {
    if (!targetCode || !targetCode.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await certificateApi.verifyCode(targetCode.trim())
      setResult(res.data)
    } catch (err) {
      setResult({ valid: false, detail: 'Failed to communicate with verification server.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (routeCode) {
      setInputCode(routeCode)
      performVerification(routeCode)
    }
  }, [routeCode])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputCode.trim()) {
      navigate(`/verify/${inputCode.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg-canvas text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-brand-500 selection:text-white">
      
      {/* ── Public Minimal Header ── */}
      <header className="border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-darkBg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-subtle font-bold text-xs">
            PM
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-zinc-100 text-sm leading-tight">PathMind AI</h1>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Credential Verification Registry</p>
          </div>
        </Link>
        <Link to="/login" className="btn-secondary text-xs py-2 px-3.5 rounded-xl">
          Learner Sign In
        </Link>
      </header>

      {/* ── Verification Content ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-16 space-y-8 animate-fade-in">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold border border-indigo-200/60 dark:border-white/[0.08]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Public Credential Verification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Verify a Certificate of Completion
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Enter the 5-digit unique credential code printed on any PathMind AI certificate to verify its authenticity.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. 8K9A2"
              maxLength={10}
              className="input pl-10 uppercase font-mono tracking-wider font-bold text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="btn-primary px-5 py-2.5 text-xs rounded-xl flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
          </button>
        </form>

        {/* Verification Result Card */}
        {searched && (
          <div>
            {result?.valid ? (
              <div className="card p-6 sm:p-8 bg-white dark:bg-darkBg-card border-2 border-emerald-500/40 dark:border-emerald-500/30 rounded-3xl shadow-card space-y-6 animate-scale-in">
                
                {/* Verified Header Stamp */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.08]">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                      Officially Verified & Authentic
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                      Valid PathMind AI Credential
                    </h3>
                  </div>
                </div>

                {/* Recipient & Path Details */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200/80 dark:border-white/[0.08] space-y-1">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Recipient Name</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{result.recipient_name}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200/80 dark:border-white/[0.08] space-y-1">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Credential Code</p>
                    <p className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">{result.code}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200/80 dark:border-white/[0.08] space-y-1 sm:col-span-2">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Curriculum Path</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{cleanCourseTitle(result.path_title)}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200/80 dark:border-white/[0.08] space-y-1">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Issue Date</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      {new Date(result.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBg-cardSub border border-slate-200/80 dark:border-white/[0.08] space-y-1">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Issuing Authority</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{result.issuer}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-[11px] text-center font-mono">
                  Digital Cryptographic Checksum: Verified Authentic by PathMind Authority
                </div>

              </div>
            ) : (
              <div className="card p-6 sm:p-8 bg-white dark:bg-darkBg-card border border-rose-200 dark:border-rose-900/40 rounded-3xl text-center space-y-3 animate-scale-in">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Credential Verification Failed
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {result?.detail || 'No approved certificate found matching this verification code. Please check the code and try again.'}
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── Minimal Public Footer ── */}
      <footer className="border-t border-slate-200/80 dark:border-white/[0.08] py-6 text-center text-xs text-slate-400 font-mono">
        PathMind AI Autonomous Curriculum Authority • Built with ❤️ in Bharat 🇮🇳
      </footer>

    </div>
  )
}
