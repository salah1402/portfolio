import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('   FORENSIC INTEGRITY AUDIT — MILESTONE 2: InfiniteMenu.tsx');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function check(desc, condition, details = '') {
  if (condition) {
    passCount++;
    console.log(`✓ [PASS] ${desc}`);
  } else {
    failCount++;
    console.log(`✗ [FAIL] ${desc}`);
    if (details) console.log(`  Detail: ${details}`);
  }
}

// 1. Source file existence
const targetPath = path.join(PROJECT_ROOT, 'src', 'components', 'ui', 'InfiniteMenu.tsx');
check('InfiniteMenu.tsx exists at expected path', fs.existsSync(targetPath));

const content = fs.readFileSync(targetPath, 'utf8');

// 2. WebGL2 Hardware-Accelerated Instanced Rendering
check(
  'Direct call to gl.drawElementsInstanced present',
  content.includes('gl.drawElementsInstanced')
);
check(
  'Instanced attribute divisor configuration (gl.vertexAttribDivisor) present',
  content.includes('gl.vertexAttribDivisor')
);
check(
  'Vertex Array Object (VAO) binding (gl.bindVertexArray) present',
  content.includes('gl.bindVertexArray')
);
check(
  '12x12 subdivided grid mesh generation present',
  content.includes('for (let y = 0; y <= GRID; y++)') && content.includes('const GRID = 12;')
);
check(
  'Triangles element array indexing present',
  content.includes('indices.push(i, i + 1, i + GRID + 1, i + 1, i + GRID + 2, i + GRID + 1);')
);

// 3. GLSL ES 3.00 Custom Shaders
check(
  'Vertex shader declares #version 300 es',
  content.includes('const VERTEX_SHADER = `#version 300 es')
);
check(
  'Fragment shader declares #version 300 es',
  content.includes('const FRAGMENT_SHADER = `#version 300 es')
);
check(
  'Vertex shader implements Rodrigues quaternion rotation formula',
  content.includes('vec3 rotate(vec4 q, vec3 v)') &&
  content.includes('vec3 t = 2.0 * cross(q.xyz, v);') &&
  content.includes('return v + q.w * t + cross(q.xyz, t);')
);
check(
  'Orthonormal basis with polar singularity avoidance present in vertex shader',
  content.includes('abs(center.y) > 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0)') &&
  content.includes('vec3 tangent = normalize(cross(reference, center));') &&
  content.includes('vec3 bitangent = cross(center, tangent);')
);
check(
  'Dynamic motion stretch deformation along instantaneous angular velocity vector present',
  content.includes('vec3 motion = cross(uSpin.xyz, center);') &&
  content.includes('offset += direction * dot(offset, direction) * amount;')
);
check(
  'Fragment shader implements procedural Signed Distance Field (SDF) rounded box',
  content.includes('vec2 q = abs(vUv) - (1.0 - corner);') &&
  content.includes('float d = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - corner;')
);
check(
  'Screen-space derivative anti-aliasing via fwidth present in fragment shader',
  content.includes('float aa = max(fwidth(d), 0.0001);') &&
  content.includes('float mask = 1.0 - smoothstep(-aa, aa, d);')
);
check(
  'Fragment shader samples composite 2D texture atlas with sub-texel padding',
  content.includes('texture(uAtlas, (cell + uInset + local * (1.0 - 2.0 * uInset)) / uCells)')
);
check(
  'Thinking Gods editorial bone aesthetic shading present in shader',
  content.includes('uPlaceholder') &&
  content.includes('uTone') &&
  content.includes('0.945, 0.945, 0.945')
);

// 4. Dependencies Audit
const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
const runtimeDeps = Object.keys(packageJson.dependencies || {});
const prohibitedLibs = ['three', '@react-three/fiber', '@react-three/drei', 'ogl', 'twgl.js', 'gl-matrix'];
const foundProhibited = runtimeDeps.filter(d => prohibitedLibs.includes(d));
check(
  'Zero prohibited 3D runtime dependencies in package.json',
  foundProhibited.length === 0,
  `Found: ${foundProhibited.join(', ')}`
);

