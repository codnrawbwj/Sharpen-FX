export interface ImageWorker extends Worker {
  cleanup: () => void;
}

const workerCode = `
self.onmessage = function(e) {
  const { imageData, strength } = e.data;
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0].map(v => v * strength);
  const out = new Uint8ClampedArray(data.length);

  function getIdx(x, y, c) {
    return (y * width + x) * 4 + c;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        let acc = 0;
        let k = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const sx = Math.min(width - 1, Math.max(0, x + kx));
            const sy = Math.min(height - 1, Math.max(0, y + ky));
            acc += data[getIdx(sx, sy, c)] * kernel[k++];
          }
        }
        
        const idx = getIdx(x, y, c);
        out[idx] = Math.min(255, Math.max(0, acc)); // Clamp to 0-255
      }
      
      out[getIdx(x, y, 3)] = data[getIdx(x, y, 3)];
    }
  }

  self.postMessage({ 
    imageData: { width, height, data: out } 
  }, [out.buffer]);
};
`;

export const createImageWorker = (): Worker => {
  const blob = new Blob([workerCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url) as ImageWorker;

  worker.cleanup = () => {
    URL.revokeObjectURL(url);
  };

  return worker;
};
