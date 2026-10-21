'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface InfiniteMenuItem {
  image: string;
  title: string;
  description: string;
  category: string;
  link: string;
  slug?: string;
  client?: string;
  year?: string;
}

export interface InfiniteMenuProps {
  items: InfiniteMenuItem[];
  scale?: number;
  className?: string;
  count?: number;
  tileSize?: number;
  roundness?: number;
  zoom?: number;
  pullBack?: number;
  stretch?: number;
  inertia?: number;
  autoplay?: number;
  grayscale?: boolean;
  dim?: number;
  intro?: boolean;
  showInfo?: boolean;
  renderInfo?: (item: InfiniteMenuItem, index: number, moving: boolean) => React.ReactNode;
  theme?: 'dark' | 'light';
  accentColor?: string;
  backgroundColor?: string;
  onActiveChange?: (item: InfiniteMenuItem, index: number) => void;
  onItemClick?: (item: InfiniteMenuItem, index: number) => void;
  style?: React.CSSProperties;
}

type Engine = {
  loadItems: (list: InfiniteMenuItem[]) => void;
  wake: () => void;
};

// ---------------------------------------------------------------------------
// GLSL ES 3.00 Custom Shaders
// ---------------------------------------------------------------------------

const VERTEX_SHADER = `#version 300 es
precision highp float;

// Per-vertex attributes (12x12 grid mesh quad)
in vec2 aCorner;

// Per-instance attributes (Instanced tile data)
in vec4 aTile; // xyz = unit sphere position, w = item index

// Uniforms
uniform vec4 uOrientation; // Quaternion [qx, qy, qz, qw]
uniform mat4 uProjection;  // Perspective projection matrix
uniform float uCamera;     // Camera distance along Z
uniform float uRadius;     // Sphere radius
uniform float uTileRadius; // Radius of each tile card
uniform vec4 uSpin;        // xyz = rotation axis, w = angular velocity
uniform float uStretch;    // Stretch factor under velocity
uniform float uShift;      // Vertical screen offset for stacked mobile layout

// Outputs to fragment shader
out vec2 vUv;
out float vFront;
flat out float vItem;

// Rodrigues quaternion rotation
vec3 rotate(vec4 q, vec3 v) {
  vec3 t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

void main() {
  // 1. Rotate tile center by current orientation quaternion
  vec3 center = normalize(rotate(uOrientation, aTile.xyz));

  // 2. Orthonormal basis tangent frame (avoid pole singularity at |y| > 0.999)
  vec3 reference = abs(center.y) > 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(reference, center));
  vec3 bitangent = cross(center, tangent);

  // 3. Scale tile size based on cosine frontness
  float front = max(center.z, 0.0);
  vec3 offset = (tangent * aCorner.x + bitangent * aCorner.y) * uTileRadius * mix(0.5, 1.0, front);

  // 4. Dynamic motion stretch deformation along instantaneous angular velocity vector
  vec3 motion = cross(uSpin.xyz, center);
  float sweep = length(motion);
  if (sweep > 0.0001) {
    vec3 direction = motion / sweep;
    float amount = min(0.9, uSpin.w * uStretch * 0.12) * sweep;
    offset += direction * dot(offset, direction) * amount;
  }

  // 5. Project offset onto sphere surface with subtle curvature dilation
  vec3 world = normalize(center * uRadius + offset) * uRadius * (1.0 + 0.003 * center.z);

  // 6. Project into clip space
  gl_Position = uProjection * vec4(world.xy, world.z - uCamera, 1.0);
  gl_Position.y += uShift * gl_Position.w;

  // 7. Pass varyings
  vUv = aCorner;
  vFront = center.z;
  vItem = aTile.w;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

// Uniforms
uniform sampler2D uAtlas;  // Composite 2D texture atlas
uniform float uCells;      // Grid dimension of atlas
uniform float uInset;      // Sub-texel boundary inset
uniform float uRoundness;  // Corner roundness [0.0, 1.0]
uniform float uGrayscale;  // Inactive tile desaturation amount [0.0, 1.0]
uniform float uDim;        // Background card dimming [0.0, 1.0]
uniform float uReveal;     // Intro animation reveal multiplier [0.0, 1.0]
uniform vec3 uPlaceholder; // Card placeholder base color
uniform vec3 uTone;        // Background dimming tint tone

// Inputs from vertex shader
in vec2 vUv;
in float vFront;
flat in float vItem;

// Fragment output
out vec4 outColor;

void main() {
  // 1. Procedural Signed Distance Field (SDF) rounded box
  float corner = clamp(uRoundness, 0.0, 1.0);
  vec2 q = abs(vUv) - (1.0 - corner);
  float d = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - corner;

  // 2. Screen-space derivative anti-aliasing via fwidth
  float aa = max(fwidth(d), 0.0001);
  float mask = 1.0 - smoothstep(-aa, aa, d);

  // 3. Spherical depth fade (discard backside fragments) and intro reveal
  float alpha = mask * smoothstep(0.02, 0.4, vFront) * uReveal;
  if (alpha < 0.002) discard;

  // 4. Sub-texel texture atlas lookup with inset padding
  float item = floor(vItem + 0.5);
  vec2 cell = vec2(mod(item, uCells), floor(item / uCells));
  vec2 local = vec2(vUv.x, -vUv.y) * 0.5 + 0.5;
  vec4 sampled = texture(uAtlas, (cell + uInset + local * (1.0 - 2.0 * uInset)) / uCells);

  // 5. Alpha composite against placeholder tile base
  vec3 color = mix(uPlaceholder, sampled.rgb, sampled.a);

  // 6. Active Focus Lighting (Tiles facing viewer directly receive focus highlight)
  float focus = smoothstep(0.93, 0.997, vFront);

  // 7. Grayscale desaturation for peripheral/inactive tiles
  float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(color, vec3(gray), uGrayscale * (1.0 - focus));

  // 8. Editorial Bone Aesthetic Shading: Dim and tint background tiles
  color = mix(color, uTone, uDim * (1.0 - focus));

  // 9. Premultiplied alpha output for WebGL2 blending
  outColor = vec4(color * alpha, alpha);
}
`;

