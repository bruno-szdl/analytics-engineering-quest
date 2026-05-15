import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Celebration block shown in LessonPanel after the final lesson's tasks all
 * complete. Renders a small confetti burst (pure CSS, no library), a headline,
 * suggested next steps, and a share link. Replaces the previous one-line
 * "you've finished" success box.
 */
export default function CourseComplete() {
  // Stable confetti so re-renders during the celebration don't reshuffle
  // dots. `useState`'s lazy initializer is the React-sanctioned way to do
  // impure work once; `useMemo` would trip react-hooks/purity.
  const [confetti] = useState(() => {
    const palette = ['var(--color-accent-orange)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-text)']
    return Array.from({ length: 22 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 600,
      color: palette[i % palette.length],
      size: 4 + Math.random() * 4,
    }))
  })

  const loadLesson = useGameStore((s) => s.loadLesson)
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://dbtquest.com')}`

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--color-success-border)',
        background: 'var(--color-success-bg)',
        borderRadius: '8px',
        padding: '20px 18px 18px',
      }}
    >
      {/* confetti — purely decorative, hidden from assistive tech */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {confetti.map((c, i) => (
          <span
            key={i}
            className="sparkle"
            style={{
              left: `${c.left}%`,
              top: '50%',
              width: `${c.size}px`,
              height: `${c.size}px`,
              background: c.color,
              animationDelay: `${c.delay}ms`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          color: 'var(--color-accent-orange)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        Course complete
      </div>
      <h3
        style={{
          margin: '0 0 10px',
          color: 'var(--color-text)',
          fontFamily: 'IBM Plex Sans, sans-serif',
          fontSize: '1.0625rem',
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        You finished dbt-quest 🎉
      </h3>
      <p
        style={{
          margin: '0 0 14px',
          color: 'var(--color-text-secondary)',
          fontSize: '0.875rem',
          lineHeight: 1.6,
        }}
      >
        You can read any real dbt project now: sources, models, refs, materializations,
        seeds, tests, docs, selectors, <code style={inlineCode}>dbt build</code>. That's the toolkit.
      </p>

      <div style={{ marginBottom: '12px' }}>
        <SubLabel>What to do next</SubLabel>
        <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <NextStep>
            Install dbt locally: <ExtLink href="https://docs.getdbt.com/docs/core/installation-overview">dbt Core install guide</ExtLink>
          </NextStep>
          <NextStep>
            Open an existing project on GitHub (try <ExtLink href="https://github.com/dbt-labs/jaffle-shop">jaffle-shop</ExtLink>) and read the DAG end-to-end.
          </NextStep>
          <NextStep>
            Skim the official docs you didn't see here: <ExtLink href="https://docs.getdbt.com/docs/build/jinja-macros">macros</ExtLink>, <ExtLink href="https://docs.getdbt.com/docs/build/incremental-models">incremental models</ExtLink>, <ExtLink href="https://docs.getdbt.com/docs/build/snapshots">snapshots</ExtLink>, <ExtLink href="https://docs.getdbt.com/docs/build/packages">packages</ExtLink>.
          </NextStep>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            fontSize: '0.8125rem',
            textDecoration: 'none',
          }}
        >
          Share on LinkedIn →
        </a>
        <button
          onClick={() => void loadLesson(0)}
          style={{
            padding: '8px 14px',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontWeight: 500,
          }}
        >
          Back to intro
        </button>
      </div>
    </div>
  )
}

const inlineCode = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '0.85em',
  background: 'var(--color-base)',
  padding: '1px 4px',
  borderRadius: '3px',
  border: '1px solid var(--color-border-subtle)',
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        color: 'var(--color-text-muted)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.625rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}
    >
      {children}
    </div>
  )
}

function NextStep({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem', lineHeight: 1.55 }}>
      <span style={{ color: 'var(--color-accent-orange)', flexShrink: 0 }}>→</span>
      <span>{children}</span>
    </li>
  )
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: 'var(--color-accent-orange)', textDecoration: 'underline' }}
    >
      {children}
    </a>
  )
}
