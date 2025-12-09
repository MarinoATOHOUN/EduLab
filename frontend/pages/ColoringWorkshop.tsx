import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Eraser, Download, Trash2, Palette, Brush, Sticker, ZoomIn, ZoomOut } from 'lucide-react';

const COLORS = [
  '#000000', // Noir
  '#EF4444', // Rouge
  '#F97316', // Orange
  '#EAB308', // Jaune
  '#22C55E', // Vert
  '#06B6D4', // Cyan
  '#3B82F6', // Bleu
  '#A855F7', // Violet
  '#EC4899', // Rose
  '#FFFFFF', // Blanc (pour effacer ou dessiner en blanc)
];

const STICKERS = ['⭐', '❤️', '🌟', '🌈', '🦋', '🌸', '🐶', '🐱', '🚀', '🌍', '👑', '🎈'];

const BRUSH_SIZES = [5, 10, 20, 40];

const ColoringWorkshop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#EF4444');
  const [brushSize, setBrushSize] = useState(10);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'brush' | 'sticker'>('brush');
  const [selectedSticker, setSelectedSticker] = useState(STICKERS[0]);
  const [zoom, setZoom] = useState(1);

  // Initialisation du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Initial resolution matches parent size
      canvas.width = canvas.parentElement?.offsetWidth || 800;
      canvas.height = canvas.parentElement?.offsetHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Note: We removed the automatic resize listener for now to avoid clearing the canvas 
    // or complex restoration logic when zooming/resizing in this simple implementation.
    // In a production app, you'd want to debouce resize and preserve canvas content via a temporary canvas.
  }, []);

  // Helper to map mouse/touch coordinates to internal canvas pixels
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    // Important: Calculate scale factor between visual size (rect) and internal resolution (width/height)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      offsetX: (clientX - rect.left) * scaleX,
      offsetY: (clientY - rect.top) * scaleY
    };
  };

  // Logique de dessin
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (selectedTool === 'sticker') {
      placeSticker(e);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || selectedTool === 'sticker') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);

    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;
    ctx.lineWidth = brushSize;
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const placeSticker = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e, canvas);

    ctx.font = `${brushSize * 3}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedSticker, offsetX, offsetY);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'mon-dessin-edulab.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const loadTemplate = (type: 'flower' | 'house' | 'rocket') => {
    clearCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    if (type === 'flower') {
      // Simple flower drawing path
      ctx.arc(cx, cy, 30, 0, Math.PI * 2); // Center
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        const x = cx + Math.cos(angle) * 60;
        const y = cy + Math.sin(angle) * 60;
        ctx.moveTo(x + 30, y);
        ctx.arc(x, y, 30, 0, Math.PI * 2);
      }
      ctx.moveTo(cx, cy + 30);
      ctx.lineTo(cx, cy + 150); // Tige
    } else if (type === 'house') {
      // House
      ctx.rect(cx - 100, cy, 200, 150); // Body
      ctx.moveTo(cx - 120, cy);
      ctx.lineTo(cx, cy - 100); // Roof L
      ctx.lineTo(cx + 120, cy); // Roof R
      ctx.rect(cx - 30, cy + 80, 60, 70); // Door
      ctx.rect(cx - 70, cy + 30, 40, 40); // Window 1
      ctx.rect(cx + 30, cy + 30, 40, 40); // Window 2
    } else if (type === 'rocket') {
      // Rocket
      ctx.moveTo(cx - 40, cy + 100);
      ctx.lineTo(cx - 40, cy - 50);
      ctx.quadraticCurveTo(cx, cy - 120, cx + 40, cy - 50);
      ctx.lineTo(cx + 40, cy + 100);
      ctx.lineTo(cx - 40, cy + 100);

      // Wings
      ctx.moveTo(cx - 40, cy + 60);
      ctx.lineTo(cx - 70, cy + 110);
      ctx.lineTo(cx - 40, cy + 100);

      ctx.moveTo(cx + 40, cy + 60);
      ctx.lineTo(cx + 70, cy + 110);
      ctx.lineTo(cx + 40, cy + 100);

      // Window
      ctx.moveTo(cx + 20, cy - 20);
      ctx.arc(cx, cy - 20, 20, 0, Math.PI * 2);
    }

    ctx.stroke();
  };

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-gradient-to-br from-pink-400 to-purple-500 p-1 animate-in fade-in duration-500 flex flex-col">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-2 mb-1 flex flex-wrap justify-between items-center gap-2 shadow-lg border-2 border-white dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/tools" className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:scale-110 transition-transform text-gray-600 dark:text-gray-300">
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <Palette size={20} />
            <span className="hidden sm:inline">Atelier</span>
          </h1>
        </div>

        <div className="flex gap-1">
          <button onClick={() => loadTemplate('flower')} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-[10px] uppercase font-bold hover:bg-yellow-200 transition-colors">Fleur</button>
          <button onClick={() => loadTemplate('house')} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] uppercase font-bold hover:bg-blue-200 transition-colors">Maison</button>
          <button onClick={() => loadTemplate('rocket')} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-[10px] uppercase font-bold hover:bg-indigo-200 transition-colors">Fusée</button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          <button onClick={() => adjustZoom(-0.25)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><ZoomOut size={16} /></button>
          <span className="text-xs font-bold min-w-[3ch] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => adjustZoom(0.25)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><ZoomIn size={16} /></button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearCanvas}
            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Tout effacer"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={downloadCanvas}
            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            title="Sauvegarder"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-grow flex flex-col lg:flex-row gap-1 h-full overflow-hidden">

        {/* Left Sidebar: Palette (Reduced width) */}
        <div className="lg:w-16 bg-white dark:bg-gray-800 rounded-xl p-1.5 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto items-center shadow-md border-2 border-white dark:border-gray-700 shrink-0 scrollbar-hide z-10">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); setSelectedTool('brush'); }}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110 shrink-0 ${color === c && !isEraser && selectedTool === 'brush' ? 'border-gray-900 scale-110 ring-2 ring-offset-2 ring-gray-300' : 'border-gray-200'}`}
              style={{ backgroundColor: c }}
            ></button>
          ))}
        </div>

        {/* Center: Canvas Container (Scrollable) */}
        <div className="flex-grow bg-gray-200 dark:bg-gray-900 rounded-xl shadow-inner overflow-auto relative border-2 border-white dark:border-gray-700 touch-none flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="bg-white shadow-2xl cursor-crosshair block origin-top-left"
            style={{
              width: `${zoom * 100}%`,
              height: `${zoom * 100}%`,
              // If zoom < 1, we center it visually, if > 1 it scrolls
              margin: zoom < 1 ? 'auto' : '0'
            }}
          />
        </div>

        {/* Right Sidebar: Tools (Reduced width) */}
        <div className="lg:w-44 bg-white dark:bg-gray-800 rounded-xl p-2 flex flex-col gap-3 shadow-md border-2 border-white dark:border-gray-700 shrink-0 overflow-y-auto z-10">

          {/* Mode Selector */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => { setSelectedTool('brush'); setIsEraser(false); }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 text-[10px] font-bold transition-all ${selectedTool === 'brush' && !isEraser ? 'bg-white dark:bg-gray-600 text-pink-600 shadow-sm' : 'text-gray-500'}`}
            >
              <Brush size={14} /> Dessin
            </button>
            <button
              onClick={() => setSelectedTool('sticker')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1 text-[10px] font-bold transition-all ${selectedTool === 'sticker' ? 'bg-white dark:bg-gray-600 text-pink-600 shadow-sm' : 'text-gray-500'}`}
            >
              <Sticker size={14} /> Stickers
            </button>
          </div>

          {selectedTool === 'brush' ? (
            <>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase">Taille</label>
                <div className="flex justify-between items-center gap-1">
                  {BRUSH_SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 transition-all flex items-center justify-center ${brushSize === size ? 'bg-pink-500 text-white' : ''}`}
                      style={{ width: Math.max(16, size + 4), height: Math.max(16, size + 4) }}
                    >
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { setIsEraser(true); setSelectedTool('brush'); }}
                  className={`w-full py-2 rounded-lg flex items-center gap-2 px-3 font-bold transition-all text-xs ${isEraser ? 'bg-pink-100 text-pink-600 ring-2 ring-pink-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                >
                  <Eraser size={16} /> Gomme
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase">Stickers</label>
              <div className="grid grid-cols-4 gap-1">
                {STICKERS.map(sticker => (
                  <button
                    key={sticker}
                    onClick={() => setSelectedSticker(sticker)}
                    className={`text-lg p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${selectedSticker === sticker ? 'bg-pink-100 ring-2 ring-pink-300' : ''}`}
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ColoringWorkshop;
