import { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowDownRight, ArrowRight, BookOpen, Check, ChevronDown,
  CircleHelp, ClipboardCheck, ExternalLink, Eye, FileSearch, GraduationCap,
  Info, LockKeyhole, Menu, Moon, RotateCcw, Shield, ShieldAlert,
  ShieldCheck, Sun, X,
} from 'lucide-react'
import { analyzeMessage, getHighlightSegments } from './lib/scamDetector'
import { learnTopics, quizQuestions, sampleMessages } from './data/content'
import type { Finding } from './types/scam'

type Page = 'dashboard' | 'learn' | 'about'

const iconForPage = {
  dashboard: FileSearch,
  learn: GraduationCap,
  about: CircleHelp,
}

const navItems: Array<{ id: Page; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'learn', label: 'Learning center' },
  { id: 'about', label: 'How it works' },
]

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [message, setMessage] = useState('')
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeMessage> | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lightTheme, setLightTheme] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const analyze = () => {
    if (!message.trim() || isAnalyzing) return
    setIsAnalyzing(true)
    window.setTimeout(() => {
      setAnalysis(analyzeMessage(message))
      setIsAnalyzing(false)
    }, 400)
  }

  const changeMessage = (value: string) => {
    setMessage(value)
    setAnalysis(null)
  }

  const selectPage = (next: Page) => {
    setPage(next)
    setMobileNavOpen(false)
  }

  return (
    <div className={`app-shell ${lightTheme ? 'light-theme' : ''}`}>
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); selectPage('dashboard') }}>
          <span className="brand-mark"><ShieldCheck size={21} strokeWidth={2.2} /></span>
          <span><strong>scam<span>spotter</span></strong><small>MESSAGE SAFETY TOOL</small></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = iconForPage[item.id]
            return (
              <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => selectPage(item.id)}>
                <Icon size={18} /><span>{item.label}</span>{page === item.id && <ArrowDownRight className="nav-active-arrow" size={14} />}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <LockKeyhole size={17} />
            <div><strong>Your message stays yours</strong><p>Analysis runs in this browser. Nothing is uploaded or saved.</p></div>
          </div>
          <div className="sidebar-footer"><span className="status-dot" /> Private by design <span>·</span> Prototype v1.0</div>
        </div>
      </aside>
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Scam Spotter</span><span className="crumb-slash">/</span><strong>{navItems.find((item) => item.id === page)?.label}</strong></div>
          <div className="topbar-actions">
            <span className="local-badge"><span className="status-dot" /> Local analysis</span>
            <button className="icon-button theme-button" onClick={() => setLightTheme(!lightTheme)} aria-label={`Switch to ${lightTheme ? 'dark' : 'light'} theme`}>
              {lightTheme ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>
        {page === 'dashboard' && (
          <Dashboard
            message={message}
            changeMessage={changeMessage}
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            analyze={analyze}
            loadSample={(text) => { changeMessage(text); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          />
        )}
        {page === 'learn' && <LearningCenter />}
        {page === 'about' && <HowItWorks />}
      </main>
    </div>
  )
}

function Dashboard({ message, changeMessage, analysis, isAnalyzing, analyze, loadSample }: {
  message: string
  changeMessage: (value: string) => void
  analysis: ReturnType<typeof analyzeMessage> | null
  isAnalyzing: boolean
  analyze: () => void
  loadSample: (text: string) => void
}) {
  const remaining = 5000 - message.length
  return (
    <div className="page-content dashboard-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> MESSAGE ANALYSIS</div>
          <h1>Understand the message.<br /><span>Spot the red flags.</span></h1>
          <p className="page-subtitle">A second look can make all the difference. Check a suspicious message with clear, explainable rules.</p>
        </div>
        <div className="heading-stamp"><Shield size={18} /> <span>RULE-BASED<br /><b>DETECTION</b></span></div>
      </div>
      <section className="analyzer-card surface">
        <div className="section-top">
          <div className="section-title"><span className="icon-tile blue-tile"><ClipboardCheck size={19} /></span><div><h2>Analyze a message</h2><p>Paste the text exactly as you received it</p></div></div>
          <span className="private-label"><LockKeyhole size={13} /> PRIVATE & LOCAL</span>
        </div>
        <textarea
          aria-label="Suspicious message"
          value={message}
          onChange={(event) => changeMessage(event.target.value.slice(0, 5000))}
          maxLength={5000}
          placeholder="Paste a suspicious SMS, email, WhatsApp message, bank alert, or delivery notification here..."
        />
        <div className="input-footer">
          <span className={remaining < 250 ? 'counter counter-low' : 'counter'}>{message.length.toLocaleString()} / 5,000 characters</span>
          <span className="sensitive-reminder"><AlertTriangle size={14} /> Don’t paste real passwords, OTPs, or sensitive details</span>
        </div>
        <div className="input-controls">
          <button className="button button-primary" onClick={analyze} disabled={!message.trim() || isAnalyzing}>
            {isAnalyzing ? <span className="spinner" /> : <FileSearch size={17} />}
            {isAnalyzing ? 'Checking message…' : 'Analyze message'}
            {!isAnalyzing && <ArrowRight size={16} />}
          </button>
          <button className="button button-quiet" onClick={() => changeMessage('')} disabled={!message && !analysis}><X size={15} /> Clear</button>
        </div>
        <div className="sample-row">
          <span>TRY A SAMPLE</span>
          {sampleMessages.map((sample, index) => (
            <button className={`sample-chip sample-${index}`} key={sample.label} onClick={() => loadSample(sample.text)}>
              <span className="sample-dot" />{sample.label}<ArrowRight size={12} />
            </button>
          ))}
        </div>
      </section>
      {analysis ? <ResultsPanel analysis={analysis} originalMessage={message} /> : <EmptyState />}
      <div className="disclaimer-line"><Info size={14} /><span>Scam Spotter uses heuristics, not certainty. A low score doesn’t guarantee a message is safe.</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Learn more <ArrowRight size={13} /></button></div>
    </div>
  )
}

function EmptyState() {
  return (
    <section className="empty-results surface">
      <div className="empty-illustration"><span className="empty-orbit orbit-one" /><span className="empty-orbit orbit-two" /><span className="empty-shield"><Shield size={31} /></span><span className="empty-spark"><Check size={12} /></span></div>
      <div className="empty-copy"><span className="empty-kicker">YOUR RESULTS WILL APPEAR HERE</span><h2>Ready when you are</h2><p>Paste a message above and run an analysis. We’ll show you the exact phrases that triggered a warning and what to do next.</p></div>
      <div className="empty-steps"><span><i>01</i> Paste message</span><ArrowRight size={14} /><span><i>02</i> Check signals</span><ArrowRight size={14} /><span><i>03</i> Stay informed</span></div>
    </section>
  )
}

function ResultsPanel({ analysis, originalMessage }: { analysis: ReturnType<typeof analyzeMessage>; originalMessage: string }) {
  const [activeFinding, setActiveFinding] = useState<string | null>(null)
  const segments = useMemo(() => getHighlightSegments(originalMessage, analysis.findings), [originalMessage, analysis.findings])
  const riskLabel = analysis.risk.toLowerCase()
  const jumpToFinding = (finding: Finding) => {
    const first = finding.matches[0]
    if (first) {
      setActiveFinding(finding.id)
      document.getElementById(`match-${finding.id}-${first.start}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => setActiveFinding(null), 1600)
    }
  }
  let segmentOffset = 0
  const highlightedSegments = segments.map((segment, index) => {
    const start = segmentOffset
    segmentOffset += segment.text.length
    const anchorFinding = segment.findingIds
      .map((id) => analysis.findings.find((finding) => finding.id === id && finding.matches.some((match) => match.start === start)))
      .find(Boolean)
    return { segment, index, start, anchorFinding }
  })

  return (
    <section className="results-section" aria-live="polite">
      <div className="results-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> ANALYSIS COMPLETE</div><h2>Here’s what we found</h2></div><span className="analysis-meta"><Check size={14} /> Checked locally just now</span></div>
      <div className="results-grid">
        <div className="results-main">
          <div className="score-card surface">
            <div className={`score-ring risk-${riskLabel}`} aria-label={`Risk score ${analysis.score} out of 100`}>
              <svg viewBox="0 0 120 120" role="img" aria-hidden="true"><circle className="ring-track" cx="60" cy="60" r="49" /><circle className="ring-progress" cx="60" cy="60" r="49" style={{ strokeDashoffset: 307.9 * (1 - analysis.score / 100) }} /></svg>
              <div className="ring-content"><strong>{analysis.score}<small>/100</small></strong><span>HEURISTIC SCORE</span></div>
            </div>
            <div className="score-details">
              <span className={`risk-pill risk-pill-${riskLabel}`}><span /> {analysis.risk} RISK</span>
              <h3>{analysis.risk === 'HIGH' ? 'Pause before acting.' : analysis.risk === 'MEDIUM' ? 'Take a closer look.' : analysis.findings.length ? 'A few things to check.' : 'No obvious flags found.'}</h3>
              <p>{analysis.risk === 'HIGH' ? 'Several concerning signals appeared. Verify independently before responding or sharing information.' : analysis.risk === 'MEDIUM' ? 'Some cautionary signals appeared. Confirm the claims through a trusted channel.' : analysis.findings.length ? 'A limited signal appeared, but this is not a safety guarantee.' : analysis.message}</p>
              <span className="score-note"><Info size={13} /> Weighted heuristic, capped at 100—not a probability.</span>
            </div>
            <div className="score-legend"><span><i className="legend-green" />LOW <b>0–29</b></span><span><i className="legend-amber" />MEDIUM <b>30–59</b></span><span><i className="legend-red" />HIGH <b>60–100</b></span></div>
          </div>
          <div className="subsection-heading"><div><h3>Message evidence</h3><p>Exact phrases that matched a rule are highlighted</p></div><div className="highlight-key"><span className="key-red" />Concern <span className="key-amber" />Caution</div></div>
          <div className="message-evidence surface">
            <div className="message-label"><span><Eye size={14} /> ORIGINAL MESSAGE</span><span>Matched text highlighted</span></div>
            <p className="highlighted-message">{highlightedSegments.map(({ segment, index, start, anchorFinding }) => {
              if (segment.findingIds.length === 0) return <span key={index}>{segment.text}</span>
              return (
                <mark
                  key={`${index}-${segment.findingIds.join('-')}`}
                  id={anchorFinding ? `match-${anchorFinding.id}-${start}` : undefined}
                  className={`highlight ${analysis.findings.find((finding) => finding.id === segment.findingIds[0])?.category ?? 'caution'} ${segment.findingIds.includes(activeFinding ?? '') ? 'highlight-active' : ''}`}
                >{segment.text}</mark>
              )
            })}</p>
          </div>
          <div className="subsection-heading findings-heading"><div><h3>Warning signs <span className="count-badge">{analysis.findings.length}</span></h3><p>Each signal is explained and scored once</p></div></div>
          {analysis.findings.length > 0 ? (
            <div className="finding-list">
              {analysis.findings.map((finding) => <FindingCard key={finding.id} finding={finding} onClick={() => jumpToFinding(finding)} />)}
            </div>
          ) : (
            <div className="no-findings surface"><span className="no-findings-icon"><ShieldCheck size={19} /></span><div><strong>No obvious warning signs were detected by our current rules.</strong><p>This does not guarantee that the message is safe. Rules may miss new or subtle scams.</p></div></div>
          )}
        </div>
        <aside className="next-steps-card surface">
          <div className="next-title"><span className="icon-tile green-tile"><ShieldCheck size={18} /></span><div><h3>What to do next</h3><p>Stay safe with these steps</p></div></div>
          <ol className="next-steps">
            {analysis.nextSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}
          </ol>
          {analysis.findings.some((finding) => ['otp', 'credentials', 'personal-info', 'payment'].includes(finding.id)) && (
            <div className="urgent-help"><AlertTriangle size={16} /><div><strong>Already shared details or sent money?</strong><p>Contact your bank or provider immediately. In India, call 1930 to report cyber financial fraud where applicable.</p></div></div>
          )}
          <div className="local-note"><LockKeyhole size={15} /><span><b>Private by design.</b> Your message isn’t stored or sent to a server.</span></div>
        </aside>
      </div>
    </section>
  )
}

function FindingCard({ finding, onClick }: { finding: Finding; onClick: () => void }) {
  const Icon = finding.category === 'high' ? ShieldAlert : finding.category === 'info' ? Info : AlertTriangle
  return (
    <button className={`finding-card surface finding-${finding.category}`} onClick={onClick}>
      <div className="finding-icon"><Icon size={17} /></div>
      <div className="finding-copy"><div className="finding-name">{finding.name}<span className="finding-match-count">{finding.matches.length} {finding.matches.length === 1 ? 'match' : 'matches'}</span></div><p>{finding.explanation}</p><span className="recommendation"><Check size={13} /> {finding.recommendation}</span></div>
      <div className="finding-points">{finding.points > 0 ? `+${finding.points}` : 'Info'}<small>{finding.points > 0 ? 'POINTS' : 'SIGNAL'}</small></div>
    </button>
  )
}

function LearningCenter() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(0)
  const score = quizQuestions.reduce((count, question, index) => count + (answers[index] === question.answer ? 1 : 0), 0)
  const resetQuiz = () => { setAnswers({}); setSubmitted(false) }
  return (
    <div className="page-content content-page">
      <div className="page-heading compact-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> BUILD YOUR SCAM SENSE</div><h1>Knowledge is your<br /><span>first line of defense.</span></h1><p className="page-subtitle">Recognize common tactics, pause under pressure, and verify through trusted channels.</p></div><div className="heading-stamp"><BookOpen size={19} /><span>LEARN<br /><b>AT YOUR PACE</b></span></div></div>
      <div className="learning-grid">
        <section className="learning-main">
          <div className="section-heading"><div><h2>Common scam patterns</h2><p>Learn what these tactics can look like in a message.</p></div><span className="topic-total">04 TOPICS</span></div>
          <div className="topic-list">
            {learnTopics.map((topic, index) => (
              <article className={`topic-card surface ${expanded === index ? 'topic-expanded' : ''}`} key={topic.title}>
                <button className="topic-toggle" onClick={() => setExpanded(expanded === index ? null : index)} aria-expanded={expanded === index}>
                  <span className={`topic-number tone-${index}`}>{String(index + 1).padStart(2, '0')}</span><span className="topic-title">{topic.title}</span><ChevronDown size={17} />
                </button>
                {expanded === index && <div className="topic-detail"><p>{topic.description}</p><div className="fictional-example"><span>FICTIONAL EXAMPLE</span><p>{topic.example}</p></div></div>}
              </article>
            ))}
          </div>
          <section className="habits-card surface">
            <div className="habits-title"><span className="icon-tile green-tile"><ShieldCheck size={18} /></span><div><h3>Safer digital habits</h3><p>Small routines make a meaningful difference.</p></div></div>
            <div className="habit-grid"><div><Check size={15} /><span>Pause when a message creates urgency</span></div><div><Check size={15} /><span>Never share OTPs, PINs, or passwords</span></div><div><Check size={15} /><span>Check links without opening them</span></div><div><Check size={15} /><span>Find official contact details yourself</span></div></div>
          </section>
        </section>
        <aside className="quiz-card surface">
          <div className="quiz-header"><span className="quiz-icon"><GraduationCap size={19} /></span><span className="quiz-label">QUICK KNOWLEDGE CHECK</span><h2>Would you spot<br />the warning signs?</h2><p>Five questions. No pressure—learn as you go.</p></div>
          <div className="quiz-questions">
            {quizQuestions.map((item, questionIndex) => (
              <fieldset className="quiz-question" key={item.question}>
                <legend><span>{String(questionIndex + 1).padStart(2, '0')}</span>{item.question}</legend>
                <div className="quiz-options">{item.options.map((option, optionIndex) => {
                  const isCorrect = submitted && optionIndex === item.answer
                  const isWrong = submitted && answers[questionIndex] === optionIndex && optionIndex !== item.answer
                  return <label className={`${answers[questionIndex] === optionIndex ? 'option-selected' : ''} ${isCorrect ? 'option-correct' : ''} ${isWrong ? 'option-wrong' : ''}`} key={option}>
                    <input type="radio" name={`question-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => !submitted && setAnswers({ ...answers, [questionIndex]: optionIndex })} disabled={submitted} />
                    <span className="radio-look" />{option}
                  </label>
                })}</div>
                {submitted && <p className={`quiz-feedback ${answers[questionIndex] === item.answer ? 'feedback-correct' : 'feedback-wrong'}`}>{answers[questionIndex] === item.answer ? 'Correct. ' : 'Good to remember. '}{item.explanation}</p>}
              </fieldset>
            ))}
          </div>
          {submitted ? <div className="quiz-result"><div><strong>{score} / {quizQuestions.length}</strong><span>{score === quizQuestions.length ? 'Excellent work!' : 'Knowledge grows with practice.'}</span></div><button className="button button-secondary" onClick={resetQuiz}><RotateCcw size={14} /> Try again</button></div> :
            <button className="button button-primary quiz-submit" disabled={Object.keys(answers).length < quizQuestions.length} onClick={() => setSubmitted(true)}>Check my answers <ArrowRight size={15} /></button>}
        </aside>
      </div>
      <div className="content-footnote"><Info size={14} /> Examples are fictional and for awareness only. No real organization or message is implied.</div>
    </div>
  )
}

