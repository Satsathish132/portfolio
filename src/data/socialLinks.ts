export interface SocialLink {
  label: string
  href: string
  handle?: string
  external: boolean
}

/**
 * Only real, provided links live here. Do not add placeholder URLs —
 * if a link isn't available yet, omit the entry rather than fabricate one.
 */
export const socialLinks: SocialLink[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/Satsathish132/',
    handle: '@Satsathish132',
    external: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sathishsankaravel',
    handle: '/in/sathishsankaravel',
    external: true,
  },
  {
    label: 'Email',
    href: 'mailto:sathishsankaravel@gmail.com',
    handle: 'sathishsankaravel@gmail.com',
    external: false,
  },
  {
    label: 'Resume',
    href: 'https://drive.google.com/file/d/1S5Heyo_34sGEbeCK2zEj2mEWXS7HyGdb/view?usp=drivesdk',
    external: true,
  },
]

export const contactEmail = 'sathishsankaravel@gmail.com'
export const displayName = 'Sathish Sankaravel'
