import { useEffect } from 'react'

const FOCUSABLE = '[tabindex="0"], button:not([disabled]), a[href], input:not([disabled])'

function getVisible() {
  return Array.from(document.querySelectorAll(FOCUSABLE)).filter(el => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
}

function cx(r) { return r.left + r.width / 2 }
function cy(r) { return r.top + r.height / 2 }

function findBest(dir, all, focused) {
  const curr = focused.getBoundingClientRect()
  const fcx = cx(curr), fcy = cy(curr)

  // Try progressively wider cones until something is found.
  // 1.5 = ~56° (strict), 3.0 = ~72°, 10.0 = ~84° (nearly a half-plane).
  // This handles layouts where the next element isn't directly in line —
  // e.g. navigating down from a centred hero button to a left-aligned card row.
  for (const ratio of [1.5, 3.0, 10.0]) {
    let best = null
    let bestScore = Infinity

    for (const el of all) {
      if (el === focused) continue
      const r = el.getBoundingClientRect()
      const ecx = cx(r), ecy = cy(r)
      const dx = ecx - fcx, dy = ecy - fcy

      const inCone =
        (dir === 'left'  && dx < -1 && Math.abs(dy) < Math.abs(dx) * ratio) ||
        (dir === 'right' && dx >  1 && Math.abs(dy) < Math.abs(dx) * ratio) ||
        (dir === 'up'    && dy < -1 && Math.abs(dx) < Math.abs(dy) * ratio) ||
        (dir === 'down'  && dy >  1 && Math.abs(dx) < Math.abs(dy) * ratio)

      if (!inCone) continue

      const primary = (dir === 'left' || dir === 'right') ? Math.abs(dx) : Math.abs(dy)
      const cross   = (dir === 'left' || dir === 'right') ? Math.abs(dy) : Math.abs(dx)
      const score   = primary + cross * 2

      if (score < bestScore) { bestScore = score; best = el }
    }

    if (best) return best
  }

  return null
}

export function useTvNav() {
  useEffect(() => {
    const onKey = (e) => {
      const dir = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[e.key]
      if (!dir) return

      const focused = document.activeElement

      // Nothing focused — pick the first visible focusable element
      if (!focused || focused === document.body) {
        const all = getVisible()
        if (all.length) all[0].focus()
        return
      }

      if (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA') return

      e.preventDefault()

      const best = findBest(dir, getVisible(), focused)
      if (best) best.focus()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