function HowItWorks() {
  const stages = [
    ['01', 'Message input', 'You paste a message into the browser. It is not sent to a server.'],
    ['02', 'Rule-based detection', 'Visible phrase and context rules check for urgency, threats, credentials, links, and more.'],
    ['03', 'Evidence extraction', 'Matched phrases retain their original text positions so you can see what triggered a signal.'],
    ['04', 'Weighted risk scoring', 'Each rule contributes a fixed, documented heuristic weight. Repeated hits from one rule count once.'],
    ['05', 'Clear next steps', 'The result explains each signal and suggests safer ways to verify the message.'],
  ]
  return (
    <div className="page-content content-page">
      <div className="page-heading compact-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> TRANSPARENT BY DESIGN</div><h1>Know how the<br /><span>check works.</span></h1><p className="page-subtitle">No black box. Scam Spotter uses visible rules so you can understand how each signal was found.</p></div><div className="heading-stamp"><CircleHelp size={19} /><span>HOW IT<br /><b>WORKS</b></span></div></div>
      <section className="pipeline-card surface">
        <div className="section-heading"><div><h2>From message to insight</h2><p>A simple, explainable pipeline—processed entirely on your device.</p></div><span className="local-badge"><span className="status-dot" /> LOCAL ONLY</span></div>
        <div className="pipeline">{stages.map(([number, title, detail], index) => <div className="pipeline-stage" key={number}><span className="pipeline-number">{number}</span><div><h3>{title}</h3><p>{detail}</p></div>{index < stages.length - 1 && <ArrowRight className="pipeline-arrow" size={15} />}</div>)}</div>
      </section>
      <div className="explain-grid">
        <section className="explain-card surface"><span className="icon-tile blue-tile"><FileSearch size={18} /></span><h3>What rules can detect</h3><p>Pressure tactics, account threats, requests for codes or credentials, payment demands, certain link characteristics, and other message-text indicators.</p><p>Rules combine patterns with lightweight context checks to avoid flagging a word such as “bank” or “urgent” on its own.</p></section>
        <section className="explain-card surface"><span className="icon-tile amber-tile"><Info size={18} /></span><h3>How to read the score</h3><p>The 0–100 score is a weighted heuristic, capped at 100—not a percentage or statistically calibrated probability of fraud.</p><p>Repeated wording from one rule does not add points repeatedly. A low score cannot guarantee safety, and rules may miss new scam techniques.</p></section>
        <section className="explain-card surface"><span className="icon-tile red-tile"><ShieldAlert size={18} /></span><h3>What we can’t confirm</h3><p>Message text alone cannot verify who sent something or whether a site is genuinely operated by an organization.</p><p>Link indicators are caution signals only. Always verify through a trusted number or official app you access independently.</p></section>
        <section className="explain-card privacy-explain surface"><span className="icon-tile green-tile"><LockKeyhole size={18} /></span><h3>Private in this prototype</h3><p>Analysis runs locally in your browser with no API, backend, analytics, or message storage. Clearing or reloading the page removes the message from the current view.</p><span><Check size={14} /> No upload <Check size={14} /> No account <Check size={14} /> No message history</span></section>
      </div>
      <div className="report-banner"><span><Info size={16} /></span><p><b>Need to report suspected cybercrime in India?</b> Visit the official cybercrime portal at <a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer">cybercrime.gov.in <ExternalLink size={12} /></a> or call 1930 where applicable.</p></div>
    </div>
  )
}

export default App
