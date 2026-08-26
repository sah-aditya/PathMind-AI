import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { profileApi, pathApi } from '../services/api'
import {
  GitBranch, CheckCircle, Clock, Lock, Sparkles,
  ArrowRight, ShieldCheck, Zap, BookOpen, Trophy,
  ZoomIn, ZoomOut, RotateCcw, Info, Layers, ChevronRight
} from 'lucide-react'

// Canonical Skill Graph Topology Definition
const SKILL_NODES_DATA = [
  // Tier 1: Foundations
  { id: 'python-basics', title: 'Python Programming', category: 'Foundation', tier: 1, x: 120, y: 140, prereqs: [] },
  { id: 'math-for-ml', title: 'Linear Algebra & Calculus', category: 'Foundation', tier: 1, x: 120, y: 320, prereqs: [] },
  { id: 'html-css', title: 'HTML5 & Modern CSS', category: 'Foundation', tier: 1, x: 120, y: 500, prereqs: [] },

  // Tier 2: Core Engineering & Data
  { id: 'data-structures-algorithms', title: 'DSA & Complexity', category: 'Core', tier: 2, x: 380, y: 140, prereqs: ['python-basics'] },
  { id: 'numpy-pandas', title: 'NumPy & Pandas Analytics', category: 'Data', tier: 2, x: 380, y: 320, prereqs: ['python-basics', 'math-for-ml'] },
  { id: 'javascript-basics', title: 'Modern JavaScript (ES6+)', category: 'Core', tier: 2, x: 380, y: 500, prereqs: ['html-css'] },

  // Tier 3: Applied Systems & Frameworks
  { id: 'machine-learning-basics', title: 'Scikit-Learn ML Models', category: 'AI/ML', tier: 3, x: 640, y: 230, prereqs: ['numpy-pandas', 'math-for-ml'] },
  { id: 'react-fundamentals', title: 'React.js & State Architecture', category: 'Web', tier: 3, x: 640, y: 500, prereqs: ['javascript-basics'] },
  { id: 'databases-sql', title: 'PostgreSQL & Relational DBs', category: 'Backend', tier: 3, x: 640, y: 360, prereqs: ['data-structures-algorithms'] },

  // Tier 4: Advanced Specialization & Deep Learning
  { id: 'deep-learning-pytorch', title: 'PyTorch Neural Networks', category: 'AI/ML', tier: 4, x: 900, y: 160, prereqs: ['machine-learning-basics'] },
  { id: 'nlp-transformers', title: 'NLP, LLMs & Transformers', category: 'GenAI', tier: 4, x: 900, y: 300, prereqs: ['deep-learning-pytorch'] },
  { id: 'nextjs-fullstack', title: 'Full-Stack Next.js & Server Actions', category: 'Web', tier: 4, x: 900, y: 500, prereqs: ['react-fundamentals', 'databases-sql'] },

  // Tier 5: Capstone Production Mastery
  { id: 'mlops-deployment', title: 'Production MLOps & FastAPIs', category: 'Production', tier: 5, x: 1160, y: 230, prereqs: ['nlp-transformers', 'deep-learning-pytorch'] },
  { id: 'cloud-devops', title: 'Cloud CI/CD, Docker & K8s', category: 'Production', tier: 5, x: 1160, y: 440, prereqs: ['nextjs-fullstack', 'databases-sql'] },
]

