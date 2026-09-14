# Portfolio — Sathish Sankaravel

A premium, interactive 3D developer portfolio built with React, Vite, TypeScript,
Tailwind CSS and Three.js (via React Three Fiber). The visual identity is a
custom WebGL liquid/paint shader that reacts to pointer movement, scroll and
section transitions — monochrome, cinematic, and GPU-light. Navigation is a
cinematic "camera journey" through the site rather than conventional document
scrolling (see **Cinematic navigation** below).

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Three.js** + **@react-three/fiber** — the liquid background shader and
  floating particles
- No animation library dependency — entrance/scroll reveals use native CSS
  transitions driven by `IntersectionObserver`, and pointer-reactive effects
  are imperative (`useFrame` / `requestAnimationFrame`) rather than
  React-state-driven, to keep 60fps under frequent mouse movement.

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run lint     # oxlint
npm run preview  # preview the production build locally
```

## Cinematic navigation

Instead of native scrolling, `useSectionScroller` (see `src/hooks/`) owns a
small state machine — `index` (current section), `targetIndex`, and an
eased `progress` — driven by intercepted wheel/touch/keyboard gestures. One
gesture snaps to the next/previous section over ~850ms; a cooldown prevents
a single scroll burst from skipping multiple sections.

**Two-level scroll:** if the active section's content is taller than the
viewport (e.g. Skills, Projects), wheel/touch input scrolls that section's
own internal content first; only once its scroll edge is reached does the
next gesture trigger a cinematic transition to the next section.

**Wheel input is delta-accumulated, not single-event-gated:** a precision
trackpad emits many small `wheel` events per gesture (deltaY often only a
few units each), so triggering only ever a single event crossing a fixed
threshold would silently drop most trackpad gestures. Instead, delta is
summed across a short burst window (resetting after ~160ms of no new input,
or on a directional reversal) and the transition fires once the accumulated
magnitude clears the trigger — see `onWheel` in `useSectionScroller.ts`.

The real document scroll is also locked (`documentElement.style.overflow =
'hidden'`) whenever the cinematic scroller is active: sections are
`position: fixed`, so any residual native scroll is invisible but can still
silently consume wheel gestures underneath the fixed layers.

Any in-page link/button that needs to jump to a section should use the
shared `useGoToSection()` hook (`src/hooks/useGoToSection.ts`) rather than
calling `scrollIntoView` directly — it resolves through the cinematic
scroller when active (where `scrollIntoView` on a `position: fixed` element
does nothing) and falls back to a normal smooth scroll otherwise.

Each section renders inside `SectionLayer`, which computes its own
opacity/scale/depth-translate every frame from shared scroller state (no
per-section React re-renders). The shared `LiquidBackground` shader reads the
same transition progress to bloom/recede during a section change (see
`uTransition` in `liquidShaders.ts`).

`src/data/sections.ts` is the single source of truth for section order, ids
and nav labels — both the scroller and the navbar/section-dots read from it,
so their indices can never drift apart. Add a section by adding an entry
there and to `SECTION_COMPONENTS` in `App.tsx`, in the same position.

**Fallback:** under `prefers-reduced-motion` (or if WebGL is unavailable),
the scroller is disabled entirely and the site renders as a normal,
fully-scrollable document with simple CSS section transitions — no camera
dolly, no scroll interception.

## Project structure

```
src/
  components/
    Navbar/        Floating glass nav, active-section highlight, mobile menu
    Hero/           Full-screen intro over the liquid background
    About/          Short professional profile
    Services/       "What I Build" — 3D tilt cards
    Skills/         Grouped skill categories with hover detail
    Projects/       Featured project (Pathlytics) + reusable project cards
    Experience/     Scroll-animated vertical journey timeline
    Contact/        Contact form + real social/professional links
    Footer/
    UI/             Reusable primitives: CustomCursor, MagneticButton, Reveal,
                     SectionLayer, SkipLink
    3d/
      LiquidBackground/   The fullscreen WebGL shader (liquidShaders.ts) +
                           its React Three Fiber driver (LiquidPlane.tsx,
                           LiquidScene.tsx)
      FloatingParticles/  Instanced-points droplet field
      InteractiveObject/  Reusable 3D accent mesh (used in Skills)

  data/             Plain data, separate from UI — edit these to update content
    sections.ts     Section order/ids/nav-labels — source of truth for navigation.
    projects.ts     Add/edit projects here. Unset liveUrl/githubUrl hide their buttons.
    skills.ts       Skill categories and descriptions.
    services.ts     "What I Build" cards.
    journey.ts      Timeline milestones. Omit `period` for an undated entry.
    socialLinks.ts  Real contact/social links + display name.

  hooks/            useSectionScroller (cinematic nav state machine),
                     useGoToSection (jump to a section from anywhere),
                     useMousePosition (singleton pointer tracker),
                     useScrollProgress, useActiveSection, useReducedMotion,
                     useDeviceTier, usePageVisible
```

## Editing content

All user-facing content lives in `src/data/*.ts` — component files don't
hardcode copy. To add a project, append an entry to `projects.ts`; to add a
skill, append to the relevant category in `skills.ts`; to add a section,
add it to `sections.ts` and `SECTION_COMPONENTS` in `App.tsx`.

**No fabricated content policy:** this project intentionally omits invented
employment history, project links or achievements. Placeholder project slots
are marked with `[Project Name]` and render with a "Coming soon" state rather
than fake details.

## Performance notes

- The Three.js/R3F bundle backs the liquid background and Skills' 3D accent;
  both `LiquidBackground` and the section-scoped `SkillsScene` are
  code-split via `React.lazy` so first paint never waits on WebGL.
- The liquid shader renders as a single fullscreen triangle (no scene graph
  geometry cost); reactivity comes from uniforms updated per-frame from refs,
  never from React state.
- Pointer tracking is a module-level singleton listener shared by the cursor,
  liquid background and tilt cards — not one `pointermove` listener per
  component.
- `frameloop` pauses automatically when the tab is backgrounded
  (`usePageVisible`), and shader intensity / particle count / DPR scale down
  on mobile and under `prefers-reduced-motion`.
- The custom cursor and 3D tilt effects are disabled entirely on coarse
  pointer / touch input (checked via `event.pointerType !== 'mouse'` on tilt
  handlers, and `isCoarsePointer || isTouch` for the custom cursor).

## Responsive design

- Navbar switches from the full horizontal desktop nav to the mobile
  hamburger menu at the `lg` (1024px) breakpoint, not `md` — six nav items
  plus the "Let's Talk" button don't comfortably fit at tablet widths.
- All touch targets are ≥44×44px (the mobile menu button, etc.).
- `env(safe-area-inset-*)` is applied to the navbar (top), footer (bottom)
  and the shared `.container-portfolio` (left/right), with
  `viewport-fit=cover` set in `index.html`, for notches/home indicators.
- Fluid type via `clamp()` throughout rather than fixed breakpoint jumps.
