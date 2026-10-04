import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useScrollSceneOptional } from './ScrollSceneContext'
import { addScrollDriver, easeOutCubic, lerp, mapRange } from './scrollDriver'

/** A `[from, to]` pair animated across the layer's active progress range. */
type Tween = readonly [number, number]

interface SceneLayerProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /**
   * Slice of the parent scene's 0..1 progress over which this layer animates.
   * Outside it the layer holds its `from` / `to` value, so layers can be
   * sequenced: `[0, 0.4]` then `[0.4, 0.8]` and so on.
   */
  range?: Tween
  /** Vertical travel, in viewport-height percent (`-20` = up by 20vh). */
  y?: Tween
  /** Horizontal travel, in viewport-width percent. */
  x?: Tween
  scale?: Tween
  opacity?: Tween
  /** Gaussian blur radius in px — use sparingly, it is fill-rate expensive. */
  blur?: Tween
  /** Rotation in degrees. */
  rotate?: Tween
  /** Pass false to interpolate linearly instead of eased. */
  eased?: boolean
}

/**
 * One animated layer inside a `ScrollScene`. Every tween is driven from the
 * shared rAF loop and written straight to the element's style — this never
 * re-renders, so a scene can hold many layers at no React cost.
 */
export function SceneLayer({
  children,
  className = '',
  style,
  range = [0, 1],
  y,
  x,
  scale,
  opacity,
  blur,
  rotate,
  eased = true,
}: SceneLayerProps) {
  const scene = useScrollSceneOptional()
  const elRef = useRef<HTMLDivElement>(null)

  // Tweens are read through a ref so changing a prop never has to tear down
  // and re-create the driver subscription mid-scroll.
  const config = useRef({ range, y, x, scale, opacity, blur, rotate, eased })
  config.current = { range, y, x, scale, opacity, blur, rotate, eased }

  useEffect(() => {
    const el = elRef.current
    if (!el || !scene) return
    const { progressRef } = scene

    return addScrollDriver(() => {
      const c = config.current
      const local = mapRange(progressRef.current, c.range[0], c.range[1])
      const t = c.eased ? easeOutCubic(local) : local

      const transforms: string[] = []
      if (c.y) transforms.push(`translateY(${lerp(c.y[0], c.y[1], t).toFixed(3)}svh)`)
      if (c.x) transforms.push(`translateX(${lerp(c.x[0], c.x[1], t).toFixed(3)}vw)`)
      if (c.rotate) transforms.push(`rotate(${lerp(c.rotate[0], c.rotate[1], t).toFixed(3)}deg)`)
      if (c.scale) transforms.push(`scale(${lerp(c.scale[0], c.scale[1], t).toFixed(4)})`)

      el.style.transform = transforms.length > 0 ? transforms.join(' ') : ''
      if (c.opacity) el.style.opacity = lerp(c.opacity[0], c.opacity[1], t).toFixed(3)
      if (c.blur) {
        const radius = lerp(c.blur[0], c.blur[1], t)
        el.style.filter = radius < 0.05 ? '' : `blur(${radius.toFixed(2)}px)`
      }
    })
  }, [scene])

  return (
    <div ref={elRef} className={className} style={{ willChange: 'transform, opacity', ...style }}>
      {children}
    </div>
  )
}
