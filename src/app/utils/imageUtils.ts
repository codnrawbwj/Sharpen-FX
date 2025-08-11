export const resizeImage = (img: HTMLImageElement, maxWidth: number) => {
  const w = Math.min(maxWidth, img.width);
  const scale = w / img.width;
  const h = Math.round(img.height * scale);
  return { w, h };
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png", 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
