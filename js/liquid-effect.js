/**
 * ============================================================
 * FULL-BOX LIQUID CODE SURFACE WITH DROPLET IMPACT & WAVE DYNAMICS
 * ============================================================
 * Reusable WebGL Fluid Simulation powered by Three.js & Custom GLSL.
 * 
 * CORE MENTAL MODEL:
 * A rectangular pool filled not with water, but with thousands of
 * lines of programming code arranged in horizontal line-wise rows.
 * Moving the hand through it bends, stretches, and flows the code.
 * Dropping a droplet (clicking) creates expanding concentric ripples
 * that physically deform the code characters as the waves propagate.
 * 
 * FEATURES:
 * 1. Procedural High-Res Code Texture (Offscreen Canvas, 2048x1024)
 *    - Line numbers (01, 02, ... 45) in dim green
 *    - Modern syntax highlighting with green developer palette
 *    - Varied indentation, line lengths, and optical depth tiers
 * 2. GPU Fluid Displacement Simulation
 *    - Base organic FBM domain-warped movement (continuous, non-looping)
 *    - Inertial pointer velocity & directional wake trail (moving hand)
 *    - Droplet impact & expanding circular ripple waves (concentric rings)
 *    - Multi-click impulse history (up to 8 concurrent ripples)
 * 3. Unified Displacement Sampling
 *    - vec2 distortedUV = uv + totalDisplacement
 *    - Code characters themselves physically bend, ripple, and stretch
 * 4. Dimensional Specular Shading & Normal Estimation
 *    - Wave crest highlights (#9CFFC1), subtle cyan edge illumination
 *    - Deep dark navy developer background (#020617 / #050c1e)
 * 5. Full Preservation of Existing UI
 *    - WebGL canvas sits behind UI (pointer-events: none)
 *    - HTML content stays sharp, readable, and 100% interactive
 * 6. Responsive & Production-Ready
 *    - ResizeObserver, zero frame allocations, prefers-reduced-motion
 *    - Public API: setIntensity, addRipple, setPointer, destroy
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

  // Modern Futuristic Developer Green Palette
  const PALETTE = {
    primary: [0.224, 1.0, 0.533],     // #39FF88 - Vibrant Developer Green
    secondary: [0.094, 0.788, 0.475],  // #18C979 - Midtone Green
    dim: [0.043, 0.435, 0.271],        // #0B6F45 - Deep Dim Green
    highlight: [0.612, 1.0, 0.757],    // #9CFFC1 - Crest & Keyword Mint
    cyan: [0.220, 0.741, 0.973],       // #38BDF8 - Subtle Liquid Glint
    bg: [0.012, 0.027, 0.071]          // #030712 - Deep Dark Navy / Obsidian
  };

  // Realistic Programming Code Lines for Offscreen Texture
  const CODE_LINES = [
    { num: '01', indent: 0, text: "const data = await fetch('/api/projects');", depth: 1.0 },
    { num: '02', indent: 0, text: "const response = await data.json();", depth: 0.9 },
    { num: '03', indent: 0, text: "const result = response.map(item => item);", depth: 0.85 },
    { num: '04', indent: 0, text: "function updateState(value) {", depth: 0.95 },
    { num: '05', indent: 1, text: "setState(previous => ({ ...previous, value }));", depth: 0.8 },
    { num: '06', indent: 0, text: "}", depth: 0.7 },
    { num: '07', indent: 0, text: "async function initialize() {", depth: 0.95 },
    { num: '08', indent: 1, text: "const result = await fetchData();", depth: 0.85 },
    { num: '09', indent: 1, text: "return result.filter(r => r.verified);", depth: 0.9 },
    { num: '10', indent: 0, text: "}", depth: 0.7 },
    { num: '11', indent: 0, text: "const users = data.filter(user => user.active);", depth: 0.8 },
    { num: '12', indent: 0, text: "export const App = () => {", depth: 1.0 },
    { num: '13', indent: 1, text: "const state = createState(config);", depth: 0.85 },
    { num: '14', indent: 1, text: "useEffect(() => subscribe(), []);", depth: 0.9 },
    { num: '15', indent: 1, text: "return render(state);", depth: 0.8 },
    { num: '16', indent: 0, text: "};", depth: 0.65 },
    { num: '17', indent: 0, text: "def forward(self, q: Tensor, k: Tensor, v: Tensor):", depth: 0.95 },
    { num: '18', indent: 1, text: "d_k = q.size(-1)", depth: 0.75 },
    { num: '19', indent: 1, text: "scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)", depth: 0.9 },
    { num: '20', indent: 1, text: "attn = F.softmax(scores, dim=-1)", depth: 0.85 },
    { num: '21', indent: 1, text: "return torch.matmul(attn, v), attn", depth: 0.9 },
    { num: '22', indent: 0, text: "export default function LiquidSurface({ tension = 0.85 }) {", depth: 1.0 },
    { num: '23', indent: 1, text: "const [field, setField] = useState(initFluidGrid);", depth: 0.85 },
    { num: '24', indent: 1, text: "const gl = canvas.getContext('webgl2', { alpha: true });", depth: 0.9 },
    { num: '25', indent: 1, text: "requestAnimationFrame(renderLoop);", depth: 0.8 },
    { num: '26', indent: 0, text: "}", depth: 0.7 },
    { num: '27', indent: 0, text: "const pipeline = device.createComputePipeline({ layout });", depth: 0.85 },
    { num: '28', indent: 0, text: "vector<int> dijkstra(int src, const vector<vector<pii>>& adj) {", depth: 0.95 },
    { num: '29', indent: 1, text: "priority_queue<pii, vector<pii>, greater<pii>> pq;", depth: 0.85 },
    { num: '30', indent: 1, text: "dist[src] = 0; pq.push({0, src});", depth: 0.9 },
    { num: '31', indent: 1, text: "while (!pq.empty()) {", depth: 0.85 },
    { num: '32', indent: 2, text: "auto [d, u] = pq.top(); pq.pop();", depth: 0.8 },
    { num: '33', indent: 2, text: "if (d > dist[u]) continue;", depth: 0.75 },
    { num: '34', indent: 1, text: "}", depth: 0.65 },
    { num: '35', indent: 0, text: "}", depth: 0.6 },
    { num: '36', indent: 0, text: "class AutonomousRoverNode : public rclcpp::Node {", depth: 0.95 },
    { num: '37', indent: 1, text: "auto cmd = geometry_msgs::msg::Twist();", depth: 0.85 },
    { num: '38', indent: 1, text: "cmd.linear.x = computeVelocity(obstacleDist);", depth: 0.85 },
    { num: '39', indent: 1, text: "publisher_->publish(cmd);", depth: 0.8 },
    { num: '40', indent: 0, text: "};", depth: 0.6 },
    { num: '41', indent: 0, text: "const [uMouse, setMouse] = useSpring({ tension: 120 });", depth: 0.9 },
    { num: '42', indent: 0, text: "vec2 distortedUV = uv + displacementField;", depth: 0.95 },
    { num: '43', indent: 0, text: "vec4 fluidCode = texture2D(uCodeTexture, distortedUV);", depth: 1.0 },
    { num: '44', indent: 0, text: "gl_FragColor = vec4(fluidCode.rgb, 1.0);", depth: 0.9 },
    { num: '45', indent: 0, text: "// GPU fluid advection step completed with 60fps tension", depth: 0.55 }
  ];

  // Helper to generate a crisp procedural Code Texture on an offscreen canvas
  function createCodeTexture() {
    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Clean transparent background
    ctx.clearRect(0, 0, width, height);

    const rowHeight = 22;
    const totalRows = Math.floor(height / rowHeight);
    const numColX = 18;
    const col1X = 64;
    const col2X = 1060;

    // Font setup
    ctx.textBaseline = 'middle';

    const KEYWORDS = new Set([
      'const', 'let', 'var', 'function', 'async', 'await', 'export', 'default',
      'return', 'def', 'class', 'if', 'else', 'while', 'for', 'import', 'from',
      'auto', 'void', 'public', 'int', 'vector', 'priority_queue', 'new'
    ]);

    function renderCodeLine(lineData, lineNum, startX, startY) {
      const lineNumStr = String(lineNum).padStart(2, '0');
      const depth = lineData.depth || 0.8;

      // 1. Line Number in Dim Green
      ctx.font = '500 12px "JetBrains Mono", "SF Mono", monospace';
      ctx.fillStyle = `rgba(11, 111, 69, ${0.45 * depth})`;
      ctx.fillText(lineNumStr, startX, startY);

      // 2. Code Line with Tokenized Syntax Colors
      let curX = startX + 38 + (lineData.indent || 0) * 20;
      ctx.font = '600 13px "JetBrains Mono", "SF Mono", "Courier New", monospace';

      const tokens = lineData.text.match(/(['"`].*?['"`])|\b([a-zA-Z_]\w*)\b|([0-9]+)|([=><+\-*/&|!{}();:,.\[\]])|(\s+)/g) || [lineData.text];

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (/^\s+$/.test(token)) {
          curX += ctx.measureText(token).width;
          continue;
        }

        if (token.startsWith('//')) {
          ctx.fillStyle = `rgba(11, 111, 69, ${0.65 * depth})`;
        } else if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
          ctx.fillStyle = `rgba(24, 201, 121, ${0.9 * depth})`; // Secondary Green
        } else if (KEYWORDS.has(token)) {
          ctx.fillStyle = `rgba(156, 255, 193, ${0.98 * depth})`; // Mint Highlight
        } else if (/^[0-9]+$/.test(token)) {
          ctx.fillStyle = `rgba(24, 201, 121, ${0.85 * depth})`;
        } else if (/^[=><+\-*/&|!{}();:,.\[\]]$/.test(token)) {
          ctx.fillStyle = `rgba(57, 255, 136, ${0.6 * depth})`;
        } else {
          ctx.fillStyle = `rgba(57, 255, 136, ${0.9 * depth})`; // Primary Green
        }

        ctx.fillText(token, curX, startY);
        curX += ctx.measureText(token).width;
      }
    }

    // Render lines across both columns to fill the full horizontal pool
    for (let row = 0; row < totalRows; row++) {
      const y = row * rowHeight + rowHeight * 0.5 + 4;
      const lineData1 = CODE_LINES[row % CODE_LINES.length];
      const lineData2 = CODE_LINES[(row + 17) % CODE_LINES.length];

      renderCodeLine(lineData1, (row % 99) + 1, numColX, y);
      renderCodeLine(lineData2, ((row + 45) % 99) + 1, col2X, y);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    return texture;
  }

  // Vertex Shader: Fullscreen quad projection
  const VERTEX_SHADER = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  // Fragment Shader: Liquid Code Surface + Pointer Wake + Droplet Ripple Dynamics
  const FRAGMENT_SHADER = /* glsl */ `
    precision highp float;

    varying vec2 vUv;

    uniform vec2 uResolution;
    uniform float uAspect;
    uniform float uTime;
    uniform vec2 uMouse;              // Pointer in UV [0, 1]
    uniform vec2 uTrailMouse;         // Trailing pointer for momentum wake
    uniform vec2 uMouseVelocityVec;   // Directional pointer velocity vector
    uniform float uMouseVelocity;     // Smoothed velocity magnitude
    uniform float uIntensity;         // Base fluid intensity
    uniform float uReducedMotion;     // prefers-reduced-motion flag

    // Active droplet ripples: vec4(normX, normY, ageInSeconds, strength)
    #define MAX_RIPPLES 8
    uniform vec4 uRipples[MAX_RIPPLES];

    uniform sampler2D uCodeTexture;

    // Theme Palette Uniforms
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform vec3 uColorDim;
    uniform vec3 uColorHighlight;
    uniform vec3 uColorCyan;
    uniform vec3 uBgColor;

    // Fast 2D Hash
    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    // 2D Gradient Noise with Hermite interpolation
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

    // 2D Rotation matrix
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

    // Evaluates fluid displacement vector at any UV coordinate
    vec2 getFluidDisplacement(vec2 uv, float t) {
      vec2 disp = vec2(0.0);
      float motionScale = mix(1.0, 0.18, uReducedMotion);
      vec2 pAspect = uv * vec2(uAspect, 1.0);

      // 1. BASE ORGANIC LIQUID MOTION (Continuous subtle fluid undulation)
      float tSlow = t * 0.038 * motionScale;
      float n1 = fbm(pAspect * 2.5 + vec2(tSlow, -tSlow * 0.85));
      float n2 = fbm(pAspect * 4.4 - vec2(tSlow * 0.75, tSlow * 1.15));
      vec2 baseOrganic = vec2(n1, n2) * 0.016 * uIntensity * motionScale;
      disp += baseOrganic;

      // 2. MOUSE MOVEMENT = LIQUID HAND INTERACTION & FLUID WAKE
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
      float wakeRadius = (0.24 + uMouseVelocity * 0.16) * motionScale;
      float wakeFalloff = smoothstep(wakeRadius, 0.0, distToSeg);

      // Directional drag in velocity direction + radial displacement
      vec2 radialDir = normalize(pAspect - m1 + vec2(0.0001));
      vec2 wakeFlow = (uMouseVelocityVec * 0.38 + radialDir * (0.035 + uMouseVelocity * 0.045)) * wakeFalloff * uIntensity * motionScale;
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

          float waveSpeed = 0.54; // Ripple propagation speed
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

      // Compute total fluid displacement field
      vec2 disp = getFluidDisplacement(uv, uTime);

      // Distort UV coordinates: CODE MOVES WITH THE LIQUID
      vec2 distortedUv = uv + disp;

      // Seamless tiling of code texture across the entire box
      vec2 codeUv = fract(distortedUv);
      vec4 codeSample = texture2D(uCodeTexture, codeUv);

      // Finite difference normal estimation for specular liquid sheen
      float eps = 0.004;
      vec2 dispR = getFluidDisplacement(uv + vec2(eps, 0.0), uTime);
      vec2 dispU = getFluidDisplacement(uv + vec2(0.0, eps), uTime);
      float dHdx = (length(dispR) - length(disp)) / eps;
      float dHdy = (length(dispU) - length(disp)) / eps;
      vec3 normal = normalize(vec3(-dHdx * 3.2, -dHdy * 3.2, 1.0));

      // Directional lighting
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

          // Splash flash at center right upon impact
          if (age < 0.42) {
            float flash = smoothstep(0.09, 0.0, rDist) * smoothstep(0.42, 0.0, age) * rip.w;
            dropletImpactGlow += flash;
          }

          // Crest illumination along expanding concentric wave rings
          float ringDist = abs(rDist - waveFront);
          float ringGlow = exp(-ringDist * 22.0) * exp(-age * 1.35) * rip.w;
          waveCrestGlow += ringGlow;
        }
      }

      // Restrained pointer interaction illumination
      float distToMouse = length(pAspect - uMouse * vec2(uAspect, 1.0));
      float mouseGlow = smoothstep(0.32, 0.0, distToMouse) * (0.06 + uMouseVelocity * 0.12);

      // Background: Deep dark navy developer surface
      vec3 bg = uBgColor;
      // Ambient atmospheric gradient depth
      bg += vec3(0.012, 0.028, 0.065) * (1.0 - uv.y);

      // Fluid code color compositing
      vec3 fluidColor = codeSample.rgb;

      // Add wave crest mint highlights
      fluidColor += uColorHighlight * (waveCrestGlow * 0.52);
      fluidColor += uColorHighlight * (spec * 0.32);

      // Droplet impact splash flash
      fluidColor += uColorHighlight * (dropletImpactGlow * 0.85);

      // Subtle cyan glint in wake
      fluidColor += uColorCyan * (spec * 0.18 + mouseGlow * 0.25);

      // UI Content Readability: Subtly calibrate luminance in the center card area
      vec2 centerVec = (uv - vec2(0.5)) * vec2(1.2, 1.6);
      float centerDist = length(centerVec);
      float centerFade = smoothstep(0.12, 0.65, centerDist);
      float adjustedAlpha = codeSample.a * mix(0.75, 1.0, centerFade);

      // Soft container edge vignette (prevents harsh cutoff at borders)
      float edgeX = smoothstep(0.0, 0.035, uv.x) * smoothstep(1.0, 0.965, uv.x);
      float edgeY = smoothstep(0.0, 0.045, uv.y) * smoothstep(1.0, 0.955, uv.y);
      float edgeMask = edgeX * edgeY;

      // Composite final color
      vec3 finalColor = mix(bg, fluidColor, adjustedAlpha * 0.94);
      finalColor += uColorPrimary * (mouseGlow * 0.06) * edgeMask;
      finalColor += uColorHighlight * (dropletImpactGlow * 0.2) * edgeMask;

      gl_FragColor = vec4(finalColor, edgeMask);
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

      this.currentVelocity = 0.0;
      this.targetVelocity = 0.0;
      this.currentVelocityVec = { x: 0.0, y: 0.0 };
      this.targetVelocityVec = { x: 0.0, y: 0.0 };
      this.lastTime = performance.now();

      // Fluid intensity
      this.currentIntensity = this.options.intensity;
      this.targetIntensity = this.options.intensity;

      // Droplet ripple impulse array
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

      // Bound handlers
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

      // Three.js Scene & Orthographic Camera for Fullscreen Quad
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      this.geometry = new THREE.PlaneGeometry(2, 2);

      // Procedural Code Texture Generation
      this.codeTexture = createCodeTexture();

      // Check prefers-reduced-motion
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Shader Uniforms
      this.uniforms = {
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uAspect: { value: this.width / this.height },
        uTime: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uTrailMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVelocityVec: { value: new THREE.Vector2(0.0, 0.0) },
        uMouseVelocity: { value: 0.0 },
        uIntensity: { value: this.currentIntensity },
        uReducedMotion: { value: prefersReduced ? 1.0 : 0.0 },
        uRipples: { value: this.rippleUniforms },
        uCodeTexture: { value: this.codeTexture },
        uColorPrimary: { value: new THREE.Vector3(...PALETTE.primary) },
        uColorSecondary: { value: new THREE.Vector3(...PALETTE.secondary) },
        uColorDim: { value: new THREE.Vector3(...PALETTE.dim) },
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

      // Attach Pointer & Droplet Interaction Listeners
      if (this.options.interactive) {
        // Listen on parent card so the entire box is the interactive fluid surface
        const target = this.container.closest('.academic-card') || this.container.parentElement || this.container;
        this.interactionTarget = target;

        target.addEventListener('pointermove', this._onPointerMove, { passive: true });
        target.addEventListener('pointerdown', this._onPointerDown, { passive: true });
        target.addEventListener('pointerleave', this._onPointerLeave, { passive: true });
        target.addEventListener('touchstart', this._onTouchStart, { passive: true });
        target.addEventListener('touchmove', this._onTouchMove, { passive: true });
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

      this.prevMouse.x = nx;
      this.prevMouse.y = ny;
      this.lastTime = now;
    }

    _onPointerDown(e) {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      const nx = Math.max(0.0, Math.min(1.0, (e.clientX - rect.left) / rect.width));
      const ny = Math.max(0.0, Math.min(1.0, 1.0 - (e.clientY - rect.top) / rect.height));

      // Trigger Droplet Impact Ripple Wave
      this.addRipple(nx, ny, 1.0);
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
      // Natural friction settling
      this.targetVelocity = 0.0;
      this.targetVelocityVec.x = 0.0;
      this.targetVelocityVec.y = 0.0;
    }

    /**
     * Add a Droplet Impact Ripple Wave at normalized coordinates [0..1]
     * @param {number} normX - UV X coordinate (0.0 = left, 1.0 = right)
     * @param {number} normY - UV Y coordinate (0.0 = bottom, 1.0 = top)
     * @param {number} strength - Ripple energy multiplier [0.2 to 1.5]
     */
    addRipple(normX, normY, strength = 1.0) {
      if (!this.clock) return;

      // Find oldest ripple or unused slot
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
      this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.14;
      this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.14;

      // Delayed Trail Pointer for Physical Wake Momentum
      this.trailMouse.x += (this.currentMouse.x - this.trailMouse.x) * 0.065;
      this.trailMouse.y += (this.currentMouse.y - this.trailMouse.y) * 0.065;

      // Velocity interpolation & friction decay
      this.currentVelocityVec.x += (this.targetVelocityVec.x - this.currentVelocityVec.x) * 0.12;
      this.currentVelocityVec.y += (this.targetVelocityVec.y - this.currentVelocityVec.y) * 0.12;
      this.currentVelocity += (this.targetVelocity - this.currentVelocity) * 0.12;

      this.targetVelocityVec.x *= 0.88;
      this.targetVelocityVec.y *= 0.88;
      this.targetVelocity *= 0.88;

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

      // Update Shader Uniforms in-place (Zero GC allocation per frame)
      this.uniforms.uTime.value = elapsed;
      this.uniforms.uMouse.value.set(this.currentMouse.x, this.currentMouse.y);
      this.uniforms.uTrailMouse.value.set(this.trailMouse.x, this.trailMouse.y);
      this.uniforms.uMouseVelocityVec.value.set(this.currentVelocityVec.x, this.currentVelocityVec.y);
      this.uniforms.uMouseVelocity.value = this.currentVelocity;
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
