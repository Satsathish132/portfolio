# Portfolio — Sathish Sankaravel

A premium, interactive 3D developer portfolio built with React, Vite, TypeScript,
Tailwind CSS and Three.js (via React Three Fiber). The visual identity is a
custom WebGL liquid/paint shader that reacts to pointer movement, scroll and
section transitions — monochrome, cinematic, and GPU-light.

The site has **two motion styles**. Scroll Story (a Scout-Motors-style
scrolling page) is the one visitors see; Cinematic (a section-snap "camera
journey") is built but **hidden for now** — see **Motion styles** below.

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

## Motion styles

**Cinematic is currently hidden.** `MOTION_STYLE_SWITCHING_ENABLED` in
`src/hooks/useMotionStyle.ts` is `false`, so every visitor gets
`scroll-story`, the navbar toggle isn't rendered, and any stored
`'cinematic'` choice is ignored (but kept). The cinematic code is untouched —
set the flag to `true` to bring the switch back.

`useMotionStyle` (`src/hooks/useMotionStyle.ts`) holds the visitor's choice in
`localStorage` under `portfolio:motion-style`. It is a module-level store read
through `useSyncExternalStore`, so the navbar toggle, `App` and `Reveal` all
share one value, and a `storage` listener keeps duplicate tabs in sync. Every
localStorage access is wrapped in try/catch — it *throws*, not just returns
null, in Safari private mode.

| Style | Scroll model | Feel |
| --- | --- | --- |
| `cinematic` | Scroll is **hijacked**: sections are `position: fixed` and snap one per gesture | Camera dolly through a 3D environment |
| `scroll-story` (default) | **Real** scroll, lerped, with `position: sticky` pinned scenes | Long-form scrollytelling (Scout Motors style) |

The two are mutually exclusive — one takes scroll away, the other is driven by
it — so `App.tsx` picks exactly one. `prefers-reduced-motion` overrides both
and renders the plain document fallback.

Switching style remounts the page, so `App` re-anchors to the section in the
URL hash to keep the reader's place.

### Scroll-story mode

Lives in `src/components/scroll-story/`. It reuses the *same* section
components the cinematic mode renders — they already lay out correctly in
normal document flow, which is how the reduced-motion fallback has always
worked. What changes is the connective tissue.

- **`scrollDriver.ts`** — one shared rAF loop that every scroll-driven effect
  subscribes to, rather than one loop (and one React state update) per
  animated element. Subscribers read their own rect and write
  `transform`/`opacity` directly; the loop idles when nothing is subscribed
  and skips work while the tab is hidden.
- **`ScrollScene`** — a tall outer track whose inner stage is `position:
  sticky`, so the stage pins while the page scrolls past it. Scene progress
  (0 on lock, 1 on release) is published through context. The pin is native
  CSS, not transform math, so the compositor owns it.
- **`SceneLayer`** — one animated layer in a scene. Takes `[from, to]` tweens
  for `y`/`x`/`scale`/`opacity`/`blur`/`rotate` plus a `range` slice of scene
  progress, so layers can be sequenced into acts.
- **`Parallax`** — viewport-relative depth drift, independent of any scene.
  Displacement is zero as the element crosses the viewport centre, so a
  parallax layer always lands in its authored position when most visible.
- **`MaskedText`** — words rise out of individual overflow masks. The masks
  carry padding plus a cancelling negative margin so descenders are not
  clipped. The split words are `aria-hidden` with one `sr-only` copy of the
  original string, so screen readers hear a sentence, not a word list.
- **`ClipReveal`** — a `clip-path` wipe with an inner counter-scale. The wipe
  and the scale are on two different elements on purpose: on one element the
  clip rectangle would scale with the content and the wipe would vanish.
- **`HorizontalGallery`** — the numbered "viewfinder". Vertical scroll is
  remapped to horizontal travel, measured from the real rendered row width so
  the last panel lands flush. The `01 / 06` counter is derived from which
  panel is actually centred and written via `textContent`, not React state —
  it updates every frame.

`Reveal` (`src/components/UI/Reveal.tsx`) reads the active style and swaps its
own entrance — fade-and-rise in cinematic, clip-path wipe in scroll-story — so
every section that already used it upgrades without being touched.

**Smooth scroll** (`useSmoothScroll`) eases the *real* `window.scrollTo`
rather than transforming the page body: the body-transform approach breaks
`position: sticky` and `position: fixed`, and the whole scroll-story layout is
built on sticky pinning. It normalises the three wheel `deltaMode` values,
eases frame-rate independently (so 60Hz and 144Hz feel the same), adopts any
scroll it did not cause (keyboard, scrollbar drag, find-in-page), and leaves
touch to the platform's native momentum.

Note `body { overflow-x: clip }` in `index.css` — not `hidden`. `hidden` makes
body a scroll container, which is the classic way to break `position: sticky`
descendants.

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
                     SectionLayer, SkipLink, MotionStyleToggle
    scroll-story/   The Scout-style continuous-scroll mode: scrollDriver (shared
                     rAF loop), ScrollScene (sticky pin), SceneLayer, Parallax,
                     MaskedText, ClipReveal, HorizontalGallery, ScrollStoryHero,
                     ScrollStory (the layout)
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

  hooks/            useMotionStyle (persisted motion-style choice),
                     useSmoothScroll (lerped real scrolling),
                     useSectionScroller (cinematic nav state machine),
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

- The scroll-story layout ships in the main bundle — it is the main
  experience, so splitting it out would only delay first paint by a request.
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
