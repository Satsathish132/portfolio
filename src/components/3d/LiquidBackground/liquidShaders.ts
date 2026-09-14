// Fullscreen liquid shader: monochrome flowing "paint" surface built from
// layered simplex noise (fbm) domain-warped by a smoothed pointer field.
// Rendered as a single fullscreen triangle — cheap on the GPU, no geometry cost.

export const liquidVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

export const liquidFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uPointer;       // smoothed, -1..1
  uniform vec2 uPointerVel;    // smoothed velocity
  uniform float uScroll;       // 0..1 page progress
  uniform float uSection;      // section morph target, continuous index
  uniform float uIntensity;    // overall reactivity scalar (reduced on mobile / reduced-motion)
  uniform float uTransition;   // 0..1, peaks mid-gesture during a section-to-section snap

  varying vec2 vUv;

  // --- simplex noise (Ashima Arts / Stefan Gustavson, public domain) ---
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
            + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.55;
    float freq = 1.0;
    for (int i = 0; i < 5; i++) {
      sum += amp * snoise(p * freq);
      freq *= 1.95;
      amp *= 0.55;
    }
    return sum;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.045;

    // Domain warp toward the smoothed pointer — the liquid "reaches" for the cursor.
    vec2 toPointer = uPointer - p;
    float distToPointer = length(toPointer);
    float pull = uIntensity * 0.22 * exp(-distToPointer * 1.6);
    vec2 warp = normalize(toPointer + 1e-4) * pull;

    // scroll slowly rotates the flow field; section index nudges frequency
    float scrollAngle = uScroll * 1.4;
    mat2 rot = mat2(cos(scrollAngle), -sin(scrollAngle), sin(scrollAngle), cos(scrollAngle));
    vec2 flowP = rot * (p * (0.9 + 0.15 * sin(uSection)));

    vec2 warped = flowP + warp * 1.4;

    // Transition bloom: a second, faster-flowing noise layer that expands to
    // fill the frame as uTransition rises, giving the "liquid sweeps across
    // and covers the section" effect during a cinematic section change.
    float transitionFlow = fbm(warped * 1.6 + vec2(t * 2.2, -t * 1.8) + uTransition * 3.0);
    float transitionMask = smoothstep(-0.6, 0.5, transitionFlow + (uTransition * 2.0 - 1.0));

    float n1 = fbm(warped * 1.15 + vec2(t, -t * 0.7));
    float n2 = fbm(warped * 2.1 - vec2(-t * 0.6, t * 0.9) + 4.2);
    float speedKick = clamp(length(uPointerVel) * 5.5, 0.0, 1.0) * uIntensity;
    float n3 = fbm(warped * 3.4 + vec2(t * 1.3, t * 0.4)) * (0.35 + speedKick * 0.5);

    float field = n1 * 0.55 + n2 * 0.35 + n3 * 0.25;

    // Liquid "surface" threshold — soft, glossy edge rather than a hard cut.
    // Raised threshold + narrower band keeps most of the frame calm black,
    // with the liquid reading as flowing highlights rather than filled mass.
    float surface = smoothstep(0.05, 0.75, field);
    surface = max(surface, transitionMask * smoothstep(0.0, 1.0, uTransition));

    // Fake specular highlight following the pointer, like light on a liquid surface.
    float highlight = exp(-distToPointer * distToPointer * 3.2) * 0.35 * uIntensity;
    float sheen = pow(max(0.0, 1.0 - abs(field - 0.15) * 2.2), 6.0) * 0.28;

    float value = surface * (0.6 + uTransition * 0.35) + highlight + sheen;

    // Vignette to keep edges receding into black.
    float vignette = smoothstep(1.25, 0.15, length(p * vec2(0.75, 1.0)));
    value *= vignette;

    // Readability well: dim a fixed region at the visual center (where hero
    // copy sits) independent of pointer position, so text stays legible
    // against the flow instead of competing with bright liquid mass.
    // Relaxed automatically while a transition is peaking, since the liquid
    // is meant to dominate the frame at that moment.
    float centerDist = length(p * vec2(0.85, 1.15));
    float readabilityWell = smoothstep(0.0, 1.1, centerDist);
    value *= mix(mix(0.45, 1.0, uTransition), 1.0, readabilityWell);

    // Subtle grain to avoid banding on the monochrome gradient.
    float grain = (fract(sin(dot(uv * uResolution.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.015;

    vec3 color = vec3(clamp(value + grain, 0.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
  }
`
