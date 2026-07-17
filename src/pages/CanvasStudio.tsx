import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useAppStore } from '../store/useAppStore';
import type { CustomShape } from '../store/useAppStore';
import { RotateCcw, Activity, Mic, MicOff, Undo2, Redo2, Camera } from 'lucide-react';
import { audioAnalyzer } from '../lib/audioAnalyzer';
import { EffectPanel } from '../components/EffectPanel';
import { AlgorithmicBrushes } from '../components/AlgorithmicBrushes';
import { Shape3DComponent } from '../components/Shape3DComponent';
import { createSVGDataUrl } from '../utils/svgGenerator';

const ShapeThumbnail: React.FC<{ shape: CustomShape }> = ({ shape }) => {
  const dataUrl = React.useMemo(() => createSVGDataUrl(shape), [shape]);
  return <img src={dataUrl} alt="Shape Preview" className="w-full h-full object-contain drop-shadow-md pointer-events-none" />;
};

const CanvasStudio: React.FC = () => {
  const { library, canvasObjects, addCanvasObject, updateCanvasObject, removeCanvasObject, setCanvasObjects, canvasColor, setCanvasColor, undo, redo, history, future } = useAppStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedShapeId, setDraggedShapeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [micEnabled, setMicEnabled] = useState(false);

  // Instead of updating the store thousands of times a second during drag (which breaks history/firebase),
  // we use a specific throttled or local update for dragging. But for now, we'll just update directly
  // since PivotControls `onDragEnd` handles the final commit!
  
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleSetAllObjs = (objs: any[]) => setCanvasObjects(objs);
  const handleAddObj = (obj: any) => addCanvasObject(obj);
  const handleRemoveObj = (id: string) => removeCanvasObject(id);
  const handleUpdateObj = (id: string, updates: any) => updateCanvasObject(id, updates);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedShapeId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newObj = {
      id: crypto.randomUUID(),
      shapeId: draggedShapeId,
      x, y,
      scaleX: 100, // Normalized to 100 base scale in 3D
      scaleY: 100,
      rotation: 0,
      behavior: 'none' as const,
      audioReactive: false
    };

    handleAddObj(newObj);
    setSelectedId(newObj.id);
    setDraggedShapeId(null);
  };

  const handleEnableMic = async () => {
    if (micEnabled) {
      setMicEnabled(false);
    } else {
      await audioAnalyzer.initialize();
      setMicEnabled(true);
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;
    handleRemoveObj(selectedId);
    setSelectedId(null);
  };

  const handleExportImage = () => {
    // Deselect objects so PivotControls disappear before capture
    const previousSelection = selectedId;
    setSelectedId(null);
    
    // Wait for the next frame so the UI update (deselection) renders
    setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `abstracta3d-render-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      // Restore selection
      if (previousSelection) setSelectedId(previousSelection);
    }, 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
        return;
      }
      
      if (!selectedId) return;
      
      // Use getState to avoid stale closures during rapid key presses
      const currentObjs = useAppStore.getState().canvasObjects;
      const obj = currentObjs.find(o => o.id === selectedId);
      if (!obj) return;

      // In 3D space mapped from 2D coordinates, 1 unit = 100 pixels.
      // So moving by 10 pixels is a nice small increment.
      const step = e.shiftKey ? 50 : 10;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleUpdateObj(selectedId, { y: obj.y - step });
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleUpdateObj(selectedId, { y: obj.y + step });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleUpdateObj(selectedId, { x: obj.x - step });
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleUpdateObj(selectedId, { x: obj.x + step });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, handleDelete, handleUpdateObj]);

  const selectedObj = canvasObjects.find(o => o.id === selectedId);
  const selectedShapeDef = selectedObj ? library.find(s => s.id === selectedObj.shapeId) : null;

  return (
    <div className="flex h-full w-full bg-neutral-900 text-white overflow-hidden">
      {/* Sidebar Library */}
      <div className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-neutral-800">
          <h3 className="font-bold">Shape Library</h3>
          <p className="text-xs text-neutral-500">Drag shapes onto the canvas.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {library.map((shape) => (
              <div 
                key={shape.id} 
                draggable
                onDragStart={() => setDraggedShapeId(shape.id)}
                className="aspect-square bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHUlEQVQ4jWNgYGAQIYAJwoz/4QUxKsCogEEDAwMA0xUB+6z+hZAAAAAASUVORK5CYII=')] rounded-lg border border-neutral-800 flex items-center justify-center p-2 cursor-grab active:cursor-grabbing hover:border-neutral-600 transition-colors relative group"
              >
                <ShapeThumbnail shape={shape} />
              </div>
            ))}
          </div>
          <AlgorithmicBrushes canvasWidth={stageSize.width} canvasHeight={stageSize.height} selectedShapeId={selectedObj?.shapeId || null} />
        </div>
      </div>

      {/* R3F WebGL Canvas */}
      <div className="flex-1 relative bg-black overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-800/90 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-700 shadow-xl flex items-center gap-2 z-20">
          <button onClick={undo} disabled={history.length === 0} className="p-2 text-neutral-400 hover:text-white disabled:opacity-30" title="Undo"><Undo2 size={18} /></button>
          <button onClick={redo} disabled={future.length === 0} className="p-2 text-neutral-400 hover:text-white disabled:opacity-30" title="Redo"><Redo2 size={18} /></button>
          <div className="w-px h-6 bg-neutral-600 mx-1"></div>
          
          <button onClick={() => { if(window.confirm('Clear canvas?')) { handleSetAllObjs([]); setSelectedId(null); } }} className="p-2 text-red-500 hover:text-red-400"><RotateCcw size={18} /></button>
          <div className="w-px h-6 bg-neutral-600 mx-1"></div>
          
          <button onClick={handleEnableMic} className={`p-2 transition-colors ${micEnabled ? 'text-pink-400' : 'text-neutral-400 hover:text-white'}`}>
            {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          <div className="w-px h-6 bg-neutral-600 mx-1"></div>
          
          <button onClick={handleExportImage} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium ml-2">
            <Camera size={16} /> Render HD
          </button>
        </div>

        <div className="flex-1" ref={containerRef} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          {stageSize.width > 0 && (
            <Canvas 
              camera={{ position: [0, 0, 10], fov: 50 }} 
              gl={{ preserveDrawingBuffer: true, antialias: true }} 
              dpr={window.devicePixelRatio > 1 ? window.devicePixelRatio : 2}
              onPointerMissed={() => setSelectedId(null)}
            >
              <color attach="background" args={[canvasColor || '#0f0f13']} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} castShadow />
              
              <Environment preset="studio" />
              
              <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={50} blur={2} far={10} />

              {canvasObjects.map((obj) => {
                const shapeDef = library.find(s => s.id === obj.shapeId);
                if (!shapeDef) return null;
                return (
                  <Shape3DComponent
                    key={obj.id}
                    canvasObj={obj}
                    shape={shapeDef}
                    isSelected={obj.id === selectedId}
                    onSelect={() => setSelectedId(obj.id)}
                    onChange={(updates) => handleUpdateObj(obj.id, updates)}
                  />
                );
              })}

              <OrbitControls makeDefault />
              
              <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} opacity={1.5} />
                <Noise opacity={0.02} />
                <ChromaticAberration offset={[0.002, 0.002] as any} blendFunction={BlendFunction.NORMAL} />
              </EffectComposer>
            </Canvas>
          )}
        </div>
      </div>

      {/* Properties Sidebar */}
      {selectedId && selectedObj && selectedShapeDef ? (
        <div className="w-80 bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col z-20 shrink-0 max-h-full overflow-y-auto">
          <h3 className="font-bold text-lg mb-6 shrink-0">3D Properties</h3>
          
          <div className="mb-6 shrink-0">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity size={14} /> Physics Behavior
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['none', 'float', 'pulse', 'spin', 'orbit'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => handleUpdateObj(selectedId, { behavior: b })}
                  className={`py-2 border rounded-md text-sm capitalize transition-colors ${
                    (selectedObj.behavior || 'none') === b ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 shrink-0 flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Mic size={14} /> React to Sound
            </label>
            <button
              onClick={() => handleUpdateObj(selectedId, { audioReactive: !selectedObj.audioReactive })}
              className={`w-12 h-6 rounded-full transition-colors relative ${selectedObj.audioReactive ? 'bg-pink-500' : 'bg-neutral-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${selectedObj.audioReactive ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <EffectPanel 
            effect={selectedObj.overrideEffect || selectedShapeDef.effect} 
            onChange={(newEffect) => handleUpdateObj(selectedId, { overrideEffect: newEffect })} 
          />
        </div>
      ) : (
        <div className="w-80 bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col z-20 shrink-0 max-h-full">
          <h3 className="font-bold text-lg mb-6 shrink-0">Canvas Settings</h3>
          <div className="mb-6 shrink-0">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Background Color</label>
            <input 
              type="color" 
              value={canvasColor || '#0f0f13'} 
              onChange={(e) => setCanvasColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasStudio;
