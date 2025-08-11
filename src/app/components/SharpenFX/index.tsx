import React from "react";
import ImageBoard from "./ImageBoard";

// function ClipEffect({ targetRef, sliderX, imgSize }) {
//   useEffect(() => {
//     const c = targetRef.current;
//     if (!c || !imgSize.w) return;
//     const ctx = c.getContext('2d');
//     // Create an overlay mask by clearing area to right of slider
//     const w = imgSize.w;
//     const h = imgSize.h;
//     if (sliderX === null) {
//       c.style.clip = 'rect(0px, ' + w + 'px, ' + h + 'px, 0px)';
//     } else {
//       c.style.clip = `rect(0px, ${sliderX}px, ${h}px, 0px)`;
//     }
//   }, [sliderX, imgSize, targetRef]);

//   return null;
// }

const SharpenFX = () => {
  // const inputRef = useRef(null);
  // const beforeCanvasRef = useRef(null);
  // const afterCanvasRef = useRef(null);
  // const containerRef = useRef(null);
  // const [processing, setProcessing] = useState(false);
  // const [worker, setWorker] = useState(null);
  // const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  // const [sliderX, setSliderX] = useState(null);

  // // create inline web worker (sharpen convolution)
  // useEffect(() => {
  //   const workerCode = `
  //     self.onmessage = function(e) {
  //       const { id, imageData, strength } = e.data;
  //       const width = imageData.width;
  //       const height = imageData.height;
  //       const data = imageData.data;

  //       // simple sharpen kernel (unsharp-like)
  //       // kernel = [ 0, -1, 0; -1, 5, -1; 0, -1, 0 ] scaled by strength
  //       const kBase = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  //       const kernel = kBase.map(v => v * strength);
  //       const out = new Uint8ClampedArray(data.length);

  //       function getIdx(x, y, c) {
  //         return (y * width + x) * 4 + c;
  //       }

  //       for (let y = 0; y < height; y++) {
  //         for (let x = 0; x < width; x++) {
  //           for (let c = 0; c < 3; c++) {
  //             let acc = 0;
  //             let k = 0;
  //             for (let ky = -1; ky <= 1; ky++) {
  //               for (let kx = -1; kx <= 1; kx++) {
  //                 const sx = Math.min(width - 1, Math.max(0, x + kx));
  //                 const sy = Math.min(height - 1, Math.max(0, y + ky));
  //                 acc += data[getIdx(sx, sy, c)] * kernel[k++];
  //               }
  //             }
  //             const idx = getIdx(x, y, c);
  //             // clamp
  //             out[idx] = Math.min(255, Math.max(0, acc));
  //           }
  //           // copy alpha
  //           out[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
  //         }
  //       }

  //       // post result
  //       self.postMessage({ id, imageData: { width, height, data: out } }, [out.buffer]);
  //     };
  //   `;

  //   const blob = new Blob([workerCode], { type: "application/javascript" });
  //   const url = URL.createObjectURL(blob);
  //   const w = new Worker(url);
  //   setWorker(w);

  //   return () => {
  //     w.terminate();
  //     URL.revokeObjectURL(url);
  //   };
  // }, []);

  // // handle messages from worker
  // useEffect(() => {
  //   if (!worker) return;
  //   worker.onmessage = (e) => {
  //     const { imageData } = e.data;
  //     // draw into after canvas
  //     const canvas = afterCanvasRef.current;
  //     if (!canvas) return;
  //     canvas.width = imageData.width;
  //     canvas.height = imageData.height;
  //     const ctx = canvas.getContext("2d");
  //     const id = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  //     ctx.putImageData(id, 0, 0);
  //     setProcessing(false);
  //   };
  // }, [worker]);

  // function downloadProcessed() {
  //   const canvas = afterCanvasRef.current;
  //   if (!canvas) return;
  //   const url = canvas.toDataURL("image/png");
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "sharpened.png";
  //   a.click();
  // }

  // // slider drag handlers
  // useEffect(() => {
  //   if (!containerRef.current) return;
  //   const container = containerRef.current;
  //   function onMove(e) {
  //     const rect = container.getBoundingClientRect();
  //     const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  //     setSliderX(Math.max(0, Math.min(rect.width, Math.round(x))));
  //   }
  //   function onUp() {
  //     window.removeEventListener("mousemove", onMove);
  //     window.removeEventListener("touchmove", onMove);
  //     window.removeEventListener("mouseup", onUp);
  //     window.removeEventListener("touchend", onUp);
  //   }
  //   function onDown(e) {
  //     onMove(e);
  //     window.addEventListener("mousemove", onMove);
  //     window.addEventListener("touchmove", onMove, { passive: false });
  //     window.addEventListener("mouseup", onUp);
  //     window.addEventListener("touchend", onUp);
  //   }
  //   container.addEventListener("mousedown", onDown);
  //   container.addEventListener("touchstart", onDown, { passive: false });

  //   return () => {
  //     container.removeEventListener("mousedown", onDown);
  //     container.removeEventListener("touchstart", onDown);
  //   };
  // }, [containerRef.current]);

  return (
    <div className="min-h-screen px-8 py-6 w-full">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <h1 className="text-3xl font-semibold mb-4">
          Sharpen <span className="text-primary-a">FX</span>
        </h1>

        <div className="flex gap-4 mb-6 flex-1">
          <ImageBoard />

          <div className="w-48 flex flex-col gap-2">
            <button className="bg-primary-a text-white hover:bg-primary-a/70 btn">
              {/* onClick={() => inputRef.current?.click()} */}
              Start Sharpening
            </button>
            <button
              className={`border border-gray-300 hover:border-gray-400 btn`}
            >
              {/* onClick={downloadProcessed} disabled={processing} */}
              Download
            </button>
            <div className="text-xs text-gray-500 mt-2">Processing:</div>
          </div>
        </div>

        <div className="relative bg-white rounded shadow-sm overflow-hidden">
          {/* before canvas */}
          {/* <canvas ref={beforeCanvasRef} style={{ position: 'absolute', left: 0, top: 0 }} /> */}

          {/* after canvas placed on top; we will clip it with slider */}
          {/* <canvas ref={afterCanvasRef} style={{ position: 'absolute', left: 0, top: 0 }} /> */}

          {/* slider indicator */}
          {/* {imgSize.w > 0 && sliderX !== null && (
            <div>
              <div style={{ position: 'absolute', left: sliderX - 1, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.8)', mixBlendMode: 'difference' }} />
              {/* mask the after-canvas by setting its clip via a style width */}
          {/* <style>{`
                canvas[ref="afterCanvas"] { pointer-events: none; }
              `}</style>
            </div> */}
        </div>

        {/* invisible overlay that controls width clip for after canvas */}
        <div style={{ height: 0 }}>
          {/* dynamic clip via inline style using sliderX */}
        </div>

        {/* reactive effect to apply clip to after canvas */}
        {/* <ClipEffect targetRef={afterCanvasRef} sliderX={sliderX} imgSize={imgSize} /> */}
      </div>
    </div>
  );
};

export default SharpenFX;