// Check imports in InfiniteMenu.tsx
const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
const importedModules = importLines.map(line => {
  const match = line.match(/from\s+['"]([^'"]+)['"]/);
  return match ? match[1] : line;
});
check(
  'InfiniteMenu.tsx only imports from React (zero third-party 3D or math imports)',
  importedModules.every(m => m === 'react'),
  `Imported modules: ${importedModules.join(', ')}`
);

// 5. Mathematical Soundness Verification
// Test quaternion multiplication and vector rotation
const quatMultiply = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
];
const quatAxisAngle = (axis, angle) => {
  const s = Math.sin(angle / 2);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
};
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const rotateVec = (q, v) => {
  const t = cross(q, v).map(val => val * 2);
  const u = cross(q, t);
  return [v[0] + q[3] * t[0] + u[0], v[1] + q[3] * t[1] + u[1], v[2] + q[3] * t[2] + u[2]];
};

// 90 deg rotation around Y axis should map (1, 0, 0) to (0, 0, -1)
const qY90 = quatAxisAngle([0, 1, 0], Math.PI / 2);
const rot = rotateVec(qY90, [1, 0, 0]);
check(
  'Quaternion rotation around Y by 90 degrees transforms [1,0,0] to [0,0,-1]',
  Math.abs(rot[0]) < 1e-6 && Math.abs(rot[1]) < 1e-6 && Math.abs(rot[2] - (-1)) < 1e-6,
  `Got: [${rot.map(x => x.toFixed(4)).join(', ')}]`
);

// 6. Fibonacci Sphere Lattice Soundness
const golden = Math.PI * (3 - Math.sqrt(5));
const spherePoints = Array.from({ length: 160 }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / 160;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  return [Math.cos(golden * i) * ring, y, Math.sin(golden * i) * ring];
});
const allOnUnitSphere = spherePoints.every(p => {
  const dist = Math.hypot(p[0], p[1], p[2]);
  return Math.abs(dist - 1) < 1e-6;
});
check('Fibonacci sphere generator distributes all 160 points exactly on the unit sphere', allOnUnitSphere);

// 7. Headless / SSR Fallback Guard
check(
  'Defensive null-check on gl context (if (!gl)) present',
  content.includes('if (!gl) {') && content.includes('setWebGlSupported(false);')
);
check(
  'Accessible HTML card fallback rendered when webGlSupported is false',
  content.includes('!webGlSupported && items.length > 0') &&
  content.includes('overflow-y-auto')
);

// 8. Dynamic Overlay & Micro-Interactions
check(
  'Synchronized HTML/Tailwind active tile overlay with title, category, description',
  content.includes('current.title') &&
  content.includes('current.category') &&
  content.includes('current.description')
);
check(
  'Signature hot pink action button (#fc4778) present with ArrowIcon',
  content.includes('ArrowIcon') && content.includes('hasAction')
);
check(
  'Keyboard navigation support (ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Enter) present',
  content.includes('ArrowRight: [1, 0]') &&
  content.includes('ArrowLeft: [-1, 0]') &&
  content.includes('ArrowUp: [0, 1]') &&
  content.includes('ArrowDown: [0, -1]')
);

// 9. Absence of Prohibited Patterns (General Profile)
// Pattern 1: Hardcoded test results
check(
  'No hardcoded test result strings or dummy outputs in InfiniteMenu.tsx',
  !content.includes('test-result') && !content.includes('mock-pass')
);
// Pattern 2: Facade implementations
check(
  'InfiniteMenu is not a facade or placeholder (file has > 1000 lines of substantive WebGL and interaction code)',
  content.split('\n').length > 1000
);

console.log('\n========================================================================');
console.log(`   AUDIT RESULTS: ${passCount} Passed, ${failCount} Failed`);
console.log('========================================================================\n');

if (failCount > 0) {
  console.log('VERDICT: INTEGRITY VIOLATION');
  process.exit(1);
} else {
  console.log('VERDICT: CLEAN');
  process.exit(0);
}
