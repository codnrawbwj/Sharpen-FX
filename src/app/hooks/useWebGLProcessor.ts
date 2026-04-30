import { useEffect, useRef, useState } from "react";
import {
  initWebGL,
  createProgram,
  createFullscreenQuad,
  uploadTexture,
  drawFrame,
} from "@/app/utils/webgl/core";

interface UseWebGLProcessorReturn {
  render: (strength: number) => void;
  isSupported: boolean;
  isReady: boolean;
}

export const useWebGLProcessor = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  image: HTMLImageElement | null
): UseWebGLProcessorReturn => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Hold WebGL resources in refs — they don't trigger re-renders
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);

  // On mount: initialize WebGL context, compile shaders, create quad
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = initWebGL(canvas);
    if (!gl) {
      // WebGL2 not available — signal to caller to fall back to CPU worker
      setIsSupported(false);
      return;
    }
    glRef.current = gl;

    const program = createProgram(gl);
    if (!program) {
      setIsSupported(false);
      return;
    }
    programRef.current = program;

    const vao = createFullscreenQuad(gl, program);
    if (!vao) {
      setIsSupported(false);
      return;
    }
    vaoRef.current = vao;

    return () => {
      // Clean up GPU resources on unmount
      gl.deleteProgram(program);
      gl.deleteVertexArray(vao);
    };
  }, [canvasRef]);

  // When the image changes: upload it as a new texture
  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !image) {
      setIsReady(false);
      return;
    }

    // Delete the previous texture to avoid GPU memory leaks
    if (textureRef.current) {
      gl.deleteTexture(textureRef.current);
      textureRef.current = null;
    }

    const texture = uploadTexture(gl, image);
    if (!texture) {
      setIsReady(false);
      return;
    }

    textureRef.current = texture;
    setIsReady(true);

    return () => {
      gl.deleteTexture(texture);
    };
  }, [image]);

  // Render a frame with the given strength — called by ImageBoard on slider change
  const render = (strength: number) => {
    const gl = glRef.current;
    const program = programRef.current;
    const vao = vaoRef.current;
    const texture = textureRef.current;

    if (!gl || !program || !vao || !texture) return;

    drawFrame(gl, program, vao, texture, strength);
  };

  return { render, isSupported, isReady };
};
