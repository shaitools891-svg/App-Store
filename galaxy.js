const THREE = window.THREE;

window.initGalaxy = function(container, options = {}) {
  const {
    density = 1.0,
    hueShift = 140,
    mouseInteraction = true,
    glowIntensity = 0.3,
    saturation = 0.0,
    mouseRepulsion = true,
    repulsionStrength = 2,
    rotationSpeed = 0.0, // Disabled rotation for performance
    starSpeed = 0.5,
    speed = 1.0,
    twinkleIntensity = 0.5, // Increased for better glitter effect
    autoCenterRepulsion = 0,
    focal = [0.5, 0.5],
    rotation = [1.0, 0.0],
    pulseIntensity = 0.3, // New: controls pulsing strength
    glitterChance = 0.15 // New: chance for a star to glitter
  } = options;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    premultipliedAlpha: false
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  // Optimized shader code
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    
    uniform float uTime;
    uniform vec3 uResolution;
    uniform vec2 uFocal;
    uniform vec2 uRotation;
    uniform float uStarSpeed;
    uniform float uDensity;
    uniform float uHueShift;
    uniform float uSpeed;
    uniform vec2 uMouse;
    uniform float uGlowIntensity;
    uniform float uSaturation;
    uniform bool uMouseRepulsion;
    uniform float uTwinkleIntensity;
    uniform float uRotationSpeed;
    uniform float uRepulsionStrength;
    uniform float uMouseActiveFactor;
    uniform float uAutoCenterRepulsion;
    uniform float uPulseIntensity;
    uniform float uGlitterChance;
    
    varying vec2 vUv;
    
    #define NUM_LAYER 3.0  // Reduced layers for performance
    #define STAR_COLOR_CUTOFF 0.2
    #define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
    
    float Hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    
    float tri(float x) {
      return abs(fract(x) * 2.0 - 1.0);
    }
    
    float tris(float x) {
      float t = fract(x);
      return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
    }
    
    float trisn(float x) {
      float t = fract(x);
      return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
    }
    
    // Smooth noise function for more natural effects
    float smoothNoise(float x) {
      return sin(x) * 0.5 + 0.5;
    }
    
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    float Star(vec2 uv, float flare, float pulse) {
      float d = length(uv);
      float m = (0.05 * uGlowIntensity * pulse) / d;
      float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
      m += rays * flare * uGlowIntensity * pulse;
      uv *= MAT45;
      rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
      m += rays * 0.3 * flare * uGlowIntensity * pulse;
      m *= smoothstep(1.0, 0.2, d);
      return m;
    }
    
    vec3 StarLayer(vec2 uv, float layerDepth) {
      vec3 col = vec3(0.0);
      
      vec2 gv = fract(uv) - 0.5; 
      vec2 id = floor(uv);
      
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 offset = vec2(float(x), float(y));
          vec2 si = id + vec2(float(x), float(y));
          float seed = Hash21(si);
          float size = fract(seed * 345.32);
          
          // Static position - no more movement for performance
          vec2 staticPos = vec2(
            Hash21(si + 10.0) - 0.5,
            Hash21(si + 20.0) - 0.5
          ) * 0.3;
          
          // Glitter effect - only some stars glitter
          float glitterSeed = Hash21(si + 100.0);
          bool shouldGlitter = glitterSeed < uGlitterChance;
          
          float glitter = 1.0;
          if (shouldGlitter) {
            // Fast glitter effect
            float glitterTime = uTime * uSpeed * (2.0 + seed * 3.0);
            glitter = smoothNoise(glitterTime) * 0.5 + 0.5;
            glitter = mix(0.3, 1.5, glitter);
          }
          
          // Pulse effect - slower, more subtle
          float pulseSeed = Hash21(si + 200.0);
          float pulseFreq = 0.5 + pulseSeed * 1.5; // Vary pulse frequency
          float pulse = smoothNoise(uTime * uSpeed * pulseFreq + seed * 6.28) * 0.5 + 0.5;
          pulse = mix(1.0 - uPulseIntensity, 1.0 + uPulseIntensity, pulse);
          
          // Combine glitter and pulse
          float finalIntensity = glitter * pulse;
          
          float flareSize = smoothstep(0.9, 1.0, size) * finalIntensity;
          
          float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
          float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
          float grn = min(red, blu) * seed;
          vec3 base = vec3(red, grn, blu);
          
          float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
          hue = fract(hue + uHueShift / 360.0);
          float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
          float val = max(max(base.r, base.g), base.b);
          base = hsv2rgb(vec3(hue, sat, val));
          
          float star = Star(gv - offset - staticPos, flareSize, finalIntensity);
          vec3 color = base;
          
          // Gentle twinkle effect
          float twinkle = smoothNoise(uTime * uSpeed * 0.3 + seed * 6.2831) * 0.5 + 0.5;
          twinkle = mix(1.0 - uTwinkleIntensity * 0.3, 1.0 + uTwinkleIntensity * 0.3, twinkle);
          star *= twinkle;
          
          col += star * size * color * finalIntensity;
        }
      }
      
      return col;
    }
    
    void main() {
      vec2 focalPx = uFocal * uResolution.xy;
      vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
      
      vec2 mouseNorm = uMouse - vec2(0.5);
      
      if (uAutoCenterRepulsion > 0.0) {
        vec2 centerUV = vec2(0.0, 0.0);
        float centerDist = length(uv - centerUV);
        vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
        uv += repulsion * 0.05;
      } else if (uMouseRepulsion) {
        vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
        float mouseDist = length(uv - mousePosUV);
        vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
        uv += repulsion * 0.05 * uMouseActiveFactor;
      } else {
        vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
        uv += mouseOffset;
      }
      
      // Static rotation - only apply initial rotation, no continuous spinning
      uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
      
      vec3 col = vec3(0.0);
      
      for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
        float depth = fract(i);
        float scale = mix(15.0 * uDensity, 0.8 * uDensity, depth);
        float fade = (1.0 - depth) * smoothstep(0.0, 0.1, depth);
        col += StarLayer(uv * scale + i * 453.32, depth) * fade;
      }
      
      float alpha = length(col);
      alpha = smoothstep(0.0, 0.3, alpha);
      alpha = min(alpha, 1.0);
      gl_FragColor = vec4(col, alpha);
    }
  `;

  // Create shader material
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector3(container.offsetWidth, container.offsetHeight, container.offsetWidth / container.offsetHeight) },
      uFocal: { value: new THREE.Vector2(focal[0], focal[1]) },
      uRotation: { value: new THREE.Vector2(rotation[0], rotation[1]) },
      uStarSpeed: { value: starSpeed },
      uDensity: { value: density },
      uHueShift: { value: hueShift },
      uSpeed: { value: speed },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uGlowIntensity: { value: glowIntensity },
      uSaturation: { value: saturation },
      uMouseRepulsion: { value: mouseRepulsion },
      uTwinkleIntensity: { value: twinkleIntensity },
      uRotationSpeed: { value: 0.0 }, // Disabled
      uRepulsionStrength: { value: repulsionStrength },
      uMouseActiveFactor: { value: 0.0 },
      uAutoCenterRepulsion: { value: autoCenterRepulsion },
      uPulseIntensity: { value: options.pulseIntensity || 0.3 },
      uGlitterChance: { value: options.glitterChance || 0.15 }
    }
  });

  // Create fullscreen quad
  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Mouse tracking
  let targetMousePos = { x: 0.5, y: 0.5 };
  let smoothMousePos = { x: 0.5, y: 0.5 };
  let targetMouseActive = 0.0;
  let smoothMouseActive = 0.0;

  function onMouseMove(event) {
    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1.0 - (event.clientY - rect.top) / rect.height;
    targetMousePos = { x, y };
    targetMouseActive = 1.0;
  }

  function onMouseLeave() {
    targetMouseActive = 0.0;
  }

  if (mouseInteraction) {
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
  }

  // Optimized animation loop
  let lastTime = 0;
  const targetFPS = 60;
  const frameInterval = 1000 / targetFPS;

  function animate(time) {
    requestAnimationFrame(animate);
    
    // Frame rate limiting for better performance
    if (time - lastTime < frameInterval) {
      return;
    }
    lastTime = time;
    
    // Update time (slower updates for better performance)
    material.uniforms.uTime.value = time * 0.0005; // Reduced time scale
    
    // Smooth mouse interpolation with reduced frequency
    const lerpFactor = 0.03; // Slower interpolation
    smoothMousePos.x += (targetMousePos.x - smoothMousePos.x) * lerpFactor;
    smoothMousePos.y += (targetMousePos.y - smoothMousePos.y) * lerpFactor;
    smoothMouseActive += (targetMouseActive - smoothMouseActive) * lerpFactor;
    
    // Update uniforms
    material.uniforms.uMouse.value.set(smoothMousePos.x, smoothMousePos.y);
    material.uniforms.uMouseActiveFactor.value = smoothMouseActive;
    
    renderer.render(scene, camera);
  }

  animate(0);

  // Handle resize
  function onWindowResize() {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    renderer.setSize(width, height);
    material.uniforms.uResolution.value.set(width, height, width / height);
  }

  window.addEventListener('resize', onWindowResize);

  // Cleanup function
  return () => {
    window.removeEventListener('resize', onWindowResize);
    if (mouseInteraction) {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    }
    container.removeChild(renderer.domElement);
    renderer.dispose();
    geometry.dispose();
    material.dispose();
  };
};