import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const PALETTES = {
  Pink: { fur: '#FFC2D6', dark: '#FF8FB3', tail: '#F29BB8', paws: '#FFB0C9', nose: '#E0608F', label: '#C2336B' },
  Peach: { fur: '#FFD3A8', dark: '#FF9F5A', tail: '#F5B47E', paws: '#FFC48F', nose: '#E07A4F', label: '#B4501C' },
  Lavender: { fur: '#D9CCFF', dark: '#A98BFF', tail: '#C3B0F7', paws: '#CDBDFF', nose: '#8E6BE0', label: '#6A45C9' },
  'Cloud gray': { fur: '#DCE1E8', dark: '#A7B1C2', tail: '#C8D0DB', paws: '#CFD6E0', nose: '#8A93A6', label: '#5B6476' },
}

// [sx, sy] per home corner: +1 = right / bottom edge, -1 = left / top edge.
const CORNERS = { br: [1, 1], bl: [-1, 1], tr: [1, -1], tl: [-1, -1] }
// Cat box and its inset from the screen edges, in CSS px (main zooms the page by SCALE).
const CAT_W = 236
const CAT_H = 197
const INSET_X = 102
const INSET_Y = 8
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
// Damped spring on a {p, v} pair, semi-implicit Euler.
const spring = (o, target, k, c, dt) => {
  o.v += (k * (target - o.p) - c * o.v) * dt
  o.p += o.v * dt
}

function home(corner) {
  const [sx, sy] = CORNERS[corner]
  return {
    x: sx > 0 ? innerWidth - INSET_X - CAT_W : INSET_X,
    y: sy > 0 ? innerHeight - INSET_Y - CAT_H : INSET_Y,
  }
}

function nearestCorner(x, y) {
  let best = 'br'
  let bestD = Infinity
  for (const k of Object.keys(CORNERS)) {
    const h = home(k)
    const d = (h.x - x) ** 2 + (h.y - y) ** 2
    if (d < bestD) [best, bestD] = [k, d]
  }
  return best
}

const newSim = () => ({
  mode: 'idle', // idle | drag | settle
  x: { p: 0, v: 0 }, y: { p: 0, v: 0 }, tx: 0, ty: 0,
  rot: { p: 0, v: 0 }, ear: { p: 0, v: 0 }, tail: { p: 0, v: 0 }, str: { p: 0, v: 0 },
  pressed: false, dragged: false, squashed: false,
  downX: 0, downY: 0, grabX: 0, grabY: 0, px: 0, py: 0, pvx: 0, pvy: 0, lastMove: 0,
  raf: 0, last: 0,
})

