/**
 * Shader Lines Animation using Three.js WebGL
 * Implements the exact GLSL fragment shader provided.
 */

(function () {
  let camera, scene, renderer, uniforms, animationId;
  const containerId = 'shader-canvas-container';

  function initShaderAnimation() {
    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    // Cancel existing animation loop if already running to prevent duplicate loops & flickering
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    // Clear previous content if any
    container.innerHTML = '';

    const THREE = window.THREE;

    // Initialize camera
    camera = new THREE.Camera();
    camera.position.z = 1;

    // Initialize scene
    scene = new THREE.Scene();

    // Create geometry
    const geometry = new THREE.PlaneBufferGeometry
      ? new THREE.PlaneBufferGeometry(2, 2)
      : new THREE.PlaneGeometry(2, 2);

    // Uniforms
    uniforms = {
      time: { type: 'f', value: 1.0 },
      resolution: { type: 'v2', value: new THREE.Vector2() }
    };

    // Vertex Shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    // Fragment Shader
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
        
      float random (in float x) {
          return fract(sin(x)*1e4);
      }
      
      void main(void) {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
        
        float t = time * 0.04;
        vec3 color = vec3(0.0);

        for (int j = 0; j < 3; j++) {
          for (int i = 1; i <= 6; i++) {
            float fi = float(i);
            float fj = float(j);
            float r = fract(t * 0.4 + fi * 0.12 + fj * 0.04);
            float dist = abs(length(uv) - r);
            float intensity = (0.0035 * fi) / max(dist, 0.001);
            if (j == 0) color.r += intensity * 1.0;
            if (j == 1) color.g += intensity * 0.45;
            if (j == 2) color.b += intensity * 0.85;
          }
        }

        // Adiciona um brilho sutil de fundo
        color += vec3(0.04, 0.02, 0.06);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create material
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    // Create mesh & add to scene
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    // Resize handler
    function onWindowResize() {
      if (!container || !renderer) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.x = width;
      uniforms.resolution.value.y = height;
    }

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    // Animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
    }

    animate();
  }

  // Export globally
  window.initShaderAnimation = initShaderAnimation;

  // Auto-inicializar animação ao carregar a página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(initShaderAnimation, 150);
    });
  } else {
    setTimeout(initShaderAnimation, 150);
  }
})();
