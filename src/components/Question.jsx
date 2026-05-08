import React, { useRef } from 'react'
import { makePair } from '../utils.js'

const ALL_TYPES = ['Objective', 'Subjective', 'Fill in the Blanks', 'Match the Following', 'True/False']

const TYPE_META = {
  'Objective':           { cls: 'obj',   label: 'MCQ' },
  'Subjective':          { cls: 'sub',   label: 'Descriptive' },
  'Fill in the Blanks':  { cls: 'fill',  label: 'Fill-in' },
  'Match the Following': { cls: 'match', label: 'Match' },
  'True/False':          { cls: 'tf',    label: 'T / F' },
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function getAvailableTypes(paperType) {
  if (paperType === 'Objective')  return ['Objective', 'True/False']
  if (paperType === 'Subjective') return ['Subjective', 'Fill in the Blanks', 'Match the Following']
  return ALL_TYPES
}

function McqOptions({ options = ['','','',''], onChange }) {
  const opts = options.length === 4 ? options : ['','','','']
  return (
    <div className="q-options-grid">
      {OPTION_LABELS.map((lbl, i) => (
        <div className="q-option-row" key={lbl}>
          <span className="q-option-label">{lbl}</span>
          <input
            className="q-option-input"
            placeholder={`Option ${lbl}`}
            value={opts[i]}
            onChange={e => { const n = [...opts]; n[i] = e.target.value; onChange(n) }}
          />
        </div>
      ))}
    </div>
  )
}

function MatchPairs({ pairs = [{ left:'', right:'' }], onChange }) {
  const upd = (idx, side, val) => onChange(pairs.map((p, i) => i === idx ? { ...p, [side]: val } : p))
  return (
    <div className="q-pairs-wrap">
      <div className="q-pairs-header"><span>Column A</span><span>Column B</span><span /></div>
      {pairs.map((pair, idx) => (
        <div className="q-pair-row" key={idx}>
          <input className="q-pair-input" placeholder={`Left ${idx + 1}`} value={pair.left}  onChange={e => upd(idx,'left',e.target.value)} />
          <span className="q-pair-arrow">↔</span>
          <input className="q-pair-input" placeholder={`Right ${idx + 1}`} value={pair.right} onChange={e => upd(idx,'right',e.target.value)} />
          <button className="q-pair-remove" onClick={() => onChange(pairs.filter((_,i) => i !== idx))} disabled={pairs.length === 1}>×</button>
        </div>
      ))}
      <button className="q-add-pair-btn" onClick={() => onChange([...pairs, makePair()])}>+ Add Pair</button>
    </div>
  )
}

export default function Question({ q, localIdx, globalIdx, sectionIdx, paperType, setSections }) {
  const fileRef = useRef()
  const available = getAvailableTypes(paperType)
  const { cls, label } = TYPE_META[q.type] || TYPE_META['Objective']

  const update = (key, val) =>
    setSections(prev => prev.map((s, si) =>
      si !== sectionIdx ? s : {
        ...s,
        questions: s.questions.map((q2, qi) => qi !== localIdx ? q2 : { ...q2, [key]: val })
      }
    ))

  const changeType = newType =>
    setSections(prev => prev.map((s, si) =>
      si !== sectionIdx ? s : {
        ...s,
        questions: s.questions.map((q2, qi) =>
          qi !== localIdx ? q2 : {
            ...q2, type: newType,
            options: q2.options?.length === 4 ? q2.options : ['','','',''],
            pairs:   q2.pairs?.length   > 0   ? q2.pairs   : [{ left:'', right:'' }],
          }
        )
      }
    ))

  const remove = () =>
    setSections(prev => prev.map((s, si) =>
      si !== sectionIdx ? s : { ...s, questions: s.questions.filter((_,qi) => qi !== localIdx) }
    ))

  const handleImage = e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => update('image', ev.target.result)
    reader.readAsDataURL(file)
  }

  const placeholder =
    q.type === 'Fill in the Blanks'   ? 'Use ___ for blanks, e.g. "The capital of India is ___."' :
    q.type === 'Match the Following'  ? 'Optional heading, e.g. "Match the following animals."' :
    q.type === 'True/False'           ? 'Enter a statement, e.g. "The Earth is flat."' :
    'Enter question text here…'

  return (
    <div className="question-item">
      {/* Top row */}
      <div className="q-top-row">
        <div className="q-num-badge">{globalIdx}</div>
        <textarea
          className="q-textarea"
          placeholder={placeholder}
          value={q.text}
          onChange={e => update('text', e.target.value)}
        />
      </div>

      {/* Type-specific editors */}
      {q.type === 'Objective' && (
        <McqOptions options={q.options} onChange={val => update('options', val)} />
      )}
      {q.type === 'Match the Following' && (
        <MatchPairs pairs={q.pairs} onChange={val => update('pairs', val)} />
      )}
      {q.type === 'True/False' && (
        <div className="q-tf-hint">Preview will show <strong>True / False</strong> choices automatically.</div>
      )}

      {/* Bottom toolbar */}
      <div className="q-bottom-row">
        <div className="q-bottom-left">
          <select className="q-type-select" value={q.type} onChange={e => changeType(e.target.value)}>
            {available.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className={`q-type-chip ${cls}`}>{label}</span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImage} />
          <button className="q-img-btn" onClick={() => fileRef.current.click()}>
            📎 {q.image ? 'Replace' : 'Image'}
          </button>
          {q.image && (
            <button className="q-img-btn" style={{ color:'var(--red)' }} onClick={() => update('image', null)}>
              ✕ Remove
            </button>
          )}
        </div>
        <button className="q-remove-btn" onClick={remove}>×</button>
      </div>

      {q.image && <img src={q.image} className="q-img-preview" alt="" />}
    </div>
  )
}
