import ImageBoard from "./ImageBoard";

const SharpenFX = () => {
  return (
    <div className="min-h-screen px-8 py-6 w-full">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <h1 className="text-3xl font-semibold mb-4">
          Sharpen <span className="text-primary-a">FX</span>
        </h1>

        <div className="flex gap-4 mb-6 flex-1">
          <ImageBoard />
        </div>
      </div>
    </div>
  );
};

export default SharpenFX;
