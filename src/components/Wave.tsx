import { FC, useEffect, useMemo, useRef } from 'react';

import { useCanvasContext } from '../hooks/useCanvas';
import useResponsiveSize from '../hooks/useResponsiveSize';
import WaveObj from '../utils/wave';

const Wave: FC = () => {
  const { context } = useCanvasContext();
  const { width } = useResponsiveSize();
  const height = 600;
  const rafIdRef = useRef<number | null>(null);
  const frequencyRef = useRef(0.013);

  const waves = useMemo(
    () => ({
      frontWave: new WaveObj([0.0211, 0.028, 0.015], 'rgba(0,134,164,0.6)'),
      backWave: new WaveObj([0.0122, 0.018, 0.005], 'rgba(0,60,255,0.6)'),
    }),
    []
  );

  useEffect(() => {
    if (!context) {
      return () => {};
    }

    const render = () => {
      context.clearRect(0, 0, width, height);
      Object.entries(waves).forEach(([, wave]) => {
        wave.draw(context, width, height, frequencyRef.current);
      });
      frequencyRef.current += 0.013;
      rafIdRef.current = globalThis.requestAnimationFrame(render);
    };

    render();

    return () => {
      if (rafIdRef.current !== null) {
        globalThis.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [context, height, waves, width]);

  return null;
};

export default Wave;