// ---------------------------------------------------------------------------
// Self-Contained 3D Vector, Matrix, & Quaternion Math (Zero NPM Dependencies)
// ---------------------------------------------------------------------------

const GRID = 12;
const RADIUS = 2;
const FOV = (30 * Math.PI) / 180;
const FRONT = [0, 0, 1];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = (a: number[], b: number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];

const normalize = (v: number[]) => {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};

const quatMultiply = (a: number[], b: number[]) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
];

const quatAxisAngle = (axis: number[], angle: number) => {
  const s = Math.sin(angle / 2);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
};

const quatNormalize = (q: number[]) => {
  const length = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / length, q[1] / length, q[2] / length, q[3] / length];
};

const rotateVec = (q: number[], v: number[]) => {
  const t = cross(q, v).map(val => val * 2);
  const u = cross(q, t);
  return [v[0] + q[3] * t[0] + u[0], v[1] + q[3] * t[1] + u[1], v[2] + q[3] * t[2] + u[2]];
};

const generateFibonacciSphere = (count: number) => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / count;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    return [Math.cos(golden * i) * ring, y, Math.sin(golden * i) * ring];
  });
};

const luminance = (hex: string) => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.replace(/./g, c => c + c) : value.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return 0;
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

const compileShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

// ---------------------------------------------------------------------------
// Styling & Layout Classes
// ---------------------------------------------------------------------------

const ROOT =
  'relative h-full w-full min-h-[460px] overflow-hidden outline-none @container text-[var(--infinite-menu-text)] [-webkit-tap-highlight-color:transparent] focus-visible:shadow-[inset_0_0_0_2px_var(--infinite-menu-text)] select-none';
const CANVAS = 'absolute inset-0 block h-full w-full cursor-grab touch-none active:cursor-grabbing';
const LAYER = 'group pointer-events-none absolute inset-0';
const CUSTOM = 'pointer-events-none absolute inset-0';
const MOTION =
  'transition-[opacity,translate,scale] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[moving=true]:opacity-0 group-data-[moving=true]:duration-[180ms]';
const TITLE =
  MOTION +
  ' absolute top-1/2 right-[calc(50%_+_var(--infinite-menu-tile,160px)_+_28px)] m-0 max-w-[calc(50%_-_var(--infinite-menu-tile,160px)_-_48px)] -translate-y-1/2 text-right text-[clamp(1.4rem,calc((50cqw_-_var(--infinite-menu-tile,160px))_*_0.22),3.4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance [text-shadow:var(--infinite-menu-shadow)] group-data-[moving=true]:translate-x-4 group-data-[layout=stacked]:top-auto group-data-[layout=stacked]:right-[88px] group-data-[layout=stacked]:bottom-[56px] group-data-[layout=stacked]:left-5 group-data-[layout=stacked]:max-w-none group-data-[layout=stacked]:translate-y-0 group-data-[layout=stacked]:text-left group-data-[layout=stacked]:text-[clamp(1.25rem,6cqw,1.75rem)] group-data-[layout=stacked]:group-data-[moving=true]:translate-x-0 group-data-[layout=stacked]:group-data-[moving=true]:translate-y-3';