export default function SkillTree() {
  const navigate = useNavigate()
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  // 1. Fetch Learner Skills Profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['learnerProfile'],
    queryFn: () => profileApi.get().then(r => r.data),
  })

  // 2. Fetch Active Learning Path
  const { data: activePath } = useQuery({
    queryKey: ['activeLearningPath'],
    queryFn: () => pathApi.getActive().then(r => r.data.path),
  })

  const userSkills = useMemo(() => profileData?.skills || {}, [profileData])

  // Compute Active Learning Skills from roadmap items
  const activeRoadmapSkills = useMemo(() => {
    const skills = new Set()
    if (activePath?.phases) {
      for (const phase of activePath.phases) {
        if (phase.status !== 'locked') {
          for (const item of phase.items) {
            for (const s of (item.skills_taught || [])) {
              skills.add(s)
            }
          }
        }
      }
    }
    return skills
  }, [activePath])

  // Determine State for Each Node
  const evaluatedNodes = useMemo(() => {
    return SKILL_NODES_DATA.map(node => {
      const userLevel = userSkills[node.id] || 0.0
      const isMastered = userLevel >= 0.7

      // Check if all prerequisites are satisfied
      const prereqsMet = node.prereqs.every(p => (userSkills[p] || 0.0) >= 0.5)
      const isInProgress = !isMastered && (userLevel > 0 || activeRoadmapSkills.has(node.id) || prereqsMet)
      const isLocked = !isMastered && !isInProgress && node.prereqs.length > 0 && !prereqsMet

      return {
        ...node,
        userLevel,
        status: isMastered ? 'mastered' : isInProgress ? 'in_progress' : 'locked'
      }
    })
  }, [userSkills, activeRoadmapSkills])

  const nodeMap = useMemo(() => {
    return new Map(evaluatedNodes.map(n => [n.id, n]))
  }, [evaluatedNodes])

  // Count Statistics
  const masteredCount = evaluatedNodes.filter(n => n.status === 'mastered').length
  const inProgressCount = evaluatedNodes.filter(n => n.status === 'in_progress').length
  const lockedCount = evaluatedNodes.filter(n => n.status === 'locked').length

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-indigo text-[10px] font-mono font-bold uppercase tracking-wider">
              Prerequisite DAG Topology
            </span>
            <span className="badge-neutral text-[10px] font-mono">
              Graph Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <GitBranch className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Prerequisite Skill Tree</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Topologically sorted Directed Acyclic Graph (DAG) visualizing dependencies, mastered nodes, and unlocked competencies.
          </p>
        </div>

        {/* Legend Pills & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-white/[0.06] text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {masteredCount} Mastered
            </span>
            <span className="text-slate-300 dark:text-zinc-600">|</span>
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> {inProgressCount} In Progress
            </span>
            <span className="text-slate-300 dark:text-zinc-600">|</span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> {lockedCount} Locked
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200/80 dark:border-white/[0.08] p-1 shadow-subtle">
            <button
              onClick={() => setZoomLevel(z => Math.max(0.7, z - 0.1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1 text-slate-600 dark:text-zinc-300">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Visual Graph Workspace & Inspector Drawer ── */}
      <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Canvas Area (3 Cols) */}
        <div className="lg:col-span-3 card p-2 sm:p-4 overflow-x-auto min-h-[580px] bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/80 dark:border-white/[0.08]">
          <div
            className="relative transition-transform duration-200 ease-out origin-top-left"
            style={{ width: '1350px', height: '620px', transform: `scale(${zoomLevel})` }}
          >
            {/* SVG Connecting Prerequisite Bezier Curves */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="grad-active" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {evaluatedNodes.map(targetNode => {
                return targetNode.prereqs.map(sourceId => {
                  const sourceNode = nodeMap.get(sourceId)
                  if (!sourceNode) return null

                  // Compute curved bezier path
                  const startX = sourceNode.x + 160
                  const startY = sourceNode.y + 35
                  const endX = targetNode.x
                  const endY = targetNode.y + 35
                  const midX = (startX + endX) / 2

                  const isEdgeActive = sourceNode.status === 'mastered' && targetNode.status !== 'locked'

                  return (
                    <g key={`${sourceId}->${targetNode.id}`}>
                      <path
                        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                        fill="none"
                        stroke={isEdgeActive ? 'url(#grad-active)' : '#94a3b8'}
                        strokeWidth={isEdgeActive ? 2.5 : 1.5}
                        strokeDasharray={targetNode.status === 'locked' ? '4 4' : 'none'}
                        opacity={isEdgeActive ? 0.9 : 0.4}
                      />
                      {/* Arrowhead dot */}
                      <circle
                        cx={endX - 3}
                        cy={endY}
                        r={isEdgeActive ? 3.5 : 2.5}
                        fill={isEdgeActive ? '#10b981' : '#94a3b8'}
                      />
                    </g>
                  )
                })
              })}
            </svg>

            {/* Interactive Graph Nodes */}
            {evaluatedNodes.map(node => {
              const isSelected = selectedSkill?.id === node.id
              const isMastered = node.status === 'mastered'
              const isInProgress = node.status === 'in_progress'
              const isLocked = node.status === 'locked'

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedSkill(node)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`
                    absolute w-44 p-3 rounded-2xl cursor-pointer select-none transition-all duration-200 z-10
                    ${isSelected ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 scale-105 shadow-xl' : 'hover:scale-102 hover:shadow-lg'}
                    ${isMastered
                      ? 'bg-emerald-50 dark:bg-zinc-900 border-2 border-emerald-500 text-emerald-950 dark:text-zinc-100 shadow-emerald-500/10'
                      : isInProgress
                      ? 'bg-indigo-50/90 dark:bg-zinc-900 border-2 border-indigo-500 text-indigo-950 dark:text-zinc-100 shadow-indigo-500/10'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 opacity-70'
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                      isMastered ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' :
                      isInProgress ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300' :
                      'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                    }`}>
                      {node.category}
                    </span>

                    {isMastered && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                    {isInProgress && <Zap className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />}
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>

                  <p className="font-bold text-xs leading-tight line-clamp-2">
                    {node.title}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
                    <span>Mastery</span>
                    <span className="font-bold">
                      {Math.round(node.userLevel * 100)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Node Inspector Drawer (1 Col) */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-3">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Competency Inspector</h3>
          </div>

          {selectedSkill ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="badge-indigo text-[10px] font-mono font-bold uppercase">
                  {selectedSkill.category} · Tier {selectedSkill.tier}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 mt-1">
                  {selectedSkill.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  ID: <code className="font-mono">{selectedSkill.id}</code>
                </p>
              </div>

              {/* Status Indicator */}
              <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                selectedSkill.status === 'mastered' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200' :
                selectedSkill.status === 'in_progress' ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 text-indigo-800 dark:text-indigo-200' :
                'bg-slate-100 dark:bg-zinc-800 border-slate-200 text-slate-600 dark:text-zinc-400'
              }`}>
                {selectedSkill.status === 'mastered' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                 selectedSkill.status === 'in_progress' ? <Zap className="w-4 h-4 text-indigo-500" /> :
                 <Lock className="w-4 h-4 text-slate-400" />}
                <span>
                  {selectedSkill.status === 'mastered' ? 'Competency Mastered' :
                   selectedSkill.status === 'in_progress' ? 'Unlocked & Active Learning' :
                   'Locked — Prerequisites Pending'}
                </span>
              </div>

              {/* Mastery Level Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-semibold text-slate-700 dark:text-zinc-300">
                  <span>Evaluated Proficiency</span>
                  <span>{Math.round(selectedSkill.userLevel * 100)}%</span>
                </div>
                <div className="progress-bar h-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedSkill.status === 'mastered' ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.max(5, selectedSkill.userLevel * 100)}%` }}
                  />
                </div>
              </div>

              {/* Prerequisite Dependencies */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono">
                  Prerequisites Required
                </span>
                {selectedSkill.prereqs.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> None (Foundational Node)
                  </p>
                ) : (
                  <div className="space-y-1">
                    {selectedSkill.prereqs.map(p => {
                      const pNode = nodeMap.get(p)
                      const isMet = (userSkills[p] || 0) >= 0.5
                      return (
                        <div key={p} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-white/[0.04]">
                          <span className="truncate">{pNode?.title || p}</span>
                          <span className={`text-[10px] font-mono font-bold ${isMet ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {isMet ? '✓ Met' : '⏳ Pending'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => navigate('/roadmap')}
                  className="btn-primary w-full justify-center text-xs py-2 rounded-xl"
                >
                  <BookOpen className="w-3.5 h-3.5" /> View in Roadmap
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
              <p>Click on any skill node in the graph to inspect prerequisites, mastery level, and recommended units.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