function Cat({ c, className, parts }) {
  const part = (k) => (el) => { parts[k] = el }
  return (
    // viewBox padded 10 units each side: the wagging tail (+14deg) reaches x≈165, past the original 160.
    <svg className={className} viewBox="-10 0 180 150" role="img" aria-label="Cat">
      <g ref={part('tail')}>
        <path className="tail" d="M128 112 Q158 98 150 70" stroke={c.tail} strokeWidth="10" strokeLinecap="round" fill="none" />
      </g>
      <ellipse cx="80" cy="102" rx="48" ry="38" fill={c.fur} />
      <ellipse cx="58" cy="138" rx="14" ry="8" fill={c.paws} />
      <ellipse cx="102" cy="138" rx="14" ry="8" fill={c.paws} />
      <g ref={part('earL')}><polygon points="36,50 44,12 72,36" fill={c.fur} /></g>
      <g ref={part('earR')}><polygon points="124,50 116,12 88,36" fill={c.fur} /></g>
      <ellipse cx="80" cy="70" rx="52" ry="44" fill={c.fur} />
      <g ref={part('innerL')}><polygon points="45,40 48,24 62,36" fill={c.dark} /></g>
      <g ref={part('innerR')}><polygon points="115,40 112,24 98,36" fill={c.dark} /></g>
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
  const [corner, setCorner] = useState('br')
  const [phase, setPhase] = useState('hidden') // hidden | peek | open
  const [moving, setMoving] = useState(false) // dragged, or flying to a corner
  const [q, setQ] = useState(-1)
  const [jump, setJump] = useState(0)
  const [hearts, setHearts] = useState([])
  // Physics lives in refs and is written straight to the DOM each frame; React only sees phase changes.
  const [s] = useState(newSim)
  const [parts] = useState({})
  const posRef = useRef()
  const jellyRef = useRef()
  const cornerRef = useRef('br')
  const closeTimer = useRef()
  const hovering = useRef(false)
  const sentInteractive = useRef(false)

  // Clicks hit the window only while the cursor is on the cat/cloud, or a drag is in progress.
  const syncInteractive = () => {
    const on = s.pressed || hovering.current
    if (on !== sentInteractive.current) {
      sentInteractive.current = on
      window.pet.setInteractive(on)
    }
  }

  const write = () => {
    if (!posRef.current) return
    posRef.current.style.transform = `translate(${s.x.p}px, ${s.y.p}px)`
    jellyRef.current.style.transform = `rotate(${s.rot.p}deg) scale(${1 - s.str.p}, ${1 + s.str.p})`
    const f = CORNERS[cornerRef.current][0] // the art is mirrored at left corners, so mirror its local angles
    const ear = f * s.ear.p
    for (const k of ['earL', 'innerL']) parts[k]?.setAttribute('transform', `rotate(${ear} 54 43)`)
    for (const k of ['earR', 'innerR']) parts[k]?.setAttribute('transform', `rotate(${ear} 106 43)`)
    parts.tail?.setAttribute('transform', `rotate(${f * s.tail.p} 128 112)`)
  }

  const place = () => {
    const h = home(cornerRef.current)
    Object.assign(s.x, { p: h.x, v: 0 })
    Object.assign(s.y, { p: h.y, v: 0 })
    s.tx = h.x
    s.ty = h.y
    write()
  }

  const step = (dt) => {
    if (reduceMotion) {
      Object.assign(s.x, { p: s.tx, v: 0 })
      Object.assign(s.y, { p: s.ty, v: 0 })
      return
    }
    if (s.mode === 'drag') {
      // Pointer stopped moving: let the measured velocity fade so the jiggle settles under a still cursor.
      if (performance.now() - s.lastMove > 50) {
        const d = Math.exp(-dt / 0.05)
        s.pvx *= d
        s.pvy *= d
      }
      spring(s.x, s.tx, 300, 28, dt)
      spring(s.y, s.ty, 300, 28, dt)
      const dx = s.x.p - s.tx
      const dy = s.y.p - s.ty
      const d = Math.hypot(dx, dy)
      if (d > 16) { // cap the lag so a fast drag never leaves the cat far behind the cursor
        s.x.p = s.tx + (dx * 16) / d
        s.y.p = s.ty + (dy * 16) / d
      }
    } else {
      spring(s.x, s.tx, 160, 22, dt)
      spring(s.y, s.ty, 160, 22, dt)
      // A hard throw bounces off the screen edge instead of flying out of frame.
      const maxX = innerWidth - CAT_W
      const maxY = innerHeight - CAT_H
      if (s.x.p < 0 || s.x.p > maxX) { s.x.p = clamp(s.x.p, 0, maxX); s.x.v *= -0.4 }
      if (s.y.p < 0 || s.y.p > maxY) { s.y.p = clamp(s.y.p, 0, maxY); s.y.v *= -0.4 }
      if (!s.squashed && Math.hypot(s.x.p - s.tx, s.y.p - s.ty) < 12) {
        s.squashed = true
        s.str.v -= 1.5 // landing squash
      }
    }
    const dragging = s.mode === 'drag'
    const vx = dragging ? s.pvx : s.x.v
    const speed = dragging ? Math.hypot(s.pvx, s.pvy) : Math.hypot(s.x.v, s.y.v)
    // Jelly lag: the body leans back from the motion, ears and tail follow on softer springs and overshoot.
    spring(s.rot, clamp(-0.012 * vx, -12, 12), 180, 18, dt)
    spring(s.ear, clamp(1.5 * s.rot.p, -15, 15), 240, 15, dt)
    spring(s.tail, clamp(2 * s.rot.p, -20, 20), 100, 12, dt)
    spring(s.str, Math.min(speed / 12000, 0.07), 220, 24, dt)
  }

  const settled = () =>
    Math.abs(s.x.p - s.tx) < 0.5 && Math.abs(s.y.p - s.ty) < 0.5 && Math.hypot(s.x.v, s.y.v) < 5 &&
    [s.rot, s.ear, s.tail].every((o) => Math.abs(o.p) < 0.2 && Math.abs(o.v) < 2) &&
    Math.abs(s.str.p) < 0.002 && Math.abs(s.str.v) < 0.05

  const tick = (now) => {
    const dt = Math.min((now - s.last) / 1000, 0.032)
    s.last = now
    for (let t = 0; t < dt; t += 0.008) step(Math.min(0.008, dt - t))
    write()
    if (s.mode === 'settle' && settled()) {
      s.raf = 0
      finishSettle()
      return
    }
    s.raf = requestAnimationFrame(tick)
  }

  const startLoop = () => {
    if (s.raf) return
    s.last = performance.now()
    s.raf = requestAnimationFrame(tick)
  }

  const hide = () => {
    clearTimeout(closeTimer.current)
    hovering.current = false
    syncInteractive()
    setPhase('hidden')
  }
  const startClose = (ms) => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(hide, ms)
  }

  const finishSettle = () => {
    for (const o of [s.rot, s.ear, s.tail, s.str]) Object.assign(o, { p: 0, v: 0 })
    s.mode = 'idle'
    place()
    setMoving(false)
    window.pet.setCorner(cornerRef.current)
    if (!hovering.current) startClose(2000) // give the cloud a moment after landing
  }

  useEffect(() => {
    window.pet.getSettings().then((st) => {
      cornerRef.current = st.corner
      setCorner(st.corner)
      setSettings(st)
    })
    window.pet.onSettings(setSettings)
    const onResize = () => { if (s.mode === 'idle') place() }
    addEventListener('resize', onResize)
    return () => {
      removeEventListener('resize', onResize)
      cancelAnimationFrame(s.raf)
    }
  }, [])

  const loaded = settings !== null
  useLayoutEffect(() => {
    if (loaded && s.mode === 'idle') place()
  }, [loaded, corner])

  if (!settings) return null
  const c = PALETTES[settings.coat] || PALETTES.Pink
  const quote = settings.quotes[Math.max(q, 0) % settings.quotes.length]
  const open = phase === 'open'

  const enter = () => {
    hovering.current = true
    clearTimeout(closeTimer.current)
    syncInteractive()
  }
  const leave = () => {
    hovering.current = false
    syncInteractive()
    if (open && !s.pressed && s.mode === 'idle') startClose(1000)
  }

  const openNow = () => {
    clearTimeout(closeTimer.current)
    window.pet.getSettings().then(setSettings) // picks up edits to settings.json without a restart
    if (!open) setQ((n) => n + 1)
    setPhase('open')
  }
  const petIt = () => {
    if (s.dragged) { // the click that ends a drag isn't a pet
      s.dragged = false
      return
    }
    const h = { id: Math.random(), left: 70 + Math.round(Math.random() * 60), top: 10 + Math.round(Math.random() * 30) }
    setJump((j) => j + 1)
    setHearts((hs) => [...hs, h])
    setTimeout(() => setHearts((hs) => hs.filter((x) => x !== h)), 1000)
  }

  const onPointerDown = (e) => {
    if (e.button !== 0 || !open) return
    e.currentTarget.setPointerCapture(e.pointerId)
    clearTimeout(closeTimer.current)
    Object.assign(s, {
      pressed: true, dragged: false,
      downX: e.clientX, downY: e.clientY, px: e.clientX, py: e.clientY, lastMove: e.timeStamp, pvx: 0, pvy: 0,
      grabX: e.clientX - s.x.p, grabY: e.clientY - s.y.p,
    })
    syncInteractive()
  }
  const onPointerMove = (e) => {
    if (!s.pressed) return
    const dt = (e.timeStamp - s.lastMove) / 1000
    if (dt > 0) { // ~50 ms exponential smoothing of pointer velocity
      const a = 1 - Math.exp(-dt / 0.05)
      s.pvx += ((e.clientX - s.px) / dt - s.pvx) * a
      s.pvy += ((e.clientY - s.py) / dt - s.pvy) * a
    }
    s.px = e.clientX
    s.py = e.clientY
    s.lastMove = e.timeStamp
    if (!s.dragged) {
      if (Math.hypot(e.clientX - s.downX, e.clientY - s.downY) < 5) return
      s.dragged = true
      setMoving(true)
    }
    s.mode = 'drag'
    s.tx = clamp(e.clientX - s.grabX, 0, innerWidth - CAT_W)
    s.ty = clamp(e.clientY - s.grabY, 0, innerHeight - CAT_H)
    startLoop()
  }
  const onPointerEnd = () => {
    if (!s.pressed) return // pointerup, pointercancel and lostpointercapture can all fire
    s.pressed = false
    if (!s.dragged) return syncInteractive()
    // Throw: keep the fling's momentum (capped) and aim for the corner it's heading toward.
    const v = Math.hypot(s.pvx, s.pvy)
    const cap = v > 4000 ? 4000 / v : 1
    s.x.v = s.pvx * cap
    s.y.v = s.pvy * cap
    const to = nearestCorner(s.x.p + s.x.v * 0.3, s.y.p + s.y.v * 0.3)
    const h = home(to)
    Object.assign(s, { mode: 'settle', tx: h.x, ty: h.y, squashed: false })
    cornerRef.current = to
    setCorner(to)
    hovering.current = false // the cat flies out from under the cursor
    syncInteractive()
    startLoop()
  }

  return (
    <div className={`stage corner-${corner}${moving ? ' moving' : ''}`}>
      <div className="peekclip">
        <PeekHead c={c} shown={phase === 'peek'} />
      </div>

      {!open && (
        <button
          className="hot"
          aria-label="Say hi to the cat"
          onMouseEnter={() => { enter(); setPhase('peek') }}
          onMouseLeave={() => { leave(); setPhase((p) => (p === 'peek' ? 'hidden' : p)) }}
          onFocus={() => setPhase('peek')}
          onBlur={() => setPhase((p) => (p === 'peek' ? 'hidden' : p))}
          onClick={openNow}
        />
      )}

      <div className="catpos" ref={posRef}>
        <div className={open ? 'catpop open' : 'catpop'}>
          <div className="catjelly" ref={jellyRef}>
            <button
              className="petbtn"
              aria-label="Pet the cat, or drag it to another corner"
              onClick={petIt}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              onLostPointerCapture={onPointerEnd}
              onMouseEnter={enter}
              onMouseLeave={leave}
            >
              <Cat c={c} parts={parts} className={jump ? (jump % 2 ? 'pet jumpA' : 'pet jumpB') : 'pet'} />
            </button>
          </div>
          {hearts.map((h) => (
            <svg key={h.id} className="heart" style={{ left: h.left, top: h.top }} width="30" height="28" viewBox="0 0 24 22" aria-hidden="true">
              <path d="M12 21C12 21 2 14.6 2 8.2A5.2 5.2 0 0 1 12 5.6A5.2 5.2 0 0 1 22 8.2C22 14.6 12 21 12 21Z" fill={c.dark} />
            </svg>
          ))}
        </div>
      </div>

      <div className={open && !moving ? 'cloudwrap show' : 'cloudwrap'} onMouseEnter={enter} onMouseLeave={leave}>
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
    </div>
  )
}
