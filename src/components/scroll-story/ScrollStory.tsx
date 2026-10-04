import { About } from '@/components/About/About'
import { Skills } from '@/components/Skills/Skills'
import { Projects } from '@/components/Projects/Projects'
import { Experience } from '@/components/Experience/Experience'
import { Contact } from '@/components/Contact/Contact'
import { Footer } from '@/components/Footer/Footer'
import { services } from '@/data/services'
import { ScrollStoryHero } from './ScrollStoryHero'
import { HorizontalGallery, type GalleryItem } from './HorizontalGallery'
import { ScrollScene } from './ScrollScene'
import { SceneLayer } from './SceneLayer'
import { MaskedText } from './MaskedText'
import { Parallax } from './Parallax'

/**
 * The Scout-Motors-style reading of the portfolio: one continuously
 * scrolling document, paced by pinned scenes and parallax rather than by
 * discrete section snapping.
 *
 * Most sections are the same components the cinematic mode renders — they
 * already lay out correctly in normal document flow (that is how the
 * reduced-motion fallback has always worked). What changes is the
 * connective tissue: pinned chapter statements between them, parallax
 * offsets, and `Reveal` upgrading itself to a clip-path wipe (see
 * `UI/Reveal.tsx`). "What I Build" is the one swap — its numbered services
 * map directly onto Scout's numbered viewfinder gallery.
 */
export function ScrollStory() {
  const galleryItems: GalleryItem[] = services.map((service) => ({
    id: service.index,
    title: service.title,
    description: service.description,
  }))

  return (
    <>
      <ScrollStoryHero />

      <Parallax speed={0.18}>
        <About />
      </Parallax>

      <StatementScene
        id="statement-craft"
        eyebrow="02 — What I Build"
        statement="Ideas become software that is useful, scalable and easy to maintain."
      />

      <HorizontalGallery
        id="build"
        heading="What I build."
        items={galleryItems}
        aria-label="What I build"
      />

      <Parallax speed={0.14}>
        <Skills />
      </Parallax>

      <StatementScene
        id="statement-work"
        eyebrow="04 — Projects"
        statement="Selected work, built end to end."
      />

      <Projects />

      <Parallax speed={0.14}>
        <Experience />
      </Parallax>

      <Contact />
      <Footer />
    </>
  )
}

interface StatementSceneProps {
  id: string
  eyebrow: string
  statement: string
}

/**
 * A pinned "chapter card" between sections — the beat Scout uses to reset
 * the reader's attention before the next run of content. The statement
 * rises word by word while the eyebrow and rule travel at their own rates.
 */
function StatementScene({ id, eyebrow, statement }: StatementSceneProps) {
  return (
    <ScrollScene id={id} pages={1.8} aria-label={eyebrow}>
      <SceneLayer
        range={[0, 1]}
        y={[8, -8]}
        scale={[1.04, 1]}
        opacity={[0.35, 1]}
        className="container-portfolio relative text-center"
      >
        <p className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          {eyebrow}
        </p>
        <MaskedText
          as="p"
          text={statement}
          stagger={40}
          className="mx-auto mt-10 max-w-4xl text-balance font-display text-[8vw] font-medium leading-[1.06] tracking-tight text-white md:text-[3.6rem]"
        />
      </SceneLayer>

      <SceneLayer
        range={[0, 1]}
        x={[-12, 12]}
        className="pointer-events-none absolute inset-x-0 bottom-[18%] flex justify-center"
      >
        <span className="h-px w-[min(70vw,900px)] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </SceneLayer>
    </ScrollScene>
  )
}
