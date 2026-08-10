import React, { useEffect, useRef } from 'react';

const ShaderBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    
    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_is_dark;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = u_time * 0.2;
    
    // Dark Mode Jewel Tones
    vec3 dark1 = vec3(0.48, 0.31, 0.95); // Deep Purple
    vec3 dark2 = vec3(1.0, 0.44, 0.70); // Vibrant Pink
    vec3 dark3 = vec3(0.53, 0.81, 0.94); // Soft Blue
    vec3 dark4 = vec3(0.11, 0.05, 0.15); // Dark Base
    
    // Light Mode Pastel Tones (cream, pastel pink, soft blue)
    vec3 light1 = vec3(0.98, 0.90, 0.95); // Pastel Pink
    vec3 light2 = vec3(0.85, 0.92, 1.0); // Soft Blue
    vec3 light3 = vec3(1.0, 0.95, 0.90); // Cream
    vec3 light4 = vec3(0.98, 0.98, 1.0); // Light Base
    
    vec3 c1 = mix(light1, dark1, u_is_dark);
    vec3 c2 = mix(light2, dark2, u_is_dark);
    vec3 c3 = mix(light3, dark3, u_is_dark);
    vec3 c4 = mix(light4, dark4, u_is_dark);

    float n1 = sin(uv.x * 2.0 + t) * 0.5 + 0.5;
    float n2 = sin(uv.y * 1.5 - t * 0.8) * 0.5 + 0.5;
    float n3 = sin((uv.x + uv.y) * 1.0 + t * 0.5) * 0.5 + 0.5;
    
    vec3 finalColor = mix(c4, c1, n1 * 0.4);
    finalColor = mix(finalColor, c2, n2 * 0.3);
    finalColor = mix(finalColor, c3, n3 * 0.3);
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;
    function cs(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uIsDark = gl.getUniformLocation(prog, 'u_is_dark');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Helper to smooth the dark mode transition in shader
    let currentDarkFactor = document.documentElement.classList.contains('dark') ? 1.0 : 0.0;

    let animationFrameId;
    function render(t) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      const targetDarkFactor = document.documentElement.classList.contains('dark') ? 1.0 : 0.0;
      currentDarkFactor += (targetDarkFactor - currentDarkFactor) * 0.05; // smooth transition

      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uIsDark) gl.uniform1f(uIsDark, currentDarkFactor);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10" style={{ display: 'block' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
    </div>
  );
};

export default ShaderBackground;
