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

  // Generate and download high-resolution PDF certificate
  const handleDownloadPDF = async (cert) => {
    if (!certRef.current) return
    setDownloading(true)
    const toastId = toast.loading('Rendering high-resolution PDF certificate...')
    
    try {
      const element = certRef.current
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      })

      const imgData = canvas.toDataURL('image/png')
      // Landscape A4 size (297 x 210 mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`PathMind_Certificate_${cert.code || 'Credential'}.pdf`)
      
      toast.success('Certificate downloaded successfully!', { id: toastId, icon: '📜' })
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-5">
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
        <div className="card h-40 animate-pulse bg-white dark:bg-darkBg-card rounded-2xl" />
      ) : certificates.length === 0 ? (
        <div className="card text-center p-8 sm:p-12 space-y-4 max-w-lg mx-auto">
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
          <div className="space-y-3 lg:col-span-1">
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
                      {cert.path_title}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Certificate Preview</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Official vector certificate template</p>
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
                        onClick={() => handleDownloadPDF(approvedCert)}
                        disabled={downloading}
                        className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2"
                      >
                        {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        <span>Download PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Visual Certificate Surface (Printable A4 Aspect) ── */}
                <div className="overflow-x-auto pb-4">
                  <div
                    ref={certRef}
                    className="w-[794px] min-w-[794px] h-[560px] bg-white text-slate-900 p-10 rounded-2xl shadow-card border-8 border-slate-100 relative flex flex-col justify-between select-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      backgroundImage: 'radial-gradient(#f1f5f9 1.2px, transparent 1.2px)',
                      backgroundSize: '24px 24px',
                    }}
                  >
                    {/* Inner Guilloche Border */}
                    <div className="absolute inset-3 border-2 border-indigo-900/15 pointer-events-none rounded-xl" />
                    <div className="absolute inset-4 border border-indigo-900/10 pointer-events-none rounded-lg" />

                    {/* Top Header */}
                    <div className="text-center space-y-1 relative z-10">
                      <div className="flex items-center justify-center gap-2.5 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                          PM
                        </div>
                        <span className="text-xs font-black tracking-widest uppercase text-slate-800 font-mono">
                          PATHMIND AI • CURRICULUM AUTHORITY
                        </span>
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                        Certificate of Completion
                      </h2>
                      <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase font-mono">
                        Autonomous Competency Credential
                      </p>
                    </div>

                    {/* Body Text */}
                    <div className="text-center space-y-3.5 my-auto relative z-10 px-8">
                      <p className="text-xs text-slate-500 italic">This is to officially certify that</p>
                      <h1 className="text-3xl font-extrabold text-indigo-950 tracking-tight border-b-2 border-indigo-600/30 inline-block pb-1 px-8">
                        {approvedCert.recipient_name}
                      </h1>
                      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-1">
                        has successfully completed all prerequisite milestones, evaluations, and structured units in the academic curriculum of
                      </p>
                      <p className="text-xl font-bold text-slate-900 tracking-tight">
                        {approvedCert.path_title}
                      </p>
                    </div>

                    {/* Footer Details & Verification Seal */}
                    <div className="flex items-end justify-between pt-6 border-t border-slate-200 relative z-10 text-xs">
                      
                      {/* Left: Unique Code & Verification URL */}
                      <div className="space-y-1 text-left">
                        <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Credential ID</p>
                        <p className="text-sm font-black font-mono tracking-wider text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200/60 inline-block">
                          {approvedCert.code || 'PENDING-APPROVAL'}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono block">
                          verify at: path-mind-ai-xi.vercel.app/verify/{approvedCert.code || ''}
                        </p>
                      </div>

                      {/* Center: Digital Signature Stamp */}
                      <div className="text-center space-y-1 px-4">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Digitally Verified by PathMind</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono">
                          Issued on {approvedCert.approved_at ? new Date(approvedCert.approved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>

                      {/* Right: Signature Line */}
                      <div className="text-right space-y-1">
                        <p className="font-mono text-sm font-bold text-slate-900 italic">Aditya Sah</p>
                        <div className="w-32 h-0.5 bg-slate-300 ml-auto" />
                        <p className="text-[10px] text-slate-500 font-mono">Director of Curriculum</p>
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
