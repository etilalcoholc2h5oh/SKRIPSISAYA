import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Eraser, PenTool, Download, Check } from 'lucide-react';

interface HandwritingCanvasProps {
  initialDataUrl?: string;
  onSave: (dataUrl: string) => void;
  isDarkMode: boolean;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ initialDataUrl, onSave, isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState(isDarkMode ? '#60a5fa' : '#1e3a8a');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 320 * 2;
    ctx.scale(2, 2);

    // Initial background & grid lines for calligraphy guide
    drawGuidelines(ctx, rect.width, 320, isDarkMode);

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, 320);
      };
      img.src = initialDataUrl;
    }
  }, [isDarkMode]);

  const drawGuidelines = (ctx: CanvasRenderingContext2D, width: number, height: number, dark: boolean) => {
    ctx.fillStyle = dark ? '#1c1917' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Ruled notebook lines
    ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1;

    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;
    ctx.strokeStyle = tool === 'eraser' ? (isDarkMode ? '#1c1917' : '#ffffff') : strokeColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    triggerAutoSave();
  };

  const triggerAutoSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    drawGuidelines(ctx, rect.width, 320, isDarkMode);
    triggerAutoSave();
  };

  return (
    <div className="space-y-3">
      {/* Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100 dark:bg-stone-800/80 rounded-xl text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tool === 'pen'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
            }`}
          >
            <PenTool className="w-4 h-4" /> Pena Khat
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tool === 'eraser'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
            }`}
          >
            <Eraser className="w-4 h-4" /> Penghapus
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500">Ketebalan:</span>
            {[2, 4, 6].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setLineWidth(w)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  lineWidth === w
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Hapus Semua
          </button>

          {savedSuccess && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Tersimpan
            </span>
          )}
        </div>
      </div>

      {/* Touch Canvas */}
      <div className="relative border border-stone-300 dark:border-stone-700 rounded-2xl overflow-hidden shadow-inner bg-white dark:bg-stone-900 touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-80 cursor-crosshair block"
        />
        <div className="absolute bottom-2 right-3 text-[11px] text-stone-400 select-none pointer-events-none font-arabic">
          اكتب بيدك هنا (Tulis tangan Arab di sini)
        </div>
      </div>
    </div>
  );
};
