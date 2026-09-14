import { lazy, Suspense, useEffect, useMemo } from 'react'
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
import { SECTIONS, NAV_SECTIONS, sectionIndex } from '@/data/sections'

// The 3D liquid background is the heaviest dependency (three.js + fiber) —
// lazy-load it so first paint (text, layout) never waits on the WebGL bundle.
const LiquidBackground = lazy(() =>
  import('@/components/3d/LiquidBackground/LiquidBackground').then((m) => ({ default: m.LiquidBackground })),
)

// SECTIONS (id + z-depth + optional nav label) is the single source of
// truth for section order — see src/data/sections.ts. Component order here
// must stay in lockstep with that array.
const SECTION_COMPONENTS = [Hero, About, Services, Skills, Projects, Experience, Contact]

function App() {
  const reducedMotion = useReducedMotion()
  const { tier, isTouch } = useDeviceTier()

  // The full scroll-hijack camera-dolly experience is desktop/tablet only —
  // under reduced motion (or as a robustness fallback) the site renders as a
  // normal, fully-scrollable document with simple CSS section transitions.
  const cinematicEnabled = !reducedMotion

  const scroller = useSectionScroller(SECTIONS, cinematicEnabled)

  // Deep-linking: on load, if the URL has a hash matching a section, jump
  // straight there (no animated fly-through on initial load).
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const index = sectionIndex(hash)
    if (index > 0) scroller.goTo(index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the URL hash in sync with the active section (without triggering
  // a native jump), so links, refresh and browser history stay meaningful.
  useEffect(() => {
    if (scroller.phase !== 'idle') return
    const id = SECTIONS[scroller.index]?.id
    if (id && window.location.hash !== `#${id}`) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }, [scroller.phase, scroller.index])

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
