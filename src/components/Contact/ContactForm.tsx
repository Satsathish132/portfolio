import { useState, type FormEvent } from 'react'
import { contactEmail } from '@/data/socialLinks'

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

type Status = 'idle' | 'success'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * There is no backend wired up yet, so submission composes a mailto: link
 * with the form contents rather than silently pretending to send. This is
 * honest about what actually happens and still gets the message to the
 * right inbox via the user's own mail client.
 */
export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Status>('idle')

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    if (!values.name.trim()) next.name = 'Please enter your name.'
    if (!values.email.trim()) next.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(values.email)) next.email = 'Please enter a valid email address.'
    if (!values.message.trim()) next.message = 'Please enter a message.'
    else if (values.message.trim().length < 10) next.message = 'Message should be at least 10 characters.'
    return next
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const subject = encodeURIComponent(`Portfolio inquiry from ${values.name}`)
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`)
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
    setStatus('success')
  }

  const inputClass =
    'w-full border-0 border-b border-white/15 bg-transparent py-3 text-base text-white placeholder:text-white/30 outline-none transition-colors duration-300 focus:border-white'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className={inputClass}
          placeholder="Your name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1.5 text-xs text-white/60">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          className={inputClass}
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-xs text-white/60">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-white/40">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className={`${inputClass} resize-none`}
          placeholder="Tell me about your idea or opportunity..."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-xs text-white/60">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        data-cursor="button"
        className="group relative mt-4 w-fit overflow-hidden rounded-full bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-black transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
      >
        Send Message
      </button>

      <p role="status" aria-live="polite" className={`text-sm text-white/50 transition-opacity duration-300 ${status === 'success' ? 'opacity-100' : 'opacity-0'}`}>
        Your mail client should now be open with this message ready to send.
      </p>
    </form>
  )
}
