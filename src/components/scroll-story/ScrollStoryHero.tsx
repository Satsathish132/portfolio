import { ScrollScene } from './ScrollScene'
import { SceneLayer } from './SceneLayer'
import { MaskedText } from './MaskedText'
import { MagneticButton } from '@/components/UI/MagneticButton'
import { useGoToSection } from '@/hooks/useGoToSection'

/**
 * The scroll-story opening: a pinned scene the reader scrolls *through*
 * rather than past. Over ~2.5 screens the headline rises and recedes, a
 * second statement takes its place, and oversized ghost type drifts behind
 * both at a different rate to build depth.
 *
 * With no photography in the project, depth is carried typographically —
 * scale, blur and differential travel rather than parallaxed imagery.
 */
export function ScrollStoryHero() {
  const goToSection = useGoToSection()

  return (
    <ScrollScene id="home" pages={2.6} aria-label="Introduction">
      {/* Oversized ghost type — the slowest, furthest layer. */}
      <SceneLayer
        range={[0, 1]}
        y={[12, -18]}
        opacity={[0.05, 0.015]}
        scale={[1, 1.18]}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 0 }}
      >
        <span className="select-none whitespace-nowrap font-display text-[34vw] font-medium leading-none tracking-tighter text-white">
          DEVELOPER
        </span>
      </SceneLayer>

      {/* Hairline horizon — a mid-depth reference the eye can track. */}
      <SceneLayer
        range={[0, 1]}
        y={[30, -30]}
        opacity={[0, 0.5]}
        className="pointer-events-none absolute inset-x-0 top-1/2 flex justify-center"
        style={{ zIndex: 1 }}
      >
        <span className="h-px w-[min(90vw,1400px)] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </SceneLayer>

      {/* Act one: the introduction, which recedes as the reader scrolls in. */}
      <SceneLayer
        range={[0, 0.45]}
        y={[0, -14]}
        opacity={[1, 0]}
        scale={[1, 0.94]}
        blur={[0, 5]}
        className="container-portfolio relative flex flex-col items-center text-center"
        style={{ zIndex: 10 }}
      >
        <MaskedText
          as="p"
          text="Computer Science Developer"
          stagger={60}
          className="mb-6 font-display text-[clamp(0.6rem,2.6vw,0.75rem)] font-medium uppercase tracking-[clamp(0.1em,1vw,0.35em)] text-white/60"
        />
        <MaskedText
          as="h1"
          text="Hi, I'm Sathish."
          stagger={70}
          delay={120}
          className="text-balance font-display text-[13vw] font-medium leading-[0.98] tracking-tight text-white sm:text-[9vw] md:text-[6.5vw] lg:text-[5.5rem]"
          style={{ textShadow: '0 4px 40px rgba(0,0,0,0.65)' }}
        />
        <MaskedText
          as="p"
          text="Building intelligent, interactive and modern digital experiences."
          stagger={28}
          delay={420}
          className="mt-6 max-w-2xl text-balance font-display text-lg font-normal text-white/80 sm:text-xl md:text-2xl"
        />
      </SceneLayer>

      {/* Act two: the statement that arrives as act one leaves. */}
      <SceneLayer
        range={[0.42, 0.92]}
        y={[16, -6]}
        opacity={[0, 1]}
        scale={[0.96, 1]}
        blur={[6, 0]}
        className="container-portfolio absolute flex flex-col items-center px-6 text-center"
        style={{ zIndex: 10 }}
      >
        <p className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          00 — Start here
        </p>
        <p className="mt-8 max-w-3xl text-balance font-display text-[7vw] font-medium leading-[1.05] tracking-tight text-white md:text-[3.4rem]">
          Software engineering, AI-powered applications and cloud technologies.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            as="a"
            href="#projects"
            cursorMode="button"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              goToSection('projects')
            }}
            className="rounded-full bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black"
          >
            View My Work
          </MagneticButton>
          <MagneticButton
            as="a"
            href="#contact"
            cursorMode="button"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              goToSection('contact')
            }}
            className="group relative overflow-hidden rounded-full border border-white/25 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors duration-500 hover:border-white"
          >
            <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100" />
            <span className="relative z-10 transition-colors duration-500 group-hover:text-black">
              Contact Me
            </span>
          </MagneticButton>
        </div>
      </SceneLayer>

      {/* Scroll cue — fades out the moment the reader takes the hint. */}
      <SceneLayer
        range={[0, 0.12]}
        opacity={[1, 0]}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        style={{ zIndex: 10 }}
      >
        <span className="font-display text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
          Scroll
        </span>
        <span className="block h-10 w-px overflow-hidden bg-white/15">
          <span className="block h-full w-full animate-[scrollLine_2.2s_ease-in-out_infinite] bg-white/70" />
        </span>
      </SceneLayer>
    </ScrollScene>
  )
}
