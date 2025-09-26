const THREE = window.THREE;

window.initGalaxy = function(container, options = {}) {
  const {
    density = 1.5,
    hueShift = 240,
    mouseInteraction = true,
    glowIntensity = 0.5,
    saturation = 0.8,
    mouseRepulsion = true,
    repulsionStrength = 2,
    rotationSpeed = 0.1
  } = options;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  const starCount = Math.floor(2000 * density);
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 100 + 50;
    const spinAngle = Math.random() * Math.PI * 2;
    const branchAngle = Math.random() * Math.PI * 2;

    const randomX = (Math.random() - 0.5) * 20;
    const randomY = (Math.random() - 0.5) * 20;
    const randomZ = (Math.random() - 0.5) * 20;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const color = new THREE.Color();
    color.setHSL((Math.random() + hueShift / 360) % 1, saturation, 0.5 + Math.random() * 0.5);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    transparent: true,
    opacity: glowIntensity,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  camera.position.z = 100;

  let mouse = { x: 0, y: 0 };
  let mouseActive = false;

  function onMouseMove(event) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouseActive = true;
  }

  function onMouseLeave() {
    mouseActive = false;
  }

  if (mouseInteraction) {
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
  }

  function animate() {
    requestAnimationFrame(animate);

    points.rotation.y += rotationSpeed * 0.01;

    if (mouseInteraction && mouseRepulsion && mouseActive) {
      const repulsion = new THREE.Vector3(mouse.x * repulsionStrength, mouse.y * repulsionStrength, 0);
      points.position.copy(repulsion);
    } else {
      points.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }

    renderer.render(scene, camera);
  }
  animate();

  function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }
  window.addEventListener('resize', onWindowResize);

  return () => {
    window.removeEventListener('resize', onWindowResize);
    if (mouseInteraction) {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    }
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };
}