// GLSL Vertex and Fragment shaders

// Positions a fullscreen quad and passes texture coordinates to the fragment shader.
// This is the same for all filters — only the fragment shader changes per filter.
export const vertexShaderSource = /*glsl*/ 
`#version 300 es

in vec2 aPosition;
out vec2 vTexCoord;

void main() {
  // Convert from clip space (-1 to 1) to texture space (0 to 1)
  vTexCoord = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Sharpen filter — replicates the 3x3 convolution kernel from ImageWorker.ts on the GPU.
//
// Kernel:
//  0  -1   0
// -1   5  -1
//  0  -1   0
//
// For each pixel, it amplifies the difference between the center pixel and its
// 4 neighbors (up, down, left, right). uStrength scales the effect.
export const sharpenFragmentShaderSource = /*glsl*/ 
`#version 300 es

precision highp float;

uniform sampler2D uTexture;
uniform float uStrength;

in vec2 vTexCoord;
out vec4 fragColor;

void main() {
  // Size of one pixel in texture (UV) coordinates
  vec2 texel = 1.0 / vec2(textureSize(uTexture, 0));

  // Sample the center pixel and its 4 neighbors
  vec4 center = texture(uTexture, vTexCoord);
  vec4 top    = texture(uTexture, vTexCoord + vec2(0.0,  texel.y));
  vec4 bottom = texture(uTexture, vTexCoord + vec2(0.0, -texel.y));
  vec4 left   = texture(uTexture, vTexCoord + vec2(-texel.x, 0.0));
  vec4 right  = texture(uTexture, vTexCoord + vec2( texel.x, 0.0));

  // Apply the sharpen kernel:
  // center * (1 + 4*strength) - neighbors * strength
  // When strength=0, result = center (no change)
  // When strength=1, result = full sharpen
  vec4 sharpened = center * (1.0 + 4.0 * uStrength)
                 - (top + bottom + left + right) * uStrength;

  // Preserve the original alpha channel, clamp RGB to valid range
  fragColor = vec4(clamp(sharpened.rgb, 0.0, 1.0), center.a);
}
`;