const DESCRIPTION =
  MOTION +
  ' absolute top-1/2 left-[calc(50%_+_var(--infinite-menu-tile,160px)_+_28px)] m-0 max-w-[min(26ch,calc(50%_-_var(--infinite-menu-tile,160px)_-_48px))] -translate-y-1/2 text-[clamp(0.85rem,1.5cqw,1.02rem)] leading-[1.55] opacity-[0.88] [text-shadow:var(--infinite-menu-shadow)] group-data-[moving=true]:-translate-x-4 group-data-[layout=stacked]:top-auto group-data-[layout=stacked]:right-[88px] group-data-[layout=stacked]:bottom-[20px] group-data-[layout=stacked]:left-5 group-data-[layout=stacked]:max-w-[36ch] group-data-[layout=stacked]:translate-y-0 group-data-[layout=stacked]:truncate group-data-[layout=stacked]:group-data-[moving=true]:translate-x-0 group-data-[layout=stacked]:group-data-[moving=true]:translate-y-3';
const ACTION =
  'absolute bottom-[7%] left-1/2 grid h-[52px] w-[52px] -translate-x-1/2 cursor-pointer place-items-center rounded-full border-0 bg-[var(--infinite-menu-accent)] p-0 text-[var(--infinite-menu-on-accent)] pointer-events-auto transition-[opacity,translate,scale,background-color] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.06] hover:brightness-105 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--infinite-menu-accent)] group-data-[moving=true]:pointer-events-none group-data-[moving=true]:translate-y-4 group-data-[moving=true]:scale-[0.6] group-data-[moving=true]:opacity-0 group-data-[moving=true]:duration-[180ms] group-data-[layout=stacked]:right-5 group-data-[layout=stacked]:bottom-[22px] group-data-[layout=stacked]:left-auto group-data-[layout=stacked]:translate-x-0 group-data-[layout=stacked]:group-data-[moving=true]:translate-y-3 shadow-lg';

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 17L17 7M17 7H9M17 7V15"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const InfiniteMenu: React.FC<InfiniteMenuProps> = ({
  items = [],
  scale = 1,
  className = '',
  count = 160,
  tileSize = 0.63,
  roundness = 0.2,
  zoom = 1.65,
  pullBack = 1.0,
  stretch = 0.6,
  inertia = 0.6,
  autoplay = 3,
  grayscale = true,
  dim = 0.5,
  intro = true,
  showInfo = true,
  renderInfo,
  theme = 'light',
  accentColor = '#fc4778',
  backgroundColor = 'transparent',
  onActiveChange,
  onItemClick,
  style
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(true);
  const [layout, setLayout] = useState<'side' | 'stacked'>('side');
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Apply scale prop proportionally to tile size and camera zoom
  const effectiveScale = typeof scale === 'number' && !isNaN(scale) && scale > 0 ? scale : 1;
  const effectiveTileSize = tileSize * effectiveScale;
  const effectiveZoom = zoom * effectiveScale;

  const settings = {
    count: clamp(Math.round(count), 6, 400),
    tileSize: clamp(effectiveTileSize, 0.2, 1.5),
    roundness: clamp(roundness, 0, 1),
    zoom: clamp(effectiveZoom, 0.2, 4),
    pullBack: clamp(pullBack, 0, 3),
    stretch: clamp(stretch, 0, 3),
    inertia: clamp(inertia, 0, 1),
    autoplay: Math.max(0, autoplay),
    grayscale,
    dim: clamp(dim, 0, 1),
    intro,
    theme: theme === 'dark' ? 'dark' : 'light'
  };

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const callbacksRef = useRef({ onActiveChange, onItemClick });
  callbacksRef.current = { onActiveChange, onItemClick };

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    // Check for headless / SSR environment without WebGL2
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      setWebGlSupported(false);
      return undefined;
    }

    // Compile and link custom GLSL ES 3.00 shaders
    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!vertex || !fragment || !program) {
      setWebGlSupported(false);
      return undefined;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebGlSupported(false);
      return undefined;
    }

    gl.useProgram(program);

    // Cache uniform locations
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    for (const name of [
      'uOrientation',
      'uProjection',
      'uCamera',
      'uRadius',
      'uTileRadius',
      'uSpin',
      'uStretch',
      'uShift',
      'uAtlas',
      'uCells',
      'uInset',
      'uRoundness',
      'uGrayscale',
      'uDim',
      'uReveal',
      'uPlaceholder',
      'uTone'
    ]) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }

    // Generate 12x12 subdivided quad mesh
    const corners: number[] = [];
    const indices: number[] = [];
    for (let y = 0; y <= GRID; y++) {
      for (let x = 0; x <= GRID; x++) {
        corners.push((x / GRID) * 2 - 1, (y / GRID) * 2 - 1);
      }
    }
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const i = y * (GRID + 1) + x;
        indices.push(i, i + 1, i + GRID + 1, i + 1, i + GRID + 2, i + GRID + 1);
      }
    }

    // VAO & Buffers
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const cornerBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    const cornerLocation = gl.getAttribLocation(program, 'aCorner');
    gl.enableVertexAttribArray(cornerLocation);
    gl.vertexAttribPointer(cornerLocation, 2, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const tileBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tileBuffer);
    const tileLocation = gl.getAttribLocation(program, 'aTile');
    gl.enableVertexAttribArray(tileLocation);
    gl.vertexAttribPointer(tileLocation, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(tileLocation, 1); // 1 instance per tile

    gl.bindVertexArray(null);

    // Offscreen Dynamic 2D Texture Atlas
    const atlasTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    );
    gl.uniform1i(uniforms.uAtlas, 0);

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const atlasCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    const atlas = {
      canvas: atlasCanvas,
      cells: 1,
      cell: 512,
      request: 0,
      dirty: false
    };

    const drag = {
      active: false,
      id: -1,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      moved: 0,
      start: 0
    };

    const state = {
      width: 1,
      height: 1,
      tiles: [] as number[][],
      assign: [] as number[],
      count: 0,
      orientation: quatNormalize([0.08, -0.3, 0, 1]),
      axis: [0, 1, 0],
      speed: settingsRef.current.intro && !reduce ? 3.2 : 0,
      camera: 0,
      target: -1,
      front: 0,
      shown: -1,
      moving: true,
      reveal: 0,
      hovered: false,
      focused: false,
      idle: 0,
      settle: 0,
      tilePx: 0,
      layout: 'side' as 'side' | 'stacked',
      shift: 0,
      started: false
    };

    let raf = 0;
    let timer = 0;
    let last = 0;
    let visible = true;
    let alive = true;

    // Disjoint neighbor assignment on Fibonacci sphere lattice
    const computeLayout = () => {
      const s = settingsRef.current;
      if (s.count === state.count) return;
      state.count = s.count;
      state.tiles = generateFibonacciSphere(s.count);
      const itemsCount = Math.max(1, itemsRef.current.length);
      const usage = new Array(itemsCount).fill(0);
      state.assign = state.tiles.map(() => -1);

      state.tiles.forEach((tile, i) => {
        const near = state.tiles
          .map((other, j) => [j === i ? -2 : dot(tile, other), j])
          .sort((a, b) => b[0] - a[0])
          .slice(0, 6)
          .map(([, j]) => state.assign[j]);

        let pick = -1;
        for (let k = 0; k < itemsCount; k++) {
          const candidate = (i + k) % itemsCount;
          if (near.includes(candidate)) continue;
          if (pick < 0 || usage[candidate] < usage[pick]) pick = candidate;
        }
        if (pick < 0) pick = i % itemsCount;
        state.assign[i] = pick;
        usage[pick] += 1;
      });

      const data = new Float32Array(s.count * 4);
      state.tiles.forEach((tile, i) =>
        data.set([tile[0], tile[1], tile[2], state.assign[i]], i * 4)
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, tileBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

      let first = -1;
      let firstZ = -2;
      state.tiles.forEach((tile, i) => {
        const z = rotateVec(state.orientation, tile)[2];
        if (state.assign[i] === 0 && z > firstZ) {
          firstZ = z;
          first = i;
        }
      });
      state.target = first;
    };

    const uploadAtlas = () => {
      if (!atlas.canvas) return;
      atlas.dirty = false;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
    };

    const loadItems = (list: InfiniteMenuItem[]) => {
      if (!atlas.canvas) return;
      const request = ++atlas.request;
      const total = Math.max(1, list.length);
      atlas.cells = Math.ceil(Math.sqrt(total));
      atlas.cell = clamp(Math.floor(4096 / atlas.cells), 64, 512);
      atlas.canvas.width = atlas.cells * atlas.cell;
      atlas.canvas.height = atlas.cells * atlas.cell;

      const ctx = atlas.canvas.getContext('2d');
      ctx?.clearRect(0, 0, atlas.canvas.width, atlas.canvas.height);
      uploadAtlas();

      state.count = 0;
      computeLayout();

      let pending = list.length;
      if (!pending) state.started = true;

      if (typeof Image === 'undefined') {
        state.started = true;
        wake();
        return;
      }

      list.forEach((item, index) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.decoding = 'async';

        const done = () => {
          pending -= 1;
          if (pending <= 0) state.started = true;
          wake();
        };

        image.onload = () => {
          if (!alive || request !== atlas.request || !ctx) return;
          const size = atlas.cell;
          const nw = image.naturalWidth || image.width || size;
          const nh = image.naturalHeight || image.height || size;
          const imgScale = Math.max(size / nw, size / nh);
          const width = nw * imgScale;
          const height = nh * imgScale;
          const x = (index % atlas.cells) * size;
          const y = Math.floor(index / atlas.cells) * size;

          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, size, size);
          ctx.clip();
          ctx.drawImage(
            image,
            x + (size - width) / 2,
            y + (size - height) / 2,
            width,
            height
          );
          ctx.restore();
          atlas.dirty = true;
          done();
        };

        image.onerror = () => {
          if (!alive || request !== atlas.request) return;
          done();
        };

        image.src = item?.image ?? '';
      });
    };

    const tileRadius = () =>
      0.5 *
      RADIUS *
      Math.sqrt((4 * Math.PI) / Math.max(1, state.count)) *
      settingsRef.current.tileSize;

    const restDistance = () => {
      const s = settingsRef.current;
      const aspect = state.width / state.height;
      const span = Math.tan(FOV / 2) * Math.min(1, aspect);
      return RADIUS + tileRadius() / (0.46 * s.zoom * span);
    };

    const measure = () => {
      const rest = restDistance();
      const radius =
        (tileRadius() / ((rest - RADIUS) * Math.tan(FOV / 2))) * (state.height / 2);
      const rounded = Math.round(radius);
      if (rounded !== state.tilePx) {
        state.tilePx = rounded;
        root.style.setProperty('--infinite-menu-tile', `${rounded}px`);
      }
      const mode = state.width / 2 - radius < 120 ? 'stacked' : 'side';
      if (mode !== state.layout) {
        state.layout = mode;
        setLayout(mode);
      }
    };

    const nearest = () => {
      let best = 0;
      let bestZ = -2;
      for (let i = 0; i < state.tiles.length; i++) {
        const z = rotateVec(state.orientation, state.tiles[i])[2];
        if (z > bestZ) {
          bestZ = z;
          best = i;
        }
      }
      return best;
    };

    const findNeighbor = (from: number, direction: number[]) => {
      const origin = rotateVec(state.orientation, state.tiles[from]);
      let best = -1;
      let bestScore = Infinity;
      for (let i = 0; i < state.tiles.length; i++) {
        if (i === from) continue;
        const c = rotateVec(state.orientation, state.tiles[i]);
        if (c[2] < 0) continue;
        const dx = c[0] - origin[0];
        const dy = c[1] - origin[1];
        const len = Math.hypot(dx, dy);
        if (len < 0.0001) continue;
        const align = (dx * direction[0] + dy * direction[1]) / len;
        if (align < 0.55) continue;
        const score = len * (2.2 - align);
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      }
      return best;
    };

    const goTo = (index: number) => {
      if (index < 0) return;
      state.target = index;
      state.speed = 0;
      state.idle = 0;
      wake();
    };

    const pickTile = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.width / rect.height;
      const span = Math.tan(FOV / 2);
      const x = (((clientX - rect.left) / rect.width) * 2 - 1) * aspect;
      const y = 1 - ((clientY - rect.top) / rect.height) * 2 - state.shift;
      const radius = tileRadius();
      let best = -1;
      let bestDistance = Infinity;

      for (let i = 0; i < state.tiles.length; i++) {
        const c = rotateVec(state.orientation, state.tiles[i]);
        if (c[2] < 0.2) continue;
        const depth = state.camera - c[2] * RADIUS;
        const sx = (c[0] * RADIUS) / (depth * span);
        const sy = (c[1] * RADIUS) / (depth * span);
        const reach = (radius * (0.5 + 0.5 * c[2])) / (depth * span);
        const distance = Math.hypot(sx - x, sy - y);
        if (distance < reach && distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }
      return best;
    };

    const activate = (index: number) => {
      const list = itemsRef.current;
      if (!list.length) return;
      const itemIndex = (state.assign[index] ?? 0) % list.length;
      const item = list[itemIndex];
      const handler = callbacksRef.current.onItemClick;
      if (handler) {
        handler(item, itemIndex);
      } else if (item?.link) {
        if (item.link.startsWith('http')) {
          window.open(item.link, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = item.link;
        }
      }
    };

    const reportActive = () => {
      const list = itemsRef.current;
      const index = list.length ? (state.assign[state.front] ?? 0) % list.length : 0;
      if (!state.moving && index !== state.shown) {
        state.shown = index;
        setActive(index);
        callbacksRef.current.onActiveChange?.(list[index], index);
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive || !visible) return;
      const s = settingsRef.current;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      computeLayout();
      if (atlas.dirty) uploadAtlas();
      if (state.started) {
        state.reveal = Math.min(1, state.reveal + dt / (reduce ? 0.01 : 0.7));
      }

      const minSide = Math.min(state.width, state.height);

      if (drag.active) {
        if (drag.dx || drag.dy) {
          const length = Math.hypot(drag.dx, drag.dy);
          const angle = (length / minSide) * 2.6;
          const axis = normalize([drag.dy, drag.dx, 0]);
          state.orientation = quatNormalize(
            quatMultiply(quatAxisAngle(axis, angle), state.orientation)
          );
          const blend = 1 - Math.exp(-dt * 30);
          state.axis = normalize(state.axis.map((val, i) => val + (axis[i] - val) * blend));
          state.speed += (angle / dt - state.speed) * blend;
          drag.dx = 0;
          drag.dy = 0;
        } else {
          state.speed *= Math.exp(-dt * 14);
        }
      } else {
        if (state.speed > 0.0005) {
          state.orientation = quatNormalize(
            quatMultiply(quatAxisAngle(state.axis, state.speed * dt), state.orientation)
          );
          state.speed *= Math.exp(-dt * (6 - 5 * s.inertia));
        } else {
          state.speed = 0;
        }

        const goal = state.target >= 0 ? state.target : nearest();
        const current = rotateVec(state.orientation, state.tiles[goal]);
        const angle = Math.acos(clamp(dot(current, FRONT), -1, 1));
        const pull = clamp(1 - state.speed / 1.4, 0, 1);

        if (angle > 0.0002 && pull > 0) {
          const axis = cross(current, FRONT);
          const step = angle * (1 - Math.exp(-dt * (state.target >= 0 ? 6 : 8))) * pull;
          if (Math.hypot(axis[0], axis[1], axis[2]) > 1e-6) {
            state.orientation = quatNormalize(
              quatMultiply(quatAxisAngle(normalize(axis), step), state.orientation)
            );
          }
        } else if (state.target >= 0 && state.speed === 0) {
          state.target = -1;
        }
        state.front = goal;
      }

      const settledAngle = Math.acos(
        clamp(rotateVec(state.orientation, state.tiles[state.front])[2], -1, 1)
      );
      const isCurrentlyMoving = drag.active || state.speed > 0.08 || settledAngle > 0.01;

      if (isCurrentlyMoving !== state.moving) {
        state.moving = isCurrentlyMoving;
        setMoving(isCurrentlyMoving);
      }

      state.settle +=
        ((isCurrentlyMoving ? 0 : 1) - state.settle) * (1 - Math.exp(-dt * (isCurrentlyMoving ? 10 : 3)));

      if (!isCurrentlyMoving) reportActive();

      const rest = restDistance();
      const pullAmount = clamp(drag.active ? 1 : state.speed / 2.2, 0, 1);
      const targetDist =
        rest + s.pullBack * pullAmount * RADIUS * 1.25 + (1 - state.reveal) * RADIUS * 1.5;

      if (!state.camera) state.camera = targetDist + RADIUS;
      state.camera += (targetDist - state.camera) * (1 - Math.exp(-dt * 4.5));

      if (s.autoplay > 0 && !isCurrentlyMoving && !state.hovered && !state.focused && !reduce) {
        state.idle += dt;
        if (state.idle >= s.autoplay) {
          state.idle = 0;
          goTo(findNeighbor(state.front, [1, 0]));
        }
      } else {
        state.idle = 0;
      }

      measure();
      const shiftTarget = state.layout === 'stacked' ? Math.min(0.3, 72 / state.height) : 0;
      state.shift += (shiftTarget - state.shift) * (1 - Math.exp(-dt * 6));

      renderScene();

      const busy =
        isCurrentlyMoving ||
        Math.abs(targetDist - state.camera) > 0.001 ||
        Math.abs(
          (state.layout === 'stacked' ? Math.min(0.3, 72 / state.height) : 0) - state.shift
        ) > 0.0005 ||
        Math.abs((isCurrentlyMoving ? 0 : 1) - state.settle) > 0.002 ||
        state.reveal < 1 ||
        atlas.dirty ||
        !state.started;

      if (busy) {
        raf = requestAnimationFrame(frame);
      } else {
        last = 0;
        if (s.autoplay > 0 && !state.hovered && !state.focused && !reduce) {
          clearTimeout(timer);
          timer = window.setTimeout(wake, Math.max(16, (s.autoplay - state.idle) * 1000));
        }
      }
    };

    const renderScene = () => {
      const s = settingsRef.current;
      const aspect = state.width / state.height;
      const f = 1 / Math.tan(FOV / 2);
      const near = 0.05;
      const far = 50;
      const projection = new Float32Array([
        f / aspect,
        0,
        0,
        0,
        0,
        f,
        0,
        0,
        0,
        0,
        (far + near) / (near - far),
        -1,
        0,
        0,
        (2 * far * near) / (near - far),
        0
      ]);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(program);
      const [qx, qy, qz, qw] = state.orientation;
      gl.uniform4f(uniforms.uOrientation, qx, qy, qz, qw);
      gl.uniformMatrix4fv(uniforms.uProjection, false, projection);
      gl.uniform1f(uniforms.uCamera, state.camera);
      gl.uniform1f(uniforms.uRadius, RADIUS);
      gl.uniform1f(uniforms.uTileRadius, tileRadius());
      gl.uniform4f(
        uniforms.uSpin,
        state.axis[0],
        state.axis[1],
        state.axis[2],
        reduce ? 0 : state.speed
      );
      gl.uniform1f(uniforms.uStretch, s.stretch);
      gl.uniform1f(uniforms.uShift, state.shift);
      gl.uniform1f(uniforms.uCells, atlas.cells);
      gl.uniform1f(uniforms.uInset, 2 / atlas.cell);
      gl.uniform1f(uniforms.uRoundness, s.roundness);
      gl.uniform1f(uniforms.uGrayscale, s.grayscale ? 1 : 0);
      gl.uniform1f(uniforms.uDim, s.dim * (0.45 + 0.55 * state.settle));
      gl.uniform1f(uniforms.uReveal, state.reveal);

      // Thinking Gods editorial bone palette shading
      if (s.theme === 'light') {
        gl.uniform3f(uniforms.uPlaceholder, 0.91, 0.91, 0.91);
        gl.uniform3f(uniforms.uTone, 0.945, 0.945, 0.945); // #f1f1f1 bone tone
      } else {
        gl.uniform3f(uniforms.uPlaceholder, 0.13, 0.12, 0.15);
        gl.uniform3f(uniforms.uTone, 0.04, 0.035, 0.05);
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.bindVertexArray(vao);
      gl.drawElementsInstanced(
        gl.TRIANGLES,
        indices.length,
        gl.UNSIGNED_SHORT,
        0,
        state.tiles.length
      );
      gl.bindVertexArray(null);
    };

    const wake = () => {
      clearTimeout(timer);
      if (raf || !alive || !visible) return;
      raf = requestAnimationFrame(frame);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      try {
        canvas.setPointerCapture?.(event.pointerId);
      } catch {
        // Fallback for non-supporting environments
      }
      drag.active = true;
      drag.id = event.pointerId;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.dx = 0;
      drag.dy = 0;
      drag.moved = 0;
      drag.start = performance.now();
      state.target = -1;
      wake();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.dx += dx;
      drag.dy += dy;
      drag.moved += Math.hypot(dx, dy);
      wake();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!drag.active || event.pointerId !== drag.id) return;
      drag.active = false;
      try {
        canvas.releasePointerCapture?.(event.pointerId);
      } catch {
        // Fallback
      }
      if (drag.moved < 6 && performance.now() - drag.start < 450) {
        const index = pickTile(event.clientX, event.clientY);
        if (index >= 0 && index === state.front) activate(index);
        else if (index >= 0) goTo(index);
      }
      wake();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const directions: Record<string, number[]> = {
        ArrowRight: [1, 0],
        ArrowLeft: [-1, 0],
        ArrowUp: [0, 1],
        ArrowDown: [0, -1]
      };
      if (directions[event.key]) {
        event.preventDefault();
        goTo(
          findNeighbor(state.target >= 0 ? state.target : state.front, directions[event.key])
        );
      } else if (event.key === 'Enter' && event.target === root) {
        event.preventDefault();
        activate(state.front);
      }
    };

    const onEnter = () => {
      state.hovered = true;
    };

    const onLeave = () => {
      state.hovered = false;
      wake();
    };

    const onFocusIn = () => {
      state.focused = true;
    };

    const onFocusOut = (event: FocusEvent) => {
      if (root.contains(event.relatedTarget as Node | null)) return;
      state.focused = false;
      wake();
    };

    const resize = () => {
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
      state.width = Math.max(1, root.clientWidth);
      state.height = Math.max(1, root.clientHeight);
      canvas.width = Math.round(state.width * dpr);
      canvas.height = Math.round(state.height * dpr);
      if (!raf) renderScene();
      wake();
    };

    engineRef.current = { loadItems, wake };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    root.addEventListener('keydown', onKeyDown);
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(root);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', resize);
    }

    let visibilityObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      visibilityObserver = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible) {
          last = 0;
          wake();
        }
      });
      visibilityObserver.observe(root);
    }

    computeLayout();
    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      engineRef.current = null;

      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      root.removeEventListener('keydown', onKeyDown);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);

      resizeObserver?.disconnect();
      if (!resizeObserver && typeof window !== 'undefined') {
        window.removeEventListener('resize', resize);
      }
      visibilityObserver?.disconnect();

      if (gl && !gl.isContextLost()) {
        gl.deleteTexture(atlasTexture);
        gl.deleteBuffer(cornerBuffer);
        gl.deleteBuffer(indexBuffer);
        gl.deleteBuffer(tileBuffer);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
      }
    };
  }, []);

  useEffect(() => {
    engineRef.current?.loadItems(items);
  }, [items]);

  useEffect(() => {
    engineRef.current?.wake();
  });

  const current = items.length ? items[active % items.length] : null;
  const ink = settings.theme === 'light' ? '#1a1a1a' : '#ffffff';
  const accent = accentColor || '#fc4778';
  const onAccent = luminance(accent) > 0.5 ? '#1a1a1a' : '#ffffff';
  const hasAction = Boolean(current?.link || onItemClick);

  const handleAction = (event: React.MouseEvent) => {
    if (!current) return;
    if (onItemClick) {
      onItemClick(current, active % items.length);
      if (!current.link) event.preventDefault();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`${ROOT}${className ? ` ${className}` : ''}`}
      tabIndex={0}
      role="region"
      aria-roledescription="3d infinite menu"
      aria-label={current?.title ? `${current.title} - 3D Project Showcase` : '3D Project Showcase'}
      style={
        {
          backgroundColor,
          '--infinite-menu-text': ink,
          '--infinite-menu-accent': accent,
          '--infinite-menu-on-accent': onAccent,
          '--infinite-menu-shadow':
            settings.theme === 'light'
              ? '0 2px 20px rgba(241, 241, 241, 0.85)'
              : '0 2px 20px rgba(0, 0, 0, 0.45)',
          ...style
        } as React.CSSProperties
      }
    >
      {/* Native WebGL2 Hardware Accelerated Canvas */}
      <canvas ref={canvasRef} className={CANVAS} />

      {/* Synchronized Responsive DOM Overlay Layer */}
      {showInfo &&
        current &&
        (renderInfo ? (
          <div className={CUSTOM}>{renderInfo(current, active % items.length, moving)}</div>
        ) : (
          <div
            className={LAYER}
            data-moving={moving ? 'true' : undefined}
            data-layout={layout}
          >
            {/* Active Project Title */}
            {current.title && (
              <div className={TITLE}>
                <h2 className="m-0 text-inherit leading-[1.02] font-semibold tracking-[-0.035em] font-display text-balance">
                  {current.title}
                </h2>
              </div>
            )}

            {/* Project Category & Editorial Description */}
            {(current.description || current.category) && (
              <div className={DESCRIPTION}>
                {current.category && (
                  <span className="block text-[11px] uppercase tracking-[0.14em] font-mono text-[#fc4778] mb-1.5 font-semibold">
                    {current.category}
                  </span>
                )}
                {current.description && (
                  <p className="m-0 font-sans leading-[1.55] text-inherit">
                    {current.description}
                  </p>
                )}
              </div>
            )}

            {/* Circular Signature Hot Pink Action Button */}
            {hasAction &&
              (current.link ? (
                <a
                  className={ACTION}
                  href={current.link}
                  target={current.link.startsWith('http') ? '_blank' : undefined}
                  rel={current.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={current.title ? `View ${current.title}` : 'View project'}
                  onClick={handleAction}
                >
                  <ArrowIcon />
                </a>
              ) : (
                <button
                  type="button"
                  className={ACTION}
                  aria-label={current.title ? `View ${current.title}` : 'View project'}
                  onClick={handleAction}
                >
                  <ArrowIcon />
                </button>
              ))}
          </div>
        ))}

      {/* Headless / SSR / Test Environment Graceful Fallback */}
      {!webGlSupported && items.length > 0 && (
        <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center overflow-y-auto pointer-events-auto bg-[#f1f1f1]">
          <div className="max-w-2xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                className="group block p-5 rounded-[14px] bg-[#fafafa] border border-[#2b2b2b]/10 text-left hover:border-[#fc4778] transition-all no-underline"
              >
                {item.image && (
                  <div className="aspect-[4/3] rounded-[10px] overflow-hidden mb-3 bg-[#e8e8e8]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                )}
                {item.category && (
                  <span className="block text-[10px] uppercase tracking-[0.14em] font-mono text-[#fc4778] font-semibold mb-1">
                    {item.category}
                  </span>
                )}
                <h3 className="font-display font-medium text-lg text-[#2b2b2b] m-0 group-hover:text-[#fc4778] transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="font-sans text-xs text-[#2b2b2b]/70 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfiniteMenu;
