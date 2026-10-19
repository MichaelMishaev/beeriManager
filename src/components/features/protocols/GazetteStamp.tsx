'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './gazette-stamp.module.css'

export type GazetteStampInk = 'blue' | 'red'

export interface GazetteStampProps {
  /** Big centre word, e.g. "מאושר" / "Утверждено" */
  label: string
  /** Text curved along the top of the ring */
  org: string
  /** Year shown along the bottom of the ring */
  year: string
  /** Text knocked out of the ribbon band (empty string = no ribbon) */
  ribbon: string
  ariaLabel: string
  /** Layout box in px (width = height). Default 150 */
  size?: number
  className?: string
  /** Ink colour. 'blue' = Prussian blue #003153 (default), 'red' = official red #8b1a1a */
  ink?: GazetteStampInk
  /** Tiny repeated text on the inner micro-lettering ring. Empty/omitted = guilloche wave instead */
  microText?: string
}

/**
 * armed – SSR + first client render, waiting for the viewport (hidden & hovering via CSS
 *         only when motion is allowed; reduced-motion / no-JS see the final state).
 * play  – hover → strike → impact → wet-in → settle (once).
 * done  – final inked state.
 */
type Phase = 'armed' | 'play' | 'done'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const PALETTE: Record<GazetteStampInk, { ink: string; bleed: string; wet: string }> = {
  blue: { ink: '#003153', bleed: '#0b3b60', wet: '#001a2c' },
  red: { ink: '#8b1a1a', bleed: '#9c2626', wet: '#4d0a0a' },
}

// Inherits the host page's label stack (--label), which puts the Cyrillic face first on ru pages:
// next/font's per-family fallback faces claim every codepoint, so a plain chain never reaches Noto Serif.
const FONT = 'var(--label), serif'
const C = 100 // viewBox centre (viewBox is 0 0 200 200)
const PLAY_MS = 2100

/** Deterministic hash → stable per-stamp seeds (SSR == client, no Math.random). */
function hashSeed(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (Math.abs(h) % 900) + 7
}

/** Small deterministic PRNG (mulberry32) for speck placement. */
function prng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f2 = (n: number) => n.toFixed(2)

