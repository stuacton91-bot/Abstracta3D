import { useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useAppStore } from '../store/useAppStore';
import type { CustomShape, CanvasObject } from '../store/useAppStore';

export const useSyncFirebase = (roomId: string | null) => {
  useEffect(() => {
    if (!roomId) return;

    useAppStore.setState({ roomId });

    const libRef = ref(db, `rooms/${roomId}/library`);
    const canvasRef = ref(db, `rooms/${roomId}/canvasObjects`);
    const colorRef = ref(db, `rooms/${roomId}/canvasColor`);
    const lightRef = ref(db, `rooms/${roomId}/lightSettings`);

    const unsubLib = onValue(libRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        useAppStore.setState({ library: Object.values(data) as CustomShape[] });
      } else {
        useAppStore.setState({ library: [] });
      }
    });

    const unsubCanvas = onValue(canvasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        useAppStore.setState({ canvasObjects: Object.values(data) as CanvasObject[] });
      } else {
        useAppStore.setState({ canvasObjects: [] });
      }
    });

    const unsubColor = onValue(colorRef, (snapshot) => {
      const color = snapshot.val();
      if (color) {
        useAppStore.setState({ canvasColor: color });
      }
    });

    const unsubLight = onValue(lightRef, (snapshot) => {
      const settings = snapshot.val();
      if (settings) {
        useAppStore.setState({ lightSettings: settings });
      }
    });

    return () => {
      off(libRef, 'value', unsubLib);
      off(canvasRef, 'value', unsubCanvas);
      off(colorRef, 'value', unsubColor);
      off(lightRef, 'value', unsubLight);
      useAppStore.setState({ roomId: null });
    };
  }, [roomId]);
};
