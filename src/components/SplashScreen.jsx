import { useEffect, useRef, useState } from 'react';

export default function SplashScreen({ dataReady, onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const animDone = useRef(false);
  const dataDone = useRef(false);

  const tryFinish = () => {
    if (animDone.current && dataDone.current) {
      setFading(true);
      setTimeout(onDone, 450);
    }
  };

  useEffect(() => {
    const duration = 2000;
    const start = Date.now();
    let raf;

    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        animDone.current = true;
        tryFinish();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (dataReady) {
      dataDone.current = true;
      tryFinish();
    }
  }, [dataReady]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none"
      style={{
        backgroundColor: '#080808',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.45s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {/* Logo */}
      <h1
        className="font-black tracking-tight leading-none bg-clip-text text-transparent"
        style={{
          fontSize: 'clamp(3rem, 16vw, 5rem)',
          backgroundImage: 'linear-gradient(90deg, #f43f5e 0%, #a855f7 50%, #6366f1 100%)',
        }}
      >
        ISYouth
      </h1>

      <p
        className="uppercase font-semibold tracking-[0.35em] mt-3"
        style={{ fontSize: '0.65rem', color: '#444' }}
      >
        Worship App
      </p>

      {/* Loading bar */}
      <div
        className="mt-10 rounded-full overflow-hidden"
        style={{ width: '10rem', height: '2px', backgroundColor: '#1c1c1c' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundImage: 'linear-gradient(90deg, #f43f5e 0%, #a855f7 50%, #6366f1 100%)',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </div>
  );
}
