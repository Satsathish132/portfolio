import { socialLinks } from '@/data/socialLinks'
import { Reveal } from '@/components/UI/Reveal'
import { MagneticButton } from '@/components/UI/MagneticButton'
import { ContactForm } from './ContactForm'

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="relative py-32 md:py-44">
      <div className="container-portfolio">
        <div className="grid gap-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Reveal>
              <span className="font-display text-xs font-medium uppercase tracking-[0.3em] text-white/40">
                06 — Contact
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 id="contact-heading" className="mt-6 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-5xl">
                Let&apos;s Build Something Together.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-white/50">
                Have an idea, project or opportunity? Let&apos;s connect.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <ul className="mt-12 flex flex-col gap-1">
                {socialLinks.map((link) => (
                  <li key={link.label} className="border-b border-white/10 first:border-t">
                    <MagneticButton
                      as="a"
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      cursorMode="link"
                      strength={0.15}
                      className="flex items-center justify-between gap-4 py-4 text-white"
                    >
                      <span className="font-display text-lg font-medium tracking-tight">{link.label}</span>
                      <span className="flex items-center gap-2 text-sm text-white/40">
                        {link.handle}
                        {link.external && (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                            <path
                              d="M2 9L9 2M9 2H3.5M9 2V7.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </MagneticButton>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <Reveal delay={200}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
