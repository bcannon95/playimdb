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

export function useTvNav() {
  useEffect(() => {
    const onKey = (e) => {
      const dir = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[e.key]
      if (!dir) return

      const focused = document.activeElement
      if (!focused || focused === document.body) return
      // Let text inputs handle their own arrow keys
      if (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA') return

      e.preventDefault()

      const all = getVisible()
      const curr = focused.getBoundingClientRect()
      const fcx = cx(curr)
      const fcy = cy(curr)

      let best = null
      let bestScore = Infinity

      for (const el of all) {
        if (el === focused) continue
        const r = el.getBoundingClientRect()
        const ecx = cx(r)
        const ecy = cy(r)
        const dx = ecx - fcx
        const dy = ecy - fcy

        // Element must be in the correct direction (cone test)
        const inCone =
          (dir === 'left'  && dx < -1 && Math.abs(dy) < Math.abs(dx) * 1.5) ||
          (dir === 'right' && dx >  1 && Math.abs(dy) < Math.abs(dx) * 1.5) ||
          (dir === 'up'    && dy < -1 && Math.abs(dx) < Math.abs(dy) * 1.5) ||
          (dir === 'down'  && dy >  1 && Math.abs(dx) < Math.abs(dy) * 1.5)

        if (!inCone) continue

        // Score: primary axis distance + weighted cross-axis penalty
        const primary = (dir === 'left' || dir === 'right') ? Math.abs(dx) : Math.abs(dy)
        const cross   = (dir === 'left' || dir === 'right') ? Math.abs(dy) : Math.abs(dx)
        const score   = primary + cross * 2

        if (score < bestScore) {
          bestScore = score
          best = el
        }
      }

      if (best) best.focus()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
