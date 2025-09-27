const hexToRgb = hex => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }
  const int = parseInt(hex, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertexShader = `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

// Matrix utilities
const createMatrix4 = () => new Float32Array(16);

const identity = (out) => {
  out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
  return out;
};

const perspective = (out, fovy, aspect, near, far) => {
  const f = 1.0 / Math.tan(fovy / 2);
  out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = (far + near) / (near - far); out[11] = -1;
  out[12] = 0; out[13] = 0; out[14] = (2 * far * near) / (near - far); out[15] = 0;
  return out;
};

const lookAt = (out, eye, center, up) => {
  const eyex = eye[0], eyey = eye[1], eyez = eye[2];
  const upx = up[0], upy = up[1], upz = up[2];
  const centerx = center[0], centery = center[1], centerz = center[2];

  if (Math.abs(eyex - centerx) < 0.000001 && Math.abs(eyey - centery) < 0.000001 && Math.abs(eyez - centerz) < 0.000001) {
    return identity(out);
  }

  let z0 = eyex - centerx, z1 = eyey - centery, z2 = eyez - centerz;
  let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len; z1 *= len; z2 *= len;

  let x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len) {
    x0 = 0; x1 = 0; x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len; x1 *= len; x2 *= len;
  }

  let y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len) {
    y0 = 0; y1 = 0; y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len; y1 *= len; y2 *= len;
  }

  out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
  out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
  out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
};

const rotateX = (out, a, rad) => {
  const s = Math.sin(rad), c = Math.cos(rad);
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

  out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
  out[4] = a10 * c + a20 * s; out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s; out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s; out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s; out[11] = a23 * c - a13 * s;
  out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  return out;
};

const rotateY = (out, a, rad) => {
  const s = Math.sin(rad), c = Math.cos(rad);
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

  out[0] = a00 * c - a20 * s; out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s; out[3] = a03 * c - a23 * s;
  out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
  out[8] = a00 * s + a20 * c; out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c; out[11] = a03 * s + a23 * c;
  out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  return out;
};

const rotateZ = (out, a, rad) => {
  const s = Math.sin(rad), c = Math.cos(rad);
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];

  out[0] = a00 * c + a10 * s; out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s; out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s; out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s; out[7] = a13 * c - a03 * s;
  out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
  out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  return out;
};

const translate = (out, a, v) => {
  out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
  out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
  out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
  out[12] = a[0] * v[0] + a[4] * v[1] + a[8] * v[2] + a[12];
  out[13] = a[1] * v[0] + a[5] * v[1] + a[9] * v[2] + a[13];
  out[14] = a[2] * v[0] + a[6] * v[1] + a[10] * v[2] + a[14];
  out[15] = a[3] * v[0] + a[7] * v[1] + a[11] * v[2] + a[15];
  return out;
};

window.initGalaxy = function(container, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const mouseRef = { x: 0, y: 0 };

  const particleCount = options.density ? options.density * 100 : 200;
  const particleSpread = 10;
  const speed = 0.1;
  const particleColors = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899'];
  const moveParticlesOnHover = options.mouseInteraction !== false;
  const particleHoverFactor = 1;
  const alphaParticles = false;
  const particleBaseSize = options.glowIntensity ? options.glowIntensity * 20 : 100;
  const sizeRandomness = 1;
  const cameraDistance = 20;
  const disableRotation = false;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  // Set up WebGL state
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  // Create shader program
  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  const vertexShaderObj = createShader(gl.VERTEX_SHADER, vertexShader);
  const fragmentShaderObj = createShader(gl.FRAGMENT_SHADER, fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShaderObj);
  gl.attachShader(program, fragmentShaderObj);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Get attribute and uniform locations
  const positionLocation = gl.getAttribLocation(program, 'position');
  const randomLocation = gl.getAttribLocation(program, 'random');
  const colorLocation = gl.getAttribLocation(program, 'color');
  
  const modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix');
  const viewMatrixLocation = gl.getUniformLocation(program, 'viewMatrix');
  const projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix');
  const uTimeLocation = gl.getUniformLocation(program, 'uTime');
  const uSpreadLocation = gl.getUniformLocation(program, 'uSpread');
  const uBaseSizeLocation = gl.getUniformLocation(program, 'uBaseSize');
  const uSizeRandomnessLocation = gl.getUniformLocation(program, 'uSizeRandomness');
  const uAlphaParticlesLocation = gl.getUniformLocation(program, 'uAlphaParticles');

  // Generate particle data
  const count = particleCount;
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 4);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x, y, z, len;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
      len = x * x + y * y + z * z;
    } while (len > 1 || len === 0);

    const r = Math.cbrt(Math.random());
    positions.set([x * r, y * r, z * r], i * 3);
    randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    
    const col = hexToRgb(particleColors[Math.floor(Math.random() * particleColors.length)]);
    colors.set(col, i * 3);
  }

  // Create and bind buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const randomBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, randomBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, randoms, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(randomLocation);
  gl.vertexAttribPointer(randomLocation, 4, gl.FLOAT, false, 0, 0);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  // Set up matrices
  const modelMatrix = createMatrix4();
  const viewMatrix = createMatrix4();
  const projectionMatrix = createMatrix4();
  const tempMatrix = createMatrix4();

  identity(modelMatrix);
  
  // Set up camera
  lookAt(viewMatrix, [0, 0, cameraDistance], [0, 0, 0], [0, 1, 0]);

  // Set static uniforms
  gl.uniform1f(uSpreadLocation, particleSpread);
  gl.uniform1f(uBaseSizeLocation, particleBaseSize);
  gl.uniform1f(uSizeRandomnessLocation, sizeRandomness);
  gl.uniform1f(uAlphaParticlesLocation, alphaParticles ? 1 : 0);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    const aspect = canvas.width / canvas.height;
    perspective(projectionMatrix, Math.PI / 12, aspect, 0.1, 100);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
  };

  window.addEventListener('resize', resize);
  resize();

  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseRef.x = x;
    mouseRef.y = y;
  };

  if (moveParticlesOnHover) {
    canvas.addEventListener('mousemove', handleMouseMove);
  }

  let animationFrameId;
  let lastTime = performance.now();
  let elapsed = 0;
  const rotation = { x: 0, y: 0, z: 0 };

  const animate = (currentTime) => {
    animationFrameId = requestAnimationFrame(animate);
    
    const delta = currentTime - lastTime;
    lastTime = currentTime;
    elapsed += delta * speed;

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update model matrix with transformations
    identity(modelMatrix);

    // Apply mouse hover effect
    if (moveParticlesOnHover) {
      translate(modelMatrix, modelMatrix, [
        -mouseRef.x * particleHoverFactor,
        -mouseRef.y * particleHoverFactor,
        0
      ]);
    }

    // Apply rotation
    if (!disableRotation) {
      rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
      rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
      rotation.z += 0.01 * speed;

      rotateX(tempMatrix, modelMatrix, rotation.x);
      rotateY(modelMatrix, tempMatrix, rotation.y);
      rotateZ(tempMatrix, modelMatrix, rotation.z);
      for (let i = 0; i < 16; i++) modelMatrix[i] = tempMatrix[i];
    }

    // Update uniforms
    gl.uniform1f(uTimeLocation, elapsed * 0.001);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

    // Draw particles
    gl.drawArrays(gl.POINTS, 0, count);
  };

  animationFrameId = requestAnimationFrame(animate);

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', resize);
    if (moveParticlesOnHover) {
      canvas.removeEventListener('mousemove', handleMouseMove);
    }
    cancelAnimationFrame(animationFrameId);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };
};