import { useEffect, useRef } from 'react'
import { MagneticButton } from '@/components/UI/MagneticButton'
import { useGoToSection } from '@/hooks/useGoToSection'

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const goToSection = useGoToSection()

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    // simple entrance: stagger the fade-up children once mounted
    const items = el.querySelectorAll<HTMLElement>('[data-reveal]')
    items.forEach((item, i) => {
      item.style.animationDelay = `${180 + i * 110}ms`
      item.classList.add('animate-fade-up')
    })
  }, [])

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24"
    >
      <div ref={rootRef} className="container-portfolio relative z-10 flex flex-col items-center text-center">
        <p
          data-reveal
          className="mb-6 whitespace-nowrap font-display font-medium uppercase text-white/60 opacity-0"
          style={{
            fontSize: 'clamp(0.6rem, 2.6vw, 0.75rem)',
            letterSpacing: 'clamp(0.1em, 1vw, 0.35em)',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}
        >
          Computer Science Developer
        </p>

        <h1
          data-reveal
          className="text-balance font-display text-[13vw] font-medium leading-[0.98] tracking-tight text-white opacity-0 sm:text-[9vw] md:text-[6.5vw] lg:text-[5.5rem]"
          style={{ textShadow: '0 4px 40px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.5)' }}
        >
          Hi, I&apos;m <span className="italic text-white/90">Sathish.</span>
        </h1>

        <p
          data-reveal
          className="mt-6 max-w-2xl text-balance font-display text-lg font-normal text-white/80 opacity-0 sm:text-xl md:text-2xl"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
        >
          Building intelligent, interactive and modern digital experiences.
        </p>

        <p
          data-reveal
          className="mt-5 max-w-xl text-balance text-sm leading-relaxed text-white/55 opacity-0 sm:text-base"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
        >
          Computer Science developer passionate about software engineering, AI-powered
          applications, modern web technologies and building practical products.
        </p>

        <div data-reveal className="mt-10 flex flex-wrap items-center justify-center gap-4 opacity-0">
          <MagneticButton
            as="a"
            href="#projects"
            cursorMode="button"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              goToSection('projects')
            }}
            className="group relative overflow-hidden rounded-full bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black"
          >
            <span className="relative z-10">View My Work</span>
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
      </div>

      {/* Scroll cue */}
      <div
        data-reveal
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 opacity-0"
      >
        <span className="font-display text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
          Scroll
        </span>
        <div className="h-10 w-px overflow-hidden bg-white/15">
          <div className="h-full w-full animate-[scrollLine_2.2s_ease-in-out_infinite] bg-white/70" />
        </div>
      </div>
    </section>
  )
}
