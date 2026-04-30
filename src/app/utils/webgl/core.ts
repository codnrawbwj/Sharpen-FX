import { vertexShaderSource, sharpenFragmentShaderSource } from "./shaders";

// 1. Initialize a WebGL2 context from a canvas element.
//    Returns null if WebGL2 is not supported — caller should fall back to CPU.
export const initWebGL = (canvas: HTMLCanvasElement): WebGL2RenderingContext | null => {
  const gl = canvas.getContext("webgl2");
  if (!gl) return null;
  return gl;
};

// 2. Compile a single shader (vertex or fragment) from a GLSL source string.
//    Returns null if compilation fails.
const compileShader = (
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

// 3. Link a vertex and fragment shader into a WebGL program.
//    The program is what the GPU actually runs during a draw call.
//    Returns null if linking fails.
export const createProgram = (
  gl: WebGL2RenderingContext
): WebGLProgram | null => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, sharpenFragmentShaderSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Shaders are now baked into the program — we don't need them separately
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
};

// 4. Upload two triangles (a fullscreen quad) to the GPU.
//    The fragment shader will run once for every pixel on this quad.
//    Returns the VAO (Vertex Array Object) that holds the quad geometry.
export const createFullscreenQuad = (gl: WebGL2RenderingContext, program: WebGLProgram): WebGLVertexArrayObject | null => {
  // Two triangles that together cover the entire clip space (-1 to 1)
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);

  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();

  if (!vao || !buffer) return null;

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  return vao;
};

// 5. Upload an image into GPU memory as a WebGL texture.
//    This replaces reading ImageData from a 2D canvas context.
//    Call this once when the user loads a new image.
export const uploadTexture = (
  gl: WebGL2RenderingContext,
  image: HTMLImageElement
): WebGLTexture | null => {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Upload the image pixels to the GPU
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // Use linear filtering and clamp to edges to avoid border artifacts
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return texture;
};

// 6. Execute a render — binds the program, texture, and uniforms, then draws.
//    Call this every time strength changes for real-time updates.
export const drawFrame = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vao: WebGLVertexArrayObject,
  texture: WebGLTexture,
  strength: number
): void => {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  // Pass the strength value into the fragment shader
  const uStrength = gl.getUniformLocation(program, "uStrength");
  gl.uniform1f(uStrength, strength);

  // Bind the image texture to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const uTexture = gl.getUniformLocation(program, "uTexture");
  gl.uniform1i(uTexture, 0);

  // Draw the fullscreen quad — this triggers the fragment shader on every pixel
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArray(null);
};
