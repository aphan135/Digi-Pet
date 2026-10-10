import { useEffect, useRef, useState } from 'react'

const PALETTES = {
  Pink: { fur: '#FFC2D6', dark: '#FF8FB3', tail: '#F29BB8', paws: '#FFB0C9', nose: '#E0608F', label: '#C2336B' },
  Peach: { fur: '#FFD3A8', dark: '#FF9F5A', tail: '#F5B47E', paws: '#FFC48F', nose: '#E07A4F', label: '#B4501C' },
  Lavender: { fur: '#D9CCFF', dark: '#A98BFF', tail: '#C3B0F7', paws: '#CDBDFF', nose: '#8E6BE0', label: '#6A45C9' },
  'Cloud gray': { fur: '#DCE1E8', dark: '#A7B1C2', tail: '#C8D0DB', paws: '#CFD6E0', nose: '#8A93A6', label: '#5B6476' },
}

// Tell Electron whether clicks should hit the cat or pass through to the desktop.
const lift = (on) => window.pet.setInteractive(on)

function Cat({ c, className }) {
  return (
    // viewBox padded 10 units each side: the wagging tail (+14deg) reaches x≈165, past the original 160.
    <svg className={className} viewBox="-10 0 180 150" role="img" aria-label="Cat">
      <path className="tail" d="M128 112 Q158 98 150 70" stroke={c.tail} strokeWidth="10" strokeLinecap="round" fill="none" />
      <ellipse cx="80" cy="102" rx="48" ry="38" fill={c.fur} />
      <ellipse cx="58" cy="138" rx="14" ry="8" fill={c.paws} />
      <ellipse cx="102" cy="138" rx="14" ry="8" fill={c.paws} />
      <polygon points="36,50 44,12 72,36" fill={c.fur} />
      <polygon points="124,50 116,12 88,36" fill={c.fur} />
      <ellipse cx="80" cy="70" rx="52" ry="44" fill={c.fur} />
      <polygon points="45,40 48,24 62,36" fill={c.dark} />
      <polygon points="115,40 112,24 98,36" fill={c.dark} />
      <ellipse cx="48" cy="82" rx="8" ry="5" fill={c.dark} opacity=".55" />
      <ellipse cx="112" cy="82" rx="8" ry="5" fill={c.dark} opacity=".55" />
      <g className="eyes">
        <circle cx="62" cy="68" r="6.5" fill="#3B2A35" />
        <circle cx="98" cy="68" r="6.5" fill="#3B2A35" />
        <circle cx="64" cy="66" r="2" fill="#FFFFFF" />
        <circle cx="100" cy="66" r="2" fill="#FFFFFF" />
      </g>
      <ellipse cx="80" cy="77" rx="3" ry="2.2" fill={c.nose} />
      <path d="M72 83 Q76 89 80 83 Q84 89 88 83" stroke="#3B2A35" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function PeekHead({ c, shown }) {
  return (
    <svg className={shown ? 'peek shown' : 'peek'} viewBox="0 0 80 80" aria-hidden="true">
      <g className="ear">
        <polygon points="37,63 47,48 32,36" fill={c.fur} />
        <polygon points="37.8,56.7 43.3,48.5 35,41.9" fill={c.dark} />
      </g>
      <g className="ear">
        <polygon points="61,38 78,34 66,14" fill={c.fur} />
        <polygon points="64.3,33.8 73.6,31.6 67,20.6" fill={c.dark} />
      </g>
      <circle cx="80" cy="80" r="46" fill={c.fur} />
      <circle cx="60" cy="68" r="4.5" fill="#3B2A35" />
      <circle cx="61.5" cy="66.5" r="1.4" fill="#FFFFFF" />
      <circle cx="72" cy="56" r="4.5" fill="#3B2A35" />
      <circle cx="73.5" cy="54.5" r="1.4" fill="#FFFFFF" />
    </svg>
  )
}

export default function App() {
  const [settings, setSettings] = useState(null)
  const [phase, setPhase] = useState('hidden') // hidden | peek | open
  const [q, setQ] = useState(-1)
  const [jump, setJump] = useState(0)
  const [hearts, setHearts] = useState([])
  const closeTimer = useRef()

  useEffect(() => {
    window.pet.getSettings().then(setSettings)
    window.pet.onSettings(setSettings)
  }, [])

  // Once the cat is tucked away, the window goes back to letting clicks through.
  useEffect(() => {
    if (phase === 'hidden') lift(false)
  }, [phase])

  if (!settings) return null
  const c = PALETTES[settings.coat] || PALETTES.Pink
  const quote = settings.quotes[Math.max(q, 0) % settings.quotes.length]
  const open = phase === 'open'

  const hide = () => {
    clearTimeout(closeTimer.current)
    setPhase('hidden')
  }
  const openNow = () => {
    clearTimeout(closeTimer.current)
    window.pet.getSettings().then(setSettings) // picks up edits to settings.json without a restart
    if (!open) setQ((n) => n + 1)
    setPhase('open')
  }
  const petIt = () => {
    const h = { id: Math.random(), left: 70 + Math.round(Math.random() * 60), top: 10 + Math.round(Math.random() * 30) }
    setJump((j) => j + 1)
    setHearts((hs) => [...hs, h])
    setTimeout(() => setHearts((hs) => hs.filter((x) => x !== h)), 1000)
  }

  return (
    <div className="stage">
      <div className="peekclip">
        <PeekHead c={c} shown={phase === 'peek'} />
      </div>

      {!open && (
        <button
          className="hot"
          aria-label="Say hi to the cat"
          onMouseEnter={() => { lift(true); setPhase('peek') }}
          onMouseLeave={() => { lift(false); setPhase((p) => (p === 'peek' ? 'hidden' : p)) }}
          onFocus={() => setPhase('peek')}
          onBlur={() => setPhase((p) => (p === 'peek' ? 'hidden' : p))}
          onClick={openNow}
        />
      )}

      <div
        className={open ? 'petwrap open' : 'petwrap'}
        onMouseEnter={() => { clearTimeout(closeTimer.current); if (open) lift(true) }}
        onMouseLeave={() => {
          if (!open) return
          lift(false)
          clearTimeout(closeTimer.current)
          closeTimer.current = setTimeout(hide, 1000)
        }}
      >
        <div className="cloudgroup">
          <div className="cloud">
            <button className="close" onClick={hide} aria-label="Close">×</button>
            <div className="cloudbody">
              <div className="label" style={{ color: c.label }}>Today’s spark</div>
              <p className="quote">“{quote.text}”</p>
              {quote.by && <div className="by">— {quote.by}</div>}
              <a className="link" href={settings.link.url} target="_blank" rel="noopener" style={{ color: c.label }}>
                {settings.link.label || settings.link.url}
              </a>
            </div>
          </div>
          <div className="trail"><span /><span /><span /></div>
        </div>
        <div className="petarea">
          {hearts.map((h) => (
            <svg key={h.id} className="heart" style={{ left: h.left, top: h.top }} width="30" height="28" viewBox="0 0 24 22" aria-hidden="true">
              <path d="M12 21C12 21 2 14.6 2 8.2A5.2 5.2 0 0 1 12 5.6A5.2 5.2 0 0 1 22 8.2C22 14.6 12 21 12 21Z" fill={c.dark} />
            </svg>
          ))}
          <button className="petbtn" onClick={petIt} aria-label="Pet the cat">
            <Cat c={c} className={jump ? (jump % 2 ? 'pet jumpA' : 'pet jumpB') : 'pet'} />
          </button>
        </div>
      </div>
    </div>
  )
}
