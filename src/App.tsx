import { useEffect, useRef } from 'react'
import Header from './components/Header'
import IntroPage from './components/IntroPage'
import Workspace from './components/Workspace'
import { useGameStore } from './store/gameStore'
import { useIsMobile } from './hooks/useIsMobile'
import MobileLayout from './components/MobileLayout'

function parseLessonHash(): number | null {
  const m = window.location.hash.match(/^#\/lesson\/(\d+)$/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

export default function App() {
  const loadLesson = useGameStore((s) => s.loadLesson)
  const currentLessonId = useGameStore((s) => s.currentLessonId)
  const theme = useGameStore((s) => s.theme)
  const initializedRef = useRef(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : ''
  }, [theme])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const fromHash = parseLessonHash()
    const resumeId = fromHash ?? 0
    loadLesson(resumeId).catch((err) => {
      console.error('Failed to initialise lesson on startup:', err)
    })
  }, [loadLesson])

  useEffect(() => {
    if (!initializedRef.current) return
    const target = `#/lesson/${currentLessonId}`
    if (window.location.hash !== target) {
      window.history.replaceState(null, '', target)
    }
  }, [currentLessonId])

  useEffect(() => {
    const onHashChange = () => {
      const id = parseLessonHash()
      if (id !== null && id !== useGameStore.getState().currentLessonId) {
        loadLesson(id).catch(() => undefined)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [loadLesson])

  const isIntro = currentLessonId === 0

  if (isMobile) {
    return (
      <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-base)' }}>
        <Header />
        <div className="flex-1 overflow-hidden">
          {isIntro ? <IntroPage /> : <MobileLayout />}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-base)' }}>
      <Header />
      {isIntro ? <IntroPage /> : <Workspace />}
    </div>
  )
}
