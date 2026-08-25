import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { certificateApi, pathApi } from '../services/api'
import {
  Award, Download, ExternalLink, ShieldCheck, CheckCircle2,
  Clock, AlertCircle, RefreshCcw, Loader2, Sparkles, Copy, Check, QrCode
} from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function cleanCourseTitle(title) {
  if (!title) return 'Software Engineering'
  let cleaned = title
    .replace(/^Your\s+/i, '')
    .replace(/\s+Learning Path$/i, '')
    .replace(/\s+Roadmap$/i, '')
    .replace(/\s+Path$/i, '')
    .trim()
  return cleaned || 'Software Engineering'
}

export default function Certificates() {
  const queryClient = useQueryClient()
  const [selectedCert, setSelectedCert] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)
  const certRef = useRef(null)

  // Fetch active learning path
  const { data: activePath } = useQuery({
    queryKey: ['activePath'],
    queryFn: () => pathApi.getActive().then(r => r.data).catch(() => null),
  })

  // Fetch learner's certificates
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['myCertificates'],
    queryFn: () => certificateApi.getMyCertificates().then(r => r.data),
  })

  // Mutation to request certificate
  const requestMutation = useMutation({
    mutationFn: (pathId) => certificateApi.request(pathId),
    onSuccess: (res) => {
      toast.success('Certificate request submitted! The administrator will review your learning path.', { icon: '🎓' })
      queryClient.invalidateQueries(['myCertificates'])
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || 'Failed to submit certificate request.')
    }
  })

  // Copy verification link to clipboard
  const handleCopyLink = (code) => {
    const url = `${window.location.origin}/verify/${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    toast.success('Verification link copied!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Native Vector Browser Print (Zero pixelation / True vector PDF)
  const handlePrint = () => {
    window.print()
  }

  // Generate and download Ultra High-Resolution 300+ DPI PDF certificate
  const handleDownloadPDF = async (cert) => {
    if (!certRef.current) return
    setDownloading(true)
    const toastId = toast.loading('Rendering 300 DPI high-resolution PDF certificate...')
    
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      const element = certRef.current
      const canvas = await html2canvas(element, {
        scale: 4, // 300-400 DPI ultra high resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 1200,
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      // Landscape A4 size (297 x 210 mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW')
      pdf.save(`PathMind_Certificate_${cert.code || 'Credential'}.pdf`)
      
      toast.success('Ultra HD Certificate downloaded!', { id: toastId, icon: '📜' })
    } catch (err) {
      console.error('PDF generation error:', err)
      toast.error('Failed to export PDF certificate.', { id: toastId })
    } finally {
      setDownloading(false)
    }
  }

  const approvedCert = selectedCert || certificates.find(c => c.status === 'approved') || certificates[0]

  return (
    <div className="max-w-5xl mx-auto py-2 sm:py-6 space-y-8 animate-fade-in">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-5 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Award className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Credentials & Certificates</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Digitally verified credentials with unique 5-character verification codes stamped by PathMind AI.
          </p>
        </div>

        {/* Request Certificate Button for Active Path */}
        {activePath && (
          <button
            onClick={() => requestMutation.mutate(activePath.id)}
            disabled={requestMutation.isPending}
            className="btn-primary self-start sm:self-auto text-xs py-2.5 px-4 rounded-xl shadow-subtle flex items-center gap-2"
          >
            {requestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Request Certificate for Current Goal</span>
          </button>
        )}
      </div>

      {/* ── Certificates List & Cards ── */}
      {isLoading ? (
        <div className="card h-40 animate-pulse bg-white dark:bg-darkBg-card rounded-2xl no-print" />
      ) : certificates.length === 0 ? (
        <div className="card text-center p-8 sm:p-12 space-y-4 max-w-lg mx-auto no-print">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-subtle">
            <Award className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">No Certificates Requested Yet</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Complete your learning path milestones, then click <strong>"Request Certificate"</strong> above to submit your path for administrative verification.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column: List of Certificate Requests */}
          <div className="space-y-3 lg:col-span-1 no-print">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono px-1">
              Your Credentials ({certificates.length})
            </p>
            {certificates.map((cert) => {
              const isSelected = (selectedCert?.id === cert.id) || (!selectedCert && approvedCert?.id === cert.id)
              const isApproved = cert.status === 'approved'
              const isPending = cert.status === 'pending'
              const isRejected = cert.status === 'rejected'

              return (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-darkBg-card border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-subtle'
                      : 'bg-white dark:bg-darkBg-card border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm leading-snug truncate">
                      {cleanCourseTitle(cert.path_title)}
                    </h4>
                    {isApproved && (
                      <span className="badge-green text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {isPending && (
                      <span className="badge-yellow text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Under Review
                      </span>
                    )}
                    {isRejected && (
                      <span className="badge-red text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Needs Work
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                    <span>{cert.code ? `Code: ${cert.code}` : 'Pending Code'}</span>
                    <span>{new Date(cert.created_at).toLocaleDateString()}</span>
                  </div>

                  {isRejected && cert.rejection_reason && (
                    <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
                      <strong>Admin note:</strong> {cert.rejection_reason}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Live Certificate Visual Preview & PDF Export */}
          <div className="lg:col-span-2 space-y-4">
            {approvedCert && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 no-print">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Certificate Preview</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Official 300 DPI vector certificate template</p>
                  </div>

                  {approvedCert.status === 'approved' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(approvedCert.code)}
                        className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
                        title="Copy Public Verification Link"
                      >
                        {copiedCode === approvedCert.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode === approvedCert.code ? 'Copied' : 'Share Link'}</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
                        title="Print Vector Certificate directly or Save as PDF"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>

                      <button
                        onClick={() => handleDownloadPDF(approvedCert)}
                        disabled={downloading}
                        className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2"
                      >
                        {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        <span>Download High-Res PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Visual Certificate Surface (True A4 Landscape Ratio: 1.414) ── */}
                <div className="overflow-x-auto pb-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-2 bg-slate-100/60 dark:bg-darkBg-cardSub/40 flex justify-center">
                  <div
                    ref={certRef}
                    className="w-[842px] min-w-[842px] h-[595px] text-slate-900 rounded-2xl shadow-card relative flex flex-col justify-between select-none print-certificate-only"
                    style={{
                      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                      backgroundColor: '#FFFFFF',
                      border: '12px solid #1e1b4b',
                      backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)',
                      backgroundSize: '20px 20px',
                      padding: '36px 40px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Ornate Gold & Navy Inner Guilloche Borders */}
                    <div
                      className="absolute pointer-events-none rounded-xl"
                      style={{ inset: '8px', border: '2px solid #b45309' }}
                    />
                    <div
                      className="absolute pointer-events-none rounded-lg"
                      style={{ inset: '14px', border: '1px solid #4338ca' }}
                    />

                    {/* Corner Accent Rosettes */}
                    <div className="absolute w-3.5 h-3.5 rounded-full pointer-events-none" style={{ top: '14px', left: '14px', backgroundColor: '#b45309' }} />
                    <div className="absolute w-3.5 h-3.5 rounded-full pointer-events-none" style={{ top: '14px', right: '14px', backgroundColor: '#b45309' }} />
                    <div className="absolute w-3.5 h-3.5 rounded-full pointer-events-none" style={{ bottom: '14px', left: '14px', backgroundColor: '#b45309' }} />
                    <div className="absolute w-3.5 h-3.5 rounded-full pointer-events-none" style={{ bottom: '14px', right: '14px', backgroundColor: '#b45309' }} />

                    {/* Top Header */}
                    <div className="text-center relative z-10 pt-1" style={{ marginBottom: '10px' }}>
                      <div className="flex items-center justify-center mb-1">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white"
                          style={{ backgroundColor: '#4338ca', marginRight: '8px' }}
                        >
                          PM
                        </div>
                        <span
                          className="text-xs font-black tracking-widest uppercase font-mono"
                          style={{ color: '#1e1b4b', letterSpacing: '0.18em' }}
                        >
                          PATHMIND AI • CURRICULUM AUTHORITY
                        </span>
                      </div>
                      <h2
                        className="text-3xl font-extrabold tracking-tight uppercase"
                        style={{
                          fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                          color: '#0f172a',
                          letterSpacing: '0.05em',
                          margin: '4px 0',
                          lineHeight: '1.2',
                        }}
                      >
                        Certificate of Completion
                      </h2>
                      <p
                        className="text-[10.5px] font-bold tracking-widest uppercase font-mono"
                        style={{ color: '#64748b', margin: '0' }}
                      >
                        Autonomous Competency Credential
                      </p>
                    </div>

                    {/* Body Text */}
                    <div className="text-center my-auto relative z-10 px-10">
                      <p
                        className="text-xs italic"
                        style={{ color: '#475569', fontFamily: "Georgia, serif", margin: '0 0 8px 0' }}
                      >
                        This is to officially certify that
                      </p>
                      
                      <div style={{ margin: '6px 0 12px 0' }}>
                        <h1
                          className="text-4xl font-extrabold tracking-tight inline-block px-8"
                          style={{
                            fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                            color: '#1e1b4b',
                            lineHeight: '1.3',
                            margin: '0',
                          }}
                        >
                          {approvedCert.recipient_name}
                        </h1>
                        {/* Clean dedicated underline divider */}
                        <div style={{ width: '280px', height: '3px', backgroundColor: '#b45309', margin: '6px auto 0 auto', borderRadius: '2px' }} />
                      </div>

                      <p
                        className="text-xs max-w-lg mx-auto leading-relaxed"
                        style={{ color: '#334155', margin: '0 auto 6px auto' }}
                      >
                        has successfully completed all prerequisite milestones, evaluations, and structured units in the academic curriculum of
                      </p>
                      
                      <p
                        className="text-2xl font-bold tracking-tight"
                        style={{
                          color: '#0f172a',
                          fontFamily: "'Inter', sans-serif",
                          margin: '4px 0 0 0',
                        }}
                      >
                        {cleanCourseTitle(approvedCert.path_title)}
                      </p>
                    </div>

                    {/* Footer Details & Verification Seal */}
                    <div
                      className="flex items-end justify-between relative z-10 text-xs"
                      style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}
                    >
                      
                      {/* Left: Unique Code & Verification URL */}
                      <div className="text-left" style={{ minWidth: '180px' }}>
                        <p
                          className="text-[10px] uppercase font-bold font-mono"
                          style={{ color: '#64748b', margin: '0 0 3px 0' }}
                        >
                          Credential ID
                        </p>
                        <p
                          className="text-sm font-black font-mono tracking-wider px-3 py-1 rounded inline-block"
                          style={{
                            backgroundColor: '#eef2ff',
                            color: '#312e81',
                            border: '1px solid #c7d2fe',
                            margin: '0 0 3px 0',
                          }}
                        >
                          {approvedCert.code || 'PENDING-APPROVAL'}
                        </p>
                        <p
                          className="text-[9.5px] font-mono block"
                          style={{ color: '#475569', margin: '0' }}
                        >
                          verify at: path-mind-ai-xi.vercel.app/verify/{approvedCert.code || ''}
                        </p>
                      </div>

                      {/* Center: Digital Signature Stamp Badge */}
                      <div className="text-center" style={{ padding: '0 12px' }}>
                        <div
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#ecfdf5',
                            border: '1.5px solid #10b981',
                            borderRadius: '9999px',
                            padding: '5px 16px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span style={{ fontSize: '13px', marginRight: '6px', verticalAlign: 'middle' }}>
                            🛡️
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '0.03em', verticalAlign: 'middle', fontFamily: "'Inter', sans-serif" }}>
                            Digitally Verified &amp; Sealed
                          </span>
                        </div>
                        <p
                          className="text-[9.5px] font-mono font-medium"
                          style={{ color: '#64748b', margin: '6px 0 0 0' }}
                        >
                          Issued on {approvedCert.approved_at ? new Date(approvedCert.approved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>

                      {/* Right: Institutional Signature Line */}
                      <div className="text-right" style={{ minWidth: '180px' }}>
                        <p
                          className="font-mono text-xs font-bold tracking-wider uppercase"
                          style={{ color: '#1e1b4b', margin: '0 0 4px 0' }}
                        >
                          PathMind Authority
                        </p>
                        <div
                          className="w-40 h-0.5 ml-auto"
                          style={{ backgroundColor: '#4338ca', margin: '0 0 4px auto' }}
                        />
                        <p
                          className="text-[9.5px] font-mono"
                          style={{ color: '#64748b', margin: '0' }}
                        >
                          Curriculum Intelligence Board
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
