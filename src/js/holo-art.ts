const INTRO_MS = 1400;
const LEVELS = 6;

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime;
uniform float uIntro;
uniform float uBlock;
uniform vec2 uPointer;
uniform float uSeed;
varying vec2 vUv;

const int LEVELS = ${LEVELS};
const vec3 HOLO = vec3(0.37, 0.95, 1.0);
const vec3 MAGENTA = vec3(1.0, 0.31, 0.85);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec4 sampleBlock(vec2 cell, float bs, vec2 off) {
  vec2 c = (cell + 0.5) * bs;
  float q = bs * 0.25;
  vec4 s = texture2D(uTex, (c + vec2(-q, -q)) / uRes + off);
  s += texture2D(uTex, (c + vec2(q, -q)) / uRes + off);
  s += texture2D(uTex, (c + vec2(-q, q)) / uRes + off);
  s += texture2D(uTex, (c + vec2(q, q)) / uRes + off);
  return s * 0.25;
}

void main() {
  vec2 px = vUv * uRes;
  float live = step(1.0, uIntro);
  float tStep = floor(uTime * 24.0);

  float micro = live * step(0.992, hash(vec2(floor(uTime * 6.0), 1.7)));
  float g = (1.0 - smoothstep(0.55, 1.0, uIntro)) + micro * 0.5;

  float row = floor(px.y / (uBlock * 5.0));
  float rr = hash(vec2(row, tStep));
  if (rr > 1.0 - g * 0.3) {
    px.x += (hash(vec2(row, tStep + 1.3)) - 0.5) * 0.12 * g * uRes.x;
  }

  float level = -1.0;
  float flash = 0.0;
  for (int k = 0; k < LEVELS; k++) {
    float bs = uBlock * exp2(float(LEVELS - 1 - k));
    vec2 cell = floor(px / bs);
    float ang = hash(vec2(float(k), 3.7)) * 6.2831;
    vec2 dir = vec2(cos(ang), sin(ang));
    float scan = dot((cell + 0.5) * bs / uRes - 0.5, dir) + 0.5;
    float th = float(k) / float(LEVELS) * 0.8 + scan * 0.12 + hash(cell + float(k) * 17.0) * 0.1;
    if (uIntro < th) break;
    level = float(k);
    flash = 1.0 - clamp((uIntro - th) / 0.07, 0.0, 1.0);
  }

  if (level < 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float coarse = uBlock * exp2(float(LEVELS - 2));
  vec2 rc = floor(px / coarse);
  float rh = hash(rc + 91.0);
  float ph = fract(uTime / (5.0 + rh * 9.0) + rh);
  float dur = 0.09;
  float repaint = 0.0;
  if (live > 0.5 && rh > 0.8 && ph < dur) {
    float pr = ph / dur;
    float ly = fract(px.y / coarse);
    if (ly < 1.0 - pr) {
      level = min(level, float(LEVELS - 1) - floor((1.0 - pr) * 4.0 + 1.0));
    }
    repaint = 1.0 - smoothstep(0.0, 0.04, abs(ly - (1.0 - pr)));
  }

  float bs = uBlock * exp2(float(LEVELS - 1) - level);
  vec2 cell = floor(px / bs);
  float split = (g * 0.012 + micro * 0.004);
  vec4 col = sampleBlock(cell, bs, vec2(0.0));
  col.r = sampleBlock(cell, bs, vec2(split, 0.0)).r;
  col.b = sampleBlock(cell, bs, vec2(-split, 0.0)).b;

  col.rgb *= 1.0 - g * 0.3 * hash(vec2(tStep, 7.0));

  vec2 f = fract(px / bs) * bs;
  if (bs >= 3.0 && (f.x < 1.0 || f.y < 1.0)) col.rgb *= 0.8;

  vec2 fc = floor(px / uBlock);
  float fade = smoothstep(0.0, 0.2, (fc.y + 0.5) * uBlock / uRes.y);
  col *= step(hash(fc + 3.0) * 0.98, fade);

  float th2 = hash(fc + 13.0);
  float pd = length(px - uPointer) / (uBlock * 22.0);
  float near = 1.0 - smoothstep(0.0, 1.0, pd);
  float chance = step(0.965 - near * 0.25, hash(fc + 5.0));
  float tw = pow(max(0.0, sin(uTime * (0.5 + th2 * 1.6) + th2 * 40.0)), 50.0) * chance * live;
  col.rgb += (HOLO * 0.5 + col.rgb) * tw * col.a;

  vec2 d = vUv - 0.5;
  d.x *= uRes.x / uRes.y;
  float sw = fract(atan(d.y, d.x) / 6.2831 - uTime * 0.045);
  float beam = exp(-pow((sw - 0.06) * 12.0, 2.0));
  col.rgb += col.a * beam * 0.16 * mix(MAGENTA, HOLO, clamp(sw * 4.0, 0.0, 1.0)) * live;

  float bandPos = 1.0 - fract(uTime * 0.09);
  float band = exp(-pow((vUv.y - bandPos) * 22.0, 2.0));
  col.rgb += col.a * band * 0.1 * HOLO;
  col.rgb *= 0.94 + 0.06 * sin(px.y * 1.6 + uTime * 4.0);

  col.rgb += col.a * near * 0.12 * HOLO * live;
  col.rgb += col.a * (flash * 0.7 + repaint * 0.5) * mix(HOLO, vec3(1.0), 0.3);
  col.rgb = mix(col.rgb, col.rgb * vec3(0.96, 0.92, 1.08) + vec3(0.01, 0.02, 0.05) * col.a, 0.6);

  col.rgb = min(col.rgb, vec3(col.a));
  gl_FragColor = col;
}`;

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

function loadImage(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return img.decode();
}

async function init(el: HTMLElement) {
  const img = el.querySelector("img");
  const canvas = el.querySelector("canvas");
  if (!img || !canvas) return;

  const fail = () => {
    el.classList.remove("is-gl");
    el.classList.add("no-gl");
  };

  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  if (!gl) return fail();

  let program: WebGLProgram;
  try {
    await loadImage(img);
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
    }
  } catch (err) {
    console.warn("holo-art:", err);
    return fail();
  }

  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uRes = u("uRes");
  const uTime = u("uTime");
  const uIntro = u("uIntro");
  const uBlock = u("uBlock");
  const uPointer = u("uPointer");
  gl.uniform1f(u("uSeed"), Math.random() * 10);
  gl.clearColor(0, 0, 0, 0);

  const resolution = Number(el.dataset.resolution ?? 3);
  let dpr = 1;
  let pointer: [number, number] = [-1e5, -1e5];
  let introStart = -1;
  let visible = false;
  let raf = 0;
  const t0 = performance.now();

  el.classList.add("is-gl");

  function draw(now: number) {
    const intro = reducedMotion.matches
      ? 1
      : introStart < 0
      ? 0
      : Math.min(1, (now - introStart) / INTRO_MS);
    gl!.uniform1f(uTime, reducedMotion.matches ? 2 : (now - t0) / 1000);
    gl!.uniform1f(uIntro, intro);
    gl!.uniform2f(uPointer, pointer[0], pointer[1]);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  function loop(now: number) {
    draw(now);
    raf = visible && !reducedMotion.matches ? requestAnimationFrame(loop) : 0;
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function resize() {
    dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    const width = Math.round(canvas!.clientWidth * dpr);
    const height = Math.round(canvas!.clientHeight * dpr);
    if (!width || !height) return;
    canvas!.width = width;
    canvas!.height = height;
    gl!.viewport(0, 0, width, height);
    gl!.uniform2f(uRes, width, height);
    gl!.uniform1f(uBlock, Math.max(1, Math.round(resolution * dpr)));
    if (!raf) draw(performance.now());
  }

  new ResizeObserver(resize).observe(canvas);
  resize();

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && introStart < 0) introStart = performance.now();
    if (visible) kick();
  }, { threshold: 0.25 }).observe(el);

  el.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer = [(e.clientX - rect.left) * dpr, (rect.bottom - e.clientY) * dpr];
  });
  el.addEventListener("pointerleave", () => {
    pointer = [-1e5, -1e5];
  });

  reducedMotion.addEventListener("change", () => {
    draw(performance.now());
    if (visible) kick();
  });

  canvas.addEventListener("webglcontextlost", () => {
    cancelAnimationFrame(raf);
    fail();
  });
}

document.querySelectorAll<HTMLElement>("[data-holo-art]").forEach((el) => {
  init(el);
});
