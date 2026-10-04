import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { Navbar } from '@/components/Navbar/Navbar'
import { Hero } from '@/components/Hero/Hero'
import { About } from '@/components/About/About'
import { Services } from '@/components/Services/Services'
import { Skills } from '@/components/Skills/Skills'
import { Projects } from '@/components/Projects/Projects'
import { Experience } from '@/components/Experience/Experience'
import { Contact } from '@/components/Contact/Contact'
import { Footer } from '@/components/Footer/Footer'
import { CustomCursor } from '@/components/UI/CustomCursor'
import { SkipLink } from '@/components/UI/SkipLink'
import { SectionLayer } from '@/components/UI/SectionLayer'
import { useSectionScroller } from '@/hooks/useSectionScroller'
import { SectionScrollerContext } from '@/hooks/SectionScrollerContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { useMotionStyle } from '@/hooks/useMotionStyle'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { SECTIONS, NAV_SECTIONS, sectionIndex } from '@/data/sections'

// The 3D liquid background is the heaviest dependency (three.js + fiber) —
// lazy-load it so first paint (text, layout) never waits on the WebGL bundle.
const LiquidBackground = lazy(() =>
  import('@/components/3d/LiquidBackground/LiquidBackground').then((m) => ({ default: m.LiquidBackground })),
)

// The scroll-story mode's scene machinery is only needed if the visitor has
// chosen it, so it is split out of the initial bundle the same way.
const ScrollStory = lazy(() =>
  import('@/components/scroll-story/ScrollStory').then((m) => ({ default: m.ScrollStory })),
)

// SECTIONS (id + z-depth + optional nav label) is the single source of
// truth for section order — see src/data/sections.ts. Component order here
// must stay in lockstep with that array.
const SECTION_COMPONENTS = [Hero, About, Services, Skills, Projects, Experience, Contact]

function App() {
  const reducedMotion = useReducedMotion()
  const { tier, isTouch } = useDeviceTier()
  const [motionStyle] = useMotionStyle()

  // Three mutually-exclusive motion systems, in precedence order:
  //   reduced motion  -> plain document, no scroll effects at all
  //   'cinematic'     -> scroll is hijacked into a section-snap camera dolly
  //   'scroll-story'  -> real scrolling, lerped, with pinned scroll scenes
  // Cinematic and scroll-story cannot coexist: one takes scroll away, the
  // other is driven by it.
  const cinematicEnabled = !reducedMotion && motionStyle === 'cinematic'
  const storyEnabled = !reducedMotion && motionStyle === 'scroll-story'

  const scroller = useSectionScroller(SECTIONS, cinematicEnabled)
  useSmoothScroll(storyEnabled)

  // Deep-linking: on load, if the URL has a hash matching a section, jump
  // straight there (no animated fly-through on initial load).
  useEffect(() => {
    // Only the cinematic scroller needs this: in the other modes the browser
    // resolves the hash natively, and calling goTo would spin up an 850ms
    // transition for a scroller that isn't driving anything.
    if (!cinematicEnabled) return
    const hash = window.location.hash.replace('#', '')
    const index = sectionIndex(hash)
    if (index > 0) scroller.goTo(index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the URL hash in sync with the active section (without triggering
  // a native jump), so links, refresh and browser history stay meaningful.
  useEffect(() => {
    if (!cinematicEnabled) return
    if (scroller.phase !== 'idle') return
    const id = SECTIONS[scroller.index]?.id
    if (id && window.location.hash !== `#${id}`) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }, [cinematicEnabled, scroller.phase, scroller.index])

  // Switching motion style remounts the entire page structure, which resets
  // scroll to the top. Carry the reader's place across the switch by jumping
  // to whichever section they were last on.
  const previousStyle = useRef(motionStyle)
  useEffect(() => {
    if (previousStyle.current === motionStyle) return
    previousStyle.current = motionStyle
    const id = window.location.hash.replace('#', '')
    if (!id) return
    if (motionStyle === 'cinematic') {
      const index = sectionIndex(id)
      if (index > 0) scroller.goTo(index)
    } else {
      // Let the new layout mount and lay out before measuring its position.
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' })
      })
    }
  }, [motionStyle, scroller])

  const mobileSimplified = tier === 'mobile' || isTouch

  const scrollerApi = useMemo(
    () => (cinematicEnabled ? scroller : null),
    [cinematicEnabled, scroller],
  )

  return (
    <SectionScrollerContext.Provider value={scrollerApi}>
      <SkipLink />
      <CustomCursor />

      {/* Fixed liquid background sits behind all content */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={null}>
          <LiquidBackground scroller={scrollerApi ?? undefined} />
        </Suspense>
      </div>

      <Navbar />

      {cinematicEnabled ? (
        <main id="main-content" className="relative" aria-label="Portfolio sections">
          {SECTIONS.map((section, index) => {
            const Component = SECTION_COMPONENTS[index]
            const isLast = index === SECTIONS.length - 1
            return (
              <SectionLayer key={section.id} id={section.id} index={index}>
                <Component />
                {isLast && <Footer />}
              </SectionLayer>
            )
          })}
        </main>
      ) : storyEnabled ? (
        <div className="relative z-10">
          <main id="main-content">
            <Suspense fallback={null}>
              <ScrollStory />
            </Suspense>
          </main>
        </div>
      ) : (
        <div className="relative z-10">
          <main id="main-content">
            <Hero />
            <About />
            <Services />
            <Skills />
            <Projects />
            <Experience />
            <Contact />
          </main>
          <Footer />
        </div>
      )}

      {cinematicEnabled && !mobileSimplified && (
        <SectionDots activeIndex={scroller.targetIndex} onSelect={scroller.goTo} />
      )}
    </SectionScrollerContext.Provider>
  )
}

interface SectionDotsProps {
  activeIndex: number
  onSelect: (index: number) => void
}

/** Minimal side rail showing current position among sections + direct jump. */
function SectionDots({ activeIndex, onSelect }: SectionDotsProps) {
  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
    >
      {NAV_SECTIONS.map((item) => {
        const index = sectionIndex(item.id)
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Go to ${item.navLabel}`}
            aria-current={activeIndex === index ? 'true' : undefined}
            className="group relative flex h-4 w-4 items-center justify-center"
          >
            <span
              className={`rounded-full border transition-all duration-300 ${
                activeIndex === index
                  ? 'h-2 w-2 border-white bg-white'
                  : 'h-1.5 w-1.5 border-white/30 bg-transparent group-hover:border-white/70'
              }`}
            />
          </button>
        )
      })}
    </nav>
  )
}

export default App
