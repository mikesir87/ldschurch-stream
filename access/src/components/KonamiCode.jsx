import React, { useEffect, useState, useRef } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export default function KonamiCode() {
  const sequenceRef = useRef([]);
  const [showFlowers, setShowFlowers] = useState(false);

  useEffect(() => {
    const handleKeyDown = e => {
      sequenceRef.current = [...sequenceRef.current, e.code].slice(-KONAMI_CODE.length);
      if (sequenceRef.current.join(',') === KONAMI_CODE.join(',')) {
        setShowFlowers(true);
        setTimeout(() => setShowFlowers(false), 5000);
        sequenceRef.current = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!showFlowers) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {Array.from({ length: 50 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: '-50px',
            fontSize: '24px',
            animation: `fall 3s linear forwards`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          {['🌸', '🌺', '🌻', '🌷', '🌹'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(calc(100vh + 50px)) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
