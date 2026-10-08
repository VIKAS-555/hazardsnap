/**
 * ============================================================
 * LIQUID EFFECT — GPU-ACCELERATED PROCEDURAL FLUID SHADER
 * ============================================================
 * Reusable WebGL fluid component powered by Three.js & Custom GLSL.
 * Designed natively for BST Tech Club / Department of CSE (AI & ML).
 * 
 * Features:
 * - Domain-warped Fractal Brownian Motion (FBM) fluid dynamics
 * - Organic dimensional lighting (specular sheen, pseudo-normals, fresnel rim)
 * - Soft edge masking (naturally dissolves into UI background)
 * - Inertial pointer reaction (physical fluid viscosity & pressure)
 * - Automatic Light / Dark theme synchronization
 * - Respects prefers-reduced-motion
 * - Auto-resize with ResizeObserver
 * - Zero frame object allocation for 60fps performance
 * - Public API: liquidEffect.setIntensity(0 -> 1)
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

  // Vertex Shader: Fullscreen quad projection
  const VERTEX_SHADER = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  // Fragment Shader: Organic multi-layered domain-warped liquid
  const FRAGMENT_SHADER = /* glsl */ `
    precision highp float;

    varying vec2 vUv;

    uniform vec2 uResolution;
    uniform float uAspect;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMouseVelocity;
    uniform float uIntensity;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform vec3 uColorDeep;
    uniform vec3 uColorHighlight;
    uniform vec3 uBgColor;
    uniform float uReducedMotion;

    // 2D Rotation matrix
    mat2 rot(float a) {
      float c = cos(a);
      float s = sin(a);
      return mat2(c, -s, s, c);
    }

    // 2D Hash
    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    // Gradient Noise with cubic hermite interpolation
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

    // 4-Octave Fractal Brownian Motion with octave rotation
    float fbm(vec2 p) {
      float f = 0.0;
      mat2 m = rot(0.5235); // 30 degrees
      f += 0.5000 * gnoise(p); p = m * p * 2.02;
      f += 0.2500 * gnoise(p); p = m * p * 2.04;
      f += 0.1250 * gnoise(p); p = m * p * 2.01;
      f += 0.0625 * gnoise(p);
      return f;
    }

    // Multi-layer Domain Warping for viscous organic fluid flow
    float pattern(vec2 p, out vec2 q, out vec2 r, float t) {
      // First warping pass
      q.x = fbm(p + vec2(0.0, 0.0) + 0.05 * t);
      q.y = fbm(p + vec2(5.2, 1.3) + 0.04 * t);

      // Second warping pass
      vec2 qWarp = p + 2.2 * q;
      r.x = fbm(qWarp + vec2(1.7, 9.2) + 0.08 * t);
      r.y = fbm(qWarp + vec2(8.3, 2.8) + 0.06 * t);

      // Final warped heightfield
      return fbm(p + 2.0 * r + 0.03 * t);
    }

    void main() {
      // Normalize centered coordinates maintaining aspect ratio
      vec2 p = (vUv - 0.5) * 2.0;
      p.x *= uAspect;

      // Pointer force interaction: subtle physical deformation
      vec2 mousePos = uMouse * vec2(uAspect, 1.0);
      vec2 toMouse = p - mousePos;
      float mouseDist = length(toMouse);
      
      // Smooth localized pressure wave
      float mouseInfluence = exp(-mouseDist * 2.6) * (uMouseVelocity + 0.08);
      vec2 mouseDisp = normalize(toMouse + vec2(0.0001)) * mouseInfluence * 0.28 * uIntensity;
      
      vec2 flowP = p - mouseDisp;

      // Time progression (slow and organic)
      float t = uTime * (uReducedMotion > 0.5 ? 0.08 : 0.45);

      // Generate organic fluid field with domain warping
      vec2 q, r;
      float f = pattern(flowP * 1.35, q, r, t);

      // Organic central liquid shape: soft edge mask fading seamlessly into UI
      // Deform the perimeter using internal fluid flow so there are NO geometric borders
      float centerDist = length(flowP * vec2(1.0, 1.25));
      float shapeWarp = (f * 0.45 + r.x * 0.25) * uIntensity;
      float effectiveDist = centerDist - shapeWarp;

      // Soft progressive mask: dissolves smoothly into background
      float mask = smoothstep(1.15, 0.20, effectiveDist);

      if (mask <= 0.001) {
        gl_FragColor = vec4(uBgColor, 0.0);
        return;
      }

      // Pseudo-normal estimation for dimensional surface lighting
      float eps = 0.012;
      vec2 dummyQ, dummyR;
      float hC = f;
      float hR = pattern((flowP + vec2(eps, 0.0)) * 1.35, dummyQ, dummyR, t);
      float hU = pattern((flowP + vec2(0.0, eps)) * 1.35, dummyQ, dummyR, t);
      vec3 normal = normalize(vec3((hC - hR) * 3.8, (hC - hU) * 3.8, 0.28));

      // Key light from top-left
      vec3 lightDir = normalize(vec3(-0.45, 0.65, 0.70));
      float diffuse = max(dot(normal, lightDir), 0.0);

      // Specular sheen (caustic liquid highlights)
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfDir), 0.0), 22.0) * (0.45 + 0.45 * uIntensity);

      // Fresnel edge glow (subtle dimensional depth)
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.8) * 0.55;

      // Color Palette Interpolation based on our application theme
      // Layer A: Deep core -> Primary Royal Blue
      vec3 col = mix(uColorDeep, uColorA, smoothstep(-0.2, 0.4, f));
      
      // Layer B: Tech Electric Blue / Indigo midtones
      col = mix(col, uColorB, smoothstep(0.1, 0.7, r.x));
      
      // Layer C: High-frequency accent swirls
      col = mix(col, uColorC, smoothstep(0.2, 0.85, q.y));

      // Add specular and fresnel edge lighting
      col += uColorHighlight * (spec * 0.75 + fresnel * 0.35);

      // Subtle ambient depth modulation
      col *= (0.75 + 0.35 * diffuse);

      // Blend smoothly into the container's background color
      vec3 finalRgb = mix(uBgColor, col, mask);
      float finalAlpha = mask * (0.85 + spec * 0.4);

      gl_FragColor = vec4(finalRgb, clamp(finalAlpha, 0.0, 1.0));
    }
  `;

  // Palette definitions derived directly from application theme
  const THEME_PALETTES = {
    dark: {
      colorA: [0.145, 0.388, 0.922],      // Primary Blue (#2563eb)
      colorB: [0.231, 0.510, 0.965],      // Tech Blue (#3b82f6)
      colorC: [0.388, 0.400, 0.945],      // Indigo Violet (#6366f1)
      colorDeep: [0.035, 0.051, 0.086],   // Midnight Navy (#090d16)
      colorHighlight: [0.60, 0.82, 1.0],  // Azure Specular Sheen
      bgColor: [0.051, 0.075, 0.133]      // Academic Card Bg (#0d1322)
    },
    light: {
      colorA: [0.145, 0.388, 0.922],      // Royal Blue (#2563eb)
      colorB: [0.380, 0.620, 0.980],      // Sky Blue Accent
      colorC: [0.450, 0.480, 0.900],      // Soft Indigo Accent
      colorDeep: [0.937, 0.965, 1.0],     // Light Blue Mist (#eff6ff)
      colorHighlight: [0.98, 0.99, 1.0],  // Clean White Highlight
      bgColor: [1.0, 1.0, 1.0]            // Card White (#ffffff)
    }
  };

  class LiquidEffect {
    /**
     * @param {HTMLElement|string} container - Host container element or query selector
     * @param {Object} [options] - Configuration options
     */
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) {
        console.warn('[LiquidEffect] Container not found.');
        return;
      }

      this.options = Object.assign({
        intensity: 0.5,
        interactive: true,
        reducedMotion: false,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      }, options);

      // Core State
      this.width = 0;
      this.height = 0;
      this.isRunning = false;
      this.targetIntensity = Math.max(0, Math.min(1, this.options.intensity));
      this.currentIntensity = this.targetIntensity;
      
      // Pointer dynamics
      this.targetMouse = { x: 0.0, y: 0.0 };
      this.currentMouse = { x: 0.0, y: 0.0 };
      this.targetVelocity = 0.0;
      this.currentVelocity = 0.0;
      this.lastMousePos = { x: 0.0, y: 0.0 };
      this.lastMouseTime = performance.now();

      // Theme Colors & Transitions
      this.currentTheme = this.options.theme;
      this.palette = THEME_PALETTES[this.currentTheme] || THEME_PALETTES.dark;

      // Bound Event Handlers for clean disposal
      this._onResize = this._onResize.bind(this);
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerLeave = this._onPointerLeave.bind(this);
      this._onTouchMove = this._onTouchMove.bind(this);
      this._animate = this._animate.bind(this);
      this._onThemeMutation = this._onThemeMutation.bind(this);

      // Terminal Telemetry Sync
      this._telemetryTick = 0;
      this._telemetryEl = null;

      this.init();
    }

    init() {
      if (typeof THREE === 'undefined') {
        console.warn('[LiquidEffect] Three.js is required but not loaded.');
        return;
      }

      // Check prefers-reduced-motion
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.isReducedMotion = prefersReduced || this.options.reducedMotion;

      // Initialize Three.js Scene & Orthographic Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // Fullscreen Quad Geometry
      this.geometry = new THREE.PlaneGeometry(2, 2);

      // Uniforms (reused across animation loop, zero allocations per frame)
      this.uniforms = {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uAspect: { value: 1.0 },
        uTime: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(0.0, 0.0) },
        uMouseVelocity: { value: 0.0 },
        uIntensity: { value: this.currentIntensity },
        uReducedMotion: { value: this.isReducedMotion ? 1.0 : 0.0 },
        uColorA: { value: new THREE.Vector3(...this.palette.colorA) },
        uColorB: { value: new THREE.Vector3(...this.palette.colorB) },
        uColorC: { value: new THREE.Vector3(...this.palette.colorC) },
        uColorDeep: { value: new THREE.Vector3(...this.palette.colorDeep) },
        uColorHighlight: { value: new THREE.Vector3(...this.palette.colorHighlight) },
        uBgColor: { value: new THREE.Vector3(...this.palette.bgColor) }
      };

      // Custom ShaderMaterial
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

      // Insert canvas into container
      this.container.appendChild(this.canvas);

      // Initial dimensions
      this._onResize();

      // ResizeObserver for responsive adaptation without fixed dimensions
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(this._onResize);
        this.resizeObserver.observe(this.container);
      } else {
        window.addEventListener('resize', this._onResize, { passive: true });
      }

      // Attach Pointer Listeners if interactive
      if (this.options.interactive) {
        // Listen on container and its parent section for generous interaction zone
        const interactiveTarget = this.container.closest('section') || this.container;
        interactiveTarget.addEventListener('mousemove', this._onPointerMove, { passive: true });
        interactiveTarget.addEventListener('mouseleave', this._onPointerLeave, { passive: true });
        interactiveTarget.addEventListener('touchmove', this._onTouchMove, { passive: true });
      }

      // Theme Synchronization via MutationObserver on <html>
      this.themeObserver = new MutationObserver(this._onThemeMutation);
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      // Start RAF Loop
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
      const dt = Math.max((now - this.lastMouseTime) / 1000, 0.001);

      // Normalized coordinates (-1.0 to 1.0)
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2.0;
      const ny = (-(e.clientY - rect.top) / rect.height + 0.5) * 2.0;

      // Calculate cursor displacement speed
      const dx = nx - this.lastMousePos.x;
      const dy = ny - this.lastMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dist / dt;

      this.targetMouse.x = Math.max(-1.5, Math.min(1.5, nx));
      this.targetMouse.y = Math.max(-1.5, Math.min(1.5, ny));
      this.targetVelocity = Math.min(speed * 0.35, 1.4);

      this.lastMousePos.x = nx;
      this.lastMousePos.y = ny;
      this.lastMouseTime = now;
    }

    _onTouchMove(e) {
      if (e.touches && e.touches.length > 0) {
        this._onPointerMove(e.touches[0]);
      }
    }

    _onPointerLeave() {
      // Smoothly drift pointer back toward calm center
      this.targetMouse.x = 0.0;
      this.targetMouse.y = 0.0;
      this.targetVelocity = 0.0;
    }

    _onThemeMutation() {
      const isDark = document.documentElement.classList.contains('dark');
      this.setTheme(isDark ? 'dark' : 'light');
    }

    /**
     * Set fluid activity intensity
     * @param {number} value - Intensity range [0.0, 1.0]
     */
    setIntensity(value) {
      this.targetIntensity = Math.max(0.0, Math.min(1.0, Number(value) || 0.0));
    }

    /**
     * Switch theme palette
     * @param {'dark'|'light'} theme
     */
    setTheme(theme) {
      const selected = THEME_PALETTES[theme] ? theme : 'dark';
      this.currentTheme = selected;
      const p = THEME_PALETTES[selected];
      this.palette = p;

      if (!this.uniforms) return;

      // Direct uniform update with smooth internal GLSL mix
      this.uniforms.uColorA.value.set(...p.colorA);
      this.uniforms.uColorB.value.set(...p.colorB);
      this.uniforms.uColorC.value.set(...p.colorC);
      this.uniforms.uColorDeep.value.set(...p.colorDeep);
      this.uniforms.uColorHighlight.value.set(...p.colorHighlight);
      this.uniforms.uBgColor.value.set(...p.bgColor);
    }

    _animate() {
      if (!this.isRunning) return;

      const delta = this.clock.getDelta();

      // Smooth pointer interpolation (physical spring/viscosity inertia)
      this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.075;
      this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.075;

      // Velocity decay
      this.currentVelocity += (this.targetVelocity - this.currentVelocity) * 0.09;
      this.targetVelocity *= 0.93; // decay friction

      // Intensity smoothing
      this.currentIntensity += (this.targetIntensity - this.currentIntensity) * 0.06;

      // Update shader uniforms
      this.uniforms.uTime.value += delta;
      this.uniforms.uMouse.value.set(this.currentMouse.x, this.currentMouse.y);
      this.uniforms.uMouseVelocity.value = this.currentVelocity;
      this.uniforms.uIntensity.value = this.currentIntensity;

      // Render single GPU pass
      this.renderer.render(this.scene, this.camera);

      // Real-time telemetry update for floating code terminal
      if (!this._telemetryEl) {
        this._telemetryEl = document.getElementById('telemetry-time');
      }
      if (this._telemetryEl && (++this._telemetryTick % 6 === 0)) {
        this._telemetryEl.textContent = `t: ${this.uniforms.uTime.value.toFixed(1)}s`;
      }

      this.animationFrameId = requestAnimationFrame(this._animate);
    }

    /**
     * Destroy component, dispose WebGL resources, detach listeners
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

      if (this.themeObserver) {
        this.themeObserver.disconnect();
      }

      const interactiveTarget = this.container ? (this.container.closest('section') || this.container) : null;
      if (interactiveTarget) {
        interactiveTarget.removeEventListener('mousemove', this._onPointerMove);
        interactiveTarget.removeEventListener('mouseleave', this._onPointerLeave);
        interactiveTarget.removeEventListener('touchmove', this._onTouchMove);
      }

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
