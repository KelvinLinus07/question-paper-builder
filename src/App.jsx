import React, { useState } from 'react'
import Login from './components/Login.jsx'
import HeaderForm from './components/HeaderForm.jsx'
import PaperTypeSelector from './components/PaperTypeSelector.jsx'
import Section from './components/Section.jsx'
import Preview from './components/Preview.jsx'
import { makeSection } from './utils.js'

export default function App() {
  const [user, setUser]               = useState(null)
  const [info, setInfo]               = useState({ school:'', exam:'', subject:'', duration:'', totalMarks:'' })
  const [paperType, setPaperType]     = useState('Both')
  const [sections, setSections]       = useState([makeSection(0)])
  const [toast, setToast]             = useState(null)
  const [generating, setGenerating]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // Mobile only: 'builder' | 'preview'
  const [mobileTab, setMobileTab]     = useState('builder')

  const updateInfo = (key, val) => setInfo(p => ({ ...p, [key]: val }))

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const addSection = () => {
    setSections(p => [...p, makeSection(p.length)])
    showToast('Section added ✓')
  }

  const sectionOffsets = sections.reduce((acc, sec, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + sections[i - 1].questions.length)
    return acc
  }, [])

  const totalQuestions = sections.reduce((a, s) => a + s.questions.length, 0)
  const totalMarksCalc = sections.reduce((a, s) => a + Number(s.marksPerQ) * s.questions.length, 0)

  const generatePDF = async () => {
    setGenerating(true)
    showToast('Generating PDF…', 'info')
    await new Promise(r => setTimeout(r, 450))
    const el = document.getElementById('preview-content')
    if (!el) { setGenerating(false); return }
    const filename = [info.exam, info.subject].filter(Boolean).join(' — ') || 'Question Paper'
    window.html2pdf().set({
      margin:      [14, 18],
      filename:    `${filename}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(el).save()
      .then(() => { setGenerating(false); showToast('PDF downloaded! 🎉') })
      .catch(() => { setGenerating(false); showToast('PDF failed. Try again.', 'error') })
  }

  if (!user) return <Login onLogin={setUser} />

  return (
    <div className="app-shell">

      {/* ══ NAV ══ */}
      <nav className="nav">
        <div className="nav-left">
          <button className="nav-menu-btn" onClick={() => setSidebarOpen(p => !p)} title="Toggle sidebar">
            <span /><span /><span />
          </button>
          <div className="nav-brand">
            <div className="nav-brand-icon">📋</div>
            <span>QPaper <em>Builder</em></span>
          </div>
        </div>

        {/* Mobile tab switcher — only visible on small screens */}
        <div className="nav-mobile-tabs">
          <button className={`nmt-btn${mobileTab === 'builder' ? ' active' : ''}`} onClick={() => setMobileTab('builder')}>
            ✏ Builder
          </button>
          <button className={`nmt-btn${mobileTab === 'preview' ? ' active' : ''}`} onClick={() => setMobileTab('preview')}>
            📄 Preview
          </button>
        </div>

        <div className="nav-right">
          <div className="nav-stats">
            <span className="nav-stat"><strong>{sections.length}</strong> Sections</span>
            <span className="nav-stat-sep">·</span>
            <span className="nav-stat"><strong>{totalQuestions}</strong> Qs</span>
            <span className="nav-stat-sep">·</span>
            <span className="nav-stat"><strong>{totalMarksCalc}</strong> Marks</span>
          </div>
          <button className="nav-pdf-btn" onClick={generatePDF} disabled={generating}>
            {generating
              ? <><span className="nav-spin" />Generating…</>
              : <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export PDF
                </>
            }
          </button>
          <div className="nav-user">
            <div className="nav-user-avatar">
              {user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="nav-user-info">
              <span className="nav-user-role">{user.role}</span>
              <span className="nav-user-name">{user.name}</span>
            </div>
          </div>
          <button className="nav-logout" onClick={() => setUser(null)} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ══ BODY — 3 columns ══ */}
      <div className="app-body">

        {/* ── COL 1: Sidebar ── */}
        <aside className={`app-sidebar${sidebarOpen ? '' : ' sidebar-collapsed'} ${mobileTab === 'preview' ? 'mob-hide' : ''}`}>
          <HeaderForm info={info} onChange={updateInfo} />
          <PaperTypeSelector value={paperType} onChange={setPaperType} />
          <div className="sb-block">
            <div className="sb-block-title">Summary</div>
            <div className="sb-stats">
              {[
                { label: 'Sections',  val: sections.length, icon: '▤' },
                { label: 'Questions', val: totalQuestions,  icon: '#' },
                { label: 'Marks',     val: totalMarksCalc,  icon: '★' },
              ].map(s => (
                <div className="sb-stat-card" key={s.label}>
                  <span className="sb-stat-icon">{s.icon}</span>
                  <span className="sb-stat-val">{s.val}</span>
                  <span className="sb-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── COL 2: Builder ── */}
        <main className={`app-builder ${mobileTab === 'preview' ? 'mob-hide' : ''}`}>
          <div className="builder-toolbar">
            <button className="tb-add-btn" onClick={addSection}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Section
            </button>
            {sections.length > 0 && (
              <span className="tb-hint">
                {sections.length} section{sections.length !== 1 ? 's' : ''} · {totalMarksCalc} total marks
              </span>
            )}
          </div>

          {sections.length === 0 ? (
            <div className="builder-empty">
              <div className="be-icon">📄</div>
              <h3>Start Building</h3>
              <p>Click <strong>Add Section</strong> to create your first exam section.</p>
              <button className="be-cta" onClick={addSection}>+ Add First Section</button>
            </div>
          ) : (
            <div className="builder-sections">
              {sections.map((sec, si) => (
                <Section
                  key={sec.id}
                  section={sec}
                  sectionIdx={si}
                  sections={sections}
                  setSections={setSections}
                  paperType={paperType}
                  globalOffset={sectionOffsets[si]}
                />
              ))}
            </div>
          )}
        </main>

        {/* ── COL 3: Live Preview ── ALWAYS VISIBLE on desktop ── */}
        <aside className={`app-preview-panel ${mobileTab === 'builder' ? 'mob-hide' : ''}`}>
          <div className="pvp-header">
            <div className="pvp-header-left">
              <div className="pvp-live-dot" />
              <span className="pvp-label">Live Preview</span>
            </div>
            <button className="pvp-pdf-btn" onClick={generatePDF} disabled={generating}>
              {generating ? '⏳' : '⬇ PDF'}
            </button>
          </div>
          <div className="pvp-scroll">
            <Preview info={info} sections={sections} />
          </div>
        </aside>

      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'error' ? '✕' : toast.type === 'info' ? 'ℹ' : '✓'}
          </span>
          {toast.msg}
        </div>
      )}

    </div>
  )
}
