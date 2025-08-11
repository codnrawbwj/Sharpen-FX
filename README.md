# Sharpen-FX

A real-time image sharpening application built with Next.js, Canvas API, and Web Workers for enhanced performance.

## Features

- **Real-time Image Processing**: Upload and process images instantly with customizable sharpening strength
- **Before/After Comparison**: Interactive slider to compare original and processed images
- **Web Worker Architecture**: Heavy image processing runs in background threads for smooth UI
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **TypeScript**: Full type safety and modern development experience

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest, React Testing Library
- **Image Processing**: Canvas API, Web Workers
- **Build Tool**: Next.js with Turbopack

## 🔧 How It Works

### Image Enhancement Algorithm

The application implements a pixel-based sharpening algorithm:

1. **Pixel Analysis**: Each pixel is analyzed with its surrounding neighbors
2. **Blur Detection**: Surrounding pixels are blurred to create contrast
3. **Strength Enhancement**: Selected pixels are enhanced based on user-defined strength parameter
4. **Real-time Processing**: All processing happens in Web Workers to maintain UI responsiveness

### Architecture

- **Canvas API**: Handles image rendering and pixel manipulation
- **Web Workers**: Processes image data in background threads
- **React Hooks**: Custom `useImageWorker` hook for worker communication
- **Error Handling**: Comprehensive error handling for various failure scenarios

## �� Usage

1. **Upload Image**: Drag & drop or click to select JPG/PNG images
2. **Adjust Strength**: Use the strength slider to control sharpening intensity
3. **Process Image**: Click "Sharpen Image" to apply the enhancement
4. **Compare Results**: Use the interactive slider to compare before/after
5. **Download**: Save the processed image

## 🧪 Testing

Comprehensive test suite implemented with **Vitest** and React Testing Library:

- ✅ Component rendering tests
- ✅ User interaction tests
- ✅ Image processing workflow tests
- ✅ Error handling tests
- ✅ Web Worker communication tests

Run tests:

```bash
npm test              # Run all tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

## 🚧 Current Status: MVP

This is a **Minimum Viable Product (MVP)** with core functionality implemented. The following enhancements are planned for future development:

### 🔄 Planned Improvements

1. **Error Handler Enhancement**

   - More granular error types
   - User-friendly error messages
   - Error recovery mechanisms

2. **Image Data Transfer Optimization**

   - Implement structured clone for better performance
   - Reduce memory usage during processing
   - Optimize data transfer between main thread and workers

3. **Loading States & Progress Indicators**

   - Real-time processing progress bars
   - Loading spinners and skeleton screens
   - Better user feedback during operations

4. **Image Processing Queue System**
   - Handle multiple images simultaneously
   - Queue management for large batches
   - Memory management for multiple operations

### 🎯 Additional Features

- Support for more image formats (WebP, AVIF)
- Advanced image filters and effects
- Batch processing capabilities
- Image quality settings and optimization
- Cloud storage integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Sharpen-FX.git
cd Sharpen-FX

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```
