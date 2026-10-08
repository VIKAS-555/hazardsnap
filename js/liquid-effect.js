/**
 * ============================================================
 * FULL-BOX LIQUID CODE / LIGHT-REVEAL / WAKE / DROPLET ENGINE
 * ============================================================
 * Reusable GPU WebGL Fluid Surface powered by Three.js & Custom GLSL.
 * 
 * CORE MENTAL MODEL:
 * The entire box is a dark shallow pool filled with fine technical code.
 * The writing is submerged and mostly hidden (15–30% faintly visible).
 * When a soft moving light follows the mouse, it reveals the writing.
 * As the light moves away, the characters gradually fade back.
 * At the same time, the writing physically behaves like liquid:
 * - Bends, stretches, ripples, flows, trails, swirls, carries momentum
 * - Fast mouse movement produces a stronger fluid wake
 * - Clicking creates a droplet impact with expanding concentric ripples
 * - The CODE ITSELF IS THE LIQUID (distorted by the GPU displacement field)
 * 
 * SPECIFICATION COMPLIANCE:
 * - Full box coverage (100% width, 100% height, clipped to rounded corners)
 * - Exactly the 55 specified code strings used
 * - NO line numbers, NO fake editor/terminal framing
 * - Existing UI is 100% preserved, sharp, and interactive above the canvas
 * - Responsive via ResizeObserver, zero-frame allocation, prefers-reduced-motion
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('three'));
  } else {
    root.LiquidEffect = factory(root.THREE);
  }
})(typeof window !== 'undefined' ? window : this, function (THREE) {
  'use strict';

  // Maximum concurrent droplet ripples
  const MAX_RIPPLES = 8;

  // Official Web App Brand Theme Palette (Electric Blue, Sky Cyan, Ice Highlight, Deep Obsidian)
  const PALETTE = {
    primary: [0.231, 0.510, 0.965],     // #3B82F6 - Brand Electric Blue
    secondary: [0.220, 0.741, 0.973],   // #38BDF8 - Sky Cyan
    dim: [0.114, 0.306, 0.847],         // #1D4ED8 - Deep Brand Blue
    veryDim: [0.075, 0.192, 0.541],     // #13318A - Submerged Dark Navy
    highlight: [0.729, 0.902, 0.992],   // #BAE6FD - Ice Electric Blue Highlight
    cyan: [0.388, 0.400, 0.945],        // #6366F1 - Indigo Accent
    bg: [0.008, 0.024, 0.090]           // #020617 - Deep Dark Obsidian Slate-950
  };

  // Exact 55 code snippets from Section 4 (Rendered without line numbers)
  const EXACT_CODE_SNIPPETS = [
    "const signal = observe(input);",
    "const response = await fetch(url);",
    "const data = await response.json();",
    "function updateState(value) {",
    "return state.map(transform);",
    "const result = data.filter(Boolean);",
    "const next = previous + delta;",
    "async function initialize() {",
    "const result = await fetchData();",
    "return result;",
    "const value = response?.payload;",
    "if (value) render(value);",
    "const pointer = normalize(cursor);",
    "const field = domainWarp(uv);",
    "const surface = liquid(displacement);",
    "const intensity = clamp(level, 0, 1);",
    "const velocity = smooth(pointerDelta);",
    "requestAnimationFrame(frame);",
    "const state = createState(config);",
    "useEffect(() => subscribe(), []);",
    "const users = data.filter(user => user.active);",
    "return compose(surface, code);",
    "const stream = createStream(source);",
    "await process(stream);",
    "const texture = createTexture(data);",
    "shader.uniforms.uTime.value = time;",
    "shader.uniforms.uMouse.value = mouse;",
    "const displacement = fluidField(uv);",
    "const target = calculate(input);",
    "current += (target - current) * smoothing;",
    "const result = await resolve(data);",
    "export default function Surface() {",
    "return <InteractiveLayer />;",
    "}",
    "function transform(value) {",
    "return value * intensity;",
    "}",
    "const noise = fbm(domain);",
    "const warped = uv + distortion;",
    "const ripple = radialWave(position);",
    "const force = pointerVelocity * strength;",
    "const wake = advect(force);",
    "const field = simulate(surface);",
    "const rendered = composite(liquid, code);",
    "await synchronize(state);",
    "const output = render(result);",
    "if (!active) return;",
    "const delta = current - previous;",
    "update(delta);",
    "const system = initialize(config);",
    "const payload = response.data;",
    "const active = state?.status;",
    "return process(payload);",
    "const layer = createLayer(surface);",
    "const signal = update(input);"
  ];

  /**
   * Generates a high-resolution procedural code texture on an offscreen canvas.
   * Arranged in horizontal line-wise rows with subtle artistic layout (Section 5).
   * NO line numbers (Section 4 & 22).
   */
  /**
   * Generates a dense, continuous procedural code texture on an offscreen canvas.
   * Fills 100% of the surface from edge to edge, row by row, with ZERO empty gaps.
   * Uses all 55 exact snippets repeatedly in continuous horizontal streams.
   * NO line numbers (Sections 4 & 22).
   */
  function createCodeTexture() {
    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Clean transparent clear
    ctx.clearRect(0, 0, width, height);

    // Generous row height and large font for crystal-clear readability
    const rowHeight = 36;
    const totalRows = Math.floor(height / rowHeight);

    ctx.textBaseline = 'middle';
    ctx.font = '600 22px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

    const KEYWORDS = new Set([
      'const', 'let', 'var', 'function', 'async', 'await', 'export', 'default',
      'return', 'if', 'else', 'while', 'for', 'import', 'from'
    ]);

    function renderSnippetTokens(snippet, startX, startY, baseAlpha) {
      let curX = startX;
      const tokens = snippet.match(/(['"`].*?['"`])|\b([a-zA-Z_]\w*)\b|([0-9]+)|([=><+\-*/&|!{}();:,.\[\]])|(\s+)/g) || [snippet];

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (/^\s+$/.test(token)) {
          curX += ctx.measureText(token).width;
          continue;
        }

        // Web App Brand Theme Syntax Highlighting (Electric Blue, Sky Cyan, Ice Highlight, Indigo)
        if (token.startsWith('//')) {
          ctx.fillStyle = `rgba(100, 116, 139, ${0.70 * baseAlpha})`; // Muted Slate
        } else if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
          ctx.fillStyle = `rgba(56, 189, 248, ${0.98 * baseAlpha})`; // Sky Cyan String
        } else if (KEYWORDS.has(token)) {
          ctx.fillStyle = `rgba(186, 230, 253, ${1.00 * baseAlpha})`; // Ice Electric Blue Keyword
        } else if (/^[0-9]+$/.test(token)) {
          ctx.fillStyle = `rgba(165, 180, 252, ${0.95 * baseAlpha})`; // Indigo / Violet Number
        } else if (/^[=><+\-*/&|!{}();:,.\[\]]$/.test(token)) {
          ctx.fillStyle = `rgba(96, 165, 250, ${0.85 * baseAlpha})`; // Brand Blue Operator
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${0.98 * baseAlpha})`; // Brand Electric Blue Identifier
        }

        ctx.fillText(token, curX, startY);
        curX += ctx.measureText(token).width;
      }

      return curX - startX;
    }

    // CONTINUOUS ROW PACKING: Fills 100% of the box from edge to edge without any empty regions
    for (let row = 0; row < totalRows; row++) {
      const y = row * rowHeight + rowHeight * 0.5 + 2;

      // Depth tier variation (Background: 0.60, Midground: 0.82, Foreground: 1.0)
      const depthTier = (row % 3);
      const baseAlpha = depthTier === 0 ? 0.60 : depthTier === 1 ? 0.82 : 1.0;

      // Staggered starting offset so snippet breaks are naturally varied across lines
      let curX = -((row * 137) % 260);
      let snippetIdx = (row * 7) % EXACT_CODE_SNIPPETS.length;

      // Continuously pack snippets horizontally across the entire width and beyond
      while (curX < width + 140) {
        const snippet = EXACT_CODE_SNIPPETS[snippetIdx % EXACT_CODE_SNIPPETS.length];
        
        // Render snippet
        const snippetWidth = renderSnippetTokens(snippet, curX, y, baseAlpha);

        // Gap spacing between snippets
        const gap = 28 + ((snippetIdx * 23) % 28);
        curX += snippetWidth + gap;

        // Subtle ellipsis on some snippet gaps
        if ((snippetIdx % 5) === 0 && curX < width + 60) {
          ctx.fillStyle = `rgba(59, 130, 246, ${0.45 * baseAlpha})`;
          ctx.fillText('...', curX - gap + 6, y);
        }

        snippetIdx++;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    return texture;
  }

  // Fullscreen Quad Vertex Shader
  const VERTEX_SHADER = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  // Fragment Shader: Light-Reveal, GPU Fluid Displacement, Hand Wake & Droplet Waves
  const FRAGMENT_SHADER = /* glsl */ `
    precision highp float;

    varying vec2 vUv;

    uniform vec2 uResolution;
    uniform float uAspect;
    uniform float uTime;
    uniform vec2 uMouse;              // Pointer in UV space [0, 1]
    uniform vec2 uTrailMouse;         // Trailing pointer for momentum wake
    uniform vec2 uLightPos;           // Soft moving light center (interpolated)
    uniform vec2 uTrailLightPos;      // Trailing light center
    uniform vec2 uMouseVelocityVec;   // Directional velocity vector
    uniform float uMouseVelocity;     // Smoothed velocity magnitude
    uniform float uMouseActive;       // 1.0 when pointer is active over surface, 0.0 when idle
    uniform float uKineticEnergy;     // Movement-generated kinetic electricity [0..1]
    uniform float uIntensity;         // Base fluid energy [0..1]
    uniform float uReducedMotion;     // prefers-reduced-motion flag

    // Active droplet ripples: vec4(normX, normY, ageInSeconds, strength)
    #define MAX_RIPPLES 8
    uniform vec4 uRipples[MAX_RIPPLES];

    uniform sampler2D uCodeTexture;

    // Palette Uniforms
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform vec3 uColorDim;
    uniform vec3 uColorVeryDim;
    uniform vec3 uColorHighlight;
    uniform vec3 uColorCyan;
    uniform vec3 uBgColor;

    // Fast 2D Hash
    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    // 2D Gradient Noise
    float gnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    mat2 rot(float a) {
      float c = cos(a);
      float s = sin(a);
      return mat2(c, -s, s, c);
    }

    // 4-octave Fractal Brownian Motion
    float fbm(vec2 p) {
      float f = 0.0;
      mat2 m = rot(0.523);
      f += 0.5000 * gnoise(p); p = m * p * 2.02;
      f += 0.2500 * gnoise(p); p = m * p * 2.03;
      f += 0.1250 * gnoise(p); p = m * p * 2.01;
      f += 0.0625 * gnoise(p);
      return f;
    }

    // Evaluates the physical fluid displacement vector at any UV coordinate
    vec2 getFluidDisplacement(vec2 uv, float t) {
      vec2 disp = vec2(0.0);
      float motionScale = mix(1.0, 0.16, uReducedMotion);
      vec2 pAspect = uv * vec2(uAspect, 1.0);

      // 1. BASE ORGANIC LIQUID MOTION (Continuous non-looping subtle undulation)
      float tSlow = t * 0.036 * motionScale;
      float n1 = fbm(pAspect * 2.4 + vec2(tSlow, -tSlow * 0.82));
      float n2 = fbm(pAspect * 4.2 - vec2(tSlow * 0.72, tSlow * 1.12));
      vec2 baseOrganic = vec2(n1, n2) * 0.015 * uIntensity * motionScale;
      disp += baseOrganic;

      // 2. MOUSE = HAND MOVING THROUGH LIQUID & DIRECTIONAL FLUID WAKE
      vec2 m0 = uTrailMouse * vec2(uAspect, 1.0);
      vec2 m1 = uMouse * vec2(uAspect, 1.0);
      vec2 vSeg = m1 - m0;
      float segLen = length(vSeg);

      float distToMouse = length(pAspect - m1);
      float distToSeg = distToMouse;

      if (segLen > 0.0005) {
        float proj = clamp(dot(pAspect - m0, vSeg) / (segLen * segLen), 0.0, 1.0);
        distToSeg = length(pAspect - (m0 + proj * vSeg));
      }

      // Wake radius widens as pointer velocity increases
      float wakeRadius = (0.22 + uMouseVelocity * 0.16) * motionScale;
      float wakeFalloff = smoothstep(wakeRadius, 0.0, distToSeg);

      // Drag in motion direction + radial displacement
      vec2 radialDir = normalize(pAspect - m1 + vec2(0.0001));
      vec2 wakeFlow = (uMouseVelocityVec * 0.36 + radialDir * (0.032 + uMouseVelocity * 0.045)) * wakeFalloff * uIntensity * motionScale;
      disp += wakeFlow;

      // 3. DROPLET IMPACT & EXPANDING WAVE RIPPLES
      vec2 rippleDispTotal = vec2(0.0);
      for (int i = 0; i < MAX_RIPPLES; i++) {
        vec4 rip = uRipples[i];
        float age = rip.z;
        if (age >= 0.0 && age < 3.2) {
          vec2 rCenter = rip.xy * vec2(uAspect, 1.0);
          vec2 rDiff = pAspect - rCenter;
          float rDist = length(rDiff);

          float waveSpeed = 0.54;
          float waveFront = age * waveSpeed;
          float distFromFront = rDist - waveFront;

          // Multi-ring concentric ripple packet (first strongest, second weaker, third subtle)
          float freq = 32.0;
          float packetDamp = exp(-abs(distFromFront) * 14.0);
          float spatialDamp = exp(-rDist * 1.4);
          float temporalDamp = exp(-age * 1.35);

          float wave = sin(distFromFront * freq) * packetDamp * spatialDamp * temporalDamp * rip.w;
          vec2 rDir = normalize(rDiff + vec2(0.0001));

          rippleDispTotal += rDir * wave * 0.068 * uIntensity * motionScale;
        }
      }
      disp += rippleDispTotal;

      return disp;
    }

    void main() {
      vec2 uv = vUv;
      vec2 pAspect = uv * vec2(uAspect, 1.0);

      // Total fluid displacement field
      vec2 disp = getFluidDisplacement(uv, uTime);

      // Distort UV coordinates: THE CODE ITSELF MOVES WITH THE LIQUID
      vec2 distortedUv = uv + disp;

      // Centered 115% coverage so code texture extends slightly beyond visible bounds without any gaps
      vec2 centeredUv = (distortedUv - 0.5) * 1.15 + 0.5;
      vec2 codeUv = fract(centeredUv);
      vec4 codeSample = texture2D(uCodeTexture, codeUv);

      // Finite difference normal estimation for liquid specular sheen
      float eps = 0.004;
      vec2 dispR = getFluidDisplacement(uv + vec2(eps, 0.0), uTime);
      vec2 dispU = getFluidDisplacement(uv + vec2(0.0, eps), uTime);
      float dHdx = (length(dispR) - length(disp)) / eps;
      float dHdy = (length(dispU) - length(disp)) / eps;
      vec3 normal = normalize(vec3(-dHdx * 3.2, -dHdy * 3.2, 1.0));

      // Directional liquid reflection
      vec3 lightDir = normalize(vec3(-0.35, 0.55, 0.8));
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      vec3 halfVec = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfVec), 0.0), 28.0);

      // Droplet splash impact flash & ripple crest highlights
      float dropletImpactGlow = 0.0;
      float waveCrestGlow = 0.0;

      for (int i = 0; i < MAX_RIPPLES; i++) {
        vec4 rip = uRipples[i];
        float age = rip.z;
        if (age >= 0.0 && age < 3.2) {
          vec2 rCenter = rip.xy * vec2(uAspect, 1.0);
          float rDist = length(pAspect - rCenter);
          float waveFront = age * 0.54;

          // Center impact flash
          if (age < 0.42) {
            float flash = smoothstep(0.09, 0.0, rDist) * smoothstep(0.42, 0.0, age) * rip.w;
            dropletImpactGlow += flash;
          }

          // Crest illumination along concentric wave rings
          float ringDist = abs(rDist - waveFront);
          float ringGlow = exp(-ringDist * 22.0) * exp(-age * 1.35) * rip.w;
          waveCrestGlow += ringGlow;
        }
      }

      // ============================================================
      // TORCH REVEAL SYSTEM: Movement generates electricity to produce light
      // ============================================================
      
      // Pointer torch position with fluid distortion
      vec2 lightDelta = (pAspect - uLightPos * vec2(uAspect, 1.0)) - disp * 1.4;
      float lightDist = length(lightDelta);

      // Focused compact torch radius (dynamically breathes with kinetic electricity)
      float lightRadius = (0.23 + uMouseVelocity * 0.08) * (0.85 + 0.15 * uKineticEnergy);
      float normDist = lightDist / lightRadius;

      // Primary torch reveal: Smooth Hermite curve that hits EXACTLY 0.0 at the perimeter
      float lightReveal = 0.0;
      if (normDist < 1.0) {
        float f = 1.0 - normDist;
        // Smooth cubic falloff (zero derivative at boundary = perfectly seamless edge)
        float smoothFalloff = f * f * (3.0 - 2.0 * f);
        // Bright radiant center core
        lightReveal = pow(smoothFalloff, 1.15);
      }

      // Secondary trailing wake: momentum light behind moving pointer
      vec2 trailLightDelta = (pAspect - uTrailLightPos * vec2(uAspect, 1.0)) - disp * 1.2;
      float trailLightDist = length(trailLightDelta);
      float trailRadius = lightRadius * 1.05;
      float normTrailDist = trailLightDist / trailRadius;

      float trailReveal = 0.0;
      if (normTrailDist < 1.0) {
        float fTrail = 1.0 - normTrailDist;
        float smoothTrailFalloff = fTrail * fTrail * (3.0 - 2.0 * fTrail);
        trailReveal = smoothTrailFalloff * clamp(uMouseVelocity * 0.55, 0.0, 0.85);
      }

      // Movement generates electricity: light is directly powered by kinetic charge
      // When cursor stays still, uKineticEnergy decays to 0.0 and light disappears
      float activeLight = max(lightReveal, trailReveal) * uMouseActive * uKineticEnergy;

      // Subtle electric kinetic shimmer when actively moving
      float electricPulse = 1.0 + 0.06 * sin(uTime * 28.0 + pAspect.x * 24.0) * min(uMouseVelocity * 0.6, 1.0);
      activeLight *= electricPulse;

      // TOTAL REVEAL: Strictly 0.0 when still / unpowered!
      float totalReveal = activeLight;

      // ============================================================
      // COLOR & SHADING COMPOSITING (Web App Brand Blue / Cyan Theme)
      // ============================================================
      // Background: Deep dark obsidian / slate-950 pool
      vec3 bg = uBgColor;
      bg += vec3(0.010, 0.024, 0.055) * (1.0 - uv.y);

      // When illuminated, high contrast vibrant Electric Brand Blue & Sky Cyan
      vec3 codeColor = mix(uColorSecondary, uColorHighlight, codeSample.a * 0.55 + activeLight * 0.45);
      codeColor = mix(codeColor, uColorPrimary, 0.40);

      // Specular sheen and wave crest highlights (strictly confined to illuminated zone)
      codeColor += uColorHighlight * (waveCrestGlow * 0.45 * activeLight);
      codeColor += uColorHighlight * (spec * 0.35 * activeLight);

      // Droplet impact flash at cursor
      codeColor += uColorHighlight * (dropletImpactGlow * 0.80 * activeLight);

      // Electric Blue & Indigo glint under torch
      codeColor += uColorCyan * (activeLight * 0.28);

      // Ambient soft blue bloom around the torch
      vec3 ambientLightBloom = mix(uColorPrimary, uColorSecondary, 0.40) * activeLight * (0.09 + uMouseVelocity * 0.08);

      // FINAL CODE ALPHA: Exactly 0.0 outside torch, up to 1.0 under torch
      float finalAlpha = codeSample.a * totalReveal;

      // Final compositing: when totalReveal is 0.0, finalColor is 100% pure bg!
      vec3 finalColor = mix(bg, codeColor, finalAlpha);
      finalColor += ambientLightBloom;
      finalColor += uColorHighlight * (dropletImpactGlow * 0.22 * activeLight);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  class LiquidEffect {
    constructor(container, options = {}) {
      if (!container) {
        console.warn('[LiquidEffect] Container element not provided.');
        return;
      }

      this.container = container;
      this.options = Object.assign({
        intensity: 0.55,
        interactive: true
      }, options);

      // Pointer velocity & momentum state
      this.currentMouse = { x: 0.5, y: 0.5 };
      this.targetMouse = { x: 0.5, y: 0.5 };
      this.trailMouse = { x: 0.5, y: 0.5 };
      this.prevMouse = { x: 0.5, y: 0.5 };

      // Soft moving light positions (interpolated for physical feeling)
      this.lightPos = { x: 0.5, y: 0.5 };
      this.trailLightPos = { x: 0.5, y: 0.5 };

      this.currentVelocity = 0.0;
      this.targetVelocity = 0.0;
      this.currentVelocityVec = { x: 0.0, y: 0.0 };
      this.targetVelocityVec = { x: 0.0, y: 0.0 };
      this.lastTime = performance.now();

      // Mouse active state (fades in when hovering, decays when idle)
      this.mouseActive = 0.0;
      this.targetMouseActive = 0.0;

      // Kinetic electricity dynamo: movement generates electricity to produce light
      this.kineticEnergy = 0.0;
      this.lastMoveTime = 0;

      // Fluid intensity
      this.currentIntensity = this.options.intensity;
      this.targetIntensity = this.options.intensity;

      // Droplet ripple impulse array (up to 8 concurrent ripples)
      this.ripples = [];
      for (let i = 0; i < MAX_RIPPLES; i++) {
        this.ripples.push({
          x: 0.5,
          y: 0.5,
          birthTime: -100.0,
          strength: 1.0
        });
      }
      this.rippleUniforms = new Float32Array(MAX_RIPPLES * 4);

      // Bound event listeners
      this._onResize = this._onResize.bind(this);
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerDown = this._onPointerDown.bind(this);
      this._onPointerLeave = this._onPointerLeave.bind(this);
      this._onTouchStart = this._onTouchStart.bind(this);
      this._onTouchMove = this._onTouchMove.bind(this);
      this._animate = this._animate.bind(this);

      this._init();
    }

    _init() {
      if (!THREE) {
        console.warn('[LiquidEffect] Three.js is required but not loaded.');
        return;
      }

      const rect = this.container.getBoundingClientRect();
      this.width = Math.max(rect.width, 10);
      this.height = Math.max(rect.height, 10);

      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.geometry = new THREE.PlaneGeometry(2, 2);

      // Procedural code texture (exact 55 strings, no line numbers)
      this.codeTexture = createCodeTexture();

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Shader Uniforms
      this.uniforms = {
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uAspect: { value: this.width / this.height },
        uTime: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uTrailMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uLightPos: { value: new THREE.Vector2(0.5, 0.5) },
        uTrailLightPos: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVelocityVec: { value: new THREE.Vector2(0.0, 0.0) },
        uMouseVelocity: { value: 0.0 },
        uMouseActive: { value: 0.0 },
        uKineticEnergy: { value: 0.0 },
        uIntensity: { value: this.currentIntensity },
        uReducedMotion: { value: prefersReduced ? 1.0 : 0.0 },
        uRipples: { value: this.rippleUniforms },
        uCodeTexture: { value: this.codeTexture },
        uColorPrimary: { value: new THREE.Vector3(...PALETTE.primary) },
        uColorSecondary: { value: new THREE.Vector3(...PALETTE.secondary) },
        uColorDim: { value: new THREE.Vector3(...PALETTE.dim) },
        uColorVeryDim: { value: new THREE.Vector3(...PALETTE.veryDim) },
        uColorHighlight: { value: new THREE.Vector3(...PALETTE.highlight) },
        uColorCyan: { value: new THREE.Vector3(...PALETTE.cyan) },
        uBgColor: { value: new THREE.Vector3(...PALETTE.bg) }
      };

      this.material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: this.uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false
      });

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(this.mesh);

      // WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });

      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      this.canvas = this.renderer.domElement;
      this.canvas.className = 'liquid-effect-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.display = 'block';
      this.canvas.style.pointerEvents = 'none';

      this.container.appendChild(this.canvas);
      this._onResize();

      // Responsive Observer
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(this._onResize);
        this.resizeObserver.observe(this.container);
      } else {
        window.addEventListener('resize', this._onResize, { passive: true });
      }

      // Attach Interaction Listeners on parent card
      if (this.options.interactive) {
        const target = this.container.closest('.academic-card') || this.container.parentElement || this.container;
        this.interactionTarget = target;

        target.addEventListener('pointermove', this._onPointerMove, { passive: true });
        target.addEventListener('pointerdown', this._onPointerDown, { passive: true });
        target.addEventListener('pointerleave', this._onPointerLeave, { passive: true });
        target.addEventListener('touchstart', this._onTouchStart, { passive: true });
        target.addEventListener('touchmove', this._onTouchMove, { passive: true });
        target.addEventListener('touchend', this._onPointerLeave, { passive: true });
        target.addEventListener('touchcancel', this._onPointerLeave, { passive: true });
      }

      // Start Animation Loop
      this.clock = new THREE.Clock();
      this.isRunning = true;
      this.animationFrameId = requestAnimationFrame(this._animate);
    }

    _onResize() {
      if (!this.container || !this.renderer) return;

      const rect = this.container.getBoundingClientRect();
      const width = Math.max(rect.width, 10);
      const height = Math.max(rect.height, 10);

      this.width = width;
      this.height = height;

      this.renderer.setSize(width, height, false);
      this.uniforms.uResolution.value.set(width, height);
      this.uniforms.uAspect.value = width / height;
    }

    _onPointerMove(e) {
      if (!this.container) return;

      const rect = this.container.getBoundingClientRect();
      const now = performance.now();
      const dt = Math.max((now - this.lastTime) / 1000, 0.001);

      // Normalized UV space [0.0 to 1.0]
      const nx = Math.max(0.0, Math.min(1.0, (e.clientX - rect.left) / rect.width));
      const ny = Math.max(0.0, Math.min(1.0, 1.0 - (e.clientY - rect.top) / rect.height));

      const dx = nx - this.prevMouse.x;
      const dy = ny - this.prevMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dist / dt;

      this.targetMouse.x = nx;
      this.targetMouse.y = ny;

      // Pointer velocity vector & scalar
      this.targetVelocityVec.x = Math.max(-3.0, Math.min(3.0, dx / dt));
      this.targetVelocityVec.y = Math.max(-3.0, Math.min(3.0, dy / dt));
      this.targetVelocity = Math.min(speed, 3.5);

      this.targetMouseActive = 1.0;
      this.lastMoveTime = now;

      // Kinetic Generator: Movement generates electricity to power light
      this.kineticEnergy = Math.min(1.0, this.kineticEnergy + Math.max(0.25, dist * 14.0));

      this.prevMouse.x = nx;
      this.prevMouse.y = ny;
      this.lastTime = now;
    }

    _onPointerDown(e) {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      const nx = Math.max(0.0, Math.min(1.0, (e.clientX - rect.left) / rect.width));
      const ny = Math.max(0.0, Math.min(1.0, 1.0 - (e.clientY - rect.top) / rect.height));

      // Trigger Droplet Impact Ripple Wave & Full Kinetic Charge
      this.addRipple(nx, ny, 1.0);
      this.targetMouseActive = 1.0;
      this.lastMoveTime = performance.now();
      this.kineticEnergy = 1.0;
    }

    _onTouchStart(e) {
      if (e.touches && e.touches.length > 0) {
        this._onPointerDown(e.touches[0]);
      }
    }

    _onTouchMove(e) {
      if (e.touches && e.touches.length > 0) {
        this._onPointerMove(e.touches[0]);
      }
    }

    _onPointerLeave() {
      // Natural friction settling & gradual light fade
      this.targetVelocity = 0.0;
      this.targetVelocityVec.x = 0.0;
      this.targetVelocityVec.y = 0.0;
      this.targetMouseActive = 0.0;
    }

    /**
     * Add a Droplet Impact Ripple Wave at normalized coordinates [0..1]
     * @param {number} normX - UV X coordinate (0.0 = left, 1.0 = right)
     * @param {number} normY - UV Y coordinate (0.0 = bottom, 1.0 = top)
     * @param {number} strength - Ripple energy multiplier [0.2 to 1.5]
     */
    addRipple(normX, normY, strength = 1.0) {
      if (!this.clock) return;

      let oldestIdx = 0;
      let oldestTime = Infinity;
      for (let i = 0; i < MAX_RIPPLES; i++) {
        if (this.ripples[i].birthTime < oldestTime) {
          oldestTime = this.ripples[i].birthTime;
          oldestIdx = i;
        }
      }

      const now = this.clock.getElapsedTime();
      this.ripples[oldestIdx] = {
        x: Math.max(0.0, Math.min(1.0, normX)),
        y: Math.max(0.0, Math.min(1.0, normY)),
        birthTime: now,
        strength: Math.min(Math.max(strength, 0.2), 1.5)
      };
    }

    /**
     * Set fluid activity intensity
     * @param {number} value - Range [0.0, 1.0]
     */
    setIntensity(value) {
      this.targetIntensity = Math.max(0.0, Math.min(1.0, Number(value) || 0.0));
    }

    /**
     * Programmatic pointer interaction
     * @param {number} normX 
     * @param {number} normY 
     */
    setPointer(normX, normY) {
      this.targetMouse.x = Math.max(0.0, Math.min(1.0, normX));
      this.targetMouse.y = Math.max(0.0, Math.min(1.0, normY));
      this.targetMouseActive = 1.0;
    }

    /**
     * Theme synchronization compatibility
     * @param {'dark'|'light'} theme
     */
    setTheme(theme) {
      // Retains signature dark navy developer pool across theme toggles
    }

    _animate() {
      if (!this.isRunning) return;

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Fluid Viscosity: Smooth pointer interpolation
      this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.12;
      this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.12;

      // Soft moving light follows pointer smoothly with slight lag (Section 8)
      this.lightPos.x += (this.targetMouse.x - this.lightPos.x) * 0.10;
      this.lightPos.y += (this.targetMouse.y - this.lightPos.y) * 0.10;

      // Delayed Trail Pointer & Trail Light for physical fluid wake momentum
      this.trailMouse.x += (this.currentMouse.x - this.trailMouse.x) * 0.06;
      this.trailMouse.y += (this.currentMouse.y - this.trailMouse.y) * 0.06;

      this.trailLightPos.x += (this.lightPos.x - this.trailLightPos.x) * 0.055;
      this.trailLightPos.y += (this.lightPos.y - this.trailLightPos.y) * 0.055;

      // Velocity interpolation & friction decay
      this.currentVelocityVec.x += (this.targetVelocityVec.x - this.currentVelocityVec.x) * 0.12;
      this.currentVelocityVec.y += (this.targetVelocityVec.y - this.currentVelocityVec.y) * 0.12;
      this.currentVelocity += (this.targetVelocity - this.currentVelocity) * 0.12;

      this.targetVelocityVec.x *= 0.88;
      this.targetVelocityVec.y *= 0.88;
      this.targetVelocity *= 0.88;

      // Active state smoothing (smooth light fade in/out)
      this.mouseActive += (this.targetMouseActive - this.mouseActive) * 0.08;

      // ============================================================
      // KINETIC DYNAMO / ELECTRICITY DISCHARGE
      // Movement generates electricity to produce light.
      // When cursor stays still, electricity discharges and light smoothly fades away to darkness.
      // ============================================================
      const now = performance.now();
      const stillDuration = (now - this.lastMoveTime) / 1000;

      if (this.targetMouseActive > 0.0) {
        if (stillDuration < 0.22) {
          // Actively moving: maintain/generate full electrical charge
          this.kineticEnergy += (1.0 - this.kineticEnergy) * 0.22;
        } else {
          // Cursor is staying still: electricity discharges and light smoothly disappears
          // Natural smooth decay over ~0.8s
          const dischargeRate = 1.25;
          this.kineticEnergy = Math.max(0.0, this.kineticEnergy - delta * dischargeRate);
        }
      } else {
        // Pointer left the card: rapid discharge to complete darkness
        this.kineticEnergy = Math.max(0.0, this.kineticEnergy - delta * 2.5);
      }

      // Intensity smoothing
      this.currentIntensity += (this.targetIntensity - this.currentIntensity) * 0.06;

      // Update Active Droplet Ripple Uniforms
      for (let i = 0; i < MAX_RIPPLES; i++) {
        const r = this.ripples[i];
        const age = elapsed - r.birthTime;
        const offset = i * 4;
        this.rippleUniforms[offset + 0] = r.x;
        this.rippleUniforms[offset + 1] = r.y;
        this.rippleUniforms[offset + 2] = (age >= 0.0 && age < 3.2) ? age : -1.0;
        this.rippleUniforms[offset + 3] = r.strength;
      }

      // Update Shader Uniforms in-place (Zero heap allocations per frame)
      this.uniforms.uTime.value = elapsed;
      this.uniforms.uMouse.value.set(this.currentMouse.x, this.currentMouse.y);
      this.uniforms.uTrailMouse.value.set(this.trailMouse.x, this.trailMouse.y);
      this.uniforms.uLightPos.value.set(this.lightPos.x, this.lightPos.y);
      this.uniforms.uTrailLightPos.value.set(this.trailLightPos.x, this.trailLightPos.y);
      this.uniforms.uMouseVelocityVec.value.set(this.currentVelocityVec.x, this.currentVelocityVec.y);
      this.uniforms.uMouseVelocity.value = this.currentVelocity;
      this.uniforms.uMouseActive.value = this.mouseActive;
      this.uniforms.uKineticEnergy.value = this.kineticEnergy;
      this.uniforms.uIntensity.value = this.currentIntensity;

      // Render GPU Pass
      this.renderer.render(this.scene, this.camera);

      this.animationFrameId = requestAnimationFrame(this._animate);
    }

    /**
     * Destroy component, dispose WebGL resources and detach listeners
     */
    destroy() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', this._onResize);
      }

      if (this.interactionTarget) {
        this.interactionTarget.removeEventListener('pointermove', this._onPointerMove);
        this.interactionTarget.removeEventListener('pointerdown', this._onPointerDown);
        this.interactionTarget.removeEventListener('pointerleave', this._onPointerLeave);
        this.interactionTarget.removeEventListener('touchstart', this._onTouchStart);
        this.interactionTarget.removeEventListener('touchmove', this._onTouchMove);
        this.interactionTarget.removeEventListener('touchend', this._onPointerLeave);
        this.interactionTarget.removeEventListener('touchcancel', this._onPointerLeave);
      }

      if (this.codeTexture) this.codeTexture.dispose();
      if (this.geometry) this.geometry.dispose();
      if (this.material) this.material.dispose();
      if (this.renderer) {
        this.renderer.dispose();
        if (this.canvas && this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
      }

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.canvas = null;
      this.container = null;
    }
  }

  return LiquidEffect;
});
