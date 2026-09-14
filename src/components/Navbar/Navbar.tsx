import { useContext, useState } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useGoToSection } from '@/hooks/useGoToSection'
import { SectionScrollerContext } from '@/hooks/SectionScrollerContext'
import { SECTIONS, NAV_SECTIONS } from '@/data/sections'
import { MagneticButton } from '@/components/UI/MagneticButton'

export function Navbar() {
  const scroller = useContext(SectionScrollerContext)
  const documentScroll = useScrollProgress()
  // Only needed for the non-hijacked (reduced-motion) fallback path.
  const observedActive = useActiveSection(scroller ? [] : NAV_SECTIONS.map((n) => n.id))
  const [mobileOpen, setMobileOpen] = useState(false)
  const goToSection = useGoToSection()

  const activeId = scroller ? SECTIONS[scroller.targetIndex]?.id : observedActive
  const progress = scroller
    ? (scroller.index + (scroller.targetIndex - scroller.index) * scroller.progress) / (SECTIONS.length - 1)
    : documentScroll.progress
  const scrolled = scroller ? scroller.targetIndex > 0 || scroller.progress > 0 : documentScroll.scrolled

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3' : 'py-6'
        }`}
        style={{ paddingTop: `calc(${scrolled ? '0.75rem' : '1.5rem'} + env(safe-area-inset-top, 0px))` }}
      >
        <nav
          aria-label="Primary"
          className={`container-portfolio flex items-center justify-between rounded-full border transition-all duration-500 ${
            scrolled
              ? 'border-white/10 bg-black/60 px-5 py-2.5 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)]'
              : 'border-transparent bg-transparent px-5 py-2.5'
          }`}
          style={{ maxWidth: scrolled ? 900 : 1400, marginInline: 'auto' }}
        >
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              goToSection('home')
            }}
            className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-white"
            data-cursor="link"
          >
            <span className="relative h-7 w-7 overflow-hidden rounded-full border border-white/25 bg-white/5">
              <img
                src="/images/profile.jpg"
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </span>
            SS<span className="text-white/40">.</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_SECTIONS.map((item) => (
              <li key={item.id}>
                <MagneticButton
                  as="a"
                  href={`#${item.id}`}
                  strength={0.25}
                  cursorMode="link"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault()
                    goToSection(item.id)
                  }}
                  className={`relative inline-block rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] ${
                    activeId === item.id ? 'text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {activeId === item.id && (
                    <span className="absolute inset-0 -z-10 rounded-full bg-white" aria-hidden="true" />
                  )}
                  {item.navLabel}
                </MagneticButton>
              </li>
            ))}
          </ul>

          <MagneticButton
            as="a"
            href="#contact"
            cursorMode="button"
            strength={0.3}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              goToSection('contact')
            }}
            className="hidden rounded-full border border-white/25 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white hover:border-white hover:bg-white hover:text-black lg:inline-block"
          >
            Let&apos;s Talk
          </MagneticButton>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span
              className={`h-px w-5 bg-white transition-transform duration-300 ${mobileOpen ? 'translate-y-[3px] rotate-45' : ''}`}
            />
            <span
              className={`h-px w-5 bg-white transition-transform duration-300 ${mobileOpen ? '-translate-y-[3px] -rotate-45' : ''}`}
            />
          </button>
        </nav>

        {/* Section progress hairline */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/5">
          <div
            className="h-full bg-white/60 transition-[width] duration-150 ease-out"
            style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }}
          />
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl transition-opacity duration-400 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ul className="flex h-full flex-col items-center justify-center gap-8">
          {NAV_SECTIONS.map((item, i) => (
            <li
              key={item.id}
              style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : '0ms' }}
              className={`transition-all duration-500 ${
                mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  goToSection(item.id)
                  setMobileOpen(false)
                }}
                className="font-display text-3xl font-medium tracking-tight text-white"
              >
                {item.navLabel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