function circle(r: number): string {
  return `M${C - r} ${C}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
}

/** Notary-style crimped edge: zig-zag outer boundary, filled down to rInner. */
function serrated(rOut: number, rIn: number, rInner: number, teeth: number): string {
  const pts: string[] = []
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn
    const a = (i / (teeth * 2)) * Math.PI * 2
    pts.push(`${f2(C + r * Math.cos(a))} ${f2(C + r * Math.sin(a))}`)
  }
  return `M${pts.join('L')}Z${circle(rInner)}`
}

/** Guilloche wave circle: r(θ) = r0 + amp·sin(freq·θ + phase) */
function wave(r0: number, amp: number, freq: number, phase: number, steps = 360): string {
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const r = r0 + amp * Math.sin(freq * t + phase)
    pts.push(`${f2(C + r * Math.cos(t))} ${f2(C + r * Math.sin(t))}`)
  }
  return `M${pts.join('L')}Z`
}

function star(cx: number, cy: number, r: number, rot = -90): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.42
    const a = ((rot + i * 36) * Math.PI) / 180
    pts.push(`${f2(cx + rr * Math.cos(a))} ${f2(cy + rr * Math.sin(a))}`)
  }
  return `M${pts.join('L')}Z`
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

export function GazetteStamp({
  label,
  org,
  year,
  ribbon,
  ariaLabel,
  size = 150,
  className,
  ink = 'blue',
  microText = '',
}: GazetteStampProps) {
  const uid = `gzs${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const rootRef = useRef<HTMLDivElement>(null)
  // Server + first client render are 'armed' (identical markup → no hydration mismatch,
  // no flash of the finished stamp). CSS only hides 'armed' under
  // prefers-reduced-motion: no-preference; <noscript> reveals it without JS.
  const [phase, setPhase] = useState<Phase>('armed')
  const playedRef = useRef(false)

  useIsoLayoutEffect(() => {
    const el = rootRef.current
    if (!el || playedRef.current) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      playedRef.current = true
      setPhase('done')
      return
    }

    let timer: number | undefined
    const play = () => {
      playedRef.current = true
      setPhase('play')
      // after the last keyframe drop to the identical static state (frees GPU layers)
      timer = window.setTimeout(() => setPhase('done'), PLAY_MS)
    }

    if (typeof IntersectionObserver === 'undefined') {
      play()
      return () => {
        if (timer !== undefined) window.clearTimeout(timer)
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        play()
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (timer !== undefined) {
        window.clearTimeout(timer)
        // unmounted/re-run mid-animation (e.g. StrictMode): settle on the final state
        setPhase('done')
      }
    }
  }, [])

  const colors = PALETTE[ink] ?? PALETTE.blue
  const seed = hashSeed(`${label}|${org}|${year}|${ink}`)
  const hasRibbon = ribbon.trim().length > 0
  const micro = microText.trim()

  // Heuristic font fitting (no DOM measuring → identical on server and client)
  const orgFs = clamp(190 / (Math.max(org.length, 1) * 0.6), 10, 15)
  const labelFs = clamp(116 / (Math.max(label.length, 1) * 0.57), 15, 34)
  const ribbonFs = clamp(108 / (Math.max(ribbon.length, 1) * 0.56), 9.5, 13)
  const labelY = hasRibbon ? C + labelFs * 0.34 - 1 : C + labelFs * 0.34 + 4
  const microRepeat = micro ? Math.max(1, Math.ceil(240 / (micro.length + 3))) : 0
  const microLine = micro ? Array.from({ length: microRepeat }, () => `${micro} • `).join('') : ''

  const id = (k: string) => `${uid}-${k}`
  const url = (k: string) => `url(#${id(k)})`

  // ink splatter specks flicked outward on impact (deterministic)
  const rnd = prng(seed * 7919)
  const specks = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 + rnd() * 0.7
    const dist = 0.53 + rnd() * 0.07 // fraction of size from centre
    const d = (0.9 + rnd() * 1.6) * (size / 150)
    const fx = -Math.cos(a) * size * 0.07
    const fy = -Math.sin(a) * size * 0.07
    return {
      key: i,
      style: {
        left: `${f2(50 + Math.cos(a) * dist * 100)}%`,
        top: `${f2(50 + Math.sin(a) * dist * 100)}%`,
        width: `${f2(d)}px`,
        height: `${f2(d * (0.75 + rnd() * 0.5))}px`,
        ['--fx' as string]: `${f2(fx)}px`,
        ['--fy' as string]: `${f2(fy)}px`,
        ['--o' as string]: f2(0.45 + rnd() * 0.45),
        animationDelay: `${640 + Math.round(rnd() * 60)}ms`,
      } as CSSProperties,
    }
  })

  const rootStyle = {
    width: size,
    height: size,
    ['--gzs-ink' as string]: colors.ink,
  } as CSSProperties

  const art = `#${id('art')}`

  const sel = (k: keyof typeof styles) => `.${styles.stamp}[data-state] .${styles[k]}`
  const noscriptCss =
    `<style>${sel('press')}{opacity:1!important;transform:rotate(-8deg)!important}` +
    `${sel('ink')}{opacity:.94!important}${sel('bleed')}{opacity:.26!important}` +
    `${sel('ghost')}{opacity:.16!important}${sel('dent')}{opacity:1!important}` +
    `${sel('speck')}{opacity:var(--o,.7)!important}</style>`

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={ariaLabel}
      data-state={phase}
      data-ink={ink}
      className={[styles.stamp, className].filter(Boolean).join(' ')}
      style={rootStyle}
    >
      {/* No-JS: reveal the final inked state (string is identical on server & client) */}
      <noscript dangerouslySetInnerHTML={{ __html: noscriptCss }} />

      {/* Shared defs: zero-size (NOT display:none, which breaks filters/masks in some engines) */}
      <svg className={styles.defs} width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <path id={id('top')} d={`M${C - 68} ${C}A68 68 0 0 1 ${C + 68} ${C}`} />
          <path id={id('bot')} d={`M${C - 78.5} ${C}A78.5 78.5 0 0 0 ${C + 78.5} ${C}`} />
          <path id={id('micro')} d={`M${C - 83.6} ${C}A83.6 83.6 0 1 1 ${C + 83.6} ${C}A83.6 83.6 0 1 1 ${C - 83.6} ${C}`} />

          {/* one side pressed harder than the other */}
          <linearGradient id={id('pg')} gradientUnits="userSpaceOnUse" x1="38" y1="22" x2="176" y2="186">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.55" stopColor="#f0f0f0" />
            <stop offset="1" stopColor="#8f8f8f" />
          </linearGradient>
          <mask id={id('press')} maskUnits="userSpaceOnUse" x="-10" y="-10" width="220" height="220">
            <rect x="-10" y="-10" width="220" height="220" fill={url('pg')} />
          </mask>

          {/* guilloche is interrupted where the label/ribbon band crosses */}
          <mask id={id('gm')} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
            <rect width="200" height="200" fill="#fff" />
            <rect x="0" y={hasRibbon ? 84 : 82} width="200" height={hasRibbon ? 56 : 40} fill="#000" />
          </mask>

          {hasRibbon && (
            <mask id={id('rk')} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
              <rect width="200" height="200" fill="#fff" />
              <text
                x={C}
                y={126 + ribbonFs * 0.36}
                fill="#000"
                fontSize={ribbonFs}
                fontWeight={800}
                textAnchor="middle"
                letterSpacing={0.4}
                style={{ fontFamily: FONT }}
              >
                {ribbon}
              </text>
            </mask>
          )}

          {/* Main ink: rough edge + patchy pressure + grain + pinholes + paper fibres */}
          <filter id={id('ink')} filterUnits="userSpaceOnUse" x="-12" y="-12" width="224" height="224" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={3} seed={seed} result="en" />
            <feDisplacementMap in="SourceGraphic" in2="en" scale="2.1" xChannelSelector="R" yChannelSelector="G" result="rough" />
            <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves={2} seed={seed + 1} result="pn" />
            <feColorMatrix in="pn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.6 0 0 0 -0.72" result="pressure" />
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={seed + 2} result="gn" />
            <feColorMatrix in="gn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.2 0 0 0 -0.1" result="grain" />
            <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves={1} seed={seed + 3} result="hn" />
            <feColorMatrix in="hn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -16 0 0 0 11.6" result="holes" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.045" numOctaves={1} seed={seed + 4} result="fn" />
            <feColorMatrix in="fn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -10 0 0 0 8.2" result="fibres" />
            <feComposite in="rough" in2="pressure" operator="in" result="a" />
            <feComposite in="a" in2="grain" operator="in" result="b" />
            <feComponentTransfer in="b" result="c">
              <feFuncA type="linear" slope="2.1" intercept="-0.16" />
            </feComponentTransfer>
            <feComposite in="c" in2="holes" operator="in" result="d" />
            <feComposite in="d" in2="fibres" operator="in" />
          </filter>

          {/* Bleed halo: same rough edge, fattened + softened into the fibres */}
          <filter id={id('bleed')} filterUnits="userSpaceOnUse" x="-12" y="-12" width="224" height="224" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={3} seed={seed} result="en" />
            <feDisplacementMap in="SourceGraphic" in2="en" scale="2.1" xChannelSelector="R" yChannelSelector="G" result="rough" />
            <feMorphology in="rough" operator="dilate" radius="0.5" result="fat" />
            <feGaussianBlur in="fat" stdDeviation="1.2" />
          </filter>

          {/* Wet ink body with specular glint */}
          <filter id={id('wet')} filterUnits="userSpaceOnUse" x="-12" y="-12" width="224" height="224" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={3} seed={seed} result="en" />
            <feDisplacementMap in="SourceGraphic" in2="en" scale="2.1" xChannelSelector="R" yChannelSelector="G" result="rough" />
            <feGaussianBlur in="rough" stdDeviation="0.9" result="bump" />
            <feSpecularLighting in="bump" surfaceScale="2.4" specularConstant="0.8" specularExponent="18" lightingColor="#ffffff" result="spec">
              <feDistantLight azimuth="225" elevation="50" />
            </feSpecularLighting>
            <feComposite in="spec" in2="rough" operator="in" result="glint" />
            <feMerge>
              <feMergeNode in="rough" />
              <feMergeNode in="glint" />
            </feMerge>
          </filter>

          {/* The artwork. Fills inherit the <use fill>; hairlines use currentColor (<use color>). */}
          <g id={id('art')} style={{ fontFamily: FONT }}>
            {/* crimped outer edge + double rule */}
            <path d={serrated(98, 94.6, 91.2, 84)} fillRule="evenodd" />
            <path d={circle(89.6) + circle(88.7)} fillRule="evenodd" />

            {/* micro-lettering ring, or a fine guilloche wave when no micro text */}
            {micro ? (
              <text fontSize={3.6} fontWeight={600} letterSpacing={0.25} textAnchor="middle">
                <textPath href={`#${id('micro')}`} startOffset="50%">
                  {microLine}
                </textPath>
              </text>
            ) : (
              <path d={wave(84.6, 1.3, 72, 0, 720)} fill="none" stroke="currentColor" strokeWidth={0.45} />
            )}
            <path d={circle(81.6) + circle(81.0)} fillRule="evenodd" />

            <text fontSize={orgFs} fontWeight={700} textAnchor="middle" letterSpacing={0.5}>
              <textPath href={`#${id('top')}`} startOffset="50%">
                {org}
              </textPath>
            </text>
            <text fontSize={13.5} fontWeight={700} textAnchor="middle" letterSpacing={2.2}>
              <textPath href={`#${id('bot')}`} startOffset="50%">
                {year}
              </textPath>
            </text>

            {/* ring separators (9 and 3 o'clock) + flanking the year */}
            <path d={star(C - 72.5, C, 5.2)} />
            <path d={star(C + 72.5, C, 5.2)} />
            <path d={star(C - 40, C + 60.5, 3)} />
            <path d={star(C + 40, C + 60.5, 3)} />

            {/* inner double rule */}
            <path d={circle(61.4) + circle(60.2)} fillRule="evenodd" />
            <path d={circle(58.9) + circle(58.4)} fillRule="evenodd" />

            {/* guilloche security band (crossing sine circles) */}
            <g mask={url('gm')} fill="none" stroke="currentColor" strokeWidth={0.42}>
              <path d={wave(53.4, 2.6, 20, 0)} />
              <path d={wave(53.4, 2.6, 20, Math.PI)} />
              <path d={wave(53.4, 1.6, 30, Math.PI / 2)} />
            </g>

            {/* central rosette ornament */}
            <g fill="none" stroke="currentColor" strokeWidth={0.55}>
              {[0, 30, 60, 90, 120, 150].map((r) => (
                <ellipse key={r} cx={C} cy={hasRibbon ? 70 : 68} rx={8.6} ry={2.7} transform={`rotate(${r} ${C} ${hasRibbon ? 70 : 68})`} />
              ))}
            </g>
            <path d={star(C, hasRibbon ? 70 : 68, 3.2)} />

            {/* thin double rule */}
            <rect x={C - 32} y={hasRibbon ? 80.6 : 79} width="64" height="1.2" />
            <rect x={C - 26} y={hasRibbon ? 82.8 : 81.2} width="52" height="0.5" />

            <text x={C} y={labelY} fontSize={labelFs} fontWeight={800} textAnchor="middle" letterSpacing={labelFs > 26 ? 0.5 : 0.2}>
              {label}
            </text>

            {hasRibbon ? (
              <path d="M31 116.5H169L161 126L169 135.5H31L39 126Z" mask={url('rk')} />
            ) : (
              <>
                <rect x={C - 32} y={labelY + 9} width="64" height="1.2" />
                <rect x={C - 26} y={labelY + 11.2} width="52" height="0.5" />
              </>
            )}
          </g>
        </defs>
      </svg>

      {/* paper dent (embossed impression) – normal blend so its highlight shows */}
      <div className={styles.dent} aria-hidden="true" />
      <div className={styles.shadow} aria-hidden="true" />

      {/* everything below multiplies into the paper */}
      <div className={styles.jolt} aria-hidden="true">
        <div className={styles.shock} />
        {specks.map((s) => (
          <span key={s.key} className={styles.speck} style={s.style} />
        ))}
        <div className={styles.press}>
          <svg className={`${styles.layer} ${styles.ghost}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
            <use href={art} fill={colors.ink} color={colors.ink} filter={url('ink')} />
          </svg>
          <svg className={`${styles.layer} ${styles.bleed}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
            <use href={art} fill={colors.bleed} color={colors.bleed} filter={url('bleed')} />
          </svg>
          <svg className={`${styles.layer} ${styles.ink}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
            <g mask={url('press')}>
              <use href={art} fill={colors.ink} color={colors.ink} filter={url('ink')} />
            </g>
          </svg>
          <svg className={`${styles.layer} ${styles.wet}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
            <use href={art} fill={colors.wet} color={colors.wet} filter={url('wet')} />
          </svg>
          <div className={styles.sheenClip}>
            <div className={styles.sheen} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GazetteStamp
