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
    const geometry = new THREE.PlaneGeometry(2, 2);

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
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time*0.05;
        float lineWidth = 0.002;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
          }
        }
        
        gl_FragColor = vec4(color[0],color[1],color[2],1.0);
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
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    // Resize handler
    function onWindowResize() {
      if (!container || !renderer) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
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

