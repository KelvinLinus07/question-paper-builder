import React from 'react'

const OPTION_LABELS = ['A','B','C','D']

function renderFillText(text) {
  return text.split('___').map((part, i, arr) => (
    <React.Fragment key={i}>
      {part}
      {i < arr.length - 1 && <span className="pv-blank" />}
    </React.Fragment>
  ))
}

function PvMcqOptions({ options = [] }) {
  const filled = options.filter(o => o?.trim())
  if (!filled.length) return null
  return (
    <div className="pv-options">
      {options.map((opt, i) => opt?.trim() ? (
        <div className="pv-option" key={i}>
          <span className="pv-option-key">({String.fromCharCode(97+i)})</span>
          <span className="pv-option-val">{opt}</span>
        </div>
      ) : null)}
    </div>
  )
}

function PvMatchTable({ pairs = [] }) {
  const filled = pairs.filter(p => p.left?.trim() || p.right?.trim())
  if (!filled.length) return null
  const ROMAN = ['i','ii','iii','iv','v','vi','vii','viii']
  return (
    <table className="pv-match-tbl">
      <thead>
        <tr>
          <th style={{width:28}}></th>
          <th>Column I</th>
          <th style={{width:28}}></th>
          <th>Column II</th>
        </tr>
      </thead>
      <tbody>
        {filled.map((pair, i) => (
          <tr key={i}>
            <td className="pv-match-key">({String.fromCharCode(97+i)})</td>
            <td className="pv-match-left">{pair.left}</td>
            <td className="pv-match-key">({ROMAN[i]})</td>
            <td className="pv-match-right">{pair.right}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Preview({ info, sections }) {
  let globalQ = 0
  const hasContent = info.school || info.exam || sections.some(s => s.questions.length > 0)
  const totalMarksCalc = sections.reduce((acc,s) => acc + Number(s.marksPerQ) * s.questions.length, 0)

  return (
    <div className="pv-wrapper">
      <div id="preview-content" className="pv-paper">
        {!hasContent ? (
          <div className="pv-empty">
            <div className="pv-empty-icon">📄</div>
            <p>Your exam paper preview will appear here.</p>
            <p>Fill in paper details and add sections to begin.</p>
          </div>
        ) : (
          <>
            {/* ══ HEADER ══ */}
            <div className="pv-header">
              {info.school  && <div className="pv-school">{info.school}</div>}
              {info.exam    && <div className="pv-exam">{info.exam}</div>}
              <div className="pv-header-rule" />
              {info.subject && <div className="pv-subject">{info.subject}</div>}
            </div>

            {/* ══ META ══ */}
            <div className="pv-meta">
              <span><strong>Time Allowed:</strong> {info.duration || '—'}</span>
              <span><strong>Maximum Marks:</strong> {info.totalMarks || totalMarksCalc || '—'}</span>
            </div>
            <div className="pv-thick-rule" />

            {/* ══ GENERAL INSTRUCTIONS ══ */}
            <div className="pv-general-inst">
              <div className="pv-gi-title">General Instructions:</div>
              <ol className="pv-gi-list">
                <li>All questions are compulsory unless stated otherwise.</li>
                <li>Read each question carefully before answering.</li>
                <li>Write neatly and clearly in your answer sheet.</li>
                {sections.map((s) => {
                  const tot = Number(s.marksPerQ) * s.questions.length
                  return (
                    <li key={s.id}>
                      Section {s.name} has {s.questions.length} question{s.questions.length !== 1 ? 's' : ''} of {s.marksPerQ} mark{Number(s.marksPerQ) !== 1 ? 's' : ''} each
                      ({s.questions.length} × {s.marksPerQ} = <strong>{tot}</strong> marks).
                    </li>
                  )
                })}
              </ol>
            </div>
            <div className="pv-double-rule" />

            {/* ══ SECTIONS ══ */}
            {sections.map(sec => {
              const sectionTotal = Number(sec.marksPerQ) * sec.questions.length
              return (
                <div className="pv-section" key={sec.id}>
                  <div className="pv-sec-heading-row">
                    <div className="pv-sec-heading">
                      SECTION {sec.name}
                      {sec.title ? <span className="pv-sec-subtitle"> — {sec.title}</span> : ''}
                    </div>
                    <div className="pv-sec-marks-summary">
                      {sec.questions.length} × {sec.marksPerQ} = {sectionTotal} Marks
                    </div>
                  </div>

                  <div className="pv-sec-inst">
                    {sec.instructions ||
                      `Answer all questions. Each question carries ${sec.marksPerQ} mark${Number(sec.marksPerQ) !== 1 ? 's' : ''}.`}
                  </div>

                  {/* CBSE-style question table */}
                  <table className="pv-q-table">
                    <thead>
                      <tr>
                        <th className="pv-th-qno">Q No.</th>
                        <th className="pv-th-q"></th>
                        <th className="pv-th-marks">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.questions.map(q => {
                        globalQ++
                        return (
                          <tr className="pv-q-row" key={q.id}>
                            <td className="pv-q-num">Q{globalQ}.</td>
                            <td className="pv-q-body">
                              <div className="pv-q-text">
                                {q.text
                                  ? (q.type === 'Fill in the Blanks' ? renderFillText(q.text) : q.text)
                                  : <em className="pv-placeholder">Question text…</em>
                                }
                              </div>
                              {q.type === 'Objective'           && <PvMcqOptions  options={q.options} />}
                              {q.type === 'Match the Following' && <PvMatchTable  pairs={q.pairs}   />}
                              {q.type === 'True/False'          && (
                                <div className="pv-tf">
                                  <span className="pv-tf-opt">True</span>
                                  <span className="pv-tf-sep">/</span>
                                  <span className="pv-tf-opt">False</span>
                                </div>
                              )}
                              {q.image && <img src={q.image} className="pv-q-img" alt="" />}
                            </td>
                            <td className="pv-q-marks">[{sec.marksPerQ}]</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}

            {/* ══ FOOTER ══ */}
            <div className="pv-footer-rule" />
            <div className="pv-footer">
              <span>*** End of Question Paper ***</span>
              <span>Total: {info.totalMarks || totalMarksCalc} Marks</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
