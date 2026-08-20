import { Link } from 'react-router-dom'
import { Brain, Zap, Target, BarChart3, ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  { icon: Brain,    title: 'AI Profile Building',      desc: 'Chat with our AI — it builds your learning profile through natural conversation, not boring forms.' },
  { icon: Target,   title: 'Skill Gap Analysis',       desc: 'See exactly which skills you need to acquire, visualized as a radar chart vs your goal requirements.' },
  { icon: Zap,      title: 'Smart Roadmap Generator',  desc: 'Get a week-by-week roadmap built with a 6-factor AI algorithm and prerequisite-aware sequencing.' },
  { icon: BarChart3,'title': 'Adaptive Learning',      desc: 'Your path adapts in real-time based on assessment scores. Struggle? Get reinforcement. Excel? Skip ahead.' },
]

const steps = [
  { n: '01', title: 'Tell AI your goal',         desc: 'Chat with PathMind AI and describe what you want to achieve.' },
  { n: '02', title: 'See your skill gaps',        desc: 'The system analyses your current skills vs what your goal requires.' },
  { n: '03', title: 'Get your personal roadmap', desc: 'A structured, week-by-week learning path is generated just for you.' },
  { n: '04', title: 'Learn and adapt',            desc: 'Complete resources, take assessments, and watch your path evolve.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white overflow-x-hidden">
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">PathMind AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-900/50 border border-brand-700/50 text-brand-300 text-sm mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini AI + Adaptive Learning
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Your goal.{' '}
            <span className="gradient-text">Your pace.</span>
            <br />Your path.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell our AI what you want to achieve. It builds your learner profile, identifies skill gaps,
            and generates a personalized week-by-week roadmap — then adapts it as you progress.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-4">
              Start My Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-4">Free forever · No credit card · No setup</p>
        </motion.div>

        {/* Hero graphic */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 glass rounded-3xl p-6 text-left max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-500">PathMind AI Chat</span>
          </div>
          <div className="space-y-3">
            <div className="chat-bubble-user ml-auto w-fit">I want to become a Machine Learning Engineer. I know Python basics and some SQL.</div>
            <div className="chat-bubble-ai w-fit">
              That's a great goal! 🎯 I've identified <strong>7 skill gaps</strong> for you. Your Python foundation gives you a head start.
              How many hours per week can you dedicate?
            </div>
            <div className="chat-bubble-user ml-auto w-fit">About 8 hours per week</div>
            <div className="chat-bubble-ai w-fit">
              Perfect. I'm generating your personalized <strong>14-week roadmap</strong> now — starting with Statistics & NumPy, 
              then Core ML, Deep Learning, and finishing with an MLOps capstone... ✨
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Not just recommendations. <span className="gradient-text">A complete system.</span></h2>
          <p className="text-gray-400">Every feature designed to maximize learning velocity and goal achievement.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card glass-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">How it works</h2>
          <p className="text-gray-400">Four steps from goal to mastery.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="card text-center relative">
              <div className="text-4xl font-black text-brand-800 mb-3">{s.n}</div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-700 z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="card border border-brand-600/20">
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-gray-400">
            {['Skill Gap Analysis', 'AI Explanations', 'Adaptive Assessments', 'Progress Dashboard'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
          <h2 className="text-3xl font-bold mb-3">Ready to start your journey?</h2>
          <p className="text-gray-400 mb-8">Join learners building structured paths toward their dream careers.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4">
            Get started — it's free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-brand-600" />
          <span className="font-semibold text-gray-400">PathMind AI</span>
        </div>
        <p>Your goal. Your pace. Your path.</p>
      </footer>
    </div>
  )
}
