import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import type { PanelKey } from '../engine/types'

const AUTO_DISMISS_MS = 6000

/**
 * Small "New" pill rendered next to a panel header the first time the panel
 * becomes visible. Reads `newlyRevealedPanels` from the store; dismisses on
 * click or after AUTO_DISMISS_MS. Renders nothing once dismissed.
 */
export default function PanelRevealBadge({ panel }: { panel: PanelKey }) {
  const isNew = useGameStore((s) => s.newlyRevealedPanels.has(panel))
  const dismiss = useGameStore((s) => s.dismissPanelReveal)

  useEffect(() => {
    if (!isNew) return
    const id = window.setTimeout(() => dismiss(panel), AUTO_DISMISS_MS)
    return () => window.clearTimeout(id)
  }, [isNew, panel, dismiss])

  if (!isNew) return null

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        dismiss(panel)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); dismiss(panel) }
      }}
      aria-label={`New panel: ${panel}. Click to dismiss.`}
      style={{
        marginLeft: '6px',
        padding: '1px 6px',
        background: 'var(--color-accent-orange)',
        color: 'var(--color-base)',
        borderRadius: '999px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.5625rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        cursor: 'pointer',
        animation: 'panel-reveal-pulse 1.6s ease-in-out infinite',
      }}
    >
      New
    </span>
  )
}
