import { create } from 'zustand';
import { db } from '../lib/firebase';
import { ref, set as firebaseSet, update, remove } from 'firebase/database';

export interface Point {
  x: number;
  y: number;
}

export type EffectType = 
  | 'glass' | 'mesh' | 'holographic' | 'noise' 
  | 'aberration' | 'liquid' | 'warp' | 'duotone' 
  | 'neon' | 'emboss' | 'paper' | 'halftone' 
  | 'sketch' | 'oil' | 'shadow';

export interface ShapeEffect {
  type: EffectType;
  colors: string[]; 
  opacity: number;
  intensity: number; 
}

export type BehaviorType = 'none' | 'float' | 'pulse' | 'spin' | 'orbit';

export interface CustomShape {
  id: string;
  points: Point[];
  effect: ShapeEffect;
}

export interface CanvasObject {
  id: string;
  shapeId: string; 
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  overrideEffect?: ShapeEffect; 
  behavior?: BehaviorType;
  audioReactive?: boolean;
}

interface AppState {
  roomId: string | null;
  setRoomId: (id: string | null) => void;

  library: CustomShape[];
  addShapeToLibrary: (shape: CustomShape) => void;
  removeShapeFromLibrary: (id: string) => void;
  setLibrary: (shapes: CustomShape[]) => void;

  canvasObjects: CanvasObject[];
  addCanvasObject: (obj: CanvasObject) => void;
  updateCanvasObject: (id: string, updates: Partial<CanvasObject>) => void;
  removeCanvasObject: (id: string) => void;
  setCanvasObjects: (objects: CanvasObject[]) => void;

  canvasColor: string;
  setCanvasColor: (color: string) => void;
}

export const useAppStore = create<AppState>()(
  (set, get) => ({
    roomId: null,
    setRoomId: (id) => set({ roomId: id }),

    library: [],
    addShapeToLibrary: (shape) => {
      const state = get();
      if (state.roomId) {
        firebaseSet(ref(db, `rooms/${state.roomId}/library/${shape.id}`), shape);
      }
    },
    removeShapeFromLibrary: (id) => {
      const state = get();
      if (state.roomId) {
        remove(ref(db, `rooms/${state.roomId}/library/${id}`));
      }
    },
    setLibrary: (shapes) => {
      const state = get();
      if (state.roomId) {
        if (shapes.length === 0) {
          firebaseSet(ref(db, `rooms/${state.roomId}/library`), null);
        } else {
          const objMap: Record<string, CustomShape> = {};
          shapes.forEach(s => objMap[s.id] = s);
          firebaseSet(ref(db, `rooms/${state.roomId}/library`), objMap);
        }
      }
    },

    canvasObjects: [],
    addCanvasObject: (obj) => {
      const state = get();
      if (state.roomId) {
        firebaseSet(ref(db, `rooms/${state.roomId}/canvasObjects/${obj.id}`), obj);
      }
    },
    updateCanvasObject: (id, updates) => {
      const state = get();
      if (state.roomId) {
        update(ref(db, `rooms/${state.roomId}/canvasObjects/${id}`), updates);
      }
    },
    removeCanvasObject: (id) => {
      const state = get();
      if (state.roomId) {
        remove(ref(db, `rooms/${state.roomId}/canvasObjects/${id}`));
      }
    },
    setCanvasObjects: (objects) => {
      const state = get();
      if (state.roomId) {
        if (objects.length === 0) {
          firebaseSet(ref(db, `rooms/${state.roomId}/canvasObjects`), null);
        } else {
          const objMap: Record<string, CanvasObject> = {};
          objects.forEach(o => objMap[o.id] = o);
          firebaseSet(ref(db, `rooms/${state.roomId}/canvasObjects`), objMap);
        }
      }
    },

    canvasColor: '#171717',
    setCanvasColor: (color) => {
      const state = get();
      if (state.roomId) {
        firebaseSet(ref(db, `rooms/${state.roomId}/canvasColor`), color);
      } else {
        set({ canvasColor: color });
      }
    }
  })
);
