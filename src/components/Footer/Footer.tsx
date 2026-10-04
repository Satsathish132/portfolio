import { socialLinks, displayName } from '@/data/socialLinks'
import { MagneticButton } from '@/components/UI/MagneticButton'

const FOOTER_LINKS = socialLinks.filter((l) => ['GitHub', 'LinkedIn', 'Email'].includes(l.label))

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative border-t border-white/10 pt-10"
      style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="container-portfolio flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="font-display text-sm text-white/60">Designed &amp; built with curiosity.</p>
          <p className="mt-1 text-xs text-white/30">
            © {year} {displayName}
          </p>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-6">
          {FOOTER_LINKS.map((link, i) => (
            <span key={link.label} className="flex items-center gap-6">
              <MagneticButton
                as="a"
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                cursorMode="link"
                strength={0.2}
                className="-my-3.5 inline-block py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-white/50 hover:text-white"
              >
                {link.label}
              </MagneticButton>
              {i < FOOTER_LINKS.length - 1 && <span className="text-white/15">|</span>}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  )
}
