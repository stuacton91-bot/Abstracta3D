import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { CanvasObject, CustomShape } from '../store/useAppStore';
import { Play, Sparkles, Infinity as InfinityIcon, Zap } from 'lucide-react';

interface AlgorithmicBrushesProps {
  canvasWidth: number;
  canvasHeight: number;
  selectedShapeId: string | null;
}

// Simple color interpolator (HSL)
const interpolateColor = (i: number, total: number): string => {
  const hue = (i / total) * 360;
  return `hsl(${hue}, 80%, 60%)`;
};

export const AlgorithmicBrushes: React.FC<AlgorithmicBrushesProps> = ({ canvasWidth, canvasHeight, selectedShapeId }) => {
  const library = useAppStore(state => state.library);
  const addCanvasObject = useAppStore(state => state.addCanvasObject);
  const saveHistoryState = useAppStore(state => state.saveHistoryState);

  const [brushType, setBrushType] = useState<'pendulum' | 'walker' | 'supernova'>('pendulum');
  const [chaosMode, setChaosMode] = useState(false);
  const [rainbowPaint, setRainbowPaint] = useState(false);
  const [dropSize, setDropSize] = useState(1);
  const [isPainting, setIsPainting] = useState(false);

  const generatePendulumPath = (count: number, cx: number, cy: number) => {
    const path = [];
    const A = Math.min(canvasWidth, canvasHeight) * 0.4; // Initial amplitude
    const B = A * 0.8;
    const f1 = 3.0; // Frequency X
    const f2 = 2.0; // Frequency Y
    const d = 0.02; // Damping (decay)
    const phase = Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const t = i * 0.1;
      const decay = Math.exp(-d * t);
      const x = cx + A * decay * Math.sin(t * f1 + phase);
      const y = cy + B * decay * Math.sin(t * f2);
      path.push({ x, y, scale: dropSize * decay, rotation: t * 10 });
    }
    return path;
  };

  const generateWalkerPath = (count: number, cx: number, cy: number) => {
    const path = [];
    let currX = cx;
    let currY = cy;
    let currAngle = Math.random() * Math.PI * 2;
    
    for (let i = 0; i < count; i++) {
      path.push({ x: currX, y: currY, scale: dropSize * (0.5 + Math.random() * 0.5), rotation: currAngle * 57.3 });
      
      currAngle += (Math.random() - 0.5) * 2; // Wander
      const step = 20 + Math.random() * 40;
      currX += Math.cos(currAngle) * step;
      currY += Math.sin(currAngle) * step;
      
      // Bounce off walls
      if (currX < 0) currX = 0;
      if (currX > canvasWidth) currX = canvasWidth;
      if (currY < 0) currY = 0;
      if (currY > canvasHeight) currY = canvasHeight;
    }
    return path;
  };

  const generateSupernovaPath = (count: number, cx: number, cy: number) => {
    const path = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.pow(Math.random(), 0.5) * (Math.min(canvasWidth, canvasHeight) * 0.4);
      const x = cx + Math.cos(angle) * distance;
      const y = cy + Math.sin(angle) * distance;
      path.push({ x, y, scale: dropSize * (0.2 + Math.random() * 0.8), rotation: Math.random() * 360, distance });
    }
    // Sort by distance to animate expanding outwards
    return path.sort((a, b) => a.distance - b.distance);
  };

  const handleStartPainting = () => {
    if (library.length === 0) return alert("Your library is empty! Go to the Shape Forge first.");
    if (!chaosMode && !selectedShapeId) return alert("Select a shape from the canvas, or enable Chaos Mode to use random shapes.");

    setIsPainting(true);
    saveHistoryState(); // Save history right before starting the macro

    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    let path: Array<{x: number, y: number, scale: number, rotation: number}> = [];

    const numPoints = brushType === 'pendulum' ? 100 : brushType === 'walker' ? 60 : 40;

    if (brushType === 'pendulum') path = generatePendulumPath(numPoints, cx, cy);
    else if (brushType === 'walker') path = generateWalkerPath(numPoints, cx, cy);
    else if (brushType === 'supernova') path = generateSupernovaPath(numPoints, cx, cy);

    let i = 0;
    const timer = setInterval(() => {
      if (i >= path.length) {
        clearInterval(timer);
        setIsPainting(false);
        return;
      }

      const pt = path[i];
      let shapeToDrop: CustomShape;
      
      if (chaosMode) {
        shapeToDrop = library[Math.floor(Math.random() * library.length)];
      } else {
        shapeToDrop = library.find(s => s.id === selectedShapeId) || library[0];
      }

      const newObj: CanvasObject = {
        id: crypto.randomUUID(),
        shapeId: shapeToDrop.id,
        x: pt.x,
        y: pt.y,
        scaleX: pt.scale,
        scaleY: pt.scale,
        rotation: pt.rotation,
      };

      if (rainbowPaint) {
        newObj.overrideEffect = {
          ...shapeToDrop.effect,
          colors: [interpolateColor(i, path.length), interpolateColor((i + 10) % path.length, path.length)],
        };
      }

      addCanvasObject(newObj);
      i++;
    }, 50); // Drop a shape every 50ms
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mt-6">
      <h4 className="font-bold text-sm text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-purple-400" /> Algorithmic Brushes
      </h4>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setBrushType('pendulum')}
          className={`py-2 px-1 text-xs rounded border flex flex-col items-center gap-1 transition-colors ${brushType === 'pendulum' ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
        >
          <InfinityIcon size={16} /> Pendulum
        </button>
        <button
          onClick={() => setBrushType('walker')}
          className={`py-2 px-1 text-xs rounded border flex flex-col items-center gap-1 transition-colors ${brushType === 'walker' ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
        >
          <Zap size={16} /> Walker
        </button>
        <button
          onClick={() => setBrushType('supernova')}
          className={`py-2 px-1 text-xs rounded border flex flex-col items-center gap-1 transition-colors ${brushType === 'supernova' ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
        >
          <Sparkles size={16} /> Supernova
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>Drop Size</span>
            <span>{dropSize.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.1" max="3" step="0.1"
            value={dropSize}
            onChange={(e) => setDropSize(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs text-neutral-400">Chaos Mode (Random Shapes)</label>
          <button onClick={() => setChaosMode(!chaosMode)} className={`w-10 h-5 rounded-full transition-colors relative ${chaosMode ? 'bg-purple-500' : 'bg-neutral-800'}`}>
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${chaosMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs text-neutral-400">Virtual Paint Tin (Rainbow)</label>
          <button onClick={() => setRainbowPaint(!rainbowPaint)} className={`w-10 h-5 rounded-full transition-colors relative ${rainbowPaint ? 'bg-purple-500' : 'bg-neutral-800'}`}>
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${rainbowPaint ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      <button
        onClick={handleStartPainting}
        disabled={isPainting || library.length === 0}
        className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isPainting ? (
          <span className="animate-pulse">Painting...</span>
        ) : (
          <><Play size={16} fill="currentColor" /> Throw Paint</>
        )}
      </button>
    </div>
  );
};
