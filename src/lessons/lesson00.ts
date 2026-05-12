import type { Lesson } from '../engine/types'

/**
 * Lesson 0 is the introductory page — rendered as a full-width article by
 * `<IntroPage />`, not by `<LessonPanel />`. The fields below exist only so
 * `getLessonById(0)` resolves and the lesson selector / hash routing work.
 */
const lesson00: Lesson = {
  id: 0,
  title: 'Introduction',
  concept: '',
  initialFiles: {},
  tasks: [],
  // No workspace panels are rendered for the intro — keep `seenPanels` empty
  // so lesson 1 starts with the SQLBolt-minimal layout.
  panels: [],
}

export default lesson00
