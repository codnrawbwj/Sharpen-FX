# Sharpen-FX

https://sharpen-fx.vercel.app/

A real-time image enhancement application built with Next.js, WebGL 2.0, and Web Workers.

## V2 Highlights

V2 is a significant upgrade over the original MVP — the core processing engine has been migrated from a CPU-based Web Worker to a **WebGL 2.0 GPU pipeline**, enabling real-time rendering via GLSL fragment shaders. The UI has also been fully redesigned to match the feel of a native desktop image tool.

- **WebGL 2.0 GPU engine** — sharpen filter runs as a GLSL fragment shader, processing all pixels in parallel on the GPU
- **CPU fallback** — original Web Worker pipeline is preserved; auto-activates if WebGL2 is unavailable
- **GPU / CPU toggle** — switch between pipelines at runtime; strength resets on switch
- **Real-time strength control** — GPU mode updates the image instantly as the slider is dragged, no button required
- **Correct download** — download uses the active pipeline's canvas (WebGL or 2D)
- **Redesigned UI** — full-screen dark layout, glassmorphism sidebar, modernized before/after slider

## Features

- **Before/After Comparison**: Interactive slider to compare original and processed images side by side
- **Adjustable Strength**: Slider controls sharpening intensity (0–2) in real-time on GPU, or on demand on CPU
- **GPU / CPU Mode**: Toggle between WebGL and Web Worker processing
- **Dark Native UI**: Full-screen dark layout with a glassmorphism control panel
- **Drag & Drop Upload**: Supports JPG and PNG up to 1920px wide
- **Download**: Export the processed image as PNG

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest, React Testing Library
- **GPU Processing**: WebGL 2.0, GLSL shaders
- **CPU Processing**: Canvas API, Web Workers
- **Build Tool**: Next.js with Turbopack

## How It Works

### GPU Pipeline (default)

1. Image is uploaded to GPU memory as a WebGL texture
2. A fullscreen quad is rendered via two triangles
3. A GLSL fragment shader runs on every pixel simultaneously, applying a 3×3 sharpen convolution kernel
4. The result is displayed on a WebGL canvas in real-time as the strength slider changes

### CPU Pipeline (fallback)

1. Image pixel data is transferred to a Web Worker via `postMessage`
2. The worker applies the same 3×3 sharpen kernel in a sequential JavaScript loop
3. The result is written back to a 2D canvas via `putImageData`

### Sharpen Kernel

Both pipelines implement the same convolution:

```
 0  -1   0
-1   5  -1
 0  -1   0
```

The `strength` parameter scales the kernel values, controlling the intensity of the effect.

## Usage

1. **Upload**: Drag & drop or click to select a JPG/PNG image
2. **Adjust**: Drag the Strength slider — GPU mode updates instantly
3. **Compare**: Drag the before/after divider to compare original and processed
4. **Download**: Save the processed image as PNG
5. **Switch**: Toggle GPU/CPU mode from the sidebar

## Testing

```bash
npm test              # Run all tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/Sharpen-FX.git
cd Sharpen-FX
npm install
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```
